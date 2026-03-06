import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";

type MetricStatus = "ok" | "empty" | "error";

type MetricResult<T> = {
  key: string;
  status: MetricStatus;
  value: T;
  message?: string;
  source?: string;
};

const normalizeError = (error: unknown): string => {
  if (!error) return "Erro desconhecido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Erro sem detalhes serializáveis";
  }
};

const looksMissingRelation = (message: string) =>
  /relation .* does not exist|column .* does not exist|schema cache|PGRST204|42P01|42703/i.test(message);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: roleData, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error(`Erro ao validar role admin: ${roleError.message}`);

    const isForcedAdminEmail = (user.email || "").toLowerCase() === FORCED_ADMIN_EMAIL;

    if (!roleData && isForcedAdminEmail) {
      const { error: insertRoleError } = await admin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" })
        .select("id")
        .maybeSingle();
      if (insertRoleError) throw new Error(`Erro ao conceder admin por email forçado: ${insertRoleError.message}`);
    }

    if (!roleData && !isForcedAdminEmail) throw new Error("Forbidden");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString();

    const metricState: Record<string, Omit<MetricResult<unknown>, "value">> = {};
    const metricErrors: Record<string, string> = {};

    const register = <T>(result: MetricResult<T>): T => {
      metricState[result.key] = {
        key: result.key,
        status: result.status,
        message: result.message,
        source: result.source,
      };
      if (result.status === "error") metricErrors[result.key] = result.message || "Erro desconhecido";
      return result.value;
    };

    const withMetric = async <T>(
      key: string,
      fallback: T,
      source: string,
      action: () => Promise<T>,
      isEmpty?: (value: T) => boolean,
    ): Promise<T> => {
      try {
        const value = await action();
        const empty = isEmpty ? isEmpty(value) : false;
        console.log(`[admin-metrics] ${key} => status=${empty ? "empty" : "ok"}`);
        return register({
          key,
          status: empty ? "empty" : "ok",
          value,
          source,
          message: empty ? "Sem dados ainda" : "ok",
        });
      } catch (error) {
        const message = normalizeError(error);
        console.error(`[admin-metrics] ${key} failed (${source}): ${message}`);
        return register({
          key,
          status: "error",
          value: fallback,
          source,
          message,
        });
      }
    };

    const resolveEventsSource = async () => {
      const appEvents = await withMetric("_source_check_app_events", false, "app_events", async () => {
        const { error } = await admin.from("app_events").select("id", { count: "exact", head: true }).limit(1);
        if (error) throw error;
        return true;
      });
      if (appEvents) return "app_events";

      const analyticsEvents = await withMetric("_source_check_analytics_events", false, "analytics_events", async () => {
        const { error } = await admin.from("analytics_events").select("id", { count: "exact", head: true }).limit(1);
        if (error) throw error;
        return true;
      });
      return analyticsEvents ? "analytics_events" : null;
    };

    const eventsTable = await resolveEventsSource();

    if (!eventsTable) {
      metricErrors.events_source = "Nenhuma fonte de eventos encontrada (app_events/analytics_events).";
    }

    const totalUsers = await withMetric("total_users", 0, "profiles", async () => {
      const { count, error } = await admin.from("profiles").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });

    const uniqueActiveInRange = async (key: string, sinceIso: string) => {
      if (!eventsTable) {
        return register({
          key,
          status: "error",
          value: 0,
          source: "events_source",
          message: "Fonte de eventos indisponível",
        });
      }
      return withMetric(key, 0, `${eventsTable}.user_id`, async () => {
        const { data, error } = await admin
          .from(eventsTable)
          .select("user_id")
          .gte("created_at", sinceIso);
        if (error) throw error;
        return new Set((data || []).map((row: any) => row.user_id).filter(Boolean)).size;
      });
    };

    const eventTypeFilter = (types: string[]) => types;

    const countEvents = async (key: string, types: string[]) => {
      if (!eventsTable) {
        return register({ key, status: "error", value: 0, source: "events_source", message: "Fonte de eventos indisponível" });
      }
      return withMetric(key, 0, `${eventsTable}.event_type`, async () => {
        const { count, error } = await admin
          .from(eventsTable)
          .select("*", { count: "exact", head: true })
          .in("event_type", eventTypeFilter(types));
        if (error) throw error;
        return count ?? 0;
      });
    };

    const activeToday = await uniqueActiveInRange("active_today", todayStart);
    const activeWeek = await uniqueActiveInRange("active_week", weekStart);
    const activeMonth = await uniqueActiveInRange("active_month", monthStart);

    const chaptersRead = await countEvents("chapters_read", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"]);
    const revelaUsage = await countEvents("revela_usage", ["revela_search", "revela_used"]);
    const notesCreated = await countEvents("notes_created", ["note_created"]);
    const highlightsCreated = await countEvents("highlights_created", ["highlight_set", "highlight_created"]);
    const sharesCreated = await countEvents("shares_created", ["verse_shared", "share_created"]);
    const questionsAsked = await countEvents("questions_asked", ["question_asked", "revela_search", "revela_used"]);
    const revelaVerse = await countEvents("revela_verse", ["revela_verse"]);
    const revelationMode = await countEvents("revelation_mode", ["revelation_mode", "study_opened"]);

    const totalNotes = await withMetric("total_notes", 0, "structured_notes", async () => {
      const { count, error } = await admin.from("structured_notes").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });

    const noteUserPct = await withMetric("note_user_pct", 0, "structured_notes.user_id", async () => {
      const { data, error } = await admin.from("structured_notes").select("user_id");
      if (error) throw error;
      const uniqueNoteUsers = new Set((data || []).map((n: any) => n.user_id).filter(Boolean)).size;
      return totalUsers ? Math.round((uniqueNoteUsers / totalUsers) * 100) : 0;
    });

    const recentShares = await withMetric("recent_shares", [], "shared_verses", async () => {
      const { data, error } = await admin
        .from("shared_verses")
        .select("book, chapter, verse, share_text, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }, (rows) => rows.length === 0);

    const queryText = eventsTable === "app_events" ? "metadata, created_at, user_id" : "event_data, created_at, user_id";

    const recentQueries = await withMetric("recent_questions", [], `${eventsTable ?? "events"}.query`, async () => {
      if (!eventsTable) return [];
      const { data, error } = await admin
        .from(eventsTable)
        .select(queryText)
        .in("event_type", ["question_asked", "revela_search", "revela_used"])
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        event_data: row.event_data ?? row.metadata ?? {},
      }));
    }, (rows) => rows.length === 0);

    const topPassages = await withMetric("most_accessed_passages", [], `${eventsTable ?? "events"}.book/chapter/verse`, async () => {
      if (!eventsTable) return [];
      const selectCols = eventsTable === "app_events"
        ? "book, chapter, verse, metadata"
        : "event_data";
      const { data, error } = await admin
        .from(eventsTable)
        .select(selectCols)
        .in("event_type", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"])
        .order("created_at", { ascending: false })
        .limit(1500);
      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((e: any) => {
        const payload = eventsTable === "app_events"
          ? { book: e.book ?? e.metadata?.book, chapter: e.chapter ?? e.metadata?.chapter, verse: e.verse ?? e.metadata?.verse }
          : { book: e.event_data?.book, chapter: e.event_data?.chapter, verse: e.event_data?.verse };

        if (!payload.book || !payload.chapter) return;
        const label = payload.verse
          ? `${payload.book} ${payload.chapter}:${payload.verse}`
          : `${payload.book} ${payload.chapter}`;
        counts[label] = (counts[label] || 0) + 1;
      });

      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([passage, count]) => ({ passage, count }));
    }, (rows) => rows.length === 0);

    const growthData = await withMetric("growth_data", [], "profiles.created_at", async () => {
      const { data, error } = await admin
        .from("profiles")
        .select("created_at")
        .gte("created_at", monthStart)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const growthByDay: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        const day = p.created_at?.slice(0, 10);
        if (day) growthByDay[day] = (growthByDay[day] || 0) + 1;
      });
      return Object.entries(growthByDay).map(([date, count]) => ({ date, count }));
    }, (rows) => rows.length === 0);

    const users = await withMetric("users_list", [], "profiles + auth.users", async () => {
      const { data: userList, error: userListError } = await admin
        .from("profiles")
        .select("user_id, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (userListError) throw userListError;

      const { data: authData, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (authError) throw authError;

      const authUsers = authData?.users ?? [];
      const emailMap: Record<string, { email: string; last_sign_in: string | null }> = {};
      authUsers.forEach((u: any) => {
        emailMap[u.id] = { email: u.email || "", last_sign_in: u.last_sign_in_at };
      });

      return (userList || []).map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        email: emailMap[p.user_id]?.email || "",
        created_at: p.created_at,
        last_sign_in: emailMap[p.user_id]?.last_sign_in || null,
      }));
    }, (rows) => rows.length === 0);

    const analyticsAudit = {
      events_table_selected: eventsTable,
      required_tables: {
        profiles: metricState.total_users?.status !== "error",
        structured_notes: metricState.total_notes?.status !== "error",
        shared_verses: metricState.recent_shares?.status !== "error",
        app_events: metricState._source_check_app_events?.status !== "error",
        analytics_events: metricState._source_check_analytics_events?.status !== "error",
      },
      missing_or_invalid: Object.entries(metricErrors).map(([key, message]) => ({
        key,
        reason: looksMissingRelation(message) ? "tabela/coluna não existe ou nome divergente" : message,
        message,
      })),
    };

    const nonCheckFailures = Object.keys(metricErrors).filter((k) => !k.startsWith("_source_check_"));

    const result = {
      totalUsers,
      activeTodayCount: activeToday,
      activeWeekCount: activeWeek,
      activeMonthCount: activeMonth,
      versesRead: chaptersRead,
      revelaUsage,
      revelaVerse,
      notesCreated,
      highlightsMade: highlightsCreated,
      sharesCount: sharesCreated,
      questionsAsked,
      revelationMode,
      totalNotes,
      noteUserPct,
      recentShares,
      recentQueries,
      topPassages,
      growthData,
      users,
      __meta: {
        status: nonCheckFailures.length === 0 ? "ok" : "partial",
        metricErrors,
        metricState,
        analyticsAudit,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const message = normalizeError(e);
    console.error("[admin-metrics] fatal error:", message);
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
