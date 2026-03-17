import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, StickyNote, Loader2, AlertTriangle,
  Pin, PanelLeftClose, PanelRightClose,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DesktopNavSidebar from "@/components/DesktopNavSidebar";
import DesktopStudyMargin from "@/components/DesktopStudyMargin";
import VersePanel from "@/components/VersePanel";
import HighlightLegend from "@/components/HighlightLegend";
import TranslationSelector, { type TranslationKey } from "@/components/TranslationSelector";
import type { DepthLevel } from "@/components/DepthSelector";
import type { BibleSearchResult } from "@/hooks/useBibleVerses";

interface VerseData {
  number: number;
  text: string;
}

interface ReaderDesktopViewProps {
  selectedBook: string;
  selectedChapter: number;
  chapters: number;
  translation: TranslationKey;
  onTranslationChange: (v: TranslationKey) => void;
  depth: DepthLevel;
  onDepthChange: (d: DepthLevel) => void;
  showLeftPanel: boolean;
  onToggleLeftPanel: () => void;
  showRightPanel: boolean;
  onToggleRightPanel: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  onChapterNote: () => void;
  onNavigate: (book: string, chapter: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: BibleSearchResult[];
  showSearchResults: boolean;
  onNavigateToResult: (r: BibleSearchResult) => void;
  highlightMatch: (text: string, query: string) => React.ReactNode;
  loading: boolean;
  error: string | null;
  verses: VerseData[];
  getFontSizeClass: () => string;
  getVerseHighlight: (n: number) => any;
  getHighlightClass: (n: number) => string;
  setHighlight: (n: number, color: string | null) => void;
  pinnedVerse: any;
  selectedVerse: VerseData | null;
  onVerseOpen: (verse: VerseData) => void;
  onCloseVerse: () => void;
  onOpenVerseNote: (n: number) => void;
  onPinVerse: () => void;
  onUnpin: () => void;
  onGoToPinned: (book: string, chapter: number, verse: number) => void;
  onNavigateToRef: (book: string, chapter: number, verse: number) => void;
  chapterNotes: any;
  verseNotes: any;
  desktopNoteVerse: number | undefined;
  onSelectVerseForNote: (v: number | undefined) => void;
  isFavorite: (book: string, chapter: number, verse: number) => boolean;
  onToggleFavorite: () => void;
}

export default function ReaderDesktopView({
  selectedBook, selectedChapter, chapters,
  translation, onTranslationChange,
  depth, onDepthChange,
  showLeftPanel, onToggleLeftPanel,
  showRightPanel, onToggleRightPanel,
  goToPrev, goToNext, onChapterNote, onNavigate,
  searchQuery, onSearchChange,
  searchResults, showSearchResults, onNavigateToResult, highlightMatch,
  loading, error, verses,
  getFontSizeClass, getVerseHighlight, getHighlightClass, setHighlight,
  pinnedVerse, selectedVerse, onVerseOpen, onCloseVerse,
  onOpenVerseNote, onPinVerse, onUnpin, onGoToPinned, onNavigateToRef,
  chapterNotes, verseNotes, desktopNoteVerse, onSelectVerseForNote,
  isFavorite, onToggleFavorite,
}: ReaderDesktopViewProps) {
  return (
    <div className="flex h-full bg-background">
      {/* Left: Navigation Sidebar */}
      <AnimatePresence mode="wait">
        {showLeftPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-60 xl:w-64 shrink-0"
          >
            <DesktopNavSidebar
              currentBook={selectedBook}
              currentChapter={selectedChapter}
              onSelect={onNavigate}
              onSearch={onSearchChange}
              searchQuery={searchQuery}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center: Scripture Text */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleLeftPanel}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <PanelLeftClose className={`w-4 h-4 transition-transform duration-200 ${!showLeftPanel ? "rotate-180" : ""}`} />
              </button>
              <div className="h-4 w-px bg-border/60" />
              <h1 className="font-scripture text-lg font-medium text-foreground tracking-tight">
                {selectedBook}
              </h1>
              <TranslationSelector value={translation} onChange={onTranslationChange} />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goToPrev}
                disabled={selectedChapter <= 1}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-[2.5rem] text-center tabular-nums text-foreground/80">
                {selectedChapter}
              </span>
              <button
                onClick={goToNext}
                disabled={selectedChapter >= chapters}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <HighlightLegend />
              <button
                onClick={onChapterNote}
                className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                title="Anotações do capítulo"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleRightPanel}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <PanelRightClose className={`w-4 h-4 transition-transform duration-200 ${!showRightPanel ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-3 bg-card border border-border/60 rounded-xl shadow-elevated max-h-[40vh] overflow-y-auto"
            >
              <div className="p-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-1.5">
                  {searchResults.length} resultados
                </p>
                {searchResults.map((r, i) => (
                  <button
                    key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
                    onClick={() => onNavigateToResult(r)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
                  >
                    <span className="text-xs font-medium text-accent">
                      {r.book} {r.chapter}:{r.verse}
                    </span>
                    <p className="text-sm text-foreground/75 font-scripture mt-0.5 line-clamp-1">
                      {highlightMatch(r.text, searchQuery)}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <motion.article
            key={`${selectedBook}-${selectedChapter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="px-12 lg:px-20 xl:px-28 py-12 max-w-4xl mx-auto"
          >
            <header className="mb-10 text-center">
              <h2 className="font-scripture text-3xl font-light text-foreground/90 tracking-tight">
                {selectedBook}
              </h2>
              <p className="font-scripture text-6xl font-light text-accent/60 mt-1">
                {selectedChapter}
              </p>
            </header>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 text-accent/60 animate-spin" />
              </div>
            )}

            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <AlertTriangle className="w-6 h-6 text-destructive/60" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-0">
                {verses.map((verse) => {
                  const hlClass = getHighlightClass(verse.number);
                  const isPinned =
                    pinnedVerse?.verse === verse.number &&
                    pinnedVerse?.book === selectedBook &&
                    pinnedVerse?.chapter === selectedChapter;
                  return (
                    <p
                      key={verse.number}
                      className={`font-scripture ${getFontSizeClass()} text-foreground/85 leading-[2.2] cursor-pointer transition-all duration-200 hover:text-foreground py-0.5 ${hlClass} ${isPinned ? "bg-accent/5 -mx-3 px-3 rounded" : ""}`}
                      onClick={() => onVerseOpen(verse)}
                    >
                      <sup className="verse-num">{verse.number}</sup>
                      {verse.text}
                      {isPinned && <Pin className="inline w-3 h-3 text-accent/50 ml-1.5" />}
                    </p>
                  );
                })}
              </div>
            )}
          </motion.article>
        </ScrollArea>
      </div>

      {/* Right: Study Margin */}
      <AnimatePresence mode="wait">
        {showRightPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-80 xl:w-88 shrink-0"
          >
            <DesktopStudyMargin
              book={selectedBook}
              chapter={selectedChapter}
              depth={depth}
              onDepthChange={onDepthChange}
              pinnedVerse={pinnedVerse}
              onUnpin={onUnpin}
              onGoToPinned={onGoToPinned}
              onNavigateToRef={onNavigateToRef}
              chapterNotes={chapterNotes}
              verseNotes={verseNotes}
              selectedVerseForNote={desktopNoteVerse}
              onSelectVerseForNote={onSelectVerseForNote}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedVerse && (
        <VersePanel
          open={!!selectedVerse}
          onClose={onCloseVerse}
          book={selectedBook}
          chapter={selectedChapter}
          verses={[{ number: selectedVerse.number, text: selectedVerse.text }]}
          isMarked={!!getVerseHighlight(selectedVerse.number)}
          onToggleMark={() => setHighlight(selectedVerse.number, getVerseHighlight(selectedVerse.number) ? null : "PROMESSA")}
          currentColor={getVerseHighlight(selectedVerse.number)?.color_key ?? null}
          onSelectColor={(color) => {
            setHighlight(selectedVerse.number, color);
            if (color === null) onCloseVerse();
          }}
          onOpenNote={() => onOpenVerseNote(selectedVerse.number)}
          onPinVerse={onPinVerse}
          onNavigateToRef={onNavigateToRef}
          isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerse.number)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}
