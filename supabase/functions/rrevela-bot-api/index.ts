import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── System prompts (reuse from existing edge functions) ──

const REVELA_AGORA_PROMPT = `Você é um assistente bíblico cristocêntrico chamado Revela. Suas respostas são EXCLUSIVAMENTE fundamentadas na Escritura.

REGRAS INVIOLÁVEIS:
- Sempre cite referências bíblicas completas (livro, capítulo, versículo)
- Nunca crie revelação fora da Escritura
- Nunca diga "Deus está dizendo para você"
- Nunca substitua aconselhamento pastoral
- Nunca gere opinião pessoal
- Aponte sempre para Cristo

CLASSIFICAÇÃO DE INTENÇÃO:
1. EMOCIONAL — sentimentos, medos, angústias
2. DOUTRINARIA — conceitos teológicos
3. CRISTOCENTRICA — tipologia AT→NT
4. REFERENCIA — busca por passagem

FORMATO (JSON válido, sem markdown):
{
  "intent": "EMOCIONAL" | "DOUTRINARIA" | "CRISTOCENTRICA" | "REFERENCIA",
  "theme": "tema em 2-4 palavras",
  "passages": [{"reference": "Livro cap:vers", "text": "texto", "why": "razão"}],
  "context": "contexto breve (2-3 frases)",
  "christocentric_connection": "conexão com Cristo (2-3 frases)",
  "application": "aplicação prática (1-2 frases)"
}

Retorne 3-5 passagens. Use Almeida Revista e Corrigida.`;

const VERSE_REVEAL_PROMPT = `Você é um assistente bíblico cristocêntrico rigoroso. Revele o significado de um versículo.

REGRAS:
- Nunca inventar interpretações sem base textual
- Linguagem neutra ("O texto mostra...")
- Conexão cristocêntrica APENAS com base textual real

RESPONDA em JSON válido, sem markdown:
{
  "theme": "Tema em 1 linha",
  "explanation": "O que o texto diz (1-2 frases)",
  "christocentric_connection": "Conexão com Cristo ou null",
  "cross_references": [{"reference": "Livro cap:vers", "text": "trecho", "connection_type": "Forte"|"Média"|"Eco", "explanation": "razão"}]
}

Retorne 3-5 referências cruzadas.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { action, phone } = body;

    // ── Authenticate bot session via phone ──
    if (!phone) {
      return json({ erro: "phone obrigatório" }, 400);
    }

    const { data: session } = await supabase
      .from("whatsapp_sessions_rrevela")
      .select("*")
      .eq("phone", phone)
      .single();

    // Actions that don't require auth
    if (!session && action !== "ping") {
      return json({ erro: "Sessão não encontrada. Faça login primeiro." }, 401);
    }

    const userId = session?.user_id;

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: ping — health check
    // ═══════════════════════════════════════════════════════════════════
    if (action === "ping") {
      return json({ ok: true, authenticated: !!session });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: verses — buscar versículos da Bíblia
    // Body: { book, chapter, verse_start?, verse_end?, translation? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "verses") {
      const { book, chapter, verse_start, verse_end, translation = "acf" } = body;

      if (!book || !chapter) return json({ erro: "book e chapter são obrigatórios" }, 400);

      let query = supabase
        .from("bible_verses")
        .select("book, chapter, verse, text")
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("translation", translation)
        .order("verse");

      if (verse_start) query = query.gte("verse", verse_start);
      if (verse_end) query = query.lte("verse", verse_end);

      const { data, error } = await query;
      if (error) return json({ erro: error.message }, 500);

      return json({ verses: data || [] });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: search — busca textual na Bíblia
    // Body: { query, translation? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "search") {
      const { query: searchQuery, translation = "acf" } = body;
      if (!searchQuery) return json({ erro: "query obrigatória" }, 400);

      const { data, error } = await supabase.rpc("search_bible", {
        search_query: searchQuery,
        translation_filter: translation,
        result_limit: 10,
      });

      if (error) return json({ erro: error.message }, 500);
      return json({ results: data || [] });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: revela — IA Revela Agora (pergunta livre)
    // Body: { query }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "revela") {
      const { query: userQuery } = body;
      if (!userQuery) return json({ erro: "query obrigatória" }, 400);

      const aiResult = await callAI(REVELA_AGORA_PROMPT, userQuery, "google/gemini-3-flash-preview", 0.3);
      return json(aiResult);
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: reveal_verse — IA revela versículo específico
    // Body: { book, chapter, verse, verse_text }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "reveal_verse") {
      const { book, chapter, verse, verse_text } = body;
      if (!book || !chapter || !verse) return json({ erro: "book, chapter, verse obrigatórios" }, 400);

      const prompt = `Versículo: ${book} ${chapter}:${verse}\nTexto: "${verse_text || ""}"\n\nRevele:\n1. Tema central\n2. O que o texto diz\n3. Conexão cristocêntrica\n4. 3-5 referências cruzadas`;
      const aiResult = await callAI(VERSE_REVEAL_PROMPT, prompt, "google/gemini-2.5-flash", 0.15);
      return json(aiResult);
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: devotional — devocional do dia
    // Body: { day_index? } (opcional, usa ordem)
    // ═══════════════════════════════════════════════════════════════════
    if (action === "devotional") {
      const { day_index } = body;

      // Get total entries
      const { count } = await supabase
        .from("devotional_entries")
        .select("*", { count: "exact", head: true });

      const total = count || 1;
      // If day_index not provided, use day of year
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const idx = day_index != null ? day_index : dayOfYear % total;

      const { data: entry, error } = await supabase
        .from("devotional_entries")
        .select("*")
        .eq("order_index", idx)
        .single();

      if (error || !entry) {
        // Fallback: get first entry
        const { data: fallback } = await supabase
          .from("devotional_entries")
          .select("*")
          .order("order_index")
          .limit(1)
          .single();

        return json({ devotional: fallback || null });
      }

      // Check if user has completed this
      let progress = null;
      if (userId) {
        const { data: prog } = await supabase
          .from("user_devotional_progress")
          .select("completed, favorited")
          .eq("user_id", userId)
          .eq("devotional_id", entry.id)
          .single();
        progress = prog;
      }

      return json({ devotional: entry, progress });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: favorites — listar favoritos do usuário
    // Body: {} (sem params extra)
    // ═══════════════════════════════════════════════════════════════════
    if (action === "favorites") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);

      const { data, error } = await supabase
        .from("favorite_verses")
        .select("book, chapter, verse, translation, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) return json({ erro: error.message }, 500);
      return json({ favorites: data || [] });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: add_favorite — adicionar favorito
    // Body: { book, chapter, verse, translation? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "add_favorite") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);
      const { book, chapter, verse, translation = "acf" } = body;
      if (!book || !chapter || !verse) return json({ erro: "book, chapter, verse obrigatórios" }, 400);

      const { error } = await supabase.from("favorite_verses").insert({
        user_id: userId,
        book,
        chapter,
        verse,
        translation,
      });

      if (error) return json({ erro: error.message }, 500);
      return json({ sucesso: true });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: remove_favorite — remover favorito
    // Body: { book, chapter, verse }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "remove_favorite") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);
      const { book, chapter, verse } = body;

      const { error } = await supabase
        .from("favorite_verses")
        .delete()
        .eq("user_id", userId)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);

      if (error) return json({ erro: error.message }, 500);
      return json({ sucesso: true });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: highlights — listar destaques do usuário
    // Body: { book?, chapter? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "highlights") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);

      let query = supabase
        .from("highlights")
        .select("book, chapter, verse, color_key, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (body.book) query = query.eq("book", body.book);
      if (body.chapter) query = query.eq("chapter", body.chapter);

      const { data, error } = await query.limit(100);
      if (error) return json({ erro: error.message }, 500);
      return json({ highlights: data || [] });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: add_highlight — adicionar destaque
    // Body: { book, chapter, verse, color_key }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "add_highlight") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);
      const { book, chapter, verse, color_key } = body;
      if (!book || !chapter || !verse || !color_key) return json({ erro: "book, chapter, verse, color_key obrigatórios" }, 400);

      // Upsert: update color if already exists
      const { data: existing } = await supabase
        .from("highlights")
        .select("id")
        .eq("user_id", userId)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse)
        .single();

      if (existing) {
        await supabase.from("highlights").update({ color_key }).eq("id", existing.id);
      } else {
        await supabase.from("highlights").insert({ user_id: userId, book, chapter, verse, color_key });
      }

      return json({ sucesso: true });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: remove_highlight — remover destaque
    // Body: { book, chapter, verse }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "remove_highlight") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);
      const { book, chapter, verse } = body;

      const { error } = await supabase
        .from("highlights")
        .delete()
        .eq("user_id", userId)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);

      if (error) return json({ erro: error.message }, 500);
      return json({ sucesso: true });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: notes — listar notas do usuário
    // Body: { book?, chapter? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "notes") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);

      let query = supabase
        .from("structured_notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (body.book) query = query.eq("book", body.book);
      if (body.chapter) query = query.eq("chapter", body.chapter);

      const { data, error } = await query.limit(50);
      if (error) return json({ erro: error.message }, 500);
      return json({ notes: data || [] });
    }

    // ═══════════════════════════════════════════════════════════════════
    // ACTION: reading_plan — progresso do plano de leitura
    // Body: { plan_id? }
    // ═══════════════════════════════════════════════════════════════════
    if (action === "reading_plan") {
      if (!userId) return json({ erro: "Usuário não autenticado" }, 401);

      let query = supabase
        .from("user_reading_progress")
        .select("*")
        .eq("user_id", userId);

      if (body.plan_id) query = query.eq("plan_id", body.plan_id);

      const { data, error } = await query;
      if (error) return json({ erro: error.message }, 500);
      return json({ plans: data || [] });
    }

    return json({ erro: "Ação inválida: " + action }, 400);
  } catch (err) {
    console.error("rrevela-bot-api error:", err);
    return json({ erro: err.message }, 500);
  }
});

// ── Helpers ──

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(systemPrompt: string, userPrompt: string, model: string, temperature: number) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error("Rate limit atingido. Tente novamente em breve.");
    if (status === 402) throw new Error("Créditos insuficientes.");
    throw new Error("Erro na IA");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: content };
  }
}
