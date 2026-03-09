import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, StickyNote, ChevronDown, Loader2, AlertTriangle, X, Pin, PanelLeftClose, PanelRightClose } from "lucide-react";
import { usePinnedVerse } from "@/hooks/usePinnedVerse";
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

const Reader = () => {
  const isMobile = useIsMobile();
  const { track } = useAnalytics();
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
  const [translation, setTranslation] = useState<TranslationKey>("acf");
  const { pinned: pinnedVerse, pin: pinVerse, unpin: unpinVerse } = usePinnedVerse();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [desktopNoteVerse, setDesktopNoteVerse] = useState<number | undefined>(undefined);

  const { verses, loading, error } = useBibleVerses(selectedBook, selectedChapter, translation);

  // Track chapter reads
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
        <mark key={i} className="bg-accent/30 text-foreground rounded-sm px-0.5">{part}</mark>
      ) : part
    );
  };

  // ─── DESKTOP LAYOUT ───
  if (!isMobile) {
    return (
      <div className="flex h-full">
        {/* Left: Navigation Sidebar */}
        {showLeftPanel && (
          <div className="w-56 xl:w-64 shrink-0">
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
          </div>
        )}

        {/* Center: Scripture Text */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                >
                  <PanelLeftClose className={`w-4 h-4 ${!showLeftPanel ? 'rotate-180' : ''} transition-transform`} />
                </Button>
                <h2 className="font-scripture text-base font-semibold text-foreground">
                  {selectedBook} {selectedChapter}
                </h2>
                <TranslationSelector value={translation} onChange={setTranslation} />
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={goToPrev} disabled={selectedChapter <= 1} className="h-7 w-7">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[2rem] text-center tabular-nums">{selectedChapter}</span>
                <Button variant="ghost" size="icon" onClick={goToNext} disabled={selectedChapter >= chapters} className="h-7 w-7">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <HighlightLegend />
                <button
                  onClick={openChapterNote}
                  className="flex items-center justify-center w-7 h-7 text-muted-foreground hover:text-accent transition-colors rounded hover:bg-secondary/50"
                >
                  <StickyNote className="w-4 h-4" />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                >
                  <PanelRightClose className={`w-4 h-4 ${!showRightPanel ? 'rotate-180' : ''} transition-transform`} />
                </Button>
              </div>
            </div>

            {/* Search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mx-4 mb-2 bg-card border border-border rounded-xl shadow-lg max-h-[40vh] overflow-y-auto">
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1">
                    {searchResults.length} resultados
                  </p>
                  {searchResults.map((r, i) => (
                    <button
                      key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
                      onClick={() => navigateToSearchResult(r)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
                    >
                      <span className="text-xs font-semibold text-accent">{r.book} {r.chapter}:{r.verse}</span>
                      <p className="text-xs text-foreground/80 font-scripture mt-0.5 line-clamp-1">
                        {highlightMatch(r.text, searchQuery)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scripture body */}
          <ScrollArea className="flex-1">
            <motion.div
              key={`${selectedBook}-${selectedChapter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="px-8 lg:px-12 xl:px-16 py-8 max-w-3xl mx-auto"
            >
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <AlertTriangle className="w-8 h-8 text-destructive/70" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              )}

              {!loading && !error && (
                <div className="space-y-0.5">
                  {verses.map((verse) => {
                    const hlClass = getHighlightClass(verse.number);
                    const isPinned = pinnedVerse?.verse === verse.number && pinnedVerse?.book === selectedBook && pinnedVerse?.chapter === selectedChapter;
                    return (
                      <p
                        key={verse.number}
                        className={`font-scripture text-foreground/90 leading-[1.9] cursor-pointer rounded-sm transition-all hover:bg-secondary/30 px-1 -mx-1 ${hlClass} ${isPinned ? 'ring-1 ring-accent/30 bg-accent/5' : ''}`}
                        onClick={() => handleVerseOpen(verse)}
                      >
                        <sup className="text-xs text-accent font-ui font-semibold mr-1.5 select-none">
                          {verse.number}
                        </sup>
                        {verse.text}
                        {isPinned && <Pin className="inline w-3 h-3 text-accent ml-1" />}
                      </p>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </ScrollArea>
        </div>

        {/* Right: Study Margin */}
        {showRightPanel && (
          <div className="w-72 xl:w-80 shrink-0">
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
          </div>
        )}

        {/* Desktop Verse Panel (uses same Drawer) */}
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
          />
        )}
      </div>
    );
  }

  // ─── MOBILE LAYOUT ───
  return (
    <div className="flex flex-col h-full">
      {/* Mobile navigation bar */}
      <div className="border-b border-border bg-card/95 backdrop-blur-md safe-top">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => setBookPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/60 active:bg-secondary transition-colors min-w-0"
          >
            <span className="font-scripture text-sm font-medium text-foreground truncate max-w-[120px]">
              {selectedBook}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={selectedChapter <= 1} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[2rem] text-center text-foreground tabular-nums">
              {selectedChapter}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNext} disabled={selectedChapter >= chapters} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <TranslationSelector value={translation} onChange={setTranslation} />

          <div className="flex items-center gap-1">
            <HighlightLegend />
            <button
              onClick={openChapterNote}
              className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary/50"
              aria-label="Caderno"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-2 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar palavra na Bíblia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 bg-secondary/40 border-0 text-sm h-8 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {searching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
            )}
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-full z-50 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-[50vh] overflow-y-auto">
              <div className="p-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1">
                  {searchResults.length} resultados
                </p>
                {searchResults.map((r, i) => (
                  <button
                    key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
                    onClick={() => navigateToSearchResult(r)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/60 active:bg-secondary transition-colors"
                  >
                    <span className="text-xs font-semibold text-accent">{r.book} {r.chapter}:{r.verse}</span>
                    <p className="text-xs text-foreground/80 font-scripture mt-0.5 line-clamp-2">
                      {highlightMatch(r.text, searchQuery)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && !searching && searchQuery.trim() && (
            <div className="absolute left-3 right-3 top-full z-50 mt-1 bg-card border border-border rounded-xl shadow-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                Nenhum resultado para "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

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

      {/* Pinned verse card (mobile) */}
      {pinnedVerse && (
        <PinnedVerseCard
          pinned={pinnedVerse}
          onGoTo={handleGoToPinned}
          onUnpin={unpinVerse}
        />
      )}

      {/* Scripture text */}
      <ScrollArea className="flex-1">
        <motion.div
          key={`${selectedBook}-${selectedChapter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-5 py-6 max-w-2xl mx-auto"
        >
          <h2 className="font-scripture text-lg font-semibold text-foreground mb-6">
            {selectedBook} {selectedChapter}
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive/70" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-1">
              {verses.map((verse) => {
                const hlClass = getHighlightClass(verse.number);
                const hl = hasHighlight(verse.number);
                return (
                  <p
                    key={verse.number}
                    className={`verse-line font-scripture text-foreground/90 leading-[1.8] cursor-pointer rounded-sm transition-all active:scale-[0.99] ${hlClass} ${hl ? 'has-highlight' : ''}`}
                    onClick={() => handleVerseOpen(verse)}
                  >
                    <sup className="text-xs text-accent font-ui font-semibold mr-1.5 select-none">
                      {verse.number}
                    </sup>
                    {verse.text}
                  </p>
                );
              })}
            </div>
          )}

          {/* Mobile: Revelation Mode below text */}
          {!loading && !error && verses.length > 0 && (
            <div className="mt-8 border-t border-border pt-4 space-y-4">
              <DepthSelector value={depth} onChange={setDepth} />
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
        </motion.div>
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
