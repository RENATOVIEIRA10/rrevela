import { motion } from "framer-motion";
import { Sun, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VerseOfDayCardProps {
  verse: { book: string; chapter: number; verse: number; text: string } | null;
  loading: boolean;
}

const VerseOfDayCard = ({ verse, loading }: VerseOfDayCardProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 animate-pulse space-y-3">
        <div className="h-3 bg-secondary rounded w-1/3" />
        <div className="h-4 bg-secondary rounded w-full" />
        <div className="h-4 bg-secondary rounded w-2/3" />
      </div>
    );
  }

  if (!verse) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-accent/20 bg-gradient-to-br from-card to-accent/[0.03] p-5 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sun className="w-4 h-4 text-accent" />
        <span className="text-[10px] uppercase tracking-widest text-accent font-medium">
          Versículo do dia
        </span>
      </div>

      <p className="font-scripture text-base text-foreground leading-relaxed">
        "{verse.text}"
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-accent">
          {verse.book} {verse.chapter}:{verse.verse}
        </span>
        <button
          onClick={() => navigate("/revela")}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors"
        >
          Aprofundar no Revela
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default VerseOfDayCard;
