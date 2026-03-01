import { useState, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const BookPickerDrawer = ({
  open,
  onOpenChange,
  onSelect,
  currentBook,
  currentChapter,
}: BookPickerDrawerProps) => {
  const [search, setSearch] = useState("");
  const [pickedBook, setPickedBook] = useState<string | null>(null);

  const filteredOT = useMemo(
    () => OT_BOOKS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );
  const filteredNT = useMemo(
    () => NT_BOOKS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search]
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

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="font-scripture text-lg">
            {pickedBook ? pickedBook : "Escolher Livro"}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            {pickedBook ? "Selecione o capítulo" : "Antigo e Novo Testamento"}
          </DrawerDescription>
        </DrawerHeader>

        {!pickedBook ? (
          <>
            <div className="px-4 pb-3">
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

            <ScrollArea className="flex-1 px-4 pb-6" style={{ maxHeight: "60vh" }}>
              {filteredOT.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Antigo Testamento
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredOT.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => handleSelectBook(book.name)}
                        className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          book.name === currentBook
                            ? "bg-accent/10 text-accent font-medium border border-accent/20"
                            : "bg-secondary/40 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                        }`}
                      >
                        <span className="font-scripture text-sm">{book.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {book.chapters}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredNT.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Novo Testamento
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredNT.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => handleSelectBook(book.name)}
                        className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          book.name === currentBook
                            ? "bg-accent/10 text-accent font-medium border border-accent/20"
                            : "bg-secondary/40 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                        }`}
                      >
                        <span className="font-scripture text-sm">{book.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {book.chapters}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <ScrollArea className="flex-1 px-4 pb-6" style={{ maxHeight: "60vh" }}>
            <div className="mb-2">
              <button
                onClick={() => setPickedBook(null)}
                className="text-xs text-accent flex items-center gap-1 mb-3"
              >
                ← Voltar aos livros
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {selectedBookData &&
                Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map(
                  (ch) => (
                    <button
                      key={ch}
                      onClick={() => handleSelectChapter(ch)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentBook === pickedBook && currentChapter === ch
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary/50 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                      }`}
                    >
                      {ch}
                    </button>
                  )
                )}
            </div>
          </ScrollArea>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default BookPickerDrawer;
