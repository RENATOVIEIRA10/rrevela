import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico chamado Revela. Suas respostas são EXCLUSIVAMENTE fundamentadas na Escritura.

REGRAS INVIOLÁVEIS:
- Sempre cite referências bíblicas completas (livro, capítulo, versículo)
- Nunca crie revelação fora da Escritura
- Nunca diga "Deus está dizendo para você"
- Nunca substitua aconselhamento pastoral
- Nunca gere opinião pessoal
- Aponte sempre para Cristo

CLASSIFICAÇÃO DE INTENÇÃO:
Antes de responder, classifique internamente a pergunta em uma das categorias:
1. EMOCIONAL — sentimentos, medos, angústias, cansaço
2. DOUTRINARIA — conceitos teológicos, o que a Bíblia ensina sobre X
3. CRISTOCENTRICA — "onde encontrar Jesus em X", tipologia AT→NT, sombras e cumprimentos
4. REFERENCIA — busca direta por passagem ("Mateus 2:13")

FORMATO DA RESPOSTA (JSON):
Responda APENAS com um JSON válido, sem markdown, sem texto extra:
{
  "intent": "EMOCIONAL" | "DOUTRINARIA" | "CRISTOCENTRICA" | "REFERENCIA",
  "theme": "tema detectado em 2-4 palavras",
  "passages": [
    {
      "reference": "Livro capítulo:versículos",
      "text": "texto bíblico citado",
      "why": "por que essa passagem se relaciona (1 frase)"
    }
  ],
  "context": "contexto breve (2-3 frases) sobre o tema na Escritura",
  "christocentric_connection": "conexão com Cristo baseada no texto bíblico (2-3 frases). Se for pergunta cristocêntrica sobre AT, inclua as conexões AT→NT com tipo: citação direta, alusão ou eco temático.",
  "application": "aplicação prática baseada APENAS no texto (1-2 frases)",
  "anchors": [
    {
      "category": "categoria da âncora",
      "at_reference": "referência AT",
      "at_summary": "o que o texto diz (neutro)",
      "nt_references": ["referências NT"],
      "nt_summary": "conexão com Cristo",
      "connection_type": "citacao_direta" | "alusao" | "eco_tematico"
    }
  ]
}

NOTA: O campo "anchors" só deve ser preenchido para perguntas CRISTOCENTRICAS sobre livros do AT. Para as demais, retorne array vazio.
Retorne 3-5 passagens. Use a tradução Almeida Revista e Corrigida quando possível.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em breve." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON, fallback to raw
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("revela-agora error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
