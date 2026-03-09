import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HistoricalContext {
  author: string;
  period: string;
  audience: string;
  setting: string;
  themes: string[];
  summary: string;
}

export function useHistoricalContext(book: string, chapter: number) {
  const [context, setContext] = useState<HistoricalContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchContext = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "historical-context",
          { body: { book, chapter } }
        );

        if (cancelled) return;

        if (fnError) {
          setError("Erro ao carregar contexto.");
          setContext(null);
        } else {
          setContext(data as HistoricalContext);
        }
      } catch {
        if (!cancelled) {
          setError("Erro ao carregar contexto.");
          setContext(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchContext();
    return () => { cancelled = true; };
  }, [book, chapter]);

  return { context, loading, error };
}
