import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS, getChapterVerses } from "@/lib/bible-data";
import { useHighlights, HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import VersePanel from "@/components/VersePanel";
import HighlightLegend from "@/components/HighlightLegend";
import type { HighlightColor } from "@/hooks/useHighlights";

const Reader = () => {
  const [selectedBook, setSelectedBook] = useState("Gênesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<{ number: number; text: string } | null>(null);

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const chapters = currentBook ? currentBook.chapters : 1;
  const verses = getChapterVerses(selectedBook, selectedChapter);
  const { getVerseHighlight, setHighlight } = useHighlights(selectedBook, selectedChapter);

  const goToPrev = () => {
    if (selectedChapter > 1) setSelectedChapter((c) => c - 1);
  };

  const goToNext = () => {
    if (selectedChapter < chapters) setSelectedChapter((c) => c + 1);
  };

  const getHighlightClass = (verseNumber: number) => {
    const h = getVerseHighlight(verseNumber);
    if (!h) return "";
    return HIGHLIGHT_COLORS.find((c) => c.key === h.color_key)?.cssClass ?? "";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <Select value={selectedBook} onValueChange={(v) => { setSelectedBook(v); setSelectedChapter(1); }}>
            <SelectTrigger className="flex-1 bg-secondary/50 border-0 font-scripture text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {BIBLE_BOOKS.map((book) => (
                <SelectItem key={book.name} value={book.name} className="font-scripture text-sm">
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={goToPrev} disabled={selectedChapter <= 1} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[2.5rem] text-center text-foreground">
              {selectedChapter}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNext} disabled={selectedChapter >= chapters} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <HighlightLegend />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar passagem ou palavra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-0 text-sm h-9"
          />
        </div>
      </div>

      {/* Scripture text */}
      <ScrollArea className="flex-1">
        <motion.div
          key={`${selectedBook}-${selectedChapter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-5 py-6 max-w-2xl mx-auto"
        >
          <h2 className="font-scripture text-lg font-semibold text-foreground mb-6">
            {selectedBook} {selectedChapter}
          </h2>

          <div className="space-y-1">
            {verses.map((verse) => (
              <p
                key={verse.number}
                className={`font-scripture text-foreground/90 leading-[1.8] cursor-pointer rounded-sm transition-all active:scale-[0.99] ${getHighlightClass(verse.number)}`}
                onClick={() => setSelectedVerse(verse)}
              >
                <sup className="text-xs text-accent font-ui font-semibold mr-1.5 select-none">
                  {verse.number}
                </sup>
                {verse.text}
              </p>
            ))}
          </div>
        </motion.div>
      </ScrollArea>

      {/* Verse Panel (bottom sheet) */}
      {selectedVerse && (
        <VersePanel
          open={!!selectedVerse}
          onClose={() => setSelectedVerse(null)}
          verseNumber={selectedVerse.number}
          verseText={selectedVerse.text}
          currentColor={getVerseHighlight(selectedVerse.number)?.color_key ?? null}
          onSelectColor={(color) => {
            setHighlight(selectedVerse.number, color);
            if (color === null) setSelectedVerse(null);
          }}
        />
      )}
    </div>
  );
};

export default Reader;
