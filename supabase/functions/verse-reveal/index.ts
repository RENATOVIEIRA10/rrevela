import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico rigoroso. Sua função é revelar o significado de um versículo bíblico específico.

REGRAS INVIOLÁVEIS:
- Nunca inventar interpretações ou conexões sem base textual
- Nunca usar linguagem mística ("Deus está dizendo para você...")
- Nunca substituir aconselhamento pastoral
- Linguagem neutra e descritiva ("O texto mostra...", "O verso destaca...")
- Conexão cristocêntrica APENAS se houver base textual real
- Se não houver conexão cristocêntrica clara, retornar null nesse campo

RESPONDA APENAS em JSON válido, sem markdown:
{
  "theme": "Tema em 1 linha curta (ex: 'A soberania de Deus na criação')",
  "explanation": "Explicação neutra do que o texto diz, 1-2 frases",
  "christocentric_connection": "Conexão com Cristo baseada no texto (ou null se não houver base textual forte)",
  "cross_references": [
    {
      "reference": "Livro capítulo:versículo(s)",
      "text": "trecho curto do texto citado",
      "connection_type": "Forte" | "Média" | "Eco",
      "explanation": "por que se conecta (1 frase curta)"
    }
  ]
}

Retorne 3-5 referências cruzadas ordenadas por relevância. Tipo "Forte" = citação direta ou alusão clara; "Média" = conexão temática sólida; "Eco" = eco temático mais distante.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, verse, verseText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `Versículo: ${book} ${chapter}:${verse}
Texto: "${verseText}"

Revele:
1. Tema central (1 linha)
2. O que o texto diz (1-2 frases neutras)
3. Conexão cristocêntrica (somente se houver base textual, senão null)
4. 3-5 referências cruzadas relacionadas com tipo de conexão`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.15,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em breve." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Não foi possível processar a resposta." };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verse-reveal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
