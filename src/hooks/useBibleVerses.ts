import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useBibleVerses(book: string, chapter: number) {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchVerses = async () => {
      const { data, error: fetchError } = await supabase
        .from("bible_verses")
        .select("verse, text")
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("translation", "acf")
        .order("verse", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError("Erro ao carregar versículos.");
        setVerses([]);
      } else if (!data || data.length === 0) {
        setError("Texto não encontrado. Verifique a tradução carregada.");
        setVerses([]);
      } else {
        setVerses(data.map((v) => ({ number: v.verse, text: v.text })));
        setError(null);
      }
      setLoading(false);
    };

    fetchVerses();
    return () => { cancelled = true; };
  }, [book, chapter]);

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
