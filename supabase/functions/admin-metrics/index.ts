import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";

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

async function safeMetric<T>(
  metricErrors: Record<string, string>,
  key: string,
  fallback: T,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    const message = normalizeError(error);
    metricErrors[key] = message;
    console.error(`[admin-metrics] ${key} failed:`, message);
    return fallback;
  }
}

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
    const metricErrors: Record<string, string> = {};

    const { data: roleData, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      throw new Error(`Erro ao validar role admin: ${roleError.message}`);
    }

    const isForcedAdminEmail = (user.email || "").toLowerCase() === FORCED_ADMIN_EMAIL;

    if (!roleData && isForcedAdminEmail) {
      const { error: insertRoleError } = await admin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" })
        .select("id")
        .maybeSingle();

      if (insertRoleError) {
        throw new Error(`Erro ao conceder admin por email forçado: ${insertRoleError.message}`);
      }
    }

    if (!roleData && !isForcedAdminEmail) throw new Error("Forbidden");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString();

    const fetchCount = async (table: string, key: string, builder?: (query: any) => any): Promise<number> => {
      return safeMetric(metricErrors, key, 0, async () => {
        let query = admin.from(table).select("*", { count: "exact", head: true });
        if (builder) query = builder(query);
        const { count, error } = await query;
        if (error) throw error;
        return count ?? 0;
      });
    };

    const fetchRows = async <T>(table: string, key: string, fallback: T, builder: (query: any) => any): Promise<T> => {
      return safeMetric(metricErrors, key, fallback, async () => {
        const { data, error } = await builder(admin.from(table));
        if (error) throw error;
        return (data as T) ?? fallback;
      });
    };

    const totalUsers = await fetchCount("profiles", "totalUsers");

    const activeToday = await fetchRows<any[]>("analytics_events", "activeTodayCount", [], (q) =>
      q.select("user_id").gte("created_at", todayStart)
    );
    const activeTodayCount = new Set(activeToday.map((e) => e.user_id)).size;

    const activeWeek = await fetchRows<any[]>("analytics_events", "activeWeekCount", [], (q) =>
      q.select("user_id").gte("created_at", weekStart)
    );
    const activeWeekCount = new Set(activeWeek.map((e) => e.user_id)).size;

    const activeMonth = await fetchRows<any[]>("analytics_events", "activeMonthCount", [], (q) =>
      q.select("user_id").gte("created_at", monthStart)
    );
    const activeMonthCount = new Set(activeMonth.map((e) => e.user_id)).size;

    const countEvents = async (key: string, eventTypes: string[]) => {
      return safeMetric(metricErrors, key, 0, async () => {
        const { count, error } = await admin
          .from("analytics_events")
          .select("*", { count: "exact", head: true })
          .in("event_type", eventTypes);
        if (error) throw error;
        return count ?? 0;
      });
    };

    const versesRead = await countEvents("versesRead", ["chapter_read", "verse_read", "verse_opened"]);
    const revelaUsage = await countEvents("revelaUsage", ["revela_search", "revela_used"]);
    const revelaVerse = await countEvents("revelaVerse", ["revela_verse"]);
    const notesCreated = await countEvents("notesCreated", ["note_created"]);
    const highlightsMade = await countEvents("highlightsMade", ["highlight_set"]);
    const sharesCount = await countEvents("sharesCount", ["verse_shared", "share_created"]);
    const revelationMode = await countEvents("revelationMode", ["revelation_mode", "study_opened"]);

    const totalNotes = await fetchCount("structured_notes", "totalNotes");

    const noteUsers = await fetchRows<any[]>("structured_notes", "noteUserPct", [], (q) =>
      q.select("user_id")
    );
    const uniqueNoteUsers = new Set(noteUsers.map((n) => n.user_id)).size;
    const noteUserPct = totalUsers ? Math.round((uniqueNoteUsers / totalUsers) * 100) : 0;

    const recentShares = await fetchRows<any[]>("shared_verses", "recentShares", [], (q) =>
      q
        .select("book, chapter, verse, share_text, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    );

    const recentQueries = await fetchRows<any[]>("analytics_events", "recentQueries", [], (q) =>
      q
        .select("event_data, created_at, user_id")
        .in("event_type", ["revela_search", "revela_used"])
        .order("created_at", { ascending: false })
        .limit(30)
    );

    const passageEvents = await fetchRows<any[]>("analytics_events", "topPassages", [], (q) =>
      q
        .select("event_data")
        .in("event_type", ["chapter_read", "verse_read", "verse_opened"])
        .order("created_at", { ascending: false })
        .limit(1000)
    );

    const passageCounts: Record<string, number> = {};
    passageEvents.forEach((e: any) => {
      const key = `${e.event_data?.book || "?"} ${e.event_data?.chapter || "?"}`;
      passageCounts[key] = (passageCounts[key] || 0) + 1;
    });
    const topPassages = Object.entries(passageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([passage, count]) => ({ passage, count }));

    const profiles = await fetchRows<any[]>("profiles", "growthData", [], (q) =>
      q
        .select("created_at")
        .gte("created_at", monthStart)
        .order("created_at", { ascending: true })
    );

    const growthByDay: Record<string, number> = {};
    profiles.forEach((p: any) => {
      const day = p.created_at?.slice(0, 10);
      if (day) growthByDay[day] = (growthByDay[day] || 0) + 1;
    });
    const growthData = Object.entries(growthByDay).map(([date, count]) => ({ date, count }));

    const userList = await fetchRows<any[]>("profiles", "users", [], (q) =>
      q
        .select("user_id, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    );

    const authUsers = await safeMetric(metricErrors, "usersAuth", [], async () => {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      return data?.users ?? [];
    });

    const emailMap: Record<string, { email: string; last_sign_in: string | null }> = {};
    authUsers.forEach((u: any) => {
      emailMap[u.id] = { email: u.email || "", last_sign_in: u.last_sign_in_at };
    });

    const users = userList.map((p: any) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      email: emailMap[p.user_id]?.email || "",
      created_at: p.created_at,
      last_sign_in: emailMap[p.user_id]?.last_sign_in || null,
    }));

    const result = {
      totalUsers,
      activeTodayCount,
      activeWeekCount,
      activeMonthCount,
      versesRead,
      revelaUsage,
      revelaVerse,
      notesCreated,
      highlightsMade,
      sharesCount,
      revelationMode,
      totalNotes,
      noteUserPct,
      recentShares,
      recentQueries,
      topPassages,
      growthData,
      users,
      __meta: {
        status: Object.keys(metricErrors).length === 0 ? "ok" : "partial",
        metricErrors,
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
