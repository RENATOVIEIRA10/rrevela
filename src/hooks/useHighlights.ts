/**
 * useHighlights.ts — Sistema de sublinhado colorido
 *
 * Evolução: de marca-texto fundo → sublinhado com cores (como caneta na Bíblia física).
 * O usuário escolhe entre 5 cores de caneta. Cada cor mapeia para um valor do enum
 * highlight_color no banco.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAnalytics } from "./useAnalytics";

// Enum do banco
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

/**
 * Cores de caneta disponíveis — mapeadas ao enum do banco.
 * Labels simples (nome da cor), sem categorias teológicas.
 */
export const PEN_COLORS: {
  key: HighlightColor;
  label: string;
  cssClass: string;
  dot: string; // HSL var for inline style
}[] = [
  { key: "PROMESSA",           label: "Amarelo", cssClass: "pen-yellow",  dot: "var(--pen-yellow)" },
  { key: "RESPOSTA_HUMANA",    label: "Verde",   cssClass: "pen-green",   dot: "var(--pen-green)" },
  { key: "ATRIBUTOS_DE_DEUS",  label: "Azul",    cssClass: "pen-blue",    dot: "var(--pen-blue)" },
  { key: "EMOCOES_ORACAO",     label: "Rosa",    cssClass: "pen-pink",    dot: "var(--pen-pink)" },
  { key: "VERDADE_DOUTRINARIA",label: "Roxo",    cssClass: "pen-purple",  dot: "var(--pen-purple)" },
];

/** Cor padrão ao marcar sem escolher */
const DEFAULT_COLOR: HighlightColor = "PROMESSA";

/** Retorna a classe CSS de sublinhado para uma cor do banco */
export function getPenClass(colorKey: HighlightColor): string {
  const pen = PEN_COLORS.find((p) => p.key === colorKey);
  return `pen-underline ${pen?.cssClass ?? "pen-yellow"}`;
}

// Mantido para compatibilidade com BuscaAvancadaSheet
export const HIGHLIGHT_COLORS = PEN_COLORS.map((p) => ({
  key: p.key,
  label: p.label,
  emoji: "",
  cssClass: p.cssClass,
  dotColor: `hsl(${p.dot})`,
}));

export const MARK_CSS_CLASS = `pen-underline pen-yellow`;

export function useHighlights(book: string, chapter: number) {
  const { user } = useAuth();
  const { track } = useAnalytics();
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

  /**
   * Marca um versículo com uma cor, ou desmarca (colorKey = null).
   */
  const setHighlight = async (
    verse: number,
    colorKey: HighlightColor | null = DEFAULT_COLOR
  ) => {
    if (!user) return;
    if (colorKey === null) {
      setHighlights((prev) => prev.filter((h) => h.verse !== verse));
      await supabase
        .from("highlights")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);
      return;
    }
    track("highlight_set", { book, chapter, verse, color: colorKey });
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
      await supabase.from("highlights").upsert(
        { user_id: user.id, book, chapter, verse, color_key: colorKey },
        { onConflict: "user_id,book,chapter,verse" }
      );
    }
  };

  /** Toggle: desmarca se já marcado, marca com cor padrão se não */
  const toggleMark = async (verse: number) => {
    const existing = highlights.find((h) => h.verse === verse);
    await setHighlight(verse, existing ? null : DEFAULT_COLOR);
  };

  const getVerseHighlight = (verse: number) =>
    highlights.find((h) => h.verse === verse);

  const isMarked = (verse: number) => !!getVerseHighlight(verse);

  /** Retorna a classe CSS de sublinhado para um versículo (ou "" se não marcado) */
  const getVersePenClass = (verse: number): string => {
    const h = getVerseHighlight(verse);
    if (!h) return "";
    return getPenClass(h.color_key);
  };

  return {
    highlights, loading,
    setHighlight, toggleMark,
    getVerseHighlight, isMarked, getVersePenClass,
  };
}
