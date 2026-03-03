import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type HighlightColor =
  | "PROMESSA"
  | "RESPOSTA_HUMANA"
  | "ATRIBUTOS_DE_DEUS"
  | "EMOCOES_ORACAO"
  | "VERDADE_DOUTRINARIA";

export interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  color_key: HighlightColor;
}

export const HIGHLIGHT_COLORS: {
  key: HighlightColor;
  label: string;
  emoji: string;
  cssClass: string;
  dotColor: string;
}[] = [
  { key: "PROMESSA", label: "O que Deus promete", emoji: "💛", cssClass: "highlight-promise", dotColor: "hsl(var(--highlight-promise))" },
  { key: "RESPOSTA_HUMANA", label: "O que eu devo viver", emoji: "🌿", cssClass: "highlight-response", dotColor: "hsl(var(--highlight-response))" },
  { key: "ATRIBUTOS_DE_DEUS", label: "Quem Deus é", emoji: "💙", cssClass: "highlight-attribute", dotColor: "hsl(var(--highlight-attribute))" },
  { key: "EMOCOES_ORACAO", label: "Clamor do coração", emoji: "🌸", cssClass: "highlight-emotion", dotColor: "hsl(var(--highlight-emotion))" },
  { key: "VERDADE_DOUTRINARIA", label: "O que isso ensina", emoji: "🕊", cssClass: "highlight-doctrine", dotColor: "hsl(var(--highlight-doctrine))" },
];

export function useHighlights(book: string, chapter: number) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHighlights = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("highlights")
      .select("*")
      .eq("user_id", user.id)
      .eq("book", book)
      .eq("chapter", chapter);
    setHighlights((data as Highlight[]) ?? []);
    setLoading(false);
  }, [user, book, chapter]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const setHighlight = async (verse: number, colorKey: HighlightColor | null) => {
    if (!user) return;

    // Optimistic update
    if (colorKey === null) {
      setHighlights((prev) => prev.filter((h) => h.verse !== verse));
      await supabase
        .from("highlights")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);
    } else {
      const existing = highlights.find((h) => h.verse === verse);
      if (existing) {
        setHighlights((prev) =>
          prev.map((h) => (h.verse === verse ? { ...h, color_key: colorKey } : h))
        );
        await supabase
          .from("highlights")
          .update({ color_key: colorKey })
          .eq("id", existing.id);
      } else {
        const tempId = crypto.randomUUID();
        setHighlights((prev) => [
          ...prev,
          { id: tempId, book, chapter, verse, color_key: colorKey },
        ]);
        await supabase.from("highlights").upsert({
          user_id: user.id,
          book,
          chapter,
          verse,
          color_key: colorKey,
        }, { onConflict: "user_id,book,chapter,verse" });
      }
    }
  };

  const getVerseHighlight = (verse: number) =>
    highlights.find((h) => h.verse === verse);

  return { highlights, loading, setHighlight, getVerseHighlight };
}
