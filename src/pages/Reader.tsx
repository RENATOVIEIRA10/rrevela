/**
 * Reader.tsx — Atualizado para o novo sistema de marcação
 *
 * MUDANÇAS:
 * - Remove <HighlightLegend /> da barra superior
 * - VersePanel agora recebe isMarked + onToggleMark em vez de currentColor + onSelectColor
 * - getHighlightClass usa highlight-marked (classe única) em vez das 5 cores
 * - hasHighlight ainda funciona para o indicador lateral
 */
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, StickyNote, ChevronDown,
  Loader2, AlertTriangle, X, Pin, PanelLeftClose,
  PanelRightClose, ArrowLeft, Search, EyeOff, ALargeSmall,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import BookPickerDrawer from "@/components/BookPickerDrawer";
import VersePanel from "@/components/VersePanel";
import NotebookSheet from "@/components/NotebookSheet";
import DesktopNavSidebar from "@/components/DesktopNavSidebar";
import DesktopStudyMargin from "@/components/DesktopStudyMargin";
import MessianicLinePanel from "@/components/MessianicLinePanel";
import BiblicalPatternsPanel from "@/components/BiblicalPatternsPanel";
import DepthSelector from "@/components/DepthSelector";
import RevealingQuestions from "@/components/RevealingQuestions";
import TranslationSelector from "@/components/TranslationSelector";
import RedemptionTimeline from "@/components/RedemptionTimeline";
import HistoricalContextPanel from "@/components/HistoricalContextPanel";
import PinnedVerseCard from "@/components/PinnedVerseCard";
import { MARK_CSS_CLASS } from "@/hooks/useHighlights";
import { useReaderState } from "@/hooks/useReaderState";
import { useChapterSwipe } from "@/hooks/useChapterSwipe";
import { useContemplation } from "@/hooks/useContemplation";
import { useComfortableReading } from "@/hooks/useComfortableReading";
import ContemplationButton from "@/components/ContemplationButton";
import FloatingVerseBar from "@/components/FloatingVerseBar";

// ─── SearchResults ────────────────────────────────────────────
interface SearchResultsProps {
  results: ReturnType<typeof useReaderState>["searchResults"];
  query: string;
  searching: boolean;
  visible: boolean;
  onSelect: (r: ReturnType<typeof useReaderState>["searchResults"][number]) => void;
  highlightMatch: (text: string, query: string) => React.ReactNode;
  variant: "desktop" | "mobile";
}

const SearchResults = ({
  results, query, searching, visible, onSelect, highlightMatch, variant,
}: SearchResultsProps) => {
  if (!visible) return null;
  const isDesktop = variant === "desktop";
  const containerClass = isDesktop
    ? "mx-6 mb-3 bg-card border border-border/60 rounded-xl shadow-elevated max-h-[40vh] overflow-y-auto"
    : "absolute left-4 right-4 top-full z-50 mt-2 bg-card border border-border/60 rounded-2xl shadow-premium max-h-[55vh] overflow-y-auto";
  const itemClass = isDesktop
    ? "w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
    : "w-full text-left px-3 py-3 rounded-xl active:bg-secondary/70 transition-colors";

  if (results.length === 0 && !searching && query.trim()) {
    return (
      <div className={isDesktop ? containerClass : "absolute left-4 right-4 top-full z-50 mt-2 bg-card border border-border/60 rounded-2xl shadow-premium p-5"}>
        <p className="text-sm text-muted-foreground text-center">Nenhum resultado para "{query}"</p>
      </div>
    );
  }
  if (results.length === 0) return null;

  return (
    <div className={containerClass}>
      <div className="p-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-1.5">
          {results.length} resultados
        </p>
        {results.map((r, i) => (
          <button
            key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
            onClick={() => onSelect(r)}
            className={itemClass}
          >
            <span className="text-xs font-medium text-accent">{r.book} {r.chapter}:{r.verse}</span>
            <p className={`text-sm text-foreground/75 font-scripture mt-0.5 ${isDesktop ? "line-clamp-1" : "line-clamp-2"}`}>
              {highlightMatch(r.text, query)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── VerseBody ────────────────────────────────────────────────
interface VerseBodyProps {
  verses: ReturnType<typeof useReaderState>["verses"];
  loading: boolean;
  error: string | null;
  fontSizeClass: string;
  isMarked: (n: number) => boolean;
  isSelected?: (n: number) => boolean;
  onVerseClick: (v: { number: number; text: string }) => void;
  pinnedVerse?: ReturnType<typeof useReaderState>["pinnedVerse"];
  selectedBook: string;
  selectedChapter: number;
  variant: "desktop" | "mobile";
  targetVerse?: number | null;
  onTargetVerseScrolled?: () => void;
  comfortableReading?: boolean;
}

const VerseBody = ({
  verses, loading, error, fontSizeClass, isMarked, isSelected,
  onVerseClick, pinnedVerse, selectedBook, selectedChapter, variant,
  targetVerse, onTargetVerseScrolled, comfortableReading,
}: VerseBodyProps) => {
  const isDesktop = variant === "desktop";
  const lineHeight = isDesktop ? "leading-[2.2]" : "leading-[1.9]";
  const spacing = isDesktop ? "space-y-1" : "space-y-4";
  const spinnerPy = isDesktop ? "py-20" : "py-16";
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  // Scroll to target verse and highlight it
  useEffect(() => {
    if (!targetVerse || loading || verses.length === 0) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-verse="${targetVerse}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedVerse(targetVerse);
        // Remove highlight after 3s
        setTimeout(() => setHighlightedVerse(null), 3000);
      }
      onTargetVerseScrolled?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [targetVerse, loading, verses.length, onTargetVerseScrolled]);

  if (loading) return (
    <div className={`flex items-center justify-center ${spinnerPy}`}>
      <Loader2 className="w-5 h-5 text-accent/60 animate-spin" />
    </div>
  );
  if (error) return (
    <div className={`flex flex-col items-center justify-center ${spinnerPy} gap-4 text-center`}>
      <AlertTriangle className="w-6 h-6 text-destructive/60" />
      <p className="text-sm text-muted-foreground">{error}</p>
    </div>
  );

  return (
    <div className={[spacing, comfortableReading ? "comfortable-verses" : ""].join(" ")}>
      {verses.map((verse) => {
        const marked = isMarked(verse.number);
        const selected = isSelected?.(verse.number) ?? false;
        const isPinned = isDesktop &&
          pinnedVerse?.verse === verse.number &&
          pinnedVerse?.book === selectedBook &&
          pinnedVerse?.chapter === selectedChapter;
        return (
          <p
            key={verse.number}
            data-verse={verse.number}
            className={[
              "font-scripture cursor-pointer transition-all duration-200",
              fontSizeClass,
              lineHeight,
              isDesktop
                ? "text-foreground/85 hover:text-foreground py-0.5"
                : "verse-line text-foreground/85 active:text-foreground",
              marked ? MARK_CSS_CLASS : "",
              marked && !isDesktop ? "has-highlight" : "",
              isPinned ? "bg-accent/5 -mx-3 px-3 rounded" : "",
              highlightedVerse === verse.number ? "verse-target-highlight" : "",
              selected ? "bg-accent/10 -mx-1 px-1 rounded-md ring-1 ring-accent/30" : "",
            ].join(" ")}
            onClick={() => onVerseClick(verse)}
          >
            <sup className="verse-num">{verse.number}</sup>
            {verse.text}
            {isPinned && <Pin className="inline w-3 h-3 text-accent/50 ml-1.5" />}
          </p>
        );
      })}
    </div>
  );
};

// ─── Reader ───────────────────────────────────────────────────
const Reader = () => {
  const state = useReaderState();
  const {
    isMobile, fromRevela, routerNavigate, targetVerse, setTargetVerse,
    selectedBook, setSelectedBook, selectedChapter, setSelectedChapter,
    chapters, goToPrev, goToNext, handleGoToPinned, handleNavigateToRef,
    searchQuery, setSearchQuery, searchResults, searching, showSearchResults,
    navigateToSearchResult, highlightMatch,
    selectedVerses, setSelectedVerses,
    versePanelOpen, openVersePanel, closeVersePanel, clearSelection,
    handleVerseOpen, handlePinVerse,
    verses, loading, error, translation, handleTranslationChange, fontSizeClass,
    // Novo: isMarked + toggleMark em vez de getHighlightClass / setHighlight
    isMarked, toggleMark,
    isFavorite, toggleFavorite,
    pinnedVerse, unpinVerse,
    noteSheetOpen, setNoteSheetOpen, noteVerse, openVerseNote, openChapterNote,
    noteVerseText, noteAiRevelation,
    chapterNotes, verseNotes,
    showLeftPanel, setShowLeftPanel, showRightPanel, setShowRightPanel,
    desktopNoteVerse, setDesktopNoteVerse,
    depth, setDepth, bookPickerOpen, setBookPickerOpen,
  } = state;

  // Format reference for floating bar
  const selectionReference = useMemo(() => {
    if (selectedVerses.length === 0) return "";
    if (selectedVerses.length === 1) return `${selectedBook} ${selectedChapter}:${selectedVerses[0].number}`;
    const nums = selectedVerses.map((v) => v.number);
    const isConsecutive = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
    if (isConsecutive) return `${selectedBook} ${selectedChapter}:${nums[0]}-${nums[nums.length - 1]}`;
    return `${selectedBook} ${selectedChapter}:${nums.join(",")}`;
  }, [selectedBook, selectedChapter, selectedVerses]);

  const swipeHandlers = useChapterSwipe({
    onPrev: goToPrev,
    onNext: goToNext,
    disabled: !!(versePanelOpen || noteSheetOpen || bookPickerOpen),
  });
  const contemplation = useContemplation();
  const comfortable = useComfortableReading();

  // ─── DESKTOP ──────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="flex h-full bg-background">
        <AnimatePresence mode="wait">
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-60 xl:w-64 shrink-0"
            >
              <DesktopNavSidebar
                currentBook={selectedBook} currentChapter={selectedChapter}
                onSelect={(book, ch) => { setSelectedBook(book); setSelectedChapter(ch); }}
                onSearch={setSearchQuery} searchQuery={searchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <PanelLeftClose className={`w-4 h-4 transition-transform duration-200 ${!showLeftPanel ? "rotate-180" : ""}`} />
                </button>
                <div className="h-4 w-px bg-border/60" />
                <h1 className="font-scripture text-lg font-medium text-foreground tracking-tight">{selectedBook}</h1>
                <TranslationSelector value={translation} onChange={handleTranslationChange} />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={goToPrev} disabled={selectedChapter <= 1} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium min-w-[2.5rem] text-center tabular-nums text-foreground/80">{selectedChapter}</span>
                <button onClick={goToNext} disabled={selectedChapter >= chapters} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* HighlightLegend REMOVIDO */}
              <div className="flex items-center gap-2">
                <button
                  onClick={comfortable.toggle}
                  className={`p-1.5 rounded-md transition-colors ${comfortable.active ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                  title={comfortable.active ? "Sair do modo Leitura Confortável" : "Leitura Confortável"}
                >
                  <ALargeSmall className="w-4 h-4" />
                </button>
                <button onClick={openChapterNote} className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors" title="Anotações do capítulo">
                  <StickyNote className="w-4 h-4" />
                </button>
                <button onClick={() => setShowRightPanel(!showRightPanel)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <PanelRightClose className={`w-4 h-4 transition-transform duration-200 ${!showRightPanel ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
            <SearchResults results={searchResults} query={searchQuery} searching={searching} visible={showSearchResults} onSelect={navigateToSearchResult} highlightMatch={highlightMatch} variant="desktop" />
          </div>

          <ScrollArea className="flex-1">
            <motion.article key={`${selectedBook}-${selectedChapter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className={`px-12 lg:px-20 xl:px-28 py-12 max-w-4xl mx-auto comfortable-article transition-all duration-300`}>
              <header className={`mb-10 text-center comfortable-chapter-header`}>
                <h2 className="font-scripture text-3xl font-light text-foreground/90 tracking-tight">{selectedBook}</h2>
                <p className="font-scripture text-6xl font-light text-accent/60 mt-1">{selectedChapter}</p>
              </header>
              <VerseBody verses={verses} loading={loading} error={error} fontSizeClass={fontSizeClass} isMarked={isMarked} onVerseClick={handleVerseOpen} pinnedVerse={pinnedVerse} selectedBook={selectedBook} selectedChapter={selectedChapter} variant="desktop" targetVerse={targetVerse} onTargetVerseScrolled={() => setTargetVerse(null)} comfortableReading={comfortable.active} />
            </motion.article>
          </ScrollArea>
        </div>

        <AnimatePresence mode="wait">
          {showRightPanel && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="w-80 xl:w-88 shrink-0">
              <DesktopStudyMargin book={selectedBook} chapter={selectedChapter} depth={depth} onDepthChange={setDepth} pinnedVerse={pinnedVerse} onUnpin={unpinVerse} onGoToPinned={handleGoToPinned} onNavigateToRef={handleNavigateToRef} chapterNotes={chapterNotes} verseNotes={verseNotes} selectedVerseForNote={desktopNoteVerse} onSelectVerseForNote={setDesktopNoteVerse} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedVerses.length > 0 && !versePanelOpen && (
            <FloatingVerseBar
              count={selectedVerses.length}
              reference={selectionReference}
              isMarked={selectedVerses.every((v) => isMarked(v.number))}
              onMark={() => selectedVerses.forEach((v) => toggleMark(v.number))}
              onReveal={openVersePanel}
              onExpand={openVersePanel}
              onClear={clearSelection}
            />
          )}
        </AnimatePresence>

        {versePanelOpen && selectedVerses.length > 0 && (
          <VersePanel
            open={versePanelOpen} onClose={closeVersePanel}
            book={selectedBook} chapter={selectedChapter}
            verses={selectedVerses}
            isMarked={isMarked(selectedVerses[0].number)}
            onToggleMark={() => toggleMark(selectedVerses[0].number)}
            onOpenNote={(aiRev) => openVerseNote(selectedVerses[0].number, selectedVerses[0].text, aiRev)}
            onPinVerse={handlePinVerse} onNavigateToRef={handleNavigateToRef}
            isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerses[0].number)}
            onToggleFavorite={() => toggleFavorite(selectedBook, selectedChapter, selectedVerses[0].number, translation)}
          />
        )}
      </div>
    );
  }

  // ─── MOBILE ───────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-background relative">
      {fromRevela && (
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => routerNavigate(-1)} className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground shadow-lg text-xs font-medium active:scale-95 transition-transform">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Revela
        </motion.button>
      )}

      <header className="border-b border-border/50 bg-background/98 backdrop-blur-md safe-top-header contemplation-hide">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setBookPickerOpen(true)} className="flex items-center gap-2 py-1.5 text-foreground/90 active:opacity-70 transition-opacity">
            <span className="font-scripture text-lg font-medium truncate max-w-[160px]">{selectedBook}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
          </button>
          <div className="flex items-center">
            <button onClick={goToPrev} disabled={selectedChapter <= 1} className="p-2.5 text-muted-foreground active:text-foreground transition-colors disabled:opacity-25"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-base font-medium min-w-[2.5rem] text-center text-foreground/80 tabular-nums">{selectedChapter}</span>
            <button onClick={goToNext} disabled={selectedChapter >= chapters} className="p-2.5 text-muted-foreground active:text-foreground transition-colors disabled:opacity-25"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-1.5">
            <TranslationSelector value={translation} onChange={handleTranslationChange} />
            <button onClick={openChapterNote} className="p-2.5 text-muted-foreground active:text-accent transition-colors" aria-label="Caderno">
              <StickyNote className="w-5 h-5" />
            </button>
            <button
              onClick={comfortable.toggle}
              className={`p-2 transition-colors contemplation-hide ${comfortable.active ? "text-accent" : "text-muted-foreground active:text-foreground"}`}
              aria-label={comfortable.active ? "Sair da leitura confortável" : "Leitura confortável"}
            >
              <ALargeSmall className="w-4 h-4" />
            </button>
            <button
              onClick={contemplation.enter}
              className="p-2.5 text-muted-foreground active:text-foreground transition-colors contemplation-hide"
              aria-label="Modo contemplação"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className={`px-4 pb-2.5 relative comfortable-hide`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input placeholder="Buscar na Bíblia..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-9 bg-secondary/30 border-0 text-base h-11 rounded-xl placeholder:text-muted-foreground/50" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showSearchResults && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <SearchResults results={searchResults} query={searchQuery} searching={searching} visible={showSearchResults} onSelect={navigateToSearchResult} highlightMatch={highlightMatch} variant="mobile" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <BookPickerDrawer open={bookPickerOpen} onOpenChange={setBookPickerOpen} onSelect={(book, chapter) => { setSelectedBook(book); setSelectedChapter(chapter); }} currentBook={selectedBook} currentChapter={selectedChapter} />
      {pinnedVerse && <PinnedVerseCard pinned={pinnedVerse} onGoTo={handleGoToPinned} onUnpin={unpinVerse} />}

      <ScrollArea className="flex-1">
        <motion.article key={`${selectedBook}-${selectedChapter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: "easeOut" }} className="px-6 py-8 comfortable-article transition-all duration-300" {...swipeHandlers}>
          <header className="mb-8 text-center comfortable-chapter-header">
            <h2 className="font-scripture text-xl font-normal text-foreground/85">{selectedBook}</h2>
            <p className="font-scripture text-4xl font-light text-accent/50 mt-0.5">{selectedChapter}</p>
          </header>

          <VerseBody verses={verses} loading={loading} error={error} fontSizeClass={fontSizeClass} isMarked={isMarked} onVerseClick={handleVerseOpen} selectedBook={selectedBook} selectedChapter={selectedChapter} variant="mobile" targetVerse={targetVerse} onTargetVerseScrolled={() => setTargetVerse(null)} comfortableReading={comfortable.active} />

          {!loading && !error && verses.length > 0 && (
            <div className={`mt-12 pt-8 space-y-5 comfortable-hide`}>
              <div className="editorial-divider mb-6" />
              <DepthSelector value={depth} onChange={setDepth} />
              <RedemptionTimeline book={selectedBook} chapter={selectedChapter} />
              <HistoricalContextPanel book={selectedBook} chapter={selectedChapter} />
              <MessianicLinePanel book={selectedBook} chapter={selectedChapter} onNavigate={handleNavigateToRef} />
              {(depth === "intermediario" || depth === "profundo") && (
                <BiblicalPatternsPanel book={selectedBook} chapter={selectedChapter} depth={depth} onNavigate={handleNavigateToRef} />
              )}
              <RevealingQuestions depth={depth} onApplyQuestion={() => { setNoteSheetOpen(true); }} />
            </div>
          )}
        </motion.article>
      </ScrollArea>

      <AnimatePresence>
        {selectedVerses.length > 0 && !versePanelOpen && (
          <FloatingVerseBar
            count={selectedVerses.length}
            reference={selectionReference}
            isMarked={selectedVerses.every((v) => isMarked(v.number))}
            onMark={() => selectedVerses.forEach((v) => toggleMark(v.number))}
            onReveal={openVersePanel}
            onExpand={openVersePanel}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>

      {versePanelOpen && selectedVerses.length > 0 && (
        <VersePanel
          open={versePanelOpen} onClose={closeVersePanel}
          book={selectedBook} chapter={selectedChapter}
          verses={selectedVerses}
          isMarked={isMarked(selectedVerses[0].number)}
          onToggleMark={() => toggleMark(selectedVerses[0].number)}
          onOpenNote={(aiRev) => openVerseNote(selectedVerses[0].number, selectedVerses[0].text, aiRev)}
          onPinVerse={handlePinVerse} onNavigateToRef={handleNavigateToRef}
          isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerses[0].number)}
          onToggleFavorite={() => toggleFavorite(selectedBook, selectedChapter, selectedVerses[0].number, translation)}
        />
      )}

      <ContemplationButton active={contemplation.active} onExit={contemplation.exit} />
      <NotebookSheet open={noteSheetOpen} onOpenChange={setNoteSheetOpen} book={selectedBook} chapter={selectedChapter} verse={noteVerse} verseText={noteVerseText} aiRevelation={noteAiRevelation} notes={noteVerse !== undefined ? verseNotes.notes : chapterNotes.notes} onSave={noteVerse !== undefined ? verseNotes.saveNote : chapterNotes.saveNote} onDelete={noteVerse !== undefined ? verseNotes.deleteNote : chapterNotes.deleteNote} />
    </div>
  );
};

export default Reader;
