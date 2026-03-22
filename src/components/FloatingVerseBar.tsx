/**
 * FloatingVerseBar.tsx — Barra flutuante com seletor de cor (caneta)
 */
import { motion } from "framer-motion";
import { Sparkles, ChevronUp, X, Eraser } from "lucide-react";
import { PEN_COLORS, type HighlightColor } from "@/hooks/useHighlights";

interface FloatingVerseBarProps {
  count: number;
  reference: string;
  onSelectColor: (color: HighlightColor | null) => void;
  onReveal: () => void;
  onExpand: () => void;
  onClear: () => void;
  isMarked: boolean;
  currentColor: HighlightColor | null;
}

const FloatingVerseBar = ({
  count,
  reference,
  onSelectColor,
  onReveal,
  onExpand,
  onClear,
  isMarked,
  currentColor,
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

        {/* Color picker + actions */}
        <div className="flex items-center gap-3">
          {/* Pen color dots */}
          <div className="flex items-center gap-1.5">
            {PEN_COLORS.map((pen) => (
              <button
                key={pen.key}
                onClick={() => onSelectColor(pen.key)}
                className={[
                  "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                  currentColor === pen.key
                    ? "ring-2 ring-offset-2 ring-offset-card scale-110"
                    : "hover:scale-110",
                ].join(" ")}
                style={{
                  backgroundColor: `hsl(${pen.dot})`,
                  ["--tw-ring-color" as string]: `hsl(${pen.dot})`,
                }}
                aria-label={`Marcar com ${pen.label}`}
                title={pen.label}
              />
            ))}
            {/* Eraser */}
            {isMarked && (
              <button
                onClick={() => onSelectColor(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="Apagar marca"
                title="Apagar"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-border/50 mx-1" />

          {/* Reveal + Expand */}
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
