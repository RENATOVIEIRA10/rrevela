/**
 * useReaderState.ts — Atualizado para novo sistema de marcação
 *
 * MUDANÇAS:
 * - Expõe `isMarked` e `toggleMark` em vez de getHighlightClass / setHighlight
 * - Remove HIGHLIGHT_COLORS (não usado mais na UI do Reader)
 * - getVerseHighlight ainda exposto para compatibilidade com DesktopStudyMargin
 */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePinnedVerse } from "@/hooks/usePinnedVerse";
import { useFavorites } from "@/hooks/useFavorites";
import { useHighlights } from "@/hooks/useHighlights";
import { useNotes } from "@/hooks/useNotes";
import { useBibleVerses, searchBible, type BibleSearchResult } from "@/hooks/useBibleVerses";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import type { DepthLevel } from "@/components/DepthSelector";
import type { TranslationKey } from "@/components/TranslationSelector";
import type { ReaderLocationState } from "@/integrations/supabase/local-types";

const FONT_SIZE_MAP: Record<string, string> = {
  sm: "text-[0.9375rem]",
  md: "text-[1.125rem]",
  lg: "text-[1.3125rem]",
};

const getFontSizeClass = (size: string) =>
  FONT_SIZE_MAP[size] ?? FONT_SIZE_MAP.md;

export function useReaderState() {
  const isMobile = useIsMobile();
  const { track } = useAnalytics();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const locationState = location.state as ReaderLocationState | null;
  const fromRevela = !!locationState?.fromRevela;

  const [selectedBook, setSelectedBook] = useState(searchParams.get("livro") || "Gênesis");
  const [selectedChapter, setSelectedChapter] = useState(Number(searchParams.get("cap")) || 1);
  const [targetVerse, setTargetVerse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{ number: number; text: string } | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteVerse, setNoteVerse] = useState<number | undefined>(undefined);
  const [noteVerseText, setNoteVerseText] = useState<string | undefined>(undefined);
  const [noteAiRevelation, setNoteAiRevelation] = useState<string | undefined>(undefined);
  const [depth, setDepth] = useState<DepthLevel>("essencial");
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [desktopNoteVerse, setDesktopNoteVerse] = useState<number | undefined>(undefined);
  const [translation, setTranslation] = useState<TranslationKey>(
    () => (localStorage.getItem("revela-translation") as TranslationKey) || "acf"
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("revela-font-size") || "md"
  );

  const handleTranslationChange = useCallback((v: TranslationKey) => {
    setTranslation(v);
    localStorage.setItem("revela-translation", v);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "revela-font-size" && e.newValue) setFontSize(e.newValue);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const { verses, loading, error } = useBibleVerses(selectedBook, selectedChapter, translation);
  const { pinned: pinnedVerse, pin: pinVerse, unpin: unpinVerse } = usePinnedVerse();
  const { isFavorite, toggleFavorite } = useFavorites();
  // Novo: toggleMark e isMarked em vez de setHighlight / getHighlightClass
  const { toggleMark, isMarked, getVerseHighlight } = useHighlights(selectedBook, selectedChapter);
  const chapterNotes = useNotes(selectedBook, selectedChapter);
  const verseNotes = useNotes(selectedBook, selectedChapter, noteVerse ?? desktopNoteVerse);

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const chapters = currentBook?.chapters ?? 1;
  const fontSizeClass = getFontSizeClass(fontSize);

  useEffect(() => {
    if (!loading && verses.length > 0) {
      track("chapter_read", { book: selectedBook, chapter: selectedChapter });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedChapter, loading, verses.length]);

  useEffect(() => {
    const livro = searchParams.get("livro");
    const cap = searchParams.get("cap");
    if (livro && BIBLE_BOOKS.some((b) => b.name === livro)) {
      setSelectedBook(livro);
      setSelectedChapter(Number(cap) || 1);
      setSearchParams({}, { replace: true });
      return;
    }
    // Fallback: location.state passado por navigate() da Home ou outros
    const state = location.state as { book?: string; chapter?: number } | null;
    if (state?.book && BIBLE_BOOKS.some((b) => b.name === state.book)) {
      setSelectedBook(state.book);
      if (state.chapter) setSelectedChapter(state.chapter);
    }
  }, [searchParams, setSearchParams, location.state]);

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

  const goToPrev = useCallback(() => setSelectedChapter((c) => Math.max(1, c - 1)), []);
  const goToNext = useCallback(() => setSelectedChapter((c) => Math.min(chapters, c + 1)), [chapters]);

  const navigateToSearchResult = useCallback((result: BibleSearchResult) => {
    setSelectedBook(result.book);
    setSelectedChapter(result.chapter);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  const handleGoToPinned = useCallback((book: string, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
  }, []);

  const handleNavigateToRef = useCallback((refBook: string, refChapter: number) => {
    setSelectedBook(refBook);
    setSelectedChapter(refChapter);
    setSelectedVerse(null);
  }, []);

  const handleVerseOpen = useCallback((verse: { number: number; text: string }) => {
    setSelectedVerse(verse);
    track("verse_opened", { book: selectedBook, chapter: selectedChapter, verse: verse.number });
  }, [selectedBook, selectedChapter, track]);

  const handlePinVerse = useCallback(() => {
    if (!selectedVerse) return;
    pinVerse({ translation, book: selectedBook, chapter: selectedChapter, verse: selectedVerse.number, text: selectedVerse.text });
    setSelectedVerse(null);
  }, [selectedVerse, translation, selectedBook, selectedChapter, pinVerse]);

  const openVerseNote = useCallback((verseNum: number, verseText?: string, aiRevelation?: string) => {
    setNoteVerseText(verseText);
    setNoteAiRevelation(aiRevelation);
    if (isMobile) {
      setNoteVerse(verseNum);
      setNoteSheetOpen(true);
      setSelectedVerse(null);
    } else {
      setDesktopNoteVerse(verseNum);
      setShowRightPanel(true);
    }
  }, [isMobile]);

  const openChapterNote = useCallback(() => {
    setNoteVerseText(undefined);
    setNoteAiRevelation(undefined);
    if (isMobile) {
      setNoteVerse(undefined);
      setNoteSheetOpen(true);
    } else {
      setDesktopNoteVerse(undefined);
      setShowRightPanel(true);
    }
  }, [isMobile]);

  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    const words = query.trim().split(/\s+/);
    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/20 text-foreground rounded-sm px-0.5">{part}</mark>
      ) : part
    );
  }, []);

  return {
    isMobile, fromRevela, routerNavigate,
    selectedBook, setSelectedBook,
    selectedChapter, setSelectedChapter,
    chapters, goToPrev, goToNext,
    handleGoToPinned, handleNavigateToRef,
    searchQuery, setSearchQuery,
    searchResults, searching, showSearchResults,
    navigateToSearchResult, highlightMatch,
    selectedVerse, setSelectedVerse,
    handleVerseOpen, handlePinVerse,
    verses, loading, error,
    translation, handleTranslationChange, fontSizeClass,
    // Novo sistema de marcação
    isMarked,
    toggleMark,
    // Mantido para DesktopStudyMargin e BuscaAvancada
    getVerseHighlight,
    isFavorite, toggleFavorite,
    pinnedVerse, unpinVerse,
    noteSheetOpen, setNoteSheetOpen,
    noteVerse, setNoteVerse,
    noteVerseText, noteAiRevelation,
    openVerseNote, openChapterNote,
    chapterNotes, verseNotes,
    showLeftPanel, setShowLeftPanel,
    showRightPanel, setShowRightPanel,
    desktopNoteVerse, setDesktopNoteVerse,
    depth, setDepth,
    bookPickerOpen, setBookPickerOpen,
  };
}
