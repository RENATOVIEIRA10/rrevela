import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Abbreviation → full Portuguese name mapping (damarals/biblias format)
const ABBREV_MAP: Record<string, string> = {
  "Gn": "Gênesis", "Êx": "Êxodo", "Ex": "Êxodo", "Lv": "Levítico", "Nm": "Números",
  "Dt": "Deuteronômio", "Js": "Josué", "Jz": "Juízes", "Rt": "Rute",
  "1Sm": "1 Samuel", "2Sm": "2 Samuel", "1Rs": "1 Reis", "2Rs": "2 Reis",
  "1Cr": "1 Crônicas", "2Cr": "2 Crônicas", "Ed": "Esdras", "Ne": "Neemias",
  "Et": "Ester", "Jó": "Jó", "Sl": "Salmos", "Pv": "Provérbios",
  "Ec": "Eclesiastes", "Ct": "Cantares", "Is": "Isaías", "Jr": "Jeremias",
  "Lm": "Lamentações", "Ez": "Ezequiel", "Dn": "Daniel", "Os": "Oséias",
  "Jl": "Joel", "Am": "Amós", "Ob": "Obadias", "Jn": "Jonas",
  "Mq": "Miquéias", "Na": "Naum", "Hc": "Habacuque", "Sf": "Sofonias",
  "Ag": "Ageu", "Zc": "Zacarias", "Ml": "Malaquias",
  "Mt": "Mateus", "Mc": "Marcos", "Lc": "Lucas", "Jo": "João",
  "At": "Atos", "Rm": "Romanos", "1Co": "1 Coríntios", "2Co": "2 Coríntios",
  "Gl": "Gálatas", "Ef": "Efésios", "Fp": "Filipenses", "Cl": "Colossenses",
  "1Ts": "1 Tessalonicenses", "2Ts": "2 Tessalonicenses",
  "1Tm": "1 Timóteo", "2Tm": "2 Timóteo", "Tt": "Tito", "Fm": "Filemom",
  "Hb": "Hebreus", "Tg": "Tiago", "1Pe": "1 Pedro", "2Pe": "2 Pedro",
  "1Jo": "1 João", "2Jo": "2 João", "3Jo": "3 João", "Jd": "Judas",
  "Ap": "Apocalipse",
};

// Full name mapping (thiagobodruk/biblia format)
const NAME_MAP: Record<string, string> = {
  "Gênesis": "Gênesis", "Êxodo": "Êxodo", "Levítico": "Levítico",
  "Números": "Números", "Deuteronômio": "Deuteronômio", "Josué": "Josué",
  "Juízes": "Juízes", "Rute": "Rute",
  "I Samuel": "1 Samuel", "II Samuel": "2 Samuel",
  "I Reis": "1 Reis", "II Reis": "2 Reis",
  "I Crônicas": "1 Crônicas", "II Crônicas": "2 Crônicas",
  "Esdras": "Esdras", "Neemias": "Neemias", "Ester": "Ester",
  "Jó": "Jó", "Salmos": "Salmos", "Provérbios": "Provérbios",
  "Eclesiastes": "Eclesiastes",
  "Cantares de Salomão": "Cantares", "Cânticos": "Cantares",
  "Cânticos de Salomão": "Cantares", "Cantares": "Cantares",
  "Isaías": "Isaías", "Jeremias": "Jeremias",
  "Lamentações de Jeremias": "Lamentações", "Lamentações": "Lamentações",
  "Ezequiel": "Ezequiel", "Daniel": "Daniel", "Oséias": "Oséias",
  "Joel": "Joel", "Amós": "Amós", "Obadias": "Obadias", "Jonas": "Jonas",
  "Miquéias": "Miquéias", "Naum": "Naum", "Habacuque": "Habacuque",
  "Sofonias": "Sofonias", "Ageu": "Ageu", "Zacarias": "Zacarias",
  "Malaquias": "Malaquias", "Mateus": "Mateus", "Marcos": "Marcos",
  "Lucas": "Lucas", "João": "João", "Atos": "Atos",
  "Atos dos Apóstolos": "Atos", "Romanos": "Romanos",
  "I Coríntios": "1 Coríntios", "II Coríntios": "2 Coríntios",
  "1 Coríntios": "1 Coríntios", "2 Coríntios": "2 Coríntios",
  "Gálatas": "Gálatas", "Efésios": "Efésios", "Filipenses": "Filipenses",
  "Colossenses": "Colossenses",
  "I Tessalonicenses": "1 Tessalonicenses", "II Tessalonicenses": "2 Tessalonicenses",
  "1 Tessalonicenses": "1 Tessalonicenses", "2 Tessalonicenses": "2 Tessalonicenses",
  "I Timóteo": "1 Timóteo", "II Timóteo": "2 Timóteo",
  "1 Timóteo": "1 Timóteo", "2 Timóteo": "2 Timóteo",
  "Tito": "Tito", "Filemom": "Filemom", "Filemon": "Filemom",
  "Hebreus": "Hebreus", "Tiago": "Tiago",
  "I Pedro": "1 Pedro", "II Pedro": "2 Pedro",
  "1 Pedro": "1 Pedro", "2 Pedro": "2 Pedro",
  "I João": "1 João", "II João": "2 João", "III João": "3 João",
  "1 João": "1 João", "2 João": "2 João", "3 João": "3 João",
  "Judas": "Judas", "Apocalipse": "Apocalipse",
};

const SOURCES: Record<string, string> = {
  acf: "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json",
  aa: "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json",
  arc: "https://raw.githubusercontent.com/damarals/biblias/master/inst/json/ARC.json",
  tb: "https://raw.githubusercontent.com/damarals/biblias/master/inst/json/TB.json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { translation } = await req.json();
    const translationKey = (translation || "").toLowerCase();

    if (!SOURCES[translationKey]) {
      return new Response(
        JSON.stringify({ error: `Unknown translation: ${translationKey}. Valid: ${Object.keys(SOURCES).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if already imported
    const { count } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true })
      .eq("translation", translationKey);

    if (count && count > 30000) {
      return new Response(
        JSON.stringify({ message: `${translationKey.toUpperCase()} already imported`, count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching ${translationKey.toUpperCase()} from ${SOURCES[translationKey]}...`);
    const response = await fetch(SOURCES[translationKey]);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const bibleData = await response.json();
    console.log(`Total books: ${bibleData.length}`);

    let totalVerses = 0;
    let errors = 0;

    for (const bookData of bibleData) {
      // Resolve book name from abbreviation or full name
      const rawName = bookData.nome || bookData.name || bookData.book || bookData.livro || "";
      const abbrev = bookData.abbrev || "";
      const bookName = ABBREV_MAP[abbrev] || NAME_MAP[rawName] || rawName;

      if (!bookName) {
        console.error("Unknown book:", JSON.stringify({ abbrev, rawName }));
        errors++;
        continue;
      }

      const chaptersData = bookData.chapters || bookData.capitulos || [];
      const verses: Array<{ book: string; chapter: number; verse: number; text: string; translation: string }> = [];

      for (let ci = 0; ci < chaptersData.length; ci++) {
        const chapter = chaptersData[ci];
        if (!Array.isArray(chapter)) continue;

        for (let vi = 0; vi < chapter.length; vi++) {
          const text = typeof chapter[vi] === "string"
            ? chapter[vi]
            : typeof chapter[vi] === "object" && chapter[vi] !== null
              ? (chapter[vi] as any).text || (chapter[vi] as any).texto || String(chapter[vi])
              : String(chapter[vi]);

          verses.push({ book: bookName, chapter: ci + 1, verse: vi + 1, text, translation: translationKey });
        }
      }

      // Insert in batches of 500
      for (let i = 0; i < verses.length; i += 500) {
        const batch = verses.slice(i, i + 500);
        const { error } = await supabase
          .from("bible_verses")
          .upsert(batch, { onConflict: "book,chapter,verse,translation" });

        if (error) {
          console.error(`Error inserting ${bookName} batch ${i}:`, error.message);
          errors++;
        } else {
          totalVerses += batch.length;
        }
      }

      console.log(`Imported ${bookName}: ${verses.length} verses`);
    }

    return new Response(
      JSON.stringify({ message: `${translationKey.toUpperCase()} import complete`, totalVerses, errors, books: bibleData.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
