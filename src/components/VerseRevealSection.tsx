/**
 * VerseRevealSection.tsx — Com Luz de Revelação
 *
 * ADICIONADO:
 * - Classe `revelation-light` no container do conteúdo revelado
 *   → linha dourada animada aparece no topo ao revelar (CSS em index.css)
 * - Botão "Abrir no Modo Revelação" corrigido: passa contexto do versículo
 *   via location.state { initialQuery, autoSearch: true }
 * - Rótulo do botão de revelar mais direto: "Revelar este versículo"
 */

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
  verseEnd?: number;
  verseText: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
  onRevealLoaded?: (text: string) => void;
}

const VerseRevealSection = ({
  book, chapter, verse, verseEnd, verseText, onNavigate, onRevealLoaded,
}: VerseRevealSectionProps) => {
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
        body: { book, chapter, verse, verseEnd, verseText },
      });
      if (error) throw error;
      if (result?.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        setExpanded(false);
      } else {
        setData(result);
        track("revela_verse", { book, chapter, verse });
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
    Forte: "alto",
    Média: "medio",
    Eco: "leve",
  };

  // Abre o Revela Agora já com o contexto do versículo pré-carregado
  const handleOpenInRevela = () => {
    navigate("/revela", {
      state: {
        initialQuery: `Revelação bíblica de ${book} ${chapter}:${verse}`,
        autoSearch: true,
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Botão de revelar */}
      <button
        onClick={fetchReveal}
        disabled={loading}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground font-ui">
              {data
                ? expanded ? "Ocultar revelação" : "Ver revelação"
                : "Revelar este versículo"}
            </p>
            {!data && !loading && (
              <p className="text-[10px] text-muted-foreground">
                Conexões cristocêntricas e referências cruzadas
              </p>
            )}
          </div>
        </div>
        {data && (
          <ArrowRight
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
      </button>

      {/* Conteúdo revelado — com Luz de Revelação */}
      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* ── Luz de Revelação ───────────────────────────────────
             * A linha dourada que desliza da esquerda para a direita
             * quando a revelação é aberta pela primeira vez.
             * Definida em index.css como .revelation-light::before
             * ────────────────────────────────────────────────────── */}
            <div className="revelation-light rounded-xl bg-card/50 border border-border/30 p-4 space-y-4 mt-1">
              {/* Controles de zoom */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground w-7 text-center font-ui">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div ref={pinchRef} className="space-y-4 touch-manipulation" style={{ fontSize: `${zoom}em` }}>
                {/* Tema */}
                {data.theme && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tema</p>
                    <p className="text-sm font-scripture font-medium text-foreground">{data.theme}</p>
                  </div>
                )}

                {/* Explicação */}
                {data.explanation && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">O que o texto diz</p>
                    <RichText
                      text={data.explanation}
                      className="text-sm font-scripture text-foreground/80 leading-relaxed"
                      onNavigate={onNavigate}
                    />
                  </div>
                )}

                {/* Conexão cristocêntrica — destaque sutil com toque dourado */}
                {data.christocentric_connection && (
                  <div
                    className="space-y-1.5 rounded-lg p-3 border"
                    style={{
                      background: "hsl(var(--gold-light) / 0.3)",
                      borderColor: "hsl(var(--gold) / 0.25)",
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                      style={{ color: "hsl(var(--gold))" }}
                    >
                      <span>✝</span>
                      Conexão cristocêntrica
                    </p>
                    <RichText
                      text={data.christocentric_connection}
                      className="text-sm font-scripture text-foreground/85 leading-relaxed"
                      onNavigate={onNavigate}
                    />
                  </div>
                )}

                {/* Referências cruzadas */}
                {data.cross_references && data.cross_references.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Referências relacionadas
                    </p>
                    {data.cross_references.map((ref, i) => {
                      const parsed = parseReferences(ref.reference);
                      return (
                        <div
                          key={i}
                          className="bg-secondary/30 rounded-lg p-2.5 space-y-1 border border-border/30"
                        >
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
              </div>

              {/* Aprofundar no Modo Revelação — corrigido com contexto */}
              <button
                onClick={handleOpenInRevela}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/15 transition-colors text-xs font-medium border border-accent/15"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Aprofundar no Modo Revelação
                <ArrowRight className="w-3 h-3" />
              </button>

              <p className="text-[10px] text-muted-foreground text-center">
                Baseado exclusivamente no texto bíblico.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerseRevealSection;
