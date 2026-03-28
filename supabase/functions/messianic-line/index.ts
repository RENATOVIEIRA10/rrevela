import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico especializado em revelar a linha messiânica nas Escrituras.

Dado um livro e capítulo, identifique como o texto atual constrói a revelação progressiva de Cristo.

REGRAS INVIOLÁVEIS:
- Apenas conexões com base textual real
- Sempre mostrar referências bíblicas completas
- Sempre mostrar tipo de conexão e grau de confiança
- Se não houver evidência textual forte, dizer explicitamente
- Nunca forçar tipologia
- Nunca alegorizar

TIPOS DE CONEXÃO:
- "citacao_cumprimento" — forte: texto é citado ou cumprido no NT
- "promessa_messianica" — forte: promessa explícita sobre o Messias
- "padrao_tipologico" — média: padrão narrativo que prefigura Cristo
- "eco_tematico" — leve: tema que ecoa na obra de Cristo

RESPONDA APENAS em JSON válido, sem markdown:
{
  "book": "nome do livro",
  "chapter": número,
  "has_messianic_content": true/false,
  "summary": "resumo de como este capítulo se relaciona com Cristo (2-3 frases). Se não houver relação, explicar.",
  "connections": [
    {
      "verse_range": "versículos relevantes (ex: 1-3)",
      "category": "título curto da conexão",
      "what_text_says": "o que o texto realmente diz, sem interpretação (2 frases)",
      "christocentric_connection": "como aponta para Cristo (2-3 frases)",
      "nt_references": ["referências NT"],
      "connection_type": "citacao_cumprimento" | "promessa_messianica" | "padrao_tipologico" | "eco_tematico",
      "confidence": "alto" | "medio" | "leve",
      "textual_basis": "base textual que sustenta esta conexão"
    }
  ],
  "no_evidence_note": "apenas se has_messianic_content=false: 'Não há evidência textual suficiente para afirmar conexão messiânica direta neste capítulo.'"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
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
            { role: "user", content: `Analise a linha messiânica em ${book} ${chapter}. Identifique todas as conexões cristocêntricas com base textual.` },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    console.error("messianic-line error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
