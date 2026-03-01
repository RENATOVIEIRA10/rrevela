import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, ArrowDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { useToast } from "@/hooks/use-toast";

const STAGE_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  promessa_inicial: { label: "Promessa inicial", icon: "✨", color: "bg-accent/15 text-accent border-accent/30" },
  expansao: { label: "Expansão", icon: "📈", color: "bg-accent/10 text-accent/80 border-accent/20" },
  ameaca: { label: "Ameaça", icon: "⚠️", color: "bg-destructive/10 text-destructive border-destructive/20" },
  preservacao: { label: "Preservação", icon: "🛡️", color: "bg-secondary text-foreground/70 border-border" },
  cumprimento_parcial: { label: "Cumprimento parcial", icon: "🌗", color: "bg-secondary text-foreground/70 border-border" },
  cumprimento_pleno: { label: "Cumprimento em Cristo", icon: "✝️", color: "bg-accent/20 text-accent border-accent/40" },
};

interface PromiseStage {
  stage: string;
  reference: string;
  description: string;
  testament: "AT" | "NT";
}

interface PromiseLine {
  title: string;
  description: string;
  stages: PromiseStage[];
  confidence: "alto" | "medio" | "leve";
  textual_basis: string;
}

interface PromiseData {
  book: string;
  has_promises: boolean;
  summary: string;
  promises: PromiseLine[];
  no_promises_note?: string;
  error?: string;
}

const atBooks = BIBLE_BOOKS.filter((b) => b.testament === "VT");

const LinhaPromessa = () => {
  const [selectedBook, setSelectedBook] = useState("Gênesis");
  const [data, setData] = useState<PromiseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastBook, setLastBook] = useState("");
  const { toast } = useToast();

  const fetchPromiseLine = async () => {
    if (data && lastBook === selectedBook) return;
    setLoading(true);
    setData(null);

    try {
      const { data: result, error } = await supabase.functions.invoke("promise-line", {
        body: { book: selectedBook },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      } else {
        setData(result);
        setLastBook(selectedBook);
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message || "Falha ao analisar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 space-y-3">
        <h1 className="font-scripture text-base font-semibold text-foreground text-center">
          Linha da Promessa
        </h1>

        <div className="flex items-center gap-2">
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger className="flex-1 bg-secondary/50 border-0 font-scripture text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {atBooks.map((book) => (
                <SelectItem key={book.name} value={book.name} className="font-scripture text-sm">
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={fetchPromiseLine}
            disabled={loading}
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revelar"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-5 py-6 max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {!data && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <p className="font-scripture text-lg text-foreground text-center">
                  Rastreie promessas divinas
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Selecione um livro do Antigo Testamento e veja como as promessas de Deus se desenvolvem até o cumprimento em Cristo.
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm text-muted-foreground font-scripture">
                  Rastreando promessas em {selectedBook}…
                </p>
              </motion.div>
            ) : data ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pb-8"
              >
                {/* Summary */}
                <div className="bg-card rounded-xl p-5 shadow-soft border border-border/50 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {data.book} — Linha da Promessa
                  </p>
                  <p className="text-sm text-foreground/85 font-scripture leading-relaxed">
                    {data.summary}
                  </p>
                </div>

                {data.has_promises && data.promises?.length > 0 ? (
                  <div className="space-y-6">
                    {data.promises.map((promise, i) => (
                      <PromiseCard key={i} promise={promise} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 bg-secondary/20 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {data.no_promises_note || "Não foram identificadas promessas centrais rastreáveis neste livro."}
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground text-center">
                  Todas as conexões exibem fonte bíblica e grau de confiança.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

const PromiseCard = ({ promise, index }: { promise: PromiseLine; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-card rounded-xl p-5 border border-border/50 space-y-4 shadow-soft"
  >
    {/* Title + Confidence */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="font-scripture text-sm font-semibold text-foreground">
          {promise.title}
        </h3>
        <p className="text-xs text-foreground/70 font-scripture mt-1">
          {promise.description}
        </p>
      </div>
      <ConfidenceBadge confidence={promise.confidence} />
    </div>

    {/* Timeline */}
    <div className="relative pl-4">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-3">
        {promise.stages.map((stage, j) => {
          const display = STAGE_DISPLAY[stage.stage] || {
            label: stage.stage,
            icon: "📍",
            color: "bg-secondary text-foreground/70 border-border",
          };
          return (
            <motion.div
              key={j}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + j * 0.06 }}
              className="relative flex items-start gap-3"
            >
              {/* Dot */}
              <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-card bg-accent/60 z-10" />

              <div className="flex-1 space-y-1.5 ml-2">
                {/* Stage label */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${display.color}`}>
                    {display.icon} {display.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-ui">
                    {stage.testament}
                  </span>
                </div>

                {/* Reference + Description */}
                <p className="text-xs font-ui font-semibold text-accent">{stage.reference}</p>
                <p className="text-sm text-foreground/80 font-scripture leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>

    {/* Textual basis */}
    <p className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-2">
      Base textual: {promise.textual_basis}
    </p>
  </motion.div>
);

export default LinhaPromessa;
