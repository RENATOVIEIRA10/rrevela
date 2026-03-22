/**
 * VersePanel.tsx — Multi-verse support + color picker (caneta bíblica)
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Pin, Sparkles, Heart, Eraser } from "lucide-react";
import { useShareVerse } from "@/hooks/useShareVerse";
import { useNotes } from "@/hooks/useNotes";
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
import { PEN_COLORS, type HighlightColor } from "@/hooks/useHighlights";

export interface SelectedVerse {
  number: number;
  text: string;
}

interface VersePanelProps {
  open: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  verses: SelectedVerse[];
  isMarked: boolean;
  currentColor: HighlightColor | null;
  onSelectColor: (color: HighlightColor | null) => void;
  onOpenNote?: (aiRevelation?: string) => void;
  onPinVerse?: () => void;
  onNavigateToRef?: (book: string, chapter: number, verse: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  // legacy compat
  onToggleMark?: () => void;
}

function formatVerseRange(book: string, chapter: number, verses: SelectedVerse[]): string {
  if (verses.length === 0) return "";
  if (verses.length === 1) return `${book} ${chapter}:${verses[0].number}`;
  const nums = verses.map((v) => v.number);
  const isConsecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  if (isConsecutive) return `${book} ${chapter}:${nums[0]}-${nums[nums.length - 1]}`;
  return `${book} ${chapter}:${nums.join(",")}`;
}

const VersePanel = ({
  open,
  onClose,
  book,
  chapter,
  verses,
  isMarked,
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

  const firstVerse = verses[0];
  const reference = formatVerseRange(book, chapter, verses);

  // Load the user's note for this verse to enrich the story template
  const { notes: verseNotes } = useNotes(book, chapter, verses.length === 1 ? firstVerse?.number : null);
  const combinedText = useMemo(
    () => verses.map((v) => v.text).join(" "),
    [verses]
  );
  const isMulti = verses.length > 1;

  const shareParams = {
    book, chapter, verse: firstVerse?.number ?? 1, verseText: combinedText,
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

  if (!firstVerse) return null;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh] bg-card border-t border-border/50 rounded-t-3xl">
        <div className="w-10 h-1 bg-border/60 rounded-full mx-auto mt-3 mb-1" />
        <DrawerHeader className="text-left pb-4 pt-2 px-6">
          <DrawerTitle className="font-scripture text-lg font-medium text-foreground/90">
            {reference}
          </DrawerTitle>
          {isMulti && (
            <p className="text-xs text-accent font-ui mt-1">
              {verses.length} versículos selecionados
            </p>
          )}
          <DrawerDescription className="font-scripture text-base text-foreground/75 italic leading-relaxed mt-2 max-h-36 overflow-y-auto">
            {verses.map((v, i) => (
              <span key={v.number}>
                <sup className="text-accent/50 text-[0.6875rem] mr-1">{v.number}</sup>
                {v.text}
                {i < verses.length - 1 ? " " : ""}
              </span>
            ))}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-10 space-y-6 overflow-y-auto">
          {/* ── Cores de caneta (marca-texto) ─────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-ui text-muted-foreground uppercase tracking-widest">
              Marcar com caneta
            </p>
            <div className="flex items-center gap-2">
              {PEN_COLORS.map((pen) => (
                <motion.button
                  key={pen.key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelectColor(pen.key)}
                  className={[
                    "w-10 h-10 rounded-full transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
                    currentColor === pen.key
                      ? "ring-2 ring-offset-2 ring-offset-card scale-110"
                      : "hover:scale-105",
                  ].join(" ")}
                  style={{
                    backgroundColor: `hsl(${pen.dot})`,
                    ["--tw-ring-color" as string]: `hsl(${pen.dot})`,
                  }}
                  aria-label={`Marcar com ${pen.label}`}
                  title={pen.label}
                />
              ))}
              {/* Eraser */}
              {isMarked && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelectColor(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  aria-label="Apagar marca"
                  title="Apagar marca"
                >
                  <Eraser className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="editorial-divider" />

          {/* ── Ações ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-2 text-sm transition-colors font-ui min-h-[44px] ${
                    isFavorite
                      ? "text-accent"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Favorito" : "Favoritar"}
                </button>
              )}

              {onPinVerse && (
                <button
                  onClick={onPinVerse}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-ui min-h-[44px]"
                >
                  <Pin className="w-5 h-5" />
                  Fixar
                </button>
              )}

              {onOpenNote && (
                <button
                  onClick={handleOpenStudy}
                  className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-ui font-medium min-h-[44px]"
                >
                  <BookOpen className="w-5 h-5" />
                  Estudar
                </button>
              )}
            </div>
          </div>

          <div className="editorial-divider" />

          {/* ── Compartilhar ─────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex gap-2.5">
              <button
                onClick={() => setShareMode("verse")}
                className={`text-sm px-4 h-11 rounded-xl transition-all font-ui ${
                  shareMode === "verse"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
                }`}
              >
                {isMulti ? "Só os versículos" : "Só o versículo"}
              </button>
              <button
                onClick={() => setShareMode("reveal")}
                className={`text-sm px-4 h-11 rounded-xl transition-all font-ui flex items-center gap-2 ${
                  shareMode === "reveal"
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "bg-secondary/30 text-foreground/60 hover:bg-secondary/50 border border-transparent"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Com revelação
              </button>
            </div>

            <ShareMenu
              onShare={handleShare}
              storyData={{
                type: shareMode === "reveal" ? "verse-reveal" : "verse",
                reference,
                verseText: combinedText,
                insightText: shareMode === "reveal" ? revealText : undefined,
                observation:    verseNotes[0]?.observation    || undefined,
                christocentric: verseNotes[0]?.christocentric || undefined,
                application:    verseNotes[0]?.application    || undefined,
                prayer:         verseNotes[0]?.prayer         || undefined,
              }}
            />
          </div>

          <div className="editorial-divider" />

          {/* ── Revelar ──────────────────────────────────────── */}
          <VerseRevealSection
            book={book}
            chapter={chapter}
            verse={firstVerse.number}
            verseEnd={isMulti ? verses[verses.length - 1].number : undefined}
            verseText={combinedText}
            onNavigate={handleRefNavigate}
            onRevealLoaded={handleRevealLoaded}
          />

          <div className="editorial-divider" />

          {/* ── Comparar ─────────────────────────────────────── */}
          <CompareOlhares
            book={book}
            chapter={chapter}
            verse={firstVerse.number}
            verseText={combinedText}
            onNavigate={handleRefNavigate}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default VersePanel;
