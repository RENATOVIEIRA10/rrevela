import { useState, useMemo } from "react";
import { Search, Clock, Cross, Repeat, BookOpen, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BIBLE_BOOKS } from "@/lib/bible-data";

const OT_BOOKS = BIBLE_BOOKS.filter((_, i) => i < 39);
const NT_BOOKS = BIBLE_BOOKS.filter((_, i) => i >= 39);

interface DesktopNavSidebarProps {
  currentBook: string;
  currentChapter: number;
  onSelect: (book: string, chapter: number) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const DesktopNavSidebar = ({
  currentBook,
  currentChapter,
  onSelect,
  onSearch,
  searchQuery,
}: DesktopNavSidebarProps) => {
  const [pickedBook, setPickedBook] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const filteredOT = useMemo(
    () => OT_BOOKS.filter((b) => b.name.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  );
  const filteredNT = useMemo(
    () => NT_BOOKS.filter((b) => b.name.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  );

  const selectedBookData = pickedBook
    ? BIBLE_BOOKS.find((b) => b.name === pickedBook)
    : null;

  const handleSelectBook = (bookName: string) => {
    const book = BIBLE_BOOKS.find((b) => b.name === bookName);
    if (book && book.chapters === 1) {
      onSelect(bookName, 1);
      setPickedBook(null);
    } else {
      setPickedBook(bookName);
    }
  };

  return (
    <div className="h-full flex flex-col border-r border-border bg-card/50">
      {/* Search */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar na Bíblia..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8 bg-secondary/40 border-0 text-sm h-8 rounded-lg"
          />
        </div>
      </div>

      {/* Book navigation */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar livros..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 bg-secondary/40 border-0 text-xs h-7 rounded-lg"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {pickedBook && selectedBookData ? (
          <div className="p-3">
            <button
              onClick={() => setPickedBook(null)}
              className="text-xs text-accent flex items-center gap-1 mb-3 hover:underline"
            >
              ← Voltar
            </button>
            <p className="font-scripture text-sm font-semibold text-foreground mb-2">{pickedBook}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    onSelect(pickedBook, ch);
                    setPickedBook(null);
                  }}
                  className={`aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors ${
                    currentBook === pickedBook && currentChapter === ch
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary/40 text-foreground/70 hover:bg-secondary"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {/* Current location */}
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-2.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Lendo agora</p>
              <p className="font-scripture text-sm font-semibold text-accent">
                {currentBook} {currentChapter}
              </p>
            </div>

            {filteredOT.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                  Antigo Testamento
                </p>
                <div className="space-y-px">
                  {filteredOT.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => handleSelectBook(book.name)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        book.name === currentBook
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-foreground/70 hover:bg-secondary/60"
                      }`}
                    >
                      <span className="font-scripture">{book.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredNT.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                  Novo Testamento
                </p>
                <div className="space-y-px">
                  {filteredNT.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => handleSelectBook(book.name)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        book.name === currentBook
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-foreground/70 hover:bg-secondary/60"
                      }`}
                    >
                      <span className="font-scripture">{book.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DesktopNavSidebar;
