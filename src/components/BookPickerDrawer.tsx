import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { BIBLE_BOOKS } from "@/lib/bible-data";

interface BookPickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (book: string, chapter: number) => void;
  currentBook: string;
  currentChapter: number;
}

const OT_BOOKS = BIBLE_BOOKS.filter((_, i) => i < 39);
const NT_BOOKS = BIBLE_BOOKS.filter((_, i) => i >= 39);

type TabKey = "at" | "nt";

const BookPickerDrawer = ({
  open,
  onOpenChange,
  onSelect,
  currentBook,
  currentChapter,
}: BookPickerDrawerProps) => {
  const [search, setSearch] = useState("");
  const [pickedBook, setPickedBook] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const idx = BIBLE_BOOKS.findIndex((b) => b.name === currentBook);
    return idx >= 39 ? "nt" : "at";
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBookRef = useRef<HTMLButtonElement>(null);

  // Scroll to current book when opening
  useEffect(() => {
    if (open && !pickedBook) {
      setTimeout(() => {
        activeBookRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 200);
    }
  }, [open, pickedBook, activeTab]);

  const booksForTab = activeTab === "at" ? OT_BOOKS : NT_BOOKS;

  const filteredBooks = useMemo(
    () =>
      search.trim()
        ? BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
        : booksForTab,
    [search, booksForTab]
  );

  const selectedBookData = pickedBook
    ? BIBLE_BOOKS.find((b) => b.name === pickedBook)
    : null;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPickedBook(null);
      setSearch("");
    }, 300);
  };

  const handleSelectChapter = (chapter: number) => {
    if (pickedBook) {
      onSelect(pickedBook, chapter);
      handleClose();
    }
  };

  const handleSelectBook = (bookName: string) => {
    const book = BIBLE_BOOKS.find((b) => b.name === bookName);
    if (book && book.chapters === 1) {
      onSelect(bookName, 1);
      handleClose();
    } else {
      setPickedBook(bookName);
    }
  };

  const isSearching = search.trim().length > 0;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="pb-1 shrink-0">
          {pickedBook ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPickedBook(null)}
                className="p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <DrawerTitle className="font-scripture text-lg text-left">
                  {pickedBook}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground text-left">
                  Selecione o capítulo
                </DrawerDescription>
              </div>
            </div>
          ) : (
            <>
              <DrawerTitle className="font-scripture text-lg">
                Escolher Livro
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                Navegue pela Bíblia
              </DrawerDescription>
            </>
          )}
        </DrawerHeader>

        {!pickedBook ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search */}
            <div className="px-4 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar livro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-0 text-sm h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Tabs AT / NT */}
            {!isSearching && (
              <div className="px-4 pb-3 shrink-0">
                <div className="flex bg-secondary/40 rounded-lg p-0.5">
                  <button
                    onClick={() => setActiveTab("at")}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTab === "at"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Antigo Testamento
                  </button>
                  <button
                    onClick={() => setActiveTab("nt")}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                      activeTab === "nt"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Novo Testamento
                  </button>
                </div>
              </div>
            )}

            {/* Book list */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
              style={{ maxHeight: "55vh" }}
            >
              {isSearching && filteredBooks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum livro encontrado
                </p>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {filteredBooks.map((book) => {
                  const isActive = book.name === currentBook;
                  return (
                    <button
                      key={book.name}
                      ref={isActive ? activeBookRef : null}
                      onClick={() => handleSelectBook(book.name)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all active:scale-[0.97] ${
                        isActive
                          ? "bg-accent/10 text-accent font-medium border border-accent/20 shadow-sm"
                          : "bg-secondary/40 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                      }`}
                    >
                      <span className="font-scripture text-sm">{book.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {book.chapters}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Chapter grid */
          <div
            className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
            style={{ maxHeight: "60vh" }}
          >
            <div className="grid grid-cols-5 gap-2">
              {selectedBookData &&
                Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map(
                  (ch) => (
                    <button
                      key={ch}
                      onClick={() => handleSelectChapter(ch)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95 ${
                        currentBook === pickedBook && currentChapter === ch
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-secondary/50 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                      }`}
                    >
                      {ch}
                    </button>
                  )
                )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default BookPickerDrawer;
