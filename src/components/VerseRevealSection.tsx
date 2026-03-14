import { useState } from "react";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, BookOpen, ArrowRight, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ConfidenceBadge } from "./ConfidenceBadge";
import ReferenceChip from "./ReferenceChip";
import RichText from "./RichText";
import { parseReferences } from "@/lib/reference-parser";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CrossRef {
  reference: string;
  text: string;
  connection_type: "Forte" | "Média" | "Eco";
  explanation: string;
}

interface RevealData {
  theme: string;
  explanation: string;
  christocentric_connection: string | null;
  cross_references: CrossRef[];
  error?: string;
}

interface VerseRevealSectionProps {
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
  onRevealLoaded?: (text: string) => void;
}

const VerseRevealSection = ({ book, chapter, verse, verseText, onNavigate, onRevealLoaded }: VerseRevealSectionProps) => {
  const [data, setData] = useState<RevealData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { containerRef: pinchRef, zoom, setZoom } = usePinchZoom(1, 0.7, 1.6);
  const { toast } = useToast();
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const fetchReveal = async () => {
    if (data) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setExpanded(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("verse-reveal", {
        body: { book, chapter, verse, verseText },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        setExpanded(false);
      } else {
        setData(result);
        track("revela_verse", { book, chapter, verse });
        // Provide reveal text for sharing
        if (onRevealLoaded && result) {
          const parts = [result.explanation, result.christocentric_connection].filter(Boolean);
          onRevealLoaded(parts.join(" "));
        }
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao revelar.", variant: "destructive" });
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  const confidenceMap: Record<string, "alto" | "medio" | "leve"> = {
    "Forte": "alto",
    "Média": "medio",
    "Eco": "leve",
  };

  return (
    <div className="space-y-2">
      <button
        onClick={fetchReveal}
        disabled={loading}
        className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors font-medium"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Revela (este verso)
      </button>

      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
            style={{ fontSize: `${zoom}em` }}
          >
            {/* Zoom controls */}
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[0.5625rem] text-muted-foreground/50 w-7 text-center font-ui">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Theme */}
            <div className="bg-accent/5 rounded-lg px-3 py-2 border border-accent/10">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Tema</p>
              <p className="text-sm font-scripture font-semibold text-foreground">{data.theme}</p>
            </div>

            {/* Explanation */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">O que o texto diz</p>
              <RichText
                text={data.explanation}
                className="text-sm text-foreground/85 font-scripture leading-relaxed"
                onNavigate={onNavigate}
              />
            </div>

            {/* Christocentric */}
            {data.christocentric_connection && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  ✝️ Conexão cristocêntrica
                </p>
                <RichText
                  text={data.christocentric_connection}
                  className="text-sm text-foreground/85 font-scripture leading-relaxed"
                  onNavigate={onNavigate}
                />
              </div>
            )}

            {/* Cross References */}
            {data.cross_references && data.cross_references.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Referências relacionadas
                </p>
                {data.cross_references.map((ref, i) => {
                  const parsed = parseReferences(ref.reference);
                  return (
                    <div key={i} className="bg-secondary/30 rounded-lg p-2.5 space-y-1 border border-border/30">
                      <div className="flex items-center justify-between gap-2">
                        {parsed.length > 0 ? (
                          <ReferenceChip reference={parsed[0]} label={ref.reference} onNavigate={onNavigate} />
                        ) : (
                          <span className="text-xs font-ui font-semibold text-accent">{ref.reference}</span>
                        )}
                        <ConfidenceBadge confidence={confidenceMap[ref.connection_type] || "leve"} />
                      </div>
                      {ref.text && (
                        <p className="font-scripture text-xs text-foreground/75 italic">{ref.text}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{ref.explanation}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Open in Revelation Mode */}
            <button
              onClick={() => navigate(`/revela`)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/15 transition-colors text-xs font-medium border border-accent/15"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Abrir no Modo Revelação
              <ArrowRight className="w-3 h-3" />
            </button>

            <p className="text-[10px] text-muted-foreground text-center">
              Baseado exclusivamente no texto bíblico.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerseRevealSection;
