import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if already imported
    const { count } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true })
      .eq("translation", "acf");

    if (count && count > 30000) {
      return new Response(
        JSON.stringify({ message: "Bible already imported", count }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch ACF Bible JSON from GitHub (thiagobodruk/biblia - Portuguese version)
    console.log("Fetching ACF Bible from GitHub...");
    const response = await fetch(
      "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json"
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible: ${response.status}`);
    }

    const bibleData = await response.json();
    
    // Log structure of first item to debug
    const firstItem = bibleData[0];
    console.log("First item keys:", Object.keys(firstItem));
    console.log("First item sample:", JSON.stringify({
      ...firstItem,
      chapters: firstItem.chapters ? `[${firstItem.chapters.length} chapters]` : undefined,
      capitulos: firstItem.capitulos ? `[${firstItem.capitulos.length} caps]` : undefined,
    }));

    // Determine field names from actual data
    const bookField = firstItem.nome || firstItem.name || firstItem.book || firstItem.livro;
    const chapterField = firstItem.chapters || firstItem.capitulos;
    
    console.log(`Book field value: ${bookField}`);
    console.log(`Total books: ${bibleData.length}`);

    // Book name mapping (handles variations in the source)
    const BOOK_NAME_MAP: Record<string, string> = {
      "Gênesis": "Gênesis",
      "Êxodo": "Êxodo",
      "Levítico": "Levítico",
      "Números": "Números",
      "Deuteronômio": "Deuteronômio",
      "Josué": "Josué",
      "Juízes": "Juízes",
      "Rute": "Rute",
      "I Samuel": "1 Samuel",
      "II Samuel": "2 Samuel",
      "I Reis": "1 Reis",
      "II Reis": "2 Reis",
      "I Crônicas": "1 Crônicas",
      "II Crônicas": "2 Crônicas",
      "Esdras": "Esdras",
      "Neemias": "Neemias",
      "Ester": "Ester",
      "Jó": "Jó",
      "Salmos": "Salmos",
      "Provérbios": "Provérbios",
      "Eclesiastes": "Eclesiastes",
      "Cantares de Salomão": "Cantares",
      "Cânticos": "Cantares",
      "Cânticos de Salomão": "Cantares",
      "Cantares": "Cantares",
      "Isaías": "Isaías",
      "Jeremias": "Jeremias",
      "Lamentações de Jeremias": "Lamentações",
      "Lamentações": "Lamentações",
      "Ezequiel": "Ezequiel",
      "Daniel": "Daniel",
      "Oséias": "Oséias",
      "Joel": "Joel",
      "Amós": "Amós",
      "Obadias": "Obadias",
      "Jonas": "Jonas",
      "Miquéias": "Miquéias",
      "Naum": "Naum",
      "Habacuque": "Habacuque",
      "Sofonias": "Sofonias",
      "Ageu": "Ageu",
      "Zacarias": "Zacarias",
      "Malaquias": "Malaquias",
      "Mateus": "Mateus",
      "Marcos": "Marcos",
      "Lucas": "Lucas",
      "João": "João",
      "Atos": "Atos",
      "Atos dos Apóstolos": "Atos",
      "Romanos": "Romanos",
      "I Coríntios": "1 Coríntios",
      "II Coríntios": "2 Coríntios",
      "Gálatas": "Gálatas",
      "Efésios": "Efésios",
      "Filipenses": "Filipenses",
      "Colossenses": "Colossenses",
      "I Tessalonicenses": "1 Tessalonicenses",
      "II Tessalonicenses": "2 Tessalonicenses",
      "I Timóteo": "1 Timóteo",
      "II Timóteo": "2 Timóteo",
      "Tito": "Tito",
      "Filemom": "Filemom",
      "Filemon": "Filemom",
      "Hebreus": "Hebreus",
      "Tiago": "Tiago",
      "I Pedro": "1 Pedro",
      "II Pedro": "2 Pedro",
      "I João": "1 João",
      "II João": "2 João",
      "III João": "3 João",
      "Judas": "Judas",
      "Apocalipse": "Apocalipse",
    };

    let totalVerses = 0;
    let errors = 0;

    for (const bookData of bibleData) {
      // Try multiple possible field names
      const rawBookName = bookData.nome || bookData.name || bookData.book || bookData.livro || "";
      const chaptersData = bookData.chapters || bookData.capitulos || [];
      
      const bookName = BOOK_NAME_MAP[rawBookName] || rawBookName;
      
      if (!bookName) {
        console.error("Could not determine book name:", JSON.stringify(Object.keys(bookData)));
        errors++;
        continue;
      }

      const verses: Array<{
        book: string;
        chapter: number;
        verse: number;
        text: string;
        translation: string;
      }> = [];

      for (let chapterIdx = 0; chapterIdx < chaptersData.length; chapterIdx++) {
        const chapter = chaptersData[chapterIdx];
        if (!Array.isArray(chapter)) continue;
        
        for (let verseIdx = 0; verseIdx < chapter.length; verseIdx++) {
          const verseText = typeof chapter[verseIdx] === "string" 
            ? chapter[verseIdx] 
            : typeof chapter[verseIdx] === "object" && chapter[verseIdx] !== null
              ? (chapter[verseIdx] as any).text || (chapter[verseIdx] as any).texto || String(chapter[verseIdx])
              : String(chapter[verseIdx]);
              
          verses.push({
            book: bookName,
            chapter: chapterIdx + 1,
            verse: verseIdx + 1,
            text: verseText,
            translation: "acf",
          });
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
      JSON.stringify({
        message: "Bible import complete",
        totalVerses,
        errors,
        books: bibleData.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
