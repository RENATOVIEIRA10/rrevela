import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { book, chapter_start, chapter_end, verse_start, verse_end, title, gospel_revelation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const passage = verse_start 
      ? `${book} ${chapter_start}:${verse_start}${verse_end ? `-${verse_end}` : ''}`
      : `${book} ${chapter_start}${chapter_end && chapter_end !== chapter_start ? `-${chapter_end}` : ''}`;

    const systemPrompt = `Você é um teólogo reformado que auxilia no estudo bíblico cristocêntrico. 
Regras invioláveis:
- Nunca diga "Deus está dizendo para você"
- Nunca crie revelação fora do texto bíblico
- Nunca substitua aconselhamento pastoral
- Nunca gere opinião pessoal ou linguagem mística
- Sempre use linguagem bíblica, pastoral, sem emocionalismo manipulativo
- Comece insights com "O texto mostra…", "Esta passagem revela…", "Aqui vemos…"
- Máximo 3 frases por insight`;

    const userPrompt = `Para o devocional "${title}" baseado em ${passage}:

Contexto: ${gospel_revelation}

Gere um insight devocional complementar (máx 3 frases) que:
1. Aprofunde a conexão do texto com o Evangelho
2. Mostre como essa passagem participa da história da redenção
3. Ofereça uma aplicação teológica fiel ao texto

Responda APENAS com o insight, sem títulos ou marcadores.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em breve." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("devotional-enrich error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
