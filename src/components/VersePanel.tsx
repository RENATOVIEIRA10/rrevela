/**
 * VersePanel.tsx — Redesenhado
 *
 * REMOVIDO:
 * - Chips de 5 cores ("O que Deus promete", "O que eu devo viver"...)
 * - Pergunta "Como este texto fala comigo?"
 * - Lógica de onSelectColor (5 opções)
 *
 * ADICIONADO:
 * - Botão "Marcar" — toggle simples, um toque marca/desmarca
 *   Visualmente claro: marcado = ícone preenchido + texto "Marcado"
 *
 * FLUXO após tocar num versículo:
 *   1. Vê o texto do versículo
 *   2. Ações: [Marcar] [Favoritar] [Fixar] [Estudar]
 *   3. Compartilhar
 *   4. Revelar (IA)
 *   5. Comparar olhares
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Pin, Sparkles, Heart, Bookmark } from "lucide-react";
import { useShareVerse } from "@/hooks/useShareVerse";
import ShareMenu from "./ShareMenu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import CompareOlhares from "./CompareOlhares";
import VerseRevealSection from "./VerseRevealSection";
import type { HighlightColor } from "@/hooks/useHighlights";

interface VersePanelProps {
  open: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  /** true se o versículo já está marcado */
  isMarked: boolean;
  /** toggle marcar/desmarcar */
  onToggleMark: () => void;
  onOpenNote?: (aiRevelation?: string) => void;
  onPinVerse?: () => void;
  onNavigateToRef?: (book: string, chapter: number, verse: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  // mantido para compatibilidade com Reader.tsx existente
  currentColor?: HighlightColor | null;
  onSelectColor?: (color: HighlightColor | null) => void;
}

const VersePanel = ({
  open,
  onClose,
  book,
  chapter,
  verseNumber,
  verseText,
  isMarked,
  onToggleMark,
  onOpenNote,
  onPinVerse,
  onNavigateToRef,
  isFavorite,
  onToggleFavorite,
}: VersePanelProps) => {
  const { shareVerse } = useShareVerse();
  const [shareMode, setShareMode] = useState<"verse" | "reveal">("reveal");
  const [revealText, setRevealText] = useState<string>("");

  const shareParams = {
    book, chapter, verse: verseNumber, verseText,
    includeReveal: shareMode === "reveal", revealText,
  };

  const handleShare = (method: "copy" | "whatsapp" | "native") => {
    shareVerse(shareParams, method);
  };

  const handleRevealLoaded = (text: string) => {
    setRevealText(text);
  };

  const handleRefNavigate = (refBook: string, refChapter: number, refVerse: number) => {
    if (onNavigateToRef) {
      onClose();
      onNavigateToRef(refBook, refChapter, refVerse);
    }
  };

  const handleOpenStudy = () => {
    onOpenNote?.(revealText || undefined);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[82vh] bg-card border-t border-border/50 rounded-t-3xl">
        <div className="w-10 h-1 bg-border/60 rounded-full mx-auto mt-3 mb-1" />
        <DrawerHeader className="text-left pb-3 pt-2 px-6">
          <DrawerTitle className="font-scripture text-base font-medium text-foreground/90">
            {book} {chapter}:{verseNumber}
          </DrawerTitle>
          <DrawerDescription className="font-scripture text-[0.9375rem] text-foreground/75 italic leading-relaxed mt-1.5">
            {verseText}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-8 space-y-5 overflow-y-auto">
          {/* ── Ações principais ─────────────────────────────── */}
          <div className="flex items-center justify-between">
            {/* Esquerda: Marcar (destaque principal) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onToggleMark}
              className={[
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 font-ui",
                isMarked
                  ? "bg-accent/10 text-accent border border-accent/25 font-medium"
                  : "bg-secondary/40 text-foreground/60 border border-transparent hover:bg-secondary/60",
              ].join(" ")}
            >
              <Bookmark
                className={`w-4 h-4 transition-all duration-200 ${
                  isMarked ? "fill-current" : ""
                }`}
              />
              {isMarked ? "Marcado" : "Marcar"}
            </motion.button>

            {/* Direita: ações secundárias */}
            <div className="flex items-center gap-4">
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-1.5 text-xs transition-colors font-ui ${
                    isFavorite
                      ? "text-accent"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Favorito" : "Favoritar"}
                </button>
              )}

              {onPinVerse && (
                <button
                  onClick={onPinVerse}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors font-ui"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Fixar
                </button>
              )}

              {onOpenNote && (
                <button
                  onClick={handleOpenStudy}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors font-ui font-medium"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Estudar
                </button>
              )}
            </div>
          </div>

          <div className="editorial-divider" />

          {/* ── Compartilhar ─────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setShareMode("verse")}
                className={`text-xs px-3.5 py-2 rounded-xl transition-all font-ui ${
                  shareMode === "verse"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
                }`}
              >
                Só o versículo
              </button>
              <button
                onClick={() => setShareMode("reveal")}
                className={`text-xs px-3.5 py-2 rounded-xl transition-all font-ui flex items-center gap-1.5 ${
                  shareMode === "reveal"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Com revelação
              </button>
            </div>

            <ShareMenu
              onShare={handleShare}
              storyData={{
                type: shareMode === "reveal" ? "verse-reveal" : "verse",
                reference: `${book} ${chapter}:${verseNumber}`,
                verseText,
                insightText: shareMode === "reveal" ? revealText : undefined,
              }}
            />
          </div>

          <div className="editorial-divider" />

          {/* ── Revelar ──────────────────────────────────────── */}
          <VerseRevealSection
            book={book}
            chapter={chapter}
            verse={verseNumber}
            verseText={verseText}
            onNavigate={handleRefNavigate}
            onRevealLoaded={handleRevealLoaded}
          />

          <div className="editorial-divider" />

          {/* ── Comparar ─────────────────────────────────────── */}
          <CompareOlhares
            book={book}
            chapter={chapter}
            verse={verseNumber}
            verseText={verseText}
            onNavigate={handleRefNavigate}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default VersePanel;
