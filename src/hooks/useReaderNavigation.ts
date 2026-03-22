import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BIBLE_BOOKS } from "@/lib/bible-data";

export function useReaderNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBook, setSelectedBook] = useState(
    searchParams.get("livro") || "Gênesis"
  );
  const [selectedChapter, setSelectedChapter] = useState(
    Number(searchParams.get("cap")) || 1
  );

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

  return {
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    chapters,
    goToPrev: () => { if (selectedChapter > 1) setSelectedChapter((c) => c - 1); },
    goToNext: () => { if (selectedChapter < chapters) setSelectedChapter((c) => c + 1); },
  };
}
