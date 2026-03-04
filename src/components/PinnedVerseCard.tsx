import { Pin, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PinnedVerseData } from "@/hooks/usePinnedVerse";

interface PinnedVerseCardProps {
  pinned: PinnedVerseData;
  onGoTo: (book: string, chapter: number, verse: number) => void;
  onUnpin: () => void;
}

const PinnedVerseCard = ({ pinned, onGoTo, onUnpin }: PinnedVerseCardProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-3 mt-2 mb-1 bg-accent/5 border border-accent/15 rounded-xl p-3 space-y-1.5"
      >
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-accent font-medium flex items-center gap-1">
            <Pin className="w-3 h-3" /> Verso fixado
          </p>
          <button
            onClick={onUnpin}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label="Desafixar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="font-scripture text-xs text-accent font-semibold">
          {pinned.book} {pinned.chapter}:{pinned.verse}
        </p>

        {pinned.text && (
          <p className="font-scripture text-sm text-foreground/85 leading-relaxed italic line-clamp-3">
            {pinned.text}
          </p>
        )}

        <button
          onClick={() => onGoTo(pinned.book, pinned.chapter, pinned.verse)}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors pt-0.5"
        >
          <ArrowRight className="w-3 h-3" />
          Ir para o verso
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default PinnedVerseCard;
