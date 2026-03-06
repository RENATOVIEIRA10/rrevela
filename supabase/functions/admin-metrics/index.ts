import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";
const ENDPOINT_NAME = "admin-metrics";

type MetricStatus = "ok" | "empty" | "error";

type MetricResult<T> = {
  key: string;
  status: MetricStatus;
  value: T;
  message?: string;
  source?: string;
};

type AdminMetricsResponse = {
  total_users: number;
  active_today: number;
  active_week: number;
  active_month: number;
  chapters_read: number;
  revela_usage: number;
  notes_created: number;
  highlights_created: number;
  shares_created: number;
  questions_asked: number;
  questions: { query: string; created_at: string; user_id: string | null }[];
  top_passages: { passage: string; count: number }[];
  __meta: {
    endpoint: string;
    status: "ok" | "partial";
    metricErrors: Record<string, string>;
    metricState: Record<string, Omit<MetricResult<unknown>, "value">>;
    analyticsAudit: {
      events_table_selected: string | null;
      required_tables: Record<string, boolean>;
      missing_or_invalid: { key: string; reason: string; message: string }[];
    };
  };
  // legacy fields used by current UI sections
  totalUsers: number;
  activeTodayCount: number;
  activeWeekCount: number;
  activeMonthCount: number;
  versesRead: number;
  revelaUsage: number;
  notesCreated: number;
  highlightsMade: number;
  sharesCount: number;
  questionsAsked: number;
  recentQueries: { event_data: { query?: string }; created_at: string; user_id: string | null }[];
  topPassages: { passage: string; count: number }[];
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

const baseResponse = (): AdminMetricsResponse => ({
  total_users: 0,
  active_today: 0,
  active_week: 0,
  active_month: 0,
  chapters_read: 0,
  revela_usage: 0,
  notes_created: 0,
  highlights_created: 0,
  shares_created: 0,
  questions_asked: 0,
  questions: [],
  top_passages: [],
  __meta: {
    endpoint: ENDPOINT_NAME,
    status: "ok",
    metricErrors: {},
    metricState: {},
    analyticsAudit: {
      events_table_selected: null,
      required_tables: {},
      missing_or_invalid: [],
    },
  },
  totalUsers: 0,
  activeTodayCount: 0,
  activeWeekCount: 0,
  activeMonthCount: 0,
  versesRead: 0,
  revelaUsage: 0,
  notesCreated: 0,
  highlightsMade: 0,
  sharesCount: 0,
  questionsAsked: 0,
  recentQueries: [],
  topPassages: [],
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await userClient.auth.getUser();
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
        return register({ key, status: "error", value: 0, source: "events_source", message: "Fonte de eventos indisponível" });
      }
      return withMetric(key, 0, `${eventsTable}.user_id`, async () => {
        const { data, error } = await admin.from(eventsTable).select("user_id").gte("created_at", sinceIso);
        if (error) throw error;
        return new Set((data || []).map((row: any) => row.user_id).filter(Boolean)).size;
      });
    };

    const countEvents = async (key: string, types: string[]) => {
      if (!eventsTable) {
        return register({ key, status: "error", value: 0, source: "events_source", message: "Fonte de eventos indisponível" });
      }
      return withMetric(key, 0, `${eventsTable}.event_type`, async () => {
        const { count, error } = await admin.from(eventsTable).select("*", { count: "exact", head: true }).in("event_type", types);
        if (error) throw error;
        return count ?? 0;
      });
    };

    const activeToday = await uniqueActiveInRange("active_today", todayStart);
    const activeWeek = await uniqueActiveInRange("active_week", weekStart);
    const activeMonth = await uniqueActiveInRange("active_month", monthStart);

    const chaptersRead = await countEvents("chapters_read", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"]);
    const revelaUsage = await countEvents("revela_usage", ["revela_search", "revela_used"]);
    const notesCreated = await withMetric("notes_created", 0, "structured_notes", async () => {
      const { count, error } = await admin.from("structured_notes").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });
    const highlightsCreated = await withMetric("highlights_created", 0, "highlights", async () => {
      const { count, error } = await admin.from("highlights").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });
    const sharesCreated = await withMetric("shares_created", 0, "shared_verses", async () => {
      const { count, error } = await admin.from("shared_verses").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });
    const questionsAsked = await countEvents("questions_asked", ["question_asked"]);

    const recentQueries = await withMetric("recent_questions", [], `${eventsTable ?? "events"}.query`, async () => {
      if (!eventsTable) return [];
      const queryText = eventsTable === "app_events" ? "metadata, created_at, user_id" : "event_data, created_at, user_id";
      const { data, error } = await admin
        .from(eventsTable)
        .select(queryText)
        .in("event_type", ["question_asked", "revela_search", "revela_used"])
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []).map((row: any) => {
        const payload = row.event_data ?? row.metadata ?? {};
        return {
          query: payload.query ?? payload.prompt ?? "",
          created_at: row.created_at,
          user_id: row.user_id ?? null,
        };
      });
    }, (rows) => rows.length === 0);

    const topPassages = await withMetric("most_accessed_passages", [], `${eventsTable ?? "events"}.book/chapter/verse`, async () => {
      if (!eventsTable) return [];
      const selectCols = eventsTable === "app_events" ? "book, chapter, verse, metadata" : "event_data";
      const { data, error } = await admin
        .from(eventsTable)
        .select(selectCols)
        .in("event_type", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"])
        .order("created_at", { ascending: false })
        .limit(1500);
      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((e: any) => {
        const payload =
          eventsTable === "app_events"
            ? { book: e.book ?? e.metadata?.book, chapter: e.chapter ?? e.metadata?.chapter, verse: e.verse ?? e.metadata?.verse }
            : { book: e.event_data?.book, chapter: e.event_data?.chapter, verse: e.event_data?.verse };

        if (!payload.book || !payload.chapter) return;
        const label = payload.verse ? `${payload.book} ${payload.chapter}:${payload.verse}` : `${payload.book} ${payload.chapter}`;
        counts[label] = (counts[label] || 0) + 1;
      });

      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([passage, count]) => ({ passage, count }));
    }, (rows) => rows.length === 0);

    const analyticsAudit = {
      events_table_selected: eventsTable,
      required_tables: {
        profiles: metricState.total_users?.status !== "error",
        structured_notes: metricState.notes_created?.status !== "error",
        highlights: metricState.highlights_created?.status !== "error",
        shared_verses: metricState.shares_created?.status !== "error",
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

    const result: AdminMetricsResponse = {
      ...baseResponse(),
      total_users: totalUsers,
      active_today: activeToday,
      active_week: activeWeek,
      active_month: activeMonth,
      chapters_read: chaptersRead,
      revela_usage: revelaUsage,
      notes_created: notesCreated,
      highlights_created: highlightsCreated,
      shares_created: sharesCreated,
      questions_asked: questionsAsked,
      questions: recentQueries,
      top_passages: topPassages,
      __meta: {
        endpoint: ENDPOINT_NAME,
        status: nonCheckFailures.length === 0 ? "ok" : "partial",
        metricErrors,
        metricState,
        analyticsAudit,
      },
      totalUsers,
      activeTodayCount: activeToday,
      activeWeekCount: activeWeek,
      activeMonthCount: activeMonth,
      versesRead: chaptersRead,
      revelaUsage,
      notesCreated,
      highlightsMade: highlightsCreated,
      sharesCount: sharesCreated,
      questionsAsked,
      recentQueries: recentQueries.map((q) => ({
        event_data: { query: q.query },
        created_at: q.created_at,
        user_id: q.user_id,
      })),
      topPassages: topPassages,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const message = normalizeError(e);
    console.error("[admin-metrics] fatal error:", message);
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ ...baseResponse(), error: message, __meta: { ...baseResponse().__meta, status: "partial", metricErrors: { fatal: message } } }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
