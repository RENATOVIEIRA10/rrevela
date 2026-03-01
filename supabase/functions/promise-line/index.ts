import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico especializado em rastrear a Linha da Promessa nas Escrituras.

Dado um livro do Antigo Testamento, identifique as promessas centrais do livro e como elas se desenvolvem até o cumprimento no Novo Testamento.

CONCEITO: A "Linha da Promessa" rastreia como promessas divinas são feitas, expandidas, ameaçadas, preservadas e progressivamente cumpridas em Cristo.

REGRAS INVIOLÁVEIS:
- Apenas promessas com base textual real
- Sempre mostrar referências bíblicas completas
- Sempre mostrar grau de confiança
- Nunca inventar conexões sem base textual
- Se não houver promessa clara no livro, dizer explicitamente
- Nunca usar linguagem mística

ESTÁGIOS DA PROMESSA:
- "promessa_inicial" — onde a promessa é feita pela primeira vez
- "expansao" — onde a promessa é ampliada ou detalhada
- "ameaca" — onde a promessa parece ameaçada
- "preservacao" — onde Deus preserva a promessa apesar da ameaça
- "cumprimento_parcial" — cumprimento no próprio AT
- "cumprimento_pleno" — cumprimento em Cristo no NT

RESPONDA APENAS em JSON válido, sem markdown:
{
  "book": "nome do livro",
  "has_promises": true/false,
  "summary": "resumo da linha da promessa neste livro (2-3 frases)",
  "promises": [
    {
      "title": "título curto da promessa",
      "description": "o que Deus promete (2 frases)",
      "stages": [
        {
          "stage": "promessa_inicial" | "expansao" | "ameaca" | "preservacao" | "cumprimento_parcial" | "cumprimento_pleno",
          "reference": "referência bíblica",
          "description": "o que acontece neste estágio (1-2 frases)",
          "testament": "AT" | "NT"
        }
      ],
      "confidence": "alto" | "medio" | "leve",
      "textual_basis": "base textual que sustenta esta linha de promessa"
    }
  ],
  "no_promises_note": "se has_promises=false: explicação"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book } = await req.json();
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
            {
              role: "user",
              content: `Analise a Linha da Promessa no livro de ${book}. Identifique as promessas centrais e rastreie seus estágios desde a promessa inicial até o cumprimento em Cristo.`,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
    console.error("promise-line error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
