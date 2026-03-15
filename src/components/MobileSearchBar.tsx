import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import type { BibleSearchResult } from "@/hooks/useBibleVerses";

interface MobileSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClear: () => void;
  searching: boolean;
  showSearchResults: boolean;
  searchResults: BibleSearchResult[];
  onNavigateToResult: (result: BibleSearchResult) => void;
  highlightMatch: (text: string, query: string) => React.ReactNode;
}

export default function MobileSearchBar({
  searchQuery, onSearchChange, onClear,
  searching, showSearchResults, searchResults,
  onNavigateToResult, highlightMatch,
}: MobileSearchBarProps) {
  return (
    <div className="px-4 pb-2.5 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        <Input
          placeholder="Buscar na Bíblia..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 bg-secondary/30 border-0 text-sm h-9 rounded-xl placeholder:text-muted-foreground/50"
        />
        {searchQuery && !searching && (
          <button
            onClick={onClear}
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
                  onClick={() => onNavigateToResult(r)}
                  className="w-full text-left px-3 py-3 rounded-xl active:bg-secondary/70 transition-colors"
                >
                  <span className="text-xs font-medium text-accent">
                    {r.book} {r.chapter}:{r.verse}
                  </span>
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
  );
}
