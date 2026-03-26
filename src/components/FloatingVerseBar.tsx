/**
 * FloatingVerseBar.tsx — Action bar direta e contextual
 *
 * Layout: [referência (n versículos)]              [X]
 *         [🟡 🟢 🔵 🟣 🟣] | [✨ Revelar] [📋] [🔗] [↑]
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronUp, X, Eraser, Copy, Share2, Check } from "lucide-react";
import { PEN_COLORS, type HighlightColor } from "@/hooks/useHighlights";
import { toast } from "@/hooks/use-toast";

interface FloatingVerseBarProps {
  count: number;
  reference: string;
  verseText: string;
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
  verseText,
  onSelectColor,
  onReveal,
  onExpand,
  onClear,
  isMarked,
  currentColor,
}: FloatingVerseBarProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${reference}\n"${verseText}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copiado!", description: `${reference} copiado.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = `${reference}\n"${verseText}"\n\n📖 Revela`;
    if (navigator.share) {
      try {
        await navigator.share({ title: reference, text });
        return;
      } catch {
        // cancelled
      }
    }
    // fallback: WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:max-w-md"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-premium px-4 py-3 space-y-2.5">
        {/* Header: reference + clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-ui font-medium text-foreground/80 truncate pr-2">
            {reference}
            <span className="text-accent ml-2">
              {count > 1 ? `(${count} versículos)` : ""}
            </span>
          </p>
          <button
            onClick={onClear}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
            aria-label="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          {/* Pen color dots */}
          <div className="flex items-center gap-1">
            {PEN_COLORS.map((pen) => (
              <button
                key={pen.key}
                onClick={() => onSelectColor(pen.key)}
                className={[
                  "w-7 h-7 rounded-full transition-all duration-200",
                  currentColor === pen.key
                    ? "ring-2 ring-offset-1 ring-offset-card scale-110"
                    : "hover:scale-110",
                ].join(" ")}
                style={{
                  backgroundColor: `hsl(${pen.dot})`,
                  ["--tw-ring-color" as string]: `hsl(${pen.dot})`,
                }}
                aria-label={`Marcar ${pen.label}`}
                title={pen.label}
              />
            ))}
            {isMarked && (
              <button
                onClick={() => onSelectColor(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="Apagar marca"
                title="Apagar"
              >
                <Eraser className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-border/50 shrink-0" />

          {/* Revelar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onReveal}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-ui bg-accent/10 text-accent border border-accent/20 font-medium hover:bg-accent/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Revelar
          </motion.button>

          {/* Copiar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70 transition-all shrink-0"
            aria-label="Copiar versículo"
            title="Copiar"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </motion.button>

          {/* Compartilhar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70 transition-all shrink-0"
            aria-label="Compartilhar versículo"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          {/* Expand (painel completo) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onExpand}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary/50 text-foreground/70 border border-transparent hover:bg-secondary/70 transition-all shrink-0"
            aria-label="Abrir painel completo"
            title="Mais opções"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingVerseBar;
