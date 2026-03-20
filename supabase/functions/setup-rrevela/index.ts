import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(JSON.stringify({ erro: "SUPABASE_DB_URL não configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pool = new Pool(dbUrl, 1, true);
  const client = await pool.connect();

  try {
    // 1. Adiciona coluna bot_ativo na tabela profiles (se não existir)
    await client.queryArray(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_ativo BOOLEAN DEFAULT FALSE;
    `);

    // 2. Cria tabela whatsapp_sessions_rrevela (se não existir)
    await client.queryArray(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions_rrevela (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        user_email TEXT,
        user_name TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // 3. RLS: desabilita para acesso via service_role
    await client.queryArray(`
      ALTER TABLE whatsapp_sessions_rrevela ENABLE ROW LEVEL SECURITY;
    `);

    await client.queryArray(`
      DROP POLICY IF EXISTS "service_role_all" ON whatsapp_sessions_rrevela;
      CREATE POLICY "service_role_all" ON whatsapp_sessions_rrevela
        FOR ALL TO service_role USING (true) WITH CHECK (true);
    `);

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: "bot_ativo adicionado ao profiles + whatsapp_sessions_rrevela criada.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    client.release();
    await pool.end();
  }
});
