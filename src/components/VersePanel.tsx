import { useState } from "react";
import { motion } from "framer-motion";
import { X, StickyNote, Pin, Sparkles } from "lucide-react";
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
}: VersePanelProps) => {
  const { shareVerse } = useShareVerse();
  const [shareMode, setShareMode] = useState<"verse" | "reveal">("reveal");
  const [revealText, setRevealText] = useState<string>("");

  const shareParams = { book, chapter, verse: verseNumber, verseText, includeReveal: shareMode === "reveal", revealText };

  const handleShare = (method: "copy" | "whatsapp" | "native") => {
    shareVerse(shareParams, method);
  };

  // Callback from VerseRevealSection to capture reveal text for sharing
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
      <DrawerContent className="max-h-[75vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="font-scripture text-base">
            {book} {chapter}:{verseNumber}
          </DrawerTitle>
          <DrawerDescription className="font-scripture text-sm text-foreground/80 italic leading-relaxed">
            {verseText}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* Natural language prompt */}
          <p className="text-xs text-muted-foreground font-scripture italic">
            Como este texto fala comigo?
          </p>

          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_COLORS.map((color) => {
              const isActive = currentColor === color.key;
              return (
                <motion.button
                  key={color.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectColor(isActive ? null : color.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent font-medium"
                      : "border-border bg-secondary/50 text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <span>{color.emoji}</span>
                  <span>{color.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            {currentColor && (
              <button
                onClick={() => onSelectColor(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
                Remover marca
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {onPinVerse && (
                <button
                  onClick={onPinVerse}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  <Pin className="w-3.5 h-3.5" />
                  Fixar
                </button>
              )}

              {onOpenNote && (
                <button
                  onClick={onOpenNote}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  Anotar
                </button>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="h-px bg-border" />

          <div className="space-y-3">
            {/* Share mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShareMode("verse")}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  shareMode === "verse"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/40 text-foreground/60 hover:bg-secondary border border-border"
                }`}
              >
                Só o versículo
              </button>
              <button
                onClick={() => setShareMode("reveal")}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  shareMode === "reveal"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/40 text-foreground/60 hover:bg-secondary border border-border"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Versículo + revelação
              </button>
            </div>

            <ShareMenu onShare={handleShare} />
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Revela (este verso) */}
          <VerseRevealSection
            book={book}
            chapter={chapter}
            verse={verseNumber}
            verseText={verseText}
            onNavigate={handleRefNavigate}
            onRevealLoaded={handleRevealLoaded}
          />

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Compare Olhares */}
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
