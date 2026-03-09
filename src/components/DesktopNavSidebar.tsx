import { useState, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
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
    <div className="h-full flex flex-col border-r border-border/50 bg-sidebar/50">
      {/* Bible search */}
      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Buscar na Bíblia..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-secondary/30 border-0 text-sm h-9 rounded-xl placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Book filter */}
      <div className="px-4 py-3 border-b border-border/40">
        <Input
          placeholder="Filtrar livros..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-secondary/30 border-0 text-xs h-8 rounded-lg placeholder:text-muted-foreground/50"
        />
      </div>

      <ScrollArea className="flex-1">
        {pickedBook && selectedBookData ? (
          <div className="p-4">
            <button
              onClick={() => setPickedBook(null)}
              className="text-xs text-accent flex items-center gap-1 mb-4 hover:underline font-ui"
            >
              ← Voltar
            </button>
            <p className="font-scripture text-sm font-medium text-foreground mb-3">{pickedBook}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    onSelect(pickedBook, ch);
                    setPickedBook(null);
                  }}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-ui font-medium transition-all duration-150 ${
                    currentBook === pickedBook && currentChapter === ch
                      ? "bg-accent text-accent-foreground shadow-soft"
                      : "bg-secondary/30 text-foreground/70 hover:bg-secondary/60"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Current location — elegant highlight */}
            <div className="bg-accent/5 border border-accent/10 rounded-xl p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-ui mb-0.5">
                Lendo agora
              </p>
              <p className="font-scripture text-sm font-medium text-accent">
                {currentBook} {currentChapter}
              </p>
            </div>

            {filteredOT.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-ui font-medium mb-2 px-1">
                  Antigo Testamento
                </p>
                <div className="space-y-0.5">
                  {filteredOT.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => handleSelectBook(book.name)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-[0.8125rem] transition-all duration-150 flex items-center justify-between group ${
                        book.name === currentBook
                          ? "bg-accent/8 text-accent font-medium"
                          : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="font-scripture">{book.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredNT.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-ui font-medium mb-2 px-1">
                  Novo Testamento
                </p>
                <div className="space-y-0.5">
                  {filteredNT.map((book) => (
                    <button
                      key={book.name}
                      onClick={() => handleSelectBook(book.name)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-[0.8125rem] transition-all duration-150 flex items-center justify-between group ${
                        book.name === currentBook
                          ? "bg-accent/8 text-accent font-medium"
                          : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="font-scripture">{book.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
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
