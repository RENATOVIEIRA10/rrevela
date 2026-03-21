/**
 * FloatingVerseBar.tsx — Barra flutuante de ações para versículos selecionados
 *
 * Aparece na parte inferior quando 1+ versículos estão selecionados.
 * Botões: Marcar, Compartilhar/Revelar, Abrir painel completo, Limpar seleção.
 */
import { motion } from "framer-motion";
import { Bookmark, Sparkles, ChevronUp, X } from "lucide-react";

interface FloatingVerseBarProps {
  count: number;
  reference: string;
  onMark: () => void;
  onReveal: () => void;
  onExpand: () => void;
  onClear: () => void;
  isMarked: boolean;
}

const FloatingVerseBar = ({
  count,
  reference,
  onMark,
  onReveal,
  onExpand,
  onClear,
  isMarked,
}: FloatingVerseBarProps) => {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:max-w-md"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-premium px-5 py-4 space-y-3">
        {/* Header: reference + clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-ui font-medium text-foreground/80 truncate pr-2">
            {reference}
            <span className="text-accent ml-2">
              ({count} {count === 1 ? "versículo" : "versículos"})
            </span>
          </p>
          <button
            onClick={onClear}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
            aria-label="Limpar seleção"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMark}
            className={[
              "flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[0.9375rem] font-ui transition-all",
              isMarked
                ? "bg-accent/15 text-accent border border-accent/25 font-medium"
                : "bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70",
            ].join(" ")}
          >
            <Bookmark className={`w-5 h-5 ${isMarked ? "fill-current" : ""}`} />
            {isMarked ? "Marcado" : "Marcar"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onReveal}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[0.9375rem] font-ui bg-accent/10 text-accent border border-accent/20 font-medium hover:bg-accent/20 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Revelar
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onExpand}
            className="flex items-center justify-center h-12 w-12 rounded-xl text-[0.9375rem] font-ui bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70 transition-all"
            aria-label="Abrir painel completo"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingVerseBar;
