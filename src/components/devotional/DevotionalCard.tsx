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
      className={`w-full text-left rounded-xl border p-4 transition-all ${
        isCompleted
          ? "border-accent/20 bg-accent/[0.03]"
          : "border-border bg-card hover:border-accent/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
            isCompleted
              ? "bg-accent text-accent-foreground"
              : "border-2 border-border"
          }`}
        >
          {isCompleted && <Check className="w-3 h-3" />}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-tight ${isCompleted ? "text-foreground/60" : "text-foreground"}`}>
              {entry.title}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              {isFavorited && <Star className="w-3 h-3 text-accent fill-accent" />}
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-[11px] text-accent font-medium">{passage}</p>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
            {entry.subtitle}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default DevotionalCard;
