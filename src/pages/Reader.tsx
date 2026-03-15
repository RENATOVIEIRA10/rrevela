import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, StickyNote, Loader2, AlertTriangle,
  ArrowLeft, ChevronDown,
} from "lucide-react";
import { usePinnedVerse } from "@/hooks/usePinnedVerse";
import { useFavorites } from "@/hooks/useFavorites";
import PinnedVerseCard from "@/components/PinnedVerseCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import BookPickerDrawer from "@/components/BookPickerDrawer";
import { useHighlights, HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { useNotes } from "@/hooks/useNotes";
import { useBibleVerses } from "@/hooks/useBibleVerses";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/hooks/useAnalytics";
import VersePanel from "@/components/VersePanel";
import NotebookSheet from "@/components/NotebookSheet";
import TranslationSelector, { type TranslationKey } from "@/components/TranslationSelector";
import { useReaderSearch } from "@/hooks/useReaderSearch";
import { useReaderNavigation } from "@/hooks/useReaderNavigation";
import ReaderDesktopView from "@/components/ReaderDesktopView";
import MobileSearchBar from "@/components/MobileSearchBar";
import MobileStudyTools from "@/components/MobileStudyTools";
import type { DepthLevel } from "@/components/DepthSelector";

const Reader = () => {
  const isMobile = useIsMobile();
  const { track } = useAnalytics();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const fromRevela = !!(location.state as any)?.fromRevela;

  const {
    selectedBook, setSelectedBook,
    selectedChapter, setSelectedChapter,
    chapters, goToPrev, goToNext,
  } = useReaderNavigation();

  const {
    searchQuery, setSearchQuery,
    searchResults, searching,
    showSearchResults, clearSearch,
    highlightMatch,
  } = useReaderSearch();

  const [selectedVerse, setSelectedVerse] = useState<{ number: number; text: string } | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteVerse, setNoteVerse] = useState<number | undefined>(undefined);
  const [depth, setDepth] = useState<DepthLevel>("essencial");
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [translation, setTranslation] = useState<TranslationKey>(
    () => (localStorage.getItem("revela-translation") as TranslationKey) || "acf"
  );
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("revela-font-size") || "md");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [desktopNoteVerse, setDesktopNoteVerse] = useState<number | undefined>(undefined);

  const { pinned: pinnedVerse, pin: pinVerse, unpin: unpinVerse } = usePinnedVerse();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { verses, loading, error } = useBibleVerses(selectedBook, selectedChapter, translation);
  const { getVerseHighlight, setHighlight } = useHighlights(selectedBook, selectedChapter);
  const chapterNotes = useNotes(selectedBook, selectedChapter);
  const verseNotes = useNotes(selectedBook, selectedChapter, noteVerse ?? desktopNoteVerse);

  const handleTranslationChange = (v: TranslationKey) => {
    setTranslation(v);
    localStorage.setItem("revela-translation", v);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-[0.9375rem]";
      case "lg": return "text-[1.3125rem]";
      default: return "text-[1.125rem]";
    }
  };

  const getHighlightClass = (verseNumber: number) => {
    const h = getVerseHighlight(verseNumber);
    if (!h) return "";
    return HIGHLIGHT_COLORS.find((c) => c.key === h.color_key)?.cssClass ?? "";
  };

  // Sync font size changes made in Profile page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "revela-font-size" && e.newValue) setFontSize(e.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!loading && verses.length > 0) {
      track("chapter_read", { book: selectedBook, chapter: selectedChapter });
    }
  }, [selectedBook, selectedChapter, loading, verses.length]);

  const handleVerseOpen = (verse: { number: number; text: string }) => {
    setSelectedVerse(verse);
    track("verse_opened", { book: selectedBook, chapter: selectedChapter, verse: verse.number });
  };

  const openVerseNote = (verseNum: number) => {
    if (isMobile) {
      setNoteVerse(verseNum);
      setNoteSheetOpen(true);
      setSelectedVerse(null);
    } else {
      setDesktopNoteVerse(verseNum);
      setShowRightPanel(true);
    }
  };

  const openChapterNote = () => {
    if (isMobile) {
      setNoteVerse(undefined);
      setNoteSheetOpen(true);
    } else {
      setDesktopNoteVerse(undefined);
      setShowRightPanel(true);
    }
  };

  const handlePinVerse = () => {
    if (selectedVerse) {
      pinVerse({ translation, book: selectedBook, chapter: selectedChapter, verse: selectedVerse.number, text: selectedVerse.text });
      setSelectedVerse(null);
    }
  };

  const handleNavigateTo = (book: string, chapter: number, _verse?: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSelectedVerse(null);
  };

  const handleSearchNavigate = (book: string, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    clearSearch();
  };

  // ─── DESKTOP LAYOUT ───
  if (!isMobile) {
    return (
      <ReaderDesktopView
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        chapters={chapters}
        translation={translation}
        onTranslationChange={handleTranslationChange}
        depth={depth}
        onDepthChange={setDepth}
        showLeftPanel={showLeftPanel}
        onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
        showRightPanel={showRightPanel}
        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        goToPrev={goToPrev}
        goToNext={goToNext}
        onChapterNote={openChapterNote}
        onNavigate={(book, ch) => { setSelectedBook(book); setSelectedChapter(ch); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onNavigateToResult={(r) => handleSearchNavigate(r.book, r.chapter)}
        highlightMatch={highlightMatch}
        loading={loading}
        error={error}
        verses={verses}
        getFontSizeClass={getFontSizeClass}
        getVerseHighlight={getVerseHighlight}
        getHighlightClass={getHighlightClass}
        setHighlight={setHighlight}
        pinnedVerse={pinnedVerse}
        selectedVerse={selectedVerse}
        onVerseOpen={handleVerseOpen}
        onCloseVerse={() => setSelectedVerse(null)}
        onOpenVerseNote={openVerseNote}
        onPinVerse={handlePinVerse}
        onUnpin={unpinVerse}
        onGoToPinned={(book, ch) => { setSelectedBook(book); setSelectedChapter(ch); }}
        onNavigateToRef={handleNavigateTo}
        chapterNotes={chapterNotes}
        verseNotes={verseNotes}
        desktopNoteVerse={desktopNoteVerse}
        onSelectVerseForNote={setDesktopNoteVerse}
        isFavorite={(book, ch, v) => isFavorite(book, ch, v)}
        onToggleFavorite={() => selectedVerse && toggleFavorite(selectedBook, selectedChapter, selectedVerse.number, translation)}
      />
    );
  }

  // ─── MOBILE LAYOUT ───
  return (
    <div className="flex flex-col h-full bg-background relative">
      {fromRevela && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => routerNavigate(-1)}
          className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground shadow-lg text-xs font-medium active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Revela
        </motion.button>
      )}

      <header className="border-b border-border/50 bg-background/98 backdrop-blur-md safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => setBookPickerOpen(true)}
            className="flex items-center gap-1.5 py-1 text-foreground/90 active:opacity-70 transition-opacity"
          >
            <span className="font-scripture text-base font-medium truncate max-w-[140px]">
              {selectedBook}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
          </button>

          <div className="flex items-center">
            <button
              onClick={goToPrev}
              disabled={selectedChapter <= 1}
              className="p-2 text-muted-foreground active:text-foreground transition-colors disabled:opacity-25"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[2rem] text-center text-foreground/80 tabular-nums">
              {selectedChapter}
            </span>
            <button
              onClick={goToNext}
              disabled={selectedChapter >= chapters}
              className="p-2 text-muted-foreground active:text-foreground transition-colors disabled:opacity-25"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <TranslationSelector value={translation} onChange={handleTranslationChange} />
            <button
              onClick={openChapterNote}
              className="p-2 text-muted-foreground active:text-accent transition-colors"
              aria-label="Caderno"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
        </div>

        <MobileSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearSearch}
          searching={searching}
          showSearchResults={showSearchResults}
          searchResults={searchResults}
          onNavigateToResult={(r) => handleSearchNavigate(r.book, r.chapter)}
          highlightMatch={highlightMatch}
        />
      </header>

      <BookPickerDrawer
        open={bookPickerOpen}
        onOpenChange={setBookPickerOpen}
        onSelect={(book, chapter) => { setSelectedBook(book); setSelectedChapter(chapter); }}
        currentBook={selectedBook}
        currentChapter={selectedChapter}
      />

      {pinnedVerse && (
        <PinnedVerseCard
          pinned={pinnedVerse}
          onGoTo={(book, ch) => { setSelectedBook(book); setSelectedChapter(ch); }}
          onUnpin={unpinVerse}
        />
      )}

      <ScrollArea className="flex-1">
        <motion.article
          key={`${selectedBook}-${selectedChapter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-6 py-8"
        >
          <header className="mb-8 text-center">
            <h2 className="font-scripture text-xl font-normal text-foreground/85">{selectedBook}</h2>
            <p className="font-scripture text-4xl font-light text-accent/50 mt-0.5">{selectedChapter}</p>
          </header>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-accent/50 animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <AlertTriangle className="w-6 h-6 text-destructive/60" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-1.5">
              {verses.map((verse) => (
                <p
                  key={verse.number}
                  className={`verse-line font-scripture ${getFontSizeClass()} text-foreground/85 leading-[2] cursor-pointer transition-colors active:text-foreground ${getHighlightClass(verse.number)} ${getVerseHighlight(verse.number) ? "has-highlight" : ""}`}
                  onClick={() => handleVerseOpen(verse)}
                >
                  <sup className="verse-num">{verse.number}</sup>
                  {verse.text}
                </p>
              ))}
            </div>
          )}

          {!loading && !error && verses.length > 0 && (
            <MobileStudyTools
              book={selectedBook}
              chapter={selectedChapter}
              depth={depth}
              onDepthChange={setDepth}
              onNavigate={handleNavigateTo}
              onOpenNote={() => { setNoteVerse(undefined); setNoteSheetOpen(true); }}
            />
          )}
        </motion.article>
      </ScrollArea>

      {selectedVerse && (
        <VersePanel
          open={!!selectedVerse}
          onClose={() => setSelectedVerse(null)}
          book={selectedBook}
          chapter={selectedChapter}
          verseNumber={selectedVerse.number}
          verseText={selectedVerse.text}
          currentColor={getVerseHighlight(selectedVerse.number)?.color_key ?? null}
          onSelectColor={(color) => { setHighlight(selectedVerse.number, color); if (color === null) setSelectedVerse(null); }}
          onOpenNote={() => openVerseNote(selectedVerse.number)}
          onPinVerse={handlePinVerse}
          onNavigateToRef={handleNavigateTo}
          isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerse.number)}
          onToggleFavorite={() => toggleFavorite(selectedBook, selectedChapter, selectedVerse.number, translation)}
        />
      )}

      <NotebookSheet
        open={noteSheetOpen}
        onOpenChange={setNoteSheetOpen}
        book={selectedBook}
        chapter={selectedChapter}
        verse={noteVerse}
        notes={noteVerse !== undefined ? verseNotes.notes : chapterNotes.notes}
        onSave={noteVerse !== undefined ? verseNotes.saveNote : chapterNotes.saveNote}
        onDelete={noteVerse !== undefined ? verseNotes.deleteNote : chapterNotes.deleteNote}
      />
    </div>
  );
};

export default Reader;
