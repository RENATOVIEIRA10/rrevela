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
      className="fixed bottom-20 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-md"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-premium px-4 py-3 space-y-2">
        {/* Header: reference + clear */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-ui font-medium text-foreground/80 truncate pr-2">
            {reference}
            <span className="text-accent ml-1.5">
              ({count} {count === 1 ? "versículo" : "versículos"})
            </span>
          </p>
          <button
            onClick={onClear}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
            aria-label="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onMark}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-ui transition-all",
              isMarked
                ? "bg-accent/15 text-accent border border-accent/25 font-medium"
                : "bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70",
            ].join(" ")}
          >
            <Bookmark className={`w-4 h-4 ${isMarked ? "fill-current" : ""}`} />
            {isMarked ? "Marcado" : "Marcar"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onReveal}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-ui bg-accent/10 text-accent border border-accent/20 font-medium hover:bg-accent/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Revelar
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onExpand}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-ui bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70 transition-all"
            aria-label="Abrir painel completo"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingVerseBar;
