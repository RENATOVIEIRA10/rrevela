import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, StickyNote, ChevronDown, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import BookPickerDrawer from "@/components/BookPickerDrawer";
import { useHighlights, HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { useNotes } from "@/hooks/useNotes";
import { useBibleVerses, searchBible, type BibleSearchResult } from "@/hooks/useBibleVerses";
import VersePanel from "@/components/VersePanel";
import HighlightLegend from "@/components/HighlightLegend";
import NoteEditor from "@/components/NoteEditor";
import MessianicLinePanel from "@/components/MessianicLinePanel";
import BiblicalPatternsPanel from "@/components/BiblicalPatternsPanel";
import DepthSelector, { type DepthLevel } from "@/components/DepthSelector";
import RevealingQuestions from "@/components/RevealingQuestions";

const Reader = () => {
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

  // Fetch verses from database
  const { verses, loading, error } = useBibleVerses(selectedBook, selectedChapter);

  // Handle navigation from other pages via query params
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
  const verseNotes = useNotes(selectedBook, selectedChapter, noteVerse);

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

  const openVerseNote = (verseNum: number) => {
    setNoteVerse(verseNum);
    setNoteSheetOpen(true);
    setSelectedVerse(null);
  };

  const openChapterNote = () => {
    setNoteVerse(undefined);
    setNoteSheetOpen(true);
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
        <mark key={i} className="bg-accent/30 text-foreground rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const activeNotes = noteVerse !== undefined ? verseNotes : chapterNotes;
  const noteType = noteVerse !== undefined ? "verse" as const : "chapter" as const;
  const existingNote = activeNotes.notes[0];

  return (
    <div className="flex flex-col h-full">
      {/* Native-style navigation bar */}
      <div className="border-b border-border bg-card/95 backdrop-blur-md safe-top">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Book + Chapter picker */}
          <button
            onClick={() => setBookPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/60 active:bg-secondary transition-colors min-w-0"
          >
            <span className="font-scripture text-sm font-medium text-foreground truncate max-w-[120px]">
              {selectedBook}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>

          {/* Chapter nav */}
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            <HighlightLegend />
            <button
              onClick={openChapterNote}
              className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary/50"
              aria-label="Nota do capítulo"
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

          {/* Search results dropdown */}
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
                    <span className="text-xs font-semibold text-accent">
                      {r.book} {r.chapter}:{r.verse}
                    </span>
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

      {/* Book Picker Drawer */}
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
              {verses.map((verse) => (
                <p
                  key={verse.number}
                  className={`font-scripture text-foreground/90 leading-[1.8] cursor-pointer rounded-sm transition-all active:scale-[0.99] ${getHighlightClass(verse.number)}`}
                  onClick={() => setSelectedVerse(verse)}
                >
                  <sup className="text-xs text-accent font-ui font-semibold mr-1.5 select-none">
                    {verse.number}
                  </sup>
                  {verse.text}
                </p>
              ))}
            </div>
          )}

          {/* Revelation Mode - below the chapter text */}
          {!loading && !error && verses.length > 0 && (
            <div className="mt-8 border-t border-border pt-4 space-y-4">
              <DepthSelector value={depth} onChange={setDepth} />
              <MessianicLinePanel book={selectedBook} chapter={selectedChapter} />
              {(depth === "intermediario" || depth === "profundo") && (
                <BiblicalPatternsPanel book={selectedBook} chapter={selectedChapter} depth={depth} />
              )}
              <RevealingQuestions
                depth={depth}
                onApplyQuestion={(q) => {
                  setNoteVerse(undefined);
                  setNoteSheetOpen(true);
                }}
              />
            </div>
          )}
        </motion.div>
      </ScrollArea>

      {/* Verse Panel */}
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
        />
      )}

      {/* Notes Sheet */}
      <Sheet open={noteSheetOpen} onOpenChange={setNoteSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="font-scripture text-base">
              {noteVerse !== undefined
                ? `${selectedBook} ${selectedChapter}:${noteVerse}`
                : `${selectedBook} ${selectedChapter}`}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {noteType === "verse" ? "Nota compacta: Observação → Cristo → Aplicação" : "Nota completa: 5 blocos formativos"}
            </SheetDescription>
          </SheetHeader>

          <NoteEditor
            note={existingNote}
            noteType={noteType}
            book={selectedBook}
            chapter={selectedChapter}
            verse={noteVerse}
            onSave={activeNotes.saveNote}
            onDelete={existingNote ? activeNotes.deleteNote : undefined}
            onClose={() => setNoteSheetOpen(false)}
          />

          {activeNotes.notes.length > 1 && (
            <div className="mt-8 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Anotações anteriores
              </p>
              {activeNotes.notes.slice(1).map((prevNote) => (
                <div
                  key={prevNote.id}
                  className="bg-secondary/30 rounded-xl p-4 space-y-2 border border-border/30"
                >
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(prevNote.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  {prevNote.observation && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Observação</p>
                      <p className="text-sm text-foreground/80 font-scripture">{prevNote.observation}</p>
                    </div>
                  )}
                  {prevNote.christocentric && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cristo</p>
                      <p className="text-sm text-foreground/80 font-scripture">{prevNote.christocentric}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Reader;
