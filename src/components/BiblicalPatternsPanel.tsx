import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Repeat, ChevronDown, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfidenceBadge } from "./ConfidenceBadge";
import ReferenceChip from "./ReferenceChip";
import RichText from "./RichText";
import { parseReferences } from "@/lib/reference-parser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StudyShareButton from "./StudyShareButton";

interface PatternOccurrence {
  reference: string;
  brief: string;
}

interface BiblicalPattern {
  name: string;
  description: string;
  verses_in_chapter: string;
  other_occurrences: PatternOccurrence[];
  christocentric_echo: string;
  confidence: "alto" | "medio" | "leve";
  textual_basis: string;
}

interface PatternsData {
  book: string;
  chapter: number;
  has_patterns: boolean;
  patterns: BiblicalPattern[];
  no_patterns_note?: string;
  error?: string;
}

interface BiblicalPatternsPanelProps {
  book: string;
  chapter: number;
  depth: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}

const BiblicalPatternsPanel = ({ book, chapter, depth, onNavigate }: BiblicalPatternsPanelProps) => {
  const [data, setData] = useState<PatternsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const { toast } = useToast();

  const currentKey = `${book}-${chapter}-${depth}`;

  const fetchPatterns = async () => {
    if (data && lastKey === currentKey) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    setOpen(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("biblical-patterns", {
        body: { book, chapter, depth },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        setOpen(false);
      } else {
        setData(result);
        setLastKey(currentKey);
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao analisar.", variant: "destructive" });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const renderRef = (refStr: string) => {
    const parsed = parseReferences(refStr);
    if (parsed.length > 0) {
      return <ReferenceChip reference={parsed[0]} label={refStr} onNavigate={onNavigate} />;
    }
    return <span className="text-xs font-ui font-semibold text-accent">{refStr}</span>;
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchPatterns}
        disabled={loading}
        className="w-full justify-between text-xs text-foreground/80 hover:text-accent hover:bg-accent/5 h-9"
      >
        <span className="flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Repeat className="w-4 h-4" />}
          Padrões que se repetem
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {open && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-4">
              {data.has_patterns && data.patterns?.length > 0 ? (
                data.patterns.map((pattern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl p-4 border border-border/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-scripture text-sm font-semibold text-foreground">
                          {pattern.name}
                        </h4>
                        <p className="text-[10px] text-accent font-ui">v. {pattern.verses_in_chapter}</p>
                      </div>
                      <ConfidenceBadge confidence={pattern.confidence} />
                    </div>

                    <RichText text={pattern.description} className="text-sm text-foreground/80 font-scripture leading-relaxed" onNavigate={onNavigate} />

                    {pattern.other_occurrences?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Onde mais aparece
                        </p>
                        {pattern.other_occurrences.map((occ, j) => (
                          <div key={j} className="flex items-start gap-2 bg-secondary/30 rounded-lg p-2.5">
                            <ArrowRight className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                            <div>
                              {renderRef(occ.reference)}
                              <p className="text-xs text-foreground/70 mt-0.5">{occ.brief}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pattern.christocentric_echo && (
                      <div className="space-y-1 border-t border-border/30 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          ✝️ Eco cristocêntrico
                        </p>
                        <RichText text={pattern.christocentric_echo} className="text-sm text-foreground/85 font-scripture" onNavigate={onNavigate} />
                      </div>
                    )}

                    <RichText
                      text={`Base textual: ${pattern.textual_basis}`}
                      className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-2"
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="flex items-start gap-2 bg-secondary/20 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.no_patterns_note || "Não foram identificados padrões narrativos claros neste capítulo."}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center">
                Padrões identificados com base textual. Sem alegorização.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiblicalPatternsPanel;
