import { useState, useEffect } from "react";
import { createElement } from "react";
import { searchBible, type BibleSearchResult } from "@/hooks/useBibleVerses";

export function useReaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    const words = query.trim().split(/\s+/);
    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? createElement("mark", { key: i, className: "bg-accent/20 text-foreground rounded-sm px-0.5" }, part)
        : part
    );
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    showSearchResults,
    setShowSearchResults,
    clearSearch,
    highlightMatch,
  };
}
