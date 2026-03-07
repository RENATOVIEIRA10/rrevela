import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Cross, ArrowRight, AlertCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfidenceBadge, ConnectionTypeBadge } from "./ConfidenceBadge";
import ReferenceChip from "./ReferenceChip";
import RichText from "./RichText";
import { parseReferences } from "@/lib/reference-parser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StudyShareButton from "./StudyShareButton";

interface MessianicConnection {
  verse_range: string;
  category: string;
  what_text_says: string;
  christocentric_connection: string;
  nt_references: string[];
  connection_type: string;
  confidence: "alto" | "medio" | "leve";
  textual_basis: string;
}

interface MessianicData {
  book: string;
  chapter: number;
  has_messianic_content: boolean;
  summary: string;
  connections: MessianicConnection[];
  no_evidence_note?: string;
  error?: string;
}

interface MessianicLinePanelProps {
  book: string;
  chapter: number;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}

const MessianicLinePanel = ({ book, chapter, onNavigate }: MessianicLinePanelProps) => {
  const [data, setData] = useState<MessianicData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchMessianicLine = async () => {
    if (data && data.book === book && data.chapter === chapter) {
      setOpen(!open);
      return;
    }
    setLoading(true);
    setOpen(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("messianic-line", {
        body: { book, chapter },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        setOpen(false);
      } else {
        setData(result);
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
    return <span className="text-xs text-accent font-ui font-medium bg-accent/5 px-2 py-0.5 rounded">{refStr}</span>;
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchMessianicLine}
        disabled={loading}
        className="w-full justify-between text-xs text-foreground/80 hover:text-accent hover:bg-accent/5 h-9"
      >
        <span className="flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cross className="w-4 h-4" />}
          Linha Messiânica
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
            <div className="space-y-4 pb-4">
              {/* Summary */}
              <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {book} {chapter} — Visão cristocêntrica
                </p>
                <RichText
                  text={data.summary}
                  className="text-sm text-foreground/85 font-scripture leading-relaxed"
                  onNavigate={onNavigate}
                />
              </div>

              {data.has_messianic_content && data.connections?.length > 0 ? (
                <div className="space-y-3">
                  {data.connections.map((conn, i) => (
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
                            {conn.category}
                          </h4>
                          <p className="text-[10px] text-accent font-ui">v. {conn.verse_range}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <ConfidenceBadge confidence={conn.confidence} />
                          <ConnectionTypeBadge type={conn.connection_type} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          O que o texto diz
                        </p>
                        <RichText text={conn.what_text_says} className="text-sm text-foreground/80 font-scripture" onNavigate={onNavigate} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          ✝️ Conexão com Cristo
                        </p>
                        <RichText text={conn.christocentric_connection} className="text-sm text-foreground/85 font-scripture" onNavigate={onNavigate} />
                      </div>

                      {conn.nt_references?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          {conn.nt_references.map((ref, j) => (
                            <span key={j}>{renderRef(ref)}</span>
                          ))}
                        </div>
                      )}

                      <RichText
                        text={`Base textual: ${conn.textual_basis}`}
                        className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-2"
                        onNavigate={onNavigate}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-secondary/20 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.no_evidence_note || "Não há evidência textual suficiente para afirmar conexão messiânica direta neste capítulo."}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-center">
                Todas as conexões exibem fonte bíblica, tipo e grau de confiança.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessianicLinePanel;
