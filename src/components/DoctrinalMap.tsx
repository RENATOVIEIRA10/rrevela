import { motion } from "framer-motion";
import { BookMarked, ChevronRight } from "lucide-react";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/hooks/useHighlights";
import { useNavigate } from "react-router-dom";

interface ThemeGroup {
  themeKey: HighlightColor;
  label: string;
  emoji: string;
  books: { book: string; chapter: number; count: number }[];
  totalCount: number;
}

interface DoctrinalMapProps {
  highlights: Array<{
    book: string;
    chapter: number;
    verse: number;
    color_key: HighlightColor;
  }>;
}

const DoctrinalMap = ({ highlights }: DoctrinalMapProps) => {
  const navigate = useNavigate();

  // Group highlights by color_key (theological theme), then by book+chapter
  const groups: ThemeGroup[] = HIGHLIGHT_COLORS.map((color) => {
    const matching = highlights.filter((h) => h.color_key === color.key);

    const bookChapterMap = new Map<string, number>();
    matching.forEach((h) => {
      const key = `${h.book}|${h.chapter}`;
      bookChapterMap.set(key, (bookChapterMap.get(key) || 0) + 1);
    });

    const books = Array.from(bookChapterMap.entries())
      .map(([key, count]) => {
        const [book, ch] = key.split("|");
        return { book, chapter: Number(ch), count };
      })
      .sort((a, b) => b.count - a.count);

    return {
      themeKey: color.key,
      label: color.label,
      emoji: color.emoji,
      books,
      totalCount: matching.length,
    };
  }).filter((g) => g.totalCount > 0);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <motion.div
          key={group.themeKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
              <span>{group.emoji}</span>
              {group.label}
            </span>
            <span className="text-[10px] text-muted-foreground font-ui">
              {group.totalCount} marcações
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {group.books.slice(0, 8).map((bc, i) => (
              <button
                key={`${bc.book}-${bc.chapter}-${i}`}
                onClick={() =>
                  navigate(`/leitor?livro=${encodeURIComponent(bc.book)}&cap=${bc.chapter}`, { state: { book: bc.book, chapter: bc.chapter } })
                }
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 hover:bg-secondary/70 border border-border/30 text-[10px] text-foreground/70 transition-colors"
              >
                <span className="font-ui font-medium">
                  {bc.book} {bc.chapter}
                </span>
                {bc.count > 1 && (
                  <span className="text-muted-foreground">×{bc.count}</span>
                )}
              </button>
            ))}
            {group.books.length > 8 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{group.books.length - 8}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DoctrinalMap;
