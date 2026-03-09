import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, BookOpen, Loader2, ChevronDown, X, ArrowRight, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/hooks/useHighlights";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  rank?: number;
  highlight?: HighlightColor | null;
}

type TestamentFilter = "all" | "VT" | "NT";

const BuscaAvancada = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [testament, setTestament] = useState<TestamentFilter>("all");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [highlightFilter, setHighlightFilter] = useState<HighlightColor | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    testament === "all" ? true : b.testament === testament
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim() && !highlightFilter) return;
    setLoading(true);
    setSearched(true);

    let searchResults: SearchResult[] = [];

    if (highlightFilter && user) {
      // Search by highlight type
      let q = supabase
        .from("highlights")
        .select("book, chapter, verse, color_key")
        .eq("user_id", user.id)
        .eq("color_key", highlightFilter)
        .order("created_at", { ascending: false })
        .limit(100);

      if (selectedBook) q = q.eq("book", selectedBook);

      const { data: highlights } = await q;

      if (highlights && highlights.length > 0) {
        // Fetch verse texts
        const versePromises = highlights.map(async (h) => {
          const { data: vData } = await supabase
            .from("bible_verses")
            .select("text")
            .eq("book", h.book)
            .eq("chapter", h.chapter)
            .eq("verse", h.verse)
            .eq("translation", "acf")
            .maybeSingle();

          return {
            book: h.book,
            chapter: h.chapter,
            verse: h.verse,
            text: vData?.text ?? "",
            highlight: h.color_key as HighlightColor,
          };
        });

        searchResults = await Promise.all(versePromises);

        // Apply text query filter if provided
        if (query.trim()) {
          const q = query.toLowerCase();
          searchResults = searchResults.filter((r) =>
            r.text.toLowerCase().includes(q)
          );
        }
      }
    } else if (query.trim()) {
      // Text search
      const { data } = await supabase.rpc("search_bible", {
        search_query: query,
        translation_filter: "acf",
        result_limit: 100,
      });

      searchResults = ((data as SearchResult[]) ?? []).map((r) => ({
        ...r,
        highlight: null,
      }));
    }

    // Apply testament/book filter
    if (testament !== "all") {
      const booksInTestament = BIBLE_BOOKS
        .filter((b) => b.testament === testament)
        .map((b) => b.name);
      searchResults = searchResults.filter((r) =>
        booksInTestament.includes(r.book)
      );
    }

    if (selectedBook) {
      searchResults = searchResults.filter((r) => r.book === selectedBook);
    }

    // If highlight filter, fetch highlight info for text-only searches
    if (!highlightFilter && user && searchResults.length > 0) {
      const { data: userHighlights } = await supabase
        .from("highlights")
        .select("book, chapter, verse, color_key")
        .eq("user_id", user.id);

      if (userHighlights) {
        const hlMap = new Map(
          userHighlights.map((h) => [`${h.book}-${h.chapter}-${h.verse}`, h.color_key as HighlightColor])
        );
        searchResults = searchResults.map((r) => ({
          ...r,
          highlight: hlMap.get(`${r.book}-${r.chapter}-${r.verse}`) ?? null,
        }));
      }
    }

    setResults(searchResults);
    setLoading(false);
  }, [query, testament, selectedBook, highlightFilter, user]);

  const handleGoTo = (book: string, chapter: number) => {
    navigate(`/leitor?livro=${encodeURIComponent(book)}&cap=${chapter}`);
  };

  const activeFilterCount =
    (testament !== "all" ? 1 : 0) +
    (selectedBook ? 1 : 0) +
    (highlightFilter ? 1 : 0);

  const clearFilters = () => {
    setTestament("all");
    setSelectedBook("");
    setHighlightFilter("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm px-5 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-scripture text-lg font-semibold text-foreground tracking-wide">
            Busca Avançada
          </h1>
          <Link
            to="/revela"
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors font-ui px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/15"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Revela
          </Link>
        </div>
        <div className="editorial-divider" />

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar na Bíblia..."
            className="pl-10 pr-4 bg-secondary/30 border-border/30 font-ui text-sm"
          />
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-xs font-ui transition-colors ${
              activeFilterCount > 0 ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4"
            >
              {/* Testament */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-ui">
                  Testamento
                </p>
                <div className="flex gap-2">
                  {([
                    ["all", "Todos"],
                    ["VT", "Antigo"],
                    ["NT", "Novo"],
                  ] as [TestamentFilter, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => {
                        setTestament(val);
                        setSelectedBook("");
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-ui transition-all ${
                        testament === val
                          ? "bg-accent/10 text-accent border border-accent/20 font-medium"
                          : "bg-secondary/30 text-foreground/60 border border-transparent hover:bg-secondary/50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-ui">
                  Livro
                </p>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="w-full text-sm bg-secondary/30 border border-border/30 rounded-lg px-3 py-2 font-ui text-foreground appearance-none"
                >
                  <option value="">Todos os livros</option>
                  {filteredBooks.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Highlight filter */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-ui">
                  Tipo de marcação
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setHighlightFilter("")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-ui transition-all ${
                      !highlightFilter
                        ? "bg-accent/10 text-accent border border-accent/20 font-medium"
                        : "bg-secondary/30 text-foreground/60 border border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    Qualquer
                  </button>
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() =>
                        setHighlightFilter(highlightFilter === c.key ? "" : c.key)
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-ui transition-all flex items-center gap-1 ${
                        highlightFilter === c.key
                          ? "bg-accent/10 text-accent border border-accent/20 font-medium"
                          : "bg-secondary/30 text-foreground/60 border border-transparent hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-sm">{c.emoji}</span>
                      <span className="hidden sm:inline">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={loading || (!query.trim() && !highlightFilter)}
          className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-ui text-sm font-medium disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Buscar
        </button>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-2 pb-10">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 space-y-2"
            >
              <Search className="w-6 h-6 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
              <p className="text-[10px] text-muted-foreground/60">
                Tente outros termos ou ajuste os filtros.
              </p>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-[10px] text-muted-foreground font-ui pb-2">
                {results.length} resultado{results.length !== 1 ? "s" : ""}
              </p>

              {results.map((r, i) => {
                const hlColor = r.highlight
                  ? HIGHLIGHT_COLORS.find((c) => c.key === r.highlight)
                  : null;

                return (
                  <motion.button
                    key={`${r.book}-${r.chapter}-${r.verse}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    onClick={() => handleGoTo(r.book, r.chapter)}
                    className="w-full text-left p-4 rounded-xl bg-card hover:bg-secondary/30 transition-colors space-y-2"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-accent/60" />
                        <span className="text-xs font-ui font-medium text-accent/80">
                          {r.book} {r.chapter}:{r.verse}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hlColor && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-ui flex items-center gap-1"
                            style={{
                              backgroundColor: `${hlColor.dotColor}20`,
                              color: hlColor.dotColor,
                            }}
                          >
                            {hlColor.emoji} {hlColor.label}
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
                      </div>
                    </div>

                    <p className="text-sm font-scripture text-foreground/80 leading-relaxed line-clamp-3">
                      {highlightTerms(r.text, query)}
                    </p>
                  </motion.button>
                );
              })}
            </>
          )}

          {!searched && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3"
            >
              <Search className="w-8 h-8 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-foreground/80 font-scripture">
                Busque por palavras ou filtre por marcações
              </p>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Use os filtros para encontrar versículos por testamento, livro ou tipo de marcação que você fez.
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BuscaAvancada;
