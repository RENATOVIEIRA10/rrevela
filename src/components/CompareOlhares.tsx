import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfidenceBadge, ConnectionTypeBadge } from "./ConfidenceBadge";
import { useToast } from "@/hooks/use-toast";

interface CrossReference {
  reference: string;
  text: string;
  relationship: string;
  explanation: string;
  confidence: "alto" | "medio" | "leve";
}

interface MessianicConnection {
  type: string;
  at_reference?: string;
  nt_reference: string;
  description: string;
  confidence: "alto" | "medio" | "leve";
  textual_basis: string;
}

interface CrossRefData {
  cross_references?: CrossReference[];
  messianic_line?: {
    has_connection: boolean;
    connections: MessianicConnection[];
    no_connection_note?: string;
  };
  error?: string;
}

interface CompareOlharesProps {
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
}

const CompareOlhares = ({ book, chapter, verse, verseText }: CompareOlharesProps) => {
  const [data, setData] = useState<CrossRefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const fetchCrossRefs = async () => {
    if (data) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setExpanded(true);

    try {
      const { data: result, error } = await supabase.functions.invoke("cross-references", {
        body: { book, chapter, verse, verseText },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        setExpanded(false);
      } else {
        setData(result);
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao buscar referências.", variant: "destructive" });
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={fetchCrossRefs}
        disabled={loading}
        className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <BookOpen className="w-3.5 h-3.5" />
        )}
        O que outros textos dizem sobre isso?
      </button>

      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4"
          >
            {/* Cross References */}
            {data.cross_references && data.cross_references.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Referências cruzadas
                </p>
                {data.cross_references.map((ref, i) => (
                  <div key={i} className="bg-secondary/30 rounded-lg p-3 space-y-1.5 border border-border/30">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-ui font-semibold text-accent">{ref.reference}</p>
                      <div className="flex items-center gap-1.5">
                        <ConnectionTypeBadge type={ref.relationship} />
                        <ConfidenceBadge confidence={ref.confidence} />
                      </div>
                    </div>
                    <p className="font-scripture text-sm text-foreground/85 italic">{ref.text}</p>
                    <p className="text-xs text-muted-foreground">{ref.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Messianic Line */}
            {data.messianic_line && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1">
                  ✝️ Linha messiânica
                </p>
                {data.messianic_line.has_connection ? (
                  data.messianic_line.connections.map((conn, i) => (
                    <div key={i} className="bg-card rounded-lg p-3 space-y-2 border border-border/50">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <ConnectionTypeBadge type={conn.type} />
                        <ConfidenceBadge confidence={conn.confidence} />
                      </div>
                      <p className="text-sm text-foreground/85 font-scripture">{conn.description}</p>
                      <div className="flex items-center gap-2 text-xs text-accent">
                        {conn.at_reference && <span>{conn.at_reference}</span>}
                        {conn.at_reference && <ArrowRight className="w-3 h-3" />}
                        <span>{conn.nt_reference}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Base textual: {conn.textual_basis}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-2 bg-secondary/20 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {data.messianic_line.no_connection_note || "Não há evidência textual forte para afirmar conexão messiânica direta neste verso."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompareOlhares;
