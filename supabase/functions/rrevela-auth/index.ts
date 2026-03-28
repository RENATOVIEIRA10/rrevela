import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action, phone, email } = await req.json();

    // ── GET — retorna sessão ativa pelo telefone ──
    if (action === "get") {
      const { data } = await supabase
        .from("whatsapp_sessions_rrevela")
        .select("*")
        .eq("phone", phone)
        .single();
      return new Response(JSON.stringify({ session: data || null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST — retorna todas as sessões ativas ──
    if (action === "list") {
      const { data } = await supabase
        .from("whatsapp_sessions_rrevela")
        .select("phone, user_email, user_name, created_at");
      return new Response(JSON.stringify({ sessions: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LOGIN — autentica por e-mail ──
    if (action === "login") {
      if (!email) {
        return new Response(JSON.stringify({ sucesso: false, erro: "E-mail não informado." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Busca usuário pelo e-mail
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const user = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: "E-mail não encontrado. Crie sua conta no app Revela." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verifica bot_ativo na tabela profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("bot_ativo, display_name")
        .eq("user_id", user.id)
        .single();

      // Verifica whitelist manual (plano_ativo na sessão ou no registro email:)
      const { data: whitelistEntry } = await supabase
        .from("whatsapp_sessions_rrevela")
        .select("plano_ativo")
        .eq("phone", `email:${email.toLowerCase()}`)
        .single();

      const isProByWhitelist = whitelistEntry?.plano_ativo === "true" || whitelistEntry?.plano_ativo === true;

      if (!profile?.bot_ativo && !isProByWhitelist) {
        return new Response(
          JSON.stringify({
            sucesso: false,
            erro: "Você ainda não tem o Revela Pro ativo. Assine em: revela.app/pro",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Cria/atualiza sessão
      const { error: upsertError } = await supabase
        .from("whatsapp_sessions_rrevela")
        .upsert(
          {
            phone,
            user_id: user.id,
            user_email: user.email,
            user_name: profile?.display_name || null,
            created_at: new Date().toISOString(),
          },
          { onConflict: "phone" }
        );

      if (upsertError) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: upsertError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ sucesso: true, user_name: profile?.display_name, user_email: user.email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── LOGOUT ──
    if (action === "logout") {
      await supabase.from("whatsapp_sessions_rrevela").delete().eq("phone", phone);
      return new Response(JSON.stringify({ sucesso: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ erro: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
