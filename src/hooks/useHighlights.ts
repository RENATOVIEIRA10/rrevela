/**
 * useHighlights.ts — Simplificado
 *
 * ANTES: 5 cores com categorias teológicas (PROMESSA, RESPOSTA_HUMANA, etc.)
 *        O usuário tinha que decidir a categoria ao marcar — travava a leitura.
 *
 * AGORA: Uma única ação — marcar / desmarcar.
 *        Por baixo, salva sempre como "PROMESSA" (mantém compatibilidade com
 *        o banco existente). A categorização pode acontecer no estudo,
 *        não no momento da leitura.
 *
 * COMPATIBILIDADE: O banco e o tipo HighlightColor não mudam.
 *        Versículos já marcados continuam visíveis no leitor.
 *        O `getVerseHighlight` continua funcionando para todos os hooks
 *        que dependem dele (BuscaAvancada, MinhaJornada, etc.).
 *        `HIGHLIGHT_COLORS` mantido para compatibilidade com BuscaAvancadaSheet.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAnalytics } from "./useAnalytics";

// Mantido para compatibilidade com DB e componentes que leem cor
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
 * Cor padrão usada ao marcar um versículo.
 * Internamente a lógica de cor não é mais exposta ao usuário.
 */
const DEFAULT_MARK: HighlightColor = "PROMESSA";

/**
 * CSS class única para versículos marcados.
 * Simplificado: todos usam o mesmo estilo de acento.
 */
export const MARK_CSS_CLASS = "highlight-amber";

/**
 * Mantido para compatibilidade com BuscaAvancadaSheet e outros componentes
 * que precisam listar as cores disponíveis.
 */
export const HIGHLIGHT_COLORS: {
  key: HighlightColor;
  label: string;
  emoji: string;
  cssClass: string;
  dotColor: string;
}[] = [
  { key: "PROMESSA", label: "O que Deus promete", emoji: "💛", cssClass: "highlight-promise", dotColor: "hsl(var(--accent))" },
  { key: "RESPOSTA_HUMANA", label: "O que eu devo viver", emoji: "🌿", cssClass: "highlight-marked", dotColor: "hsl(var(--accent))" },
  { key: "ATRIBUTOS_DE_DEUS", label: "Quem Deus é", emoji: "💙", cssClass: "highlight-marked", dotColor: "hsl(var(--accent))" },
  { key: "EMOCOES_ORACAO", label: "Clamor do coração", emoji: "🌸", cssClass: "highlight-marked", dotColor: "hsl(var(--accent))" },
  { key: "VERDADE_DOUTRINARIA", label: "O que isso ensina", emoji: "🕊", cssClass: "highlight-marked", dotColor: "hsl(var(--accent))" },
];

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
   * Marca ou desmarca um versículo.
   * Não expõe mais a escolha de cor ao usuário.
   * Para compatibilidade, aceita colorKey opcional (usado pela BuscaAvancada).
   */
  const setHighlight = async (
    verse: number,
    colorKey: HighlightColor | null = DEFAULT_MARK
  ) => {
    if (!user) return;
    if (colorKey === null) {
      // Desmarcar
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
    // Marcar com cor padrão (ou a cor passada, para compatibilidade)
    const colorToSave = colorKey ?? DEFAULT_MARK;
    track("highlight_set", { book, chapter, verse });
    const existing = highlights.find((h) => h.verse === verse);
    if (existing) {
      // Já marcado — atualiza cor (para compatibilidade com dados antigos)
      setHighlights((prev) =>
        prev.map((h) => (h.verse === verse ? { ...h, color_key: colorToSave } : h))
      );
      await supabase
        .from("highlights")
        .update({ color_key: colorToSave })
        .eq("id", existing.id);
    } else {
      const tempId = crypto.randomUUID();
      setHighlights((prev) => [
        ...prev,
        { id: tempId, book, chapter, verse, color_key: colorToSave },
      ]);
      await supabase.from("highlights").upsert(
        {
          user_id: user.id,
          book,
          chapter,
          verse,
          color_key: colorToSave,
        },
        { onConflict: "user_id,book,chapter,verse" }
      );
    }
  };

  /**
   * Toggle rápido — marca se não marcado, desmarca se marcado.
   * Usado pelo novo botão "Marcar" no VersePanel.
   */
  const toggleMark = async (verse: number) => {
    const existing = highlights.find((h) => h.verse === verse);
    await setHighlight(verse, existing ? null : DEFAULT_MARK);
  };

  const getVerseHighlight = (verse: number) =>
    highlights.find((h) => h.verse === verse);

  const isMarked = (verse: number) => !!getVerseHighlight(verse);

  return { highlights, loading, setHighlight, toggleMark, getVerseHighlight, isMarked };
}
