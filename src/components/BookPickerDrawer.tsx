import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

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

/* ─── Full-screen mobile picker ─── */
const MobileBookPicker = ({
  open,
  onClose,
  onSelect,
  currentBook,
  currentChapter,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (book: string, chapter: number) => void;
  currentBook: string;
  currentChapter: number;
}) => {
  const [search, setSearch] = useState("");
  const [pickedBook, setPickedBook] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const idx = BIBLE_BOOKS.findIndex((b) => b.name === currentBook);
    return idx >= 39 ? "nt" : "at";
  });

  const activeBookRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && !pickedBook) {
      setTimeout(() => {
        activeBookRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 250);
    }
  }, [open, pickedBook, activeTab]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPickedBook(null);
        setSearch("");
      }, 300);
    }
  }, [open]);

  const booksForTab = activeTab === "at" ? OT_BOOKS : NT_BOOKS;
  const isSearching = search.trim().length > 0;

  const filteredBooks = useMemo(
    () =>
      isSearching
        ? BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
        : booksForTab,
    [search, booksForTab, isSearching]
  );

  const selectedBookData = pickedBook ? BIBLE_BOOKS.find((b) => b.name === pickedBook) : null;

  const handleSelectBook = (bookName: string) => {
    const book = BIBLE_BOOKS.find((b) => b.name === bookName);
    if (book && book.chapters === 1) {
      onSelect(bookName, 1);
      onClose();
    } else {
      setPickedBook(bookName);
    }
  };

  const handleSelectChapter = (ch: number) => {
    if (pickedBook) {
      onSelect(pickedBook, ch);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col safe-top safe-bottom"
        >
          {/* ── Header ── */}
          <div className="shrink-0 border-b border-border/40 px-4 pt-3 pb-2">
            {!pickedBook ? (
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h1 className="font-scripture text-xl font-semibold text-foreground">
                    Escolher Livro
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Navegue pela Bíblia</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setPickedBook(null)}
                  className="p-2 -ml-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="font-scripture text-xl font-semibold text-foreground truncate">
                    {pickedBook}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Selecione o capítulo</p>
                </div>
              </div>
            )}

            {/* Search — only on book list */}
            {!pickedBook && (
              <div className="relative mt-2 mb-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Buscar livro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/40 border-0 text-sm h-11 rounded-xl"
                  autoFocus={false}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Tabs — only when not searching and on book list */}
            {!pickedBook && !isSearching && (
              <div className="flex bg-secondary/30 rounded-xl p-1 mt-2">
                <button
                  onClick={() => setActiveTab("at")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "at"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Antigo Testamento
                </button>
                <button
                  onClick={() => setActiveTab("nt")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === "nt"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Novo Testamento
                </button>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait">
              {!pickedBook ? (
                <motion.div
                  key="books"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="py-2"
                >
                  {isSearching && filteredBooks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-12">
                      Nenhum livro encontrado
                    </p>
                  )}

                  {filteredBooks.map((book) => {
                    const isActive = book.name === currentBook;
                    return (
                      <button
                        key={book.name}
                        ref={isActive ? activeBookRef : null}
                        onClick={() => handleSelectBook(book.name)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors active:scale-[0.99] ${
                          isActive
                            ? "bg-accent/8 border-l-[3px] border-accent"
                            : "border-l-[3px] border-transparent hover:bg-secondary/40 active:bg-secondary/60"
                        }`}
                      >
                        <span
                          className={`font-scripture text-[15px] ${
                            isActive ? "text-accent font-semibold" : "text-foreground/85"
                          }`}
                        >
                          {book.name}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {book.chapters} {book.chapters === 1 ? "cap" : "caps"}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="chapters"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  {selectedBookData && (
                    <div className="grid grid-cols-5 gap-2.5">
                      {Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map(
                        (ch) => {
                          const isActive = currentBook === pickedBook && currentChapter === ch;
                          return (
                            <button
                              key={ch}
                              onClick={() => handleSelectChapter(ch)}
                              className={`aspect-square flex items-center justify-center rounded-xl text-base font-medium transition-all active:scale-95 ${
                                isActive
                                  ? "bg-accent text-accent-foreground shadow-md"
                                  : "bg-secondary/40 text-foreground/80 hover:bg-secondary active:bg-secondary/80"
                              }`}
                            >
                              {ch}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Desktop drawer (unchanged behavior) ─── */
const DesktopBookPickerDrawer = ({
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

  const selectedBookData = pickedBook ? BIBLE_BOOKS.find((b) => b.name === pickedBook) : null;

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
                <DrawerTitle className="font-scripture text-lg text-left">{pickedBook}</DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground text-left">
                  Selecione o capítulo
                </DrawerDescription>
              </div>
            </div>
          ) : (
            <>
              <DrawerTitle className="font-scripture text-lg">Escolher Livro</DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                Navegue pela Bíblia
              </DrawerDescription>
            </>
          )}
        </DrawerHeader>

        {!pickedBook ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar livro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-0 text-sm h-9"
                />
              </div>
            </div>

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
                      <span className="text-[10px] text-muted-foreground ml-1">{book.chapters}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
            style={{ maxHeight: "60vh" }}
          >
            <div className="grid grid-cols-5 gap-2">
              {selectedBookData &&
                Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map((ch) => (
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
                ))}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

/* ─── Exported component: auto-switches mobile vs desktop ─── */
const BookPickerDrawer = (props: BookPickerDrawerProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileBookPicker
        open={props.open}
        onClose={() => props.onOpenChange(false)}
        onSelect={props.onSelect}
        currentBook={props.currentBook}
        currentChapter={props.currentChapter}
      />
    );
  }

  return <DesktopBookPickerDrawer {...props} />;
};

export default BookPickerDrawer;
