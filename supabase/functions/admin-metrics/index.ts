import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";
const ENDPOINT_NAME = "admin-metrics";

type MetricStatus = "ok" | "empty" | "error";
type MetricResult<T> = { key: string; status: MetricStatus; value: T; message?: string; source?: string };

const normalizeError = (error: unknown): string => {
  if (!error) return "Erro desconhecido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try { return JSON.stringify(error); } catch { return "Erro sem detalhes"; }
};

const getRequiredEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const metricState: Record<string, Omit<MetricResult<unknown>, "value">> = {};
  const metricErrors: Record<string, string> = {};
  const auditMetrics: { key: string; source: string; query: string; status: string; error: string | null }[] = [];

  const register = <T>(r: MetricResult<T>): T => {
    metricState[r.key] = { key: r.key, status: r.status, message: r.message, source: r.source };
    if (r.status === "error") metricErrors[r.key] = r.message || "Erro";
    return r.value;
  };

  const withMetric = async <T>(key: string, fallback: T, source: string, query: string, action: () => Promise<T>, isEmpty?: (v: T) => boolean): Promise<T> => {
    try {
      const value = await action();
      const empty = isEmpty ? isEmpty(value) : false;
      auditMetrics.push({ key, source, query, status: empty ? "empty" : "ok", error: null });
      return register({ key, status: empty ? "empty" : "ok", value, source, message: empty ? "Sem dados" : "ok" });
    } catch (error) {
      const message = normalizeError(error);
      auditMetrics.push({ key, source, query, status: "error", error: message });
      return register({ key, status: "error", value: fallback, source, message });
    }
  };

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const serviceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceKey;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);

    // Admin check
    const { data: roleData, error: roleError } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();

    const isForcedAdmin = (user.email || "").toLowerCase() === FORCED_ADMIN_EMAIL;
    if (roleError && !isForcedAdmin) throw new Error("Erro ao validar admin");
    if (!roleData && !isForcedAdmin) throw new Error("Forbidden");
    if (!roleData && isForcedAdmin) {
      await admin.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Resolve events table
    let eventsTable: string | null = null;
    const checkTable = async (table: string) => {
      const { error } = await admin.from(table).select("id", { count: "exact", head: true }).limit(1);
      return !error;
    };
    if (await checkTable("analytics_events")) eventsTable = "analytics_events";

    // 1. Total users
    const totalUsers = await withMetric("total_users", 0, "profiles", "count", async () => {
      const { count, error } = await admin.from("profiles").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });

    // 2. Active users
    const uniqueActive = async (key: string, since: string) => {
      if (!eventsTable) return register({ key, status: "empty", value: 0, source: "events", message: "Sem tabela" });
      return withMetric(key, 0, eventsTable, `distinct user_id since ${since}`, async () => {
        const { data, error } = await admin.from(eventsTable!).select("user_id").gte("created_at", since);
        if (error) throw error;
        return new Set((data || []).map((r: any) => r.user_id).filter(Boolean)).size;
      });
    };
    const activeToday = await uniqueActive("active_today", todayStart);
    const activeWeek = await uniqueActive("active_week", weekStart);
    const activeMonth = await uniqueActive("active_month", monthStart);

    // 3. Event counts
    const countEvents = async (key: string, types: string[]) => {
      if (!eventsTable) return register({ key, status: "empty", value: 0, source: "events", message: "Sem tabela" });
      return withMetric(key, 0, eventsTable, `count ${types.join(",")}`, async () => {
        const { count, error } = await admin.from(eventsTable!).select("*", { count: "exact", head: true }).in("event_type", types);
        if (error) throw error;
        return count ?? 0;
      });
    };

    const chaptersRead = await countEvents("chapters_read", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"]);
    const revelaUsage = await countEvents("revela_usage", ["revela_search", "revela_used"]);
    const questionsAsked = await countEvents("questions_asked", ["question_asked"]);
    const revelationMode = await countEvents("revelation_mode", ["revelation_mode", "revelation_mode_opened"]);
    const revelaVerse = await countEvents("revela_verse", ["verse_reveal", "verse_reveal_used"]);

    // 4. Table counts
    const notesCreated = await withMetric("notes_created", 0, "structured_notes", "count", async () => {
      const { count, error } = await admin.from("structured_notes").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });
    const highlightsCreated = await withMetric("highlights_created", 0, "highlights", "count", async () => {
      const { count, error } = await admin.from("highlights").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });
    const sharesCreated = await withMetric("shares_created", 0, "shared_verses", "count", async () => {
      const { count, error } = await admin.from("shared_verses").select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    });

    // 5. Note user percentage
    const noteUserPct = await withMetric("note_user_pct", 0, "structured_notes", "distinct user_id / total_users", async () => {
      const { data, error } = await admin.from("structured_notes").select("user_id");
      if (error) throw error;
      const uniqueNoteUsers = new Set((data || []).map((r: any) => r.user_id)).size;
      return totalUsers > 0 ? Math.round((uniqueNoteUsers / totalUsers) * 100) : 0;
    });

    // 6. Recent queries
    const questions = await withMetric("recent_questions", [], eventsTable ?? "events", "latest 30 questions", async () => {
      if (!eventsTable) return [];
      const { data, error } = await admin.from(eventsTable)
        .select("event_data, created_at, user_id")
        .in("event_type", ["question_asked", "revela_search", "revela_used"])
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []).map((row: any) => ({
        query: row.event_data?.query ?? row.event_data?.prompt ?? "",
        created_at: row.created_at,
        user_id: row.user_id ?? null,
      }));
    }, (rows) => rows.length === 0);

    // 7. Top passages
    const topPassages = await withMetric("most_accessed_passages", [], eventsTable ?? "events", "top passages", async () => {
      if (!eventsTable) return [];
      const { data, error } = await admin.from(eventsTable)
        .select("event_data")
        .in("event_type", ["chapter_read", "chapter_opened", "verse_read", "verse_opened"])
        .order("created_at", { ascending: false })
        .limit(1500);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((e: any) => {
        const p = e.event_data ?? {};
        if (!p.book || !p.chapter) return;
        const label = p.verse ? `${p.book} ${p.chapter}:${p.verse}` : `${p.book} ${p.chapter}`;
        counts[label] = (counts[label] || 0) + 1;
      });
      return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 15).map(([passage, count]) => ({ passage, count }));
    }, (rows) => rows.length === 0);

    // 8. Recent shares
    const recentShares = await withMetric("recent_shares", [], "shared_verses", "latest 20", async () => {
      const { data, error } = await admin.from("shared_verses")
        .select("book, chapter, verse, share_text, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }, (rows) => rows.length === 0);

    // 9. Growth data (new users per day, last 30 days)
    const growthData = await withMetric("growth_data", [], "profiles", "group by date last 30d", async () => {
      const { data, error } = await admin.from("profiles")
        .select("created_at")
        .gte("created_at", monthStart)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        const date = row.created_at?.slice(0, 10);
        if (date) counts[date] = (counts[date] || 0) + 1;
      });
      // Fill all 30 days
      const result: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toISOString().slice(0, 10);
        result.push({ date: dateStr, count: counts[dateStr] || 0 });
      }
      return result;
    }, (rows) => rows.length === 0);

    // 10. Users list (from profiles + auth admin API)
    const users = await withMetric("users_list", [], "profiles+auth", "list all users", async () => {
      const { data: profiles, error: pErr } = await admin.from("profiles").select("user_id, display_name, created_at").order("created_at", { ascending: false });
      if (pErr) throw pErr;

      // Get auth users via admin API for email and last_sign_in
      let authUsers: Record<string, { email: string; last_sign_in_at: string | null }> = {};
      try {
        const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (!authErr && authData?.users) {
          authData.users.forEach((u: any) => {
            authUsers[u.id] = { email: u.email ?? "", last_sign_in_at: u.last_sign_in_at ?? null };
          });
        }
      } catch { /* ignore auth list error */ }

      return (profiles || []).map((p: any) => ({
        user_id: p.user_id,
        display_name: p.display_name ?? "",
        email: authUsers[p.user_id]?.email ?? "",
        created_at: p.created_at,
        last_sign_in: authUsers[p.user_id]?.last_sign_in_at ?? null,
      }));
    }, (rows) => rows.length === 0);

    const nonCheckFailures = Object.keys(metricErrors).filter((k) => !k.startsWith("_"));

    const result = {
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
      revelation_mode: revelationMode,
      revela_verse: revelaVerse,
      note_user_pct: noteUserPct,
      questions,
      top_passages: topPassages,
      recent_shares: recentShares,
      growth_data: growthData,
      users,
      __meta: {
        endpoint: ENDPOINT_NAME,
        status: nonCheckFailures.length === 0 ? "ok" : "partial",
        httpStatus: 200,
        metricErrors,
        metricState,
        requestAudit: {
          metrics: auditMetrics,
          auth: {
            hasAuthorizationHeader: true,
            userId: user.id,
            email: user.email ?? null,
            adminCheck: isForcedAdmin && !roleData ? "forced_admin_email" : "ok",
          },
        },
        analyticsAudit: { events_table_selected: eventsTable },
      },
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const message = normalizeError(e);
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message, __meta: { status: "partial", httpStatus: status, metricErrors: { fatal: message }, metricState, requestAudit: { metrics: auditMetrics, auth: { hasAuthorizationHeader: false, userId: null, email: null, adminCheck: "failed" } } } }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
