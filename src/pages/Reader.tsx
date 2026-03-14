import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, StickyNote, ChevronDown, Loader2, AlertTriangle, X, Pin, PanelLeftClose, PanelRightClose, ArrowLeft } from "lucide-react";
import { usePinnedVerse } from "@/hooks/usePinnedVerse";
import { useFavorites } from "@/hooks/useFavorites";
import PinnedVerseCard from "@/components/PinnedVerseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import BookPickerDrawer from "@/components/BookPickerDrawer";
import { useHighlights, HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { useNotes } from "@/hooks/useNotes";
import { useBibleVerses, searchBible, type BibleSearchResult } from "@/hooks/useBibleVerses";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/hooks/useAnalytics";
import VersePanel from "@/components/VersePanel";
import HighlightLegend from "@/components/HighlightLegend";
import NoteEditor from "@/components/NoteEditor";
import NotebookSheet from "@/components/NotebookSheet";
import DesktopNavSidebar from "@/components/DesktopNavSidebar";
import DesktopStudyMargin from "@/components/DesktopStudyMargin";
import MessianicLinePanel from "@/components/MessianicLinePanel";
import BiblicalPatternsPanel from "@/components/BiblicalPatternsPanel";
import DepthSelector, { type DepthLevel } from "@/components/DepthSelector";
import RevealingQuestions from "@/components/RevealingQuestions";
import TranslationSelector, { type TranslationKey } from "@/components/TranslationSelector";
import RedemptionTimeline from "@/components/RedemptionTimeline";
import HistoricalContextPanel from "@/components/HistoricalContextPanel";

const Reader = () => {
  const isMobile = useIsMobile();
  const { track } = useAnalytics();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const fromRevela = !!(location.state as any)?.fromRevela;
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBook, setSelectedBook] = useState(searchParams.get("livro") || "Gênesis");
  const [selectedChapter, setSelectedChapter] = useState(Number(searchParams.get("cap")) || 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{ number: number; text: string } | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteVerse, setNoteVerse] = useState<number | undefined>(undefined);
  const [depth, setDepth] = useState<DepthLevel>("essencial");
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [translation, setTranslation] = useState<TranslationKey>(
    () => (localStorage.getItem("revela-translation") as TranslationKey) || "acf"
  );
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("revela-font-size") || "md");

  const handleTranslationChange = (v: TranslationKey) => {
    setTranslation(v);
    localStorage.setItem("revela-translation", v);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-[0.9375rem]"; // 15px
      case "lg": return "text-[1.3125rem]"; // 21px
      default: return "text-[1.125rem]"; // 18px (md)
    }
  };
  const { pinned: pinnedVerse, pin: pinVerse, unpin: unpinVerse } = usePinnedVerse();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [desktopNoteVerse, setDesktopNoteVerse] = useState<number | undefined>(undefined);

  const { verses, loading, error } = useBibleVerses(selectedBook, selectedChapter, translation);

  // Listen for font size changes from localStorage (when changed in Profile)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "revela-font-size" && e.newValue) {
        setFontSize(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!loading && verses.length > 0) {
      track("chapter_read", { book: selectedBook, chapter: selectedChapter });
    }
  }, [selectedBook, selectedChapter, loading, verses.length]);

  useEffect(() => {
    const livro = searchParams.get("livro");
    const cap = searchParams.get("cap");
    if (livro && BIBLE_BOOKS.some((b) => b.name === livro)) {
      setSelectedBook(livro);
      setSelectedChapter(Number(cap) || 1);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const chapters = currentBook ? currentBook.chapters : 1;
  const { getVerseHighlight, setHighlight } = useHighlights(selectedBook, selectedChapter);

  const chapterNotes = useNotes(selectedBook, selectedChapter);
  const verseNotes = useNotes(selectedBook, selectedChapter, noteVerse ?? desktopNoteVerse);

  const handleVerseOpen = (verse: { number: number; text: string }) => {
    setSelectedVerse(verse);
    track("verse_opened", { book: selectedBook, chapter: selectedChapter, verse: verse.number });
  };

  const goToPrev = () => {
    if (selectedChapter > 1) setSelectedChapter((c) => c - 1);
  };

  const goToNext = () => {
    if (selectedChapter < chapters) setSelectedChapter((c) => c + 1);
  };

  const getHighlightClass = (verseNumber: number) => {
    const h = getVerseHighlight(verseNumber);
    if (!h) return "";
    return HIGHLIGHT_COLORS.find((c) => c.key === h.color_key)?.cssClass ?? "";
  };

  const hasHighlight = (verseNumber: number) => !!getVerseHighlight(verseNumber);

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
      pinVerse({
        translation,
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse.number,
        text: selectedVerse.text,
      });
      setSelectedVerse(null);
    }
  };

  const handleGoToPinned = (book: string, chapter: number, _verse: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
  };

  const handleNavigateToRef = (refBook: string, refChapter: number, _refVerse: number) => {
    setSelectedBook(refBook);
    setSelectedChapter(refChapter);
    setSelectedVerse(null);
  };

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchBible(searchQuery, 30);
      setSearchResults(results);
      setShowSearchResults(true);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navigateToSearchResult = (result: BibleSearchResult) => {
    setSelectedBook(result.book);
    setSelectedChapter(result.chapter);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const words = query.trim().split(/\s+/);
    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/20 text-foreground rounded-sm px-0.5">{part}</mark>
      ) : part
    );
  };

  // ─── DESKTOP LAYOUT — Premium Study Bible ───
  if (!isMobile) {
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
                onSelect={(book, ch) => {
                  setSelectedBook(book);
                  setSelectedChapter(ch);
                }}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Scripture Text — Protagonist */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Minimal top bar */}
          <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <PanelLeftClose className={`w-4 h-4 transition-transform duration-200 ${!showLeftPanel ? 'rotate-180' : ''}`} />
                </button>
                <div className="h-4 w-px bg-border/60" />
                <h1 className="font-scripture text-lg font-medium text-foreground tracking-tight">
                  {selectedBook}
                </h1>
                <TranslationSelector value={translation} onChange={handleTranslationChange} />
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
                  onClick={openChapterNote}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                  title="Anotações do capítulo"
                >
                  <StickyNote className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <PanelRightClose className={`w-4 h-4 transition-transform duration-200 ${!showRightPanel ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search results dropdown */}
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
                      onClick={() => navigateToSearchResult(r)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors"
                    >
                      <span className="text-xs font-medium text-accent">{r.book} {r.chapter}:{r.verse}</span>
                      <p className="text-sm text-foreground/75 font-scripture mt-0.5 line-clamp-1">
                        {highlightMatch(r.text, searchQuery)}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Scripture body — Editorial layout */}
          <ScrollArea className="flex-1">
            <motion.article
              key={`${selectedBook}-${selectedChapter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="px-12 lg:px-20 xl:px-28 py-12 max-w-4xl mx-auto"
            >
              {/* Chapter heading */}
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
                    const isPinned = pinnedVerse?.verse === verse.number && pinnedVerse?.book === selectedBook && pinnedVerse?.chapter === selectedChapter;
                    return (
                      <p
                        key={verse.number}
                        className={`font-scripture ${getFontSizeClass()} text-foreground/85 leading-[2.2] cursor-pointer transition-all duration-200 hover:text-foreground py-0.5 ${hlClass} ${isPinned ? 'bg-accent/5 -mx-3 px-3 rounded' : ''}`}
                        onClick={() => handleVerseOpen(verse)}
                      >
                        <sup className="verse-num">
                          {verse.number}
                        </sup>
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

        {/* Right: Study Margin — Elegant sidebar */}
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
                onDepthChange={setDepth}
                pinnedVerse={pinnedVerse}
                onUnpin={unpinVerse}
                onGoToPinned={handleGoToPinned}
                onNavigateToRef={handleNavigateToRef}
                chapterNotes={chapterNotes}
                verseNotes={verseNotes}
                selectedVerseForNote={desktopNoteVerse}
                onSelectVerseForNote={setDesktopNoteVerse}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Verse Panel */}
        {selectedVerse && (
          <VersePanel
            open={!!selectedVerse}
            onClose={() => setSelectedVerse(null)}
            book={selectedBook}
            chapter={selectedChapter}
            verseNumber={selectedVerse.number}
            verseText={selectedVerse.text}
            currentColor={getVerseHighlight(selectedVerse.number)?.color_key ?? null}
            onSelectColor={(color) => {
              setHighlight(selectedVerse.number, color);
              if (color === null) setSelectedVerse(null);
            }}
            onOpenNote={() => openVerseNote(selectedVerse.number)}
            onPinVerse={handlePinVerse}
            onNavigateToRef={handleNavigateToRef}
            isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerse.number)}
            onToggleFavorite={() => toggleFavorite(selectedBook, selectedChapter, selectedVerse.number, translation)}
          />
        )}
      </div>
    );
  }

  // ─── MOBILE LAYOUT — Intimate Bible Experience ───
  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Floating back-to-Revela button */}
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
      {/* Minimal, elegant navigation bar */}
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

        {/* Subtle search bar */}
        <div className="px-4 pb-2.5 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Buscar na Bíblia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-secondary/30 border-0 text-sm h-9 rounded-xl placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {searching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 animate-spin" />
            )}
          </div>

          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-4 right-4 top-full z-50 mt-2 bg-card border border-border/60 rounded-2xl shadow-premium max-h-[55vh] overflow-y-auto"
              >
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-1.5">
                    {searchResults.length} resultados
                  </p>
                  {searchResults.map((r, i) => (
                    <button
                      key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
                      onClick={() => navigateToSearchResult(r)}
                      className="w-full text-left px-3 py-3 rounded-xl active:bg-secondary/70 transition-colors"
                    >
                      <span className="text-xs font-medium text-accent">{r.book} {r.chapter}:{r.verse}</span>
                      <p className="text-sm text-foreground/75 font-scripture mt-0.5 line-clamp-2">
                        {highlightMatch(r.text, searchQuery)}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showSearchResults && searchResults.length === 0 && !searching && searchQuery.trim() && (
            <div className="absolute left-4 right-4 top-full z-50 mt-2 bg-card border border-border/60 rounded-2xl shadow-premium p-5">
              <p className="text-sm text-muted-foreground text-center">
                Nenhum resultado para "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </header>

      <BookPickerDrawer
        open={bookPickerOpen}
        onOpenChange={setBookPickerOpen}
        onSelect={(book, chapter) => {
          setSelectedBook(book);
          setSelectedChapter(chapter);
        }}
        currentBook={selectedBook}
        currentChapter={selectedChapter}
      />

      {/* Pinned verse card */}
      {pinnedVerse && (
        <PinnedVerseCard
          pinned={pinnedVerse}
          onGoTo={handleGoToPinned}
          onUnpin={unpinVerse}
        />
      )}

      {/* Scripture text — Premium mobile reading */}
      <ScrollArea className="flex-1">
        <motion.article
          key={`${selectedBook}-${selectedChapter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-6 py-8"
        >
          {/* Chapter title — elegant, minimal */}
          <header className="mb-8 text-center">
            <h2 className="font-scripture text-xl font-normal text-foreground/85">
              {selectedBook}
            </h2>
            <p className="font-scripture text-4xl font-light text-accent/50 mt-0.5">
              {selectedChapter}
            </p>
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
              {verses.map((verse) => {
                const hlClass = getHighlightClass(verse.number);
                const hl = hasHighlight(verse.number);
                return (
                  <p
                    key={verse.number}
                    className={`verse-line font-scripture ${getFontSizeClass()} text-foreground/85 leading-[2] cursor-pointer transition-colors active:text-foreground ${hlClass} ${hl ? 'has-highlight' : ''}`}
                    onClick={() => handleVerseOpen(verse)}
                  >
                    <sup className="verse-num">
                      {verse.number}
                    </sup>
                    {verse.text}
                  </p>
                );
              })}
            </div>
          )}

          {/* Mobile study tools — below text, elegant separation */}
          {!loading && !error && verses.length > 0 && (
            <div className="mt-12 pt-8 space-y-5">
              <div className="editorial-divider mb-6" />
              <DepthSelector value={depth} onChange={setDepth} />
              <RedemptionTimeline book={selectedBook} chapter={selectedChapter} />
              <HistoricalContextPanel book={selectedBook} chapter={selectedChapter} />
              <MessianicLinePanel book={selectedBook} chapter={selectedChapter} onNavigate={handleNavigateToRef} />
              {(depth === "intermediario" || depth === "profundo") && (
                <BiblicalPatternsPanel book={selectedBook} chapter={selectedChapter} depth={depth} onNavigate={handleNavigateToRef} />
              )}
              <RevealingQuestions
                depth={depth}
                onApplyQuestion={() => {
                  setNoteVerse(undefined);
                  setNoteSheetOpen(true);
                }}
              />
            </div>
          )}
        </motion.article>
      </ScrollArea>

      {/* Mobile Verse Panel */}
      {selectedVerse && (
        <VersePanel
          open={!!selectedVerse}
          onClose={() => setSelectedVerse(null)}
          book={selectedBook}
          chapter={selectedChapter}
          verseNumber={selectedVerse.number}
          verseText={selectedVerse.text}
          currentColor={getVerseHighlight(selectedVerse.number)?.color_key ?? null}
          onSelectColor={(color) => {
            setHighlight(selectedVerse.number, color);
            if (color === null) setSelectedVerse(null);
          }}
          onOpenNote={() => openVerseNote(selectedVerse.number)}
          onPinVerse={handlePinVerse}
          onNavigateToRef={handleNavigateToRef}
          isFavorite={isFavorite(selectedBook, selectedChapter, selectedVerse.number)}
          onToggleFavorite={() => toggleFavorite(selectedBook, selectedChapter, selectedVerse.number, translation)}
        />
      )}

      {/* Mobile Notebook Sheet */}
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
