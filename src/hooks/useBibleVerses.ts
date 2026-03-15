import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineVerses, isTranslationOffline } from "@/lib/offline-bible";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  rank: number;
}

export function useBibleVerses(book: string, chapter: number, translation: string = "acf") {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchVerses = async () => {
      // Try online first
      const { data, error: fetchError } = await supabase
        .from("bible_verses")
        .select("verse, text")
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("translation", translation)
        .order("verse", { ascending: true });

      if (cancelled) return;

      if (!fetchError && data && data.length > 0) {
        setVerses(data.map((v) => ({ number: v.verse, text: v.text })));
        setError(null);
        setLoading(false);
        return;
      }

      // Fallback to offline IndexedDB
      try {
        const offline = await getOfflineVerses(book, chapter, translation);
        if (!cancelled && offline.length > 0) {
          setVerses(offline.map((v) => ({ number: v.verse, text: v.text })));
          setError(null);
          setLoading(false);
          return;
        }
      } catch {
        // IndexedDB unavailable
      }

      if (cancelled) return;

      if (fetchError) {
        setError("Erro ao carregar versículos.");
        setVerses([]);
      } else {
        setError(
          translation !== "acf"
            ? `Tradução ${translation.toUpperCase()} ainda não disponível. Use ACF.`
            : "Texto não encontrado. Verifique a tradução carregada."
        );
        setVerses([]);
      }
      setLoading(false);
    };

    fetchVerses();
    return () => { cancelled = true; };
  }, [book, chapter, translation]);

  return { verses, loading, error };
}

export async function searchBible(query: string, limit = 50): Promise<BibleSearchResult[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase.rpc("search_bible", {
    search_query: query,
    translation_filter: "acf",
    result_limit: limit,
  });

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data as BibleSearchResult[]) || [];
}
