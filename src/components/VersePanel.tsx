import { useState } from "react";
import { motion } from "framer-motion";
import { X, StickyNote, Pin, Sparkles, Heart } from "lucide-react";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/hooks/useHighlights";
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

interface VersePanelProps {
  open: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  currentColor: HighlightColor | null;
  onSelectColor: (color: HighlightColor | null) => void;
  onOpenNote?: () => void;
  onPinVerse?: () => void;
  onNavigateToRef?: (book: string, chapter: number, verse: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const VersePanel = ({
  open,
  onClose,
  book,
  chapter,
  verseNumber,
  verseText,
  currentColor,
  onSelectColor,
  onOpenNote,
  onPinVerse,
  onNavigateToRef,
  isFavorite,
  onToggleFavorite,
}: VersePanelProps) => {
  const { shareVerse } = useShareVerse();
  const [shareMode, setShareMode] = useState<"verse" | "reveal">("reveal");
  const [revealText, setRevealText] = useState<string>("");

  const shareParams = { book, chapter, verse: verseNumber, verseText, includeReveal: shareMode === "reveal", revealText };

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

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[80vh] bg-card border-t border-border/50 rounded-t-3xl">
        {/* Handle bar */}
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
          {/* Highlight prompt — soft, inviting */}
          <p className="text-xs text-muted-foreground font-ui">
            Como este texto fala comigo?
          </p>

          {/* Highlight colors — organic chips */}
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((color) => {
              const isActive = currentColor === color.key;
              return (
                <motion.button
                  key={color.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectColor(isActive ? null : color.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium border border-accent/25"
                      : "bg-secondary/40 text-foreground/70 border border-transparent hover:bg-secondary/60"
                  }`}
                >
                  <span className="text-base">{color.emoji}</span>
                  <span className="font-ui text-[0.8125rem]">{color.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Actions — refined, minimal */}
          <div className="flex items-center gap-4 pt-1">
            {currentColor && (
              <button
                onClick={() => onSelectColor(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive/80 transition-colors font-ui"
              >
                <X className="w-3.5 h-3.5" />
                Remover
              </button>
            )}

            <div className="flex items-center gap-4 ml-auto">
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-1.5 text-xs transition-colors font-ui ${
                    isFavorite ? "text-accent" : "text-muted-foreground hover:text-accent"
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
                  onClick={onOpenNote}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors font-ui"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  Anotar
                </button>
              )}
            </div>
          </div>

          {/* Elegant divider */}
          <div className="editorial-divider" />

          {/* Share section */}
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

          {/* Revela section */}
          <VerseRevealSection
            book={book}
            chapter={chapter}
            verse={verseNumber}
            verseText={verseText}
            onNavigate={handleRefNavigate}
            onRevealLoaded={handleRevealLoaded}
          />

          <div className="editorial-divider" />

          {/* Compare section */}
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
