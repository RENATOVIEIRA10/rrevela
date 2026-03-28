import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente bíblico cristocêntrico especializado em identificar padrões narrativos recorrentes nas Escrituras.

Dado um livro e capítulo, identifique padrões bíblicos presentes no texto.

PADRÕES COMUNS (não limitados a):
- Promessa → ameaça → preservação
- Queda → juízo → graça
- Exílio → retorno
- Sofrimento → exaltação
- Rejeição → glorificação
- Aliança → quebra → renovação
- Pecado → arrependimento → restauração
- Chamado → resistência → obediência
- Morte → ressurreição (literal ou figurada)
- Servidão → libertação

REGRAS INVIOLÁVEIS:
- Apenas padrões com base textual real neste capítulo
- Sempre mostrar referências bíblicas completas
- Sempre mostrar onde o padrão aparece em outros textos
- Nunca alegorizar ou forçar padrões
- Nunca usar linguagem mística
- Se não houver padrão claro, dizer explicitamente
- Grau de confiança obrigatório

RESPONDA APENAS em JSON válido, sem markdown:
{
  "book": "nome do livro",
  "chapter": número,
  "has_patterns": true/false,
  "patterns": [
    {
      "name": "nome curto do padrão (ex: Queda → Juízo → Graça)",
      "description": "descrição do padrão neste capítulo (2-3 frases)",
      "verses_in_chapter": "versículos onde aparece (ex: 1-8, 15-20)",
      "other_occurrences": [
        {
          "reference": "referência bíblica",
          "brief": "como o padrão aparece ali (1 frase)"
        }
      ],
      "christocentric_echo": "como este padrão aponta para Cristo (1-2 frases, apenas se houver base textual)",
      "confidence": "alto" | "medio" | "leve",
      "textual_basis": "base textual que sustenta a identificação deste padrão"
    }
  ],
  "no_patterns_note": "se has_patterns=false: explicação"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, depth } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let depthInstruction = "";
    if (depth === "essencial") {
      depthInstruction = "Identifique apenas os 1-2 padrões mais evidentes e óbvios. Foco em clareza.";
    } else if (depth === "intermediario") {
      depthInstruction = "Identifique 2-4 padrões, incluindo harmonia bíblica e padrões recorrentes.";
    } else {
      depthInstruction = "Análise profunda: identifique todos os padrões detectáveis (até 6), incluindo tipologia e conexões amplas AT ↔ NT.";
    }

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
            {
              role: "user",
              content: `Analise os padrões bíblicos em ${book} ${chapter}.\n\nNível de profundidade: ${depth || "intermediario"}.\n${depthInstruction}`,
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
    console.error("biblical-patterns error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
