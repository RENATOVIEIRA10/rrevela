import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";

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

    // Verify the calling user is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);

    // Check admin role
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isForcedAdminEmail = (user.email || "").toLowerCase() === FORCED_ADMIN_EMAIL;

    if (!roleData && isForcedAdminEmail) {
      await admin
        .from("user_roles")
        .insert({ user_id: user.id, role: "admin" })
        .select("id")
        .maybeSingle();
    }

    if (!roleData && !isForcedAdminEmail) throw new Error("Forbidden");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Total users
    const { count: totalUsers } = await admin.from("profiles").select("*", { count: "exact", head: true });

    // Active users (by analytics events)
    const { data: activeToday } = await admin
      .from("analytics_events")
      .select("user_id")
      .gte("created_at", todayStart);
    const activeTodayCount = new Set(activeToday?.map((e: any) => e.user_id)).size;

    const { data: activeWeek } = await admin
      .from("analytics_events")
      .select("user_id")
      .gte("created_at", weekStart);
    const activeWeekCount = new Set(activeWeek?.map((e: any) => e.user_id)).size;

    const { data: activeMonth } = await admin
      .from("analytics_events")
      .select("user_id")
      .gte("created_at", monthStart);
    const activeMonthCount = new Set(activeMonth?.map((e: any) => e.user_id)).size;

    // Event counts
    const countEvent = async (type: string) => {
      const { count } = await admin
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", type);
      return count ?? 0;
    };

    const versesRead = await countEvent("chapter_read");
    const revelaUsage = await countEvent("revela_search");
    const revelaVerse = await countEvent("revela_verse");
    const notesCreated = await countEvent("note_created");
    const highlightsMade = await countEvent("highlight_set");
    const sharesCount = await countEvent("verse_shared");
    const revelationMode = await countEvent("revelation_mode");

    // Notes stats
    const { count: totalNotes } = await admin
      .from("structured_notes")
      .select("*", { count: "exact", head: true });
    const { data: noteUsers } = await admin
      .from("structured_notes")
      .select("user_id");
    const uniqueNoteUsers = new Set(noteUsers?.map((n: any) => n.user_id)).size;
    const noteUserPct = totalUsers ? Math.round((uniqueNoteUsers / totalUsers) * 100) : 0;

    // Shared verses (recent)
    const { data: recentShares } = await admin
      .from("shared_verses")
      .select("book, chapter, verse, share_text, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    // Recent revela queries
    const { data: recentQueries } = await admin
      .from("analytics_events")
      .select("event_data, created_at, user_id")
      .eq("event_type", "revela_search")
      .order("created_at", { ascending: false })
      .limit(30);

    // Top passages (from chapter_read events)
    const { data: passageEvents } = await admin
      .from("analytics_events")
      .select("event_data")
      .eq("event_type", "chapter_read")
      .order("created_at", { ascending: false })
      .limit(1000);

    const passageCounts: Record<string, number> = {};
    passageEvents?.forEach((e: any) => {
      const key = `${e.event_data?.book || "?"} ${e.event_data?.chapter || "?"}`;
      passageCounts[key] = (passageCounts[key] || 0) + 1;
    });
    const topPassages = Object.entries(passageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([passage, count]) => ({ passage, count }));

    // Growth: new users per day (last 30 days)
    const { data: profiles } = await admin
      .from("profiles")
      .select("created_at")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: true });

    const growthByDay: Record<string, number> = {};
    profiles?.forEach((p: any) => {
      const day = p.created_at?.slice(0, 10);
      if (day) growthByDay[day] = (growthByDay[day] || 0) + 1;
    });
    const growthData = Object.entries(growthByDay).map(([date, count]) => ({ date, count }));

    // User list
    const { data: userList } = await admin
      .from("profiles")
      .select("user_id, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    // Get emails from auth (via admin API)
    const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, { email: string; last_sign_in: string | null }> = {};
    authUsers?.forEach((u: any) => {
      emailMap[u.id] = { email: u.email || "", last_sign_in: u.last_sign_in_at };
    });

    const users = userList?.map((p: any) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      email: emailMap[p.user_id]?.email || "",
      created_at: p.created_at,
      last_sign_in: emailMap[p.user_id]?.last_sign_in || null,
    })) ?? [];

    const result = {
      totalUsers: totalUsers ?? 0,
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
      totalNotes: totalNotes ?? 0,
      noteUserPct,
      recentShares: recentShares ?? [],
      recentQueries: recentQueries ?? [],
      topPassages,
      growthData,
      users,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const status = e.message === "Forbidden" ? 403 : e.message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
