import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapa de abreviações → nome canônico do livro
const ABREVIACOES: Record<string, string> = {
  "gn": "Gênesis", "gen": "Gênesis", "genesis": "Gênesis", "gênesis": "Gênesis",
  "ex": "Êxodo", "exo": "Êxodo", "êxodo": "Êxodo", "exodo": "Êxodo",
  "lv": "Levítico", "lev": "Levítico", "levítico": "Levítico", "levitico": "Levítico",
  "nm": "Números", "num": "Números", "números": "Números", "numeros": "Números",
  "dt": "Deuteronômio", "deu": "Deuteronômio", "deuteronômio": "Deuteronômio",
  "js": "Josué", "jos": "Josué", "josue": "Josué", "josué": "Josué",
  "jz": "Juízes", "jui": "Juízes", "juízes": "Juízes", "juizes": "Juízes",
  "rt": "Rute", "rut": "Rute", "rute": "Rute",
  "1sm": "1 Samuel", "1sam": "1 Samuel",
  "2sm": "2 Samuel", "2sam": "2 Samuel",
  "1rs": "1 Reis", "1rei": "1 Reis",
  "2rs": "2 Reis", "2rei": "2 Reis",
  "1cr": "1 Crônicas", "1cro": "1 Crônicas",
  "2cr": "2 Crônicas", "2cro": "2 Crônicas",
  "ed": "Esdras", "esd": "Esdras", "esdras": "Esdras",
  "ne": "Neemias", "nee": "Neemias", "neemias": "Neemias",
  "et": "Ester", "est": "Ester", "ester": "Ester",
  "jo": "Jó", "job": "Jó", "jó": "Jó",
  "sl": "Salmos", "sal": "Salmos", "salmo": "Salmos", "salmos": "Salmos", "ps": "Salmos",
  "pv": "Provérbios", "pro": "Provérbios", "prov": "Provérbios", "provérbios": "Provérbios",
  "ec": "Eclesiastes", "ecl": "Eclesiastes", "eclesiastes": "Eclesiastes",
  "ct": "Cantares", "cnt": "Cantares", "cantares": "Cantares", "cânticos": "Cantares",
  "is": "Isaías", "isa": "Isaías", "isaias": "Isaías", "isaías": "Isaías",
  "jr": "Jeremias", "jer": "Jeremias", "jeremias": "Jeremias",
  "lm": "Lamentações", "lam": "Lamentações", "lamentações": "Lamentações",
  "ez": "Ezequiel", "eze": "Ezequiel", "ezequiel": "Ezequiel",
  "dn": "Daniel", "dan": "Daniel", "daniel": "Daniel",
  "os": "Oséias", "ose": "Oséias", "oséias": "Oséias", "oseias": "Oséias",
  "jl": "Joel", "joel": "Joel",
  "am": "Amós", "amo": "Amós", "amós": "Amós", "amos": "Amós",
  "ob": "Obadias", "abd": "Obadias", "obadias": "Obadias",
  "jn": "Jonas", "jon": "Jonas", "jonas": "Jonas",
  "mq": "Miquéias", "mic": "Miquéias", "miquéias": "Miquéias", "miqueias": "Miquéias",
  "na": "Naum", "nau": "Naum", "naum": "Naum",
  "hc": "Habacuque", "hab": "Habacuque", "habacuque": "Habacuque",
  "sf": "Sofonias", "sof": "Sofonias", "sofonias": "Sofonias",
  "ag": "Ageu", "age": "Ageu", "ageu": "Ageu",
  "zc": "Zacarias", "zac": "Zacarias", "zacarias": "Zacarias",
  "ml": "Malaquias", "mal": "Malaquias", "malaquias": "Malaquias",
  "mt": "Mateus", "mat": "Mateus", "mateus": "Mateus",
  "mc": "Marcos", "mar": "Marcos", "marcos": "Marcos",
  "lc": "Lucas", "luc": "Lucas", "lucas": "Lucas",
  "jo3": "João", "joão": "João", "joao": "João", "jão": "João",
  "at": "Atos", "atos": "Atos", "at.": "Atos",
  "rm": "Romanos", "rom": "Romanos", "romanos": "Romanos",
  "1co": "1 Coríntios", "1cor": "1 Coríntios",
  "2co": "2 Coríntios", "2cor": "2 Coríntios",
  "gl": "Gálatas", "gal": "Gálatas", "gálatas": "Gálatas", "galatas": "Gálatas",
  "ef": "Efésios", "efe": "Efésios", "efésios": "Efésios", "efesios": "Efésios",
  "fp": "Filipenses", "fil": "Filipenses", "filipenses": "Filipenses",
  "cl": "Colossenses", "col": "Colossenses", "colossenses": "Colossenses",
  "1ts": "1 Tessalonicenses", "1te": "1 Tessalonicenses",
  "2ts": "2 Tessalonicenses", "2te": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "1ti": "1 Timóteo",
  "2tm": "2 Timóteo", "2ti": "2 Timóteo",
  "tt": "Tito", "tit": "Tito", "tito": "Tito",
  "fm": "Filemom", "flm": "Filemom", "filemom": "Filemom",
  "hb": "Hebreus", "heb": "Hebreus", "hebreus": "Hebreus",
  "tg": "Tiago", "tig": "Tiago", "tiago": "Tiago",
  "1pe": "1 Pedro", "1pd": "1 Pedro",
  "2pe": "2 Pedro", "2pd": "2 Pedro",
  "1jo": "1 João", "1jn": "1 João",
  "2jo": "2 João", "2jn": "2 João",
  "3jo": "3 João", "3jn": "3 João",
  "jd": "Judas", "jud": "Judas", "judas": "Judas",
  "ap": "Apocalipse", "apo": "Apocalipse", "apocalipse": "Apocalipse", "rv": "Apocalipse",
};

function normalizarLivro(input: string): string {
  const key = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  // Tenta lookup direto com acentos
  const keyRaw = input.toLowerCase().trim();
  if (ABREVIACOES[keyRaw]) return ABREVIACOES[keyRaw];
  if (ABREVIACOES[key]) return ABREVIACOES[key];
  // Retorna o input original capitalizado como fallback
  return input;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action, livro, capitulo } = body;

    // ── VERSÍCULO DO DIA ──
    if (action === "versiculo_dia") {
      // Usa o dia do ano como seed para selecionar um versículo diferente a cada dia
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);

      // Conta total de versículos na tradução ACF
      const { count } = await supabase
        .from("bible_verses")
        .select("*", { count: "exact", head: true })
        .eq("translation", "acf");

      if (!count || count === 0) {
        return new Response(JSON.stringify({ erro: "Bíblia não importada ainda." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const offset = dayOfYear % count;
      const { data } = await supabase
        .from("bible_verses")
        .select("book, chapter, verse, text")
        .eq("translation", "acf")
        .range(offset, offset);

      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ erro: "Versículo não encontrado." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const v = data[0];
      return new Response(
        JSON.stringify({
          versiculo: {
            texto: v.text,
            referencia: `${v.book} ${v.chapter}:${v.verse}`,
            livro: v.book,
            capitulo: v.chapter,
            versiculo: v.verse,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── CAPÍTULO ──
    if (action === "capitulo") {
      if (!livro || !capitulo) {
        return new Response(JSON.stringify({ erro: "Informe livro e capítulo." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const livroNormalizado = normalizarLivro(String(livro));
      const capNum = parseInt(String(capitulo));

      // Tenta busca exata primeiro
      let { data } = await supabase
        .from("bible_verses")
        .select("book, chapter, verse, text")
        .eq("translation", "acf")
        .eq("book", livroNormalizado)
        .eq("chapter", capNum)
        .order("verse");

      // Se não encontrou, tenta ilike
      if (!data || data.length === 0) {
        const { data: dataIlike } = await supabase
          .from("bible_verses")
          .select("book, chapter, verse, text")
          .eq("translation", "acf")
          .ilike("book", `%${livroNormalizado}%`)
          .eq("chapter", capNum)
          .order("verse");
        data = dataIlike;
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ erro: `Capítulo "${livro} ${capitulo}" não encontrado. Verifique o nome do livro.` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          livro: data[0].book,
          capitulo: data[0].chapter,
          versiculos: data.map((v) => ({ versiculo: v.verse, texto: v.text })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
