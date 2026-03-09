import { motion } from "framer-motion";
import { Loader2, BookOpen, Users, MapPin, Calendar, Sparkles } from "lucide-react";
import { useHistoricalContext } from "@/hooks/useHistoricalContext";

interface HistoricalContextPanelProps {
  book: string;
  chapter: number;
}

const ITEMS = [
  { key: "author", icon: BookOpen, label: "Autor" },
  { key: "period", icon: Calendar, label: "Período" },
  { key: "audience", icon: Users, label: "Audiência" },
  { key: "setting", icon: MapPin, label: "Contexto" },
] as const;

const HistoricalContextPanel = ({ book, chapter }: HistoricalContextPanelProps) => {
  const { context, loading, error } = useHistoricalContext(book, chapter);

  if (error) return null;

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        Contexto histórico-cultural
      </p>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        </div>
      )}

      {context && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {ITEMS.map(({ key, icon: Icon, label }) => {
            const value = context[key];
            if (!value) return null;
            return (
              <div
                key={key}
                className="flex items-start gap-2.5 bg-secondary/30 rounded-lg px-3 py-2"
              >
                <Icon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-xs text-foreground/80 leading-snug">{value}</p>
                </div>
              </div>
            );
          })}

          {context.themes && context.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {context.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {context.summary && (
            <p className="text-[10px] text-muted-foreground italic leading-relaxed border-t border-border/30 pt-2">
              {context.summary}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default HistoricalContextPanel;
