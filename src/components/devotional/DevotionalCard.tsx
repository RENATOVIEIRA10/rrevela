import { motion } from "framer-motion";
import { Check, Star, ChevronRight } from "lucide-react";
import type { DevotionalEntry } from "@/hooks/useDevotional";

interface DevotionalCardProps {
  entry: DevotionalEntry;
  isCompleted: boolean;
  isFavorited: boolean;
  index: number;
  onSelect: () => void;
}

const DevotionalCard = ({ entry, isCompleted, isFavorited, index, onSelect }: DevotionalCardProps) => {
  const passage = entry.verse_start
    ? `${entry.book} ${entry.chapter_start}:${entry.verse_start}${entry.verse_end ? `-${entry.verse_end}` : ""}`
    : `${entry.book} ${entry.chapter_start}${entry.chapter_end && entry.chapter_end !== entry.chapter_start ? `-${entry.chapter_end}` : ""}`;

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
        isCompleted
          ? "bg-accent/[0.03] opacity-75"
          : "bg-card hover:bg-card/80"
      }`}
      style={{ boxShadow: isCompleted ? "none" : "var(--shadow-soft)" }}
    >
      <div className="flex items-start gap-3">
        {/* Minimal status dot */}
        <div className="mt-1.5 shrink-0">
          {isCompleted ? (
            <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-accent" />
            </div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-1" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-snug ${isCompleted ? "text-foreground/50" : "text-foreground"}`}>
              {entry.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              {isFavorited && <Star className="w-3 h-3 text-accent/70 fill-accent/70" />}
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-[11px] text-accent/70 font-medium">{passage}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
            {entry.subtitle}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default DevotionalCard;
