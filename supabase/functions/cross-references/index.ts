import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico. Sua função é encontrar referências cruzadas e conexões messiânicas para um versículo bíblico.

REGRAS INVIOLÁVEIS:
- Apenas referências bíblicas reais
- Nunca inventar conexões sem base textual
- Nunca usar linguagem mística
- Sempre mostrar grau de confiança
- Se não houver conexão forte, dizer explicitamente

RESPONDA APENAS em JSON válido, sem markdown:
{
  "cross_references": [
    {
      "reference": "Livro capítulo:versículos",
      "text": "texto bíblico citado (Almeida RC quando possível)",
      "relationship": "mesmo_termo" | "estrutura_semelhante" | "citacao_direta" | "alusao_tematica" | "uso_messianico",
      "explanation": "por que esta referência se conecta (1 frase)",
      "confidence": "alto" | "medio" | "leve"
    }
  ],
  "messianic_line": {
    "has_connection": true/false,
    "connections": [
      {
        "type": "promessa_messianica" | "padrao_tipologico" | "eco_tematico" | "citacao_cumprimento",
        "at_reference": "referência AT (se aplicável)",
        "nt_reference": "referência NT",
        "description": "descrição da conexão (2 frases max)",
        "confidence": "alto" | "medio" | "leve",
        "textual_basis": "base textual que sustenta a conexão"
      }
    ],
    "no_connection_note": "se has_connection=false, explicar: 'Não há evidência textual forte para afirmar conexão messiânica direta neste verso.'"
  }
}

Retorne 3-6 referências cruzadas. Para linha messiânica, retorne apenas conexões com base textual real.`;

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

Encontre:
1. Referências cruzadas (textos com mesmo termo, estrutura semelhante, citações diretas, alusões)
2. Conexão com a linha messiânica (se houver base textual)

Se não houver conexão messiânica clara, diga explicitamente.`;

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
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
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
    console.error("cross-references error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
