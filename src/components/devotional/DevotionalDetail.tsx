import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Star, Sparkles, Share2, Loader2, ArrowRight, BookOpen, Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RedemptionTimeline from "@/components/RedemptionTimeline";
import ShareMenu from "@/components/ShareMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DevotionalEntry } from "@/hooks/useDevotional";

interface DevotionalDetailProps {
  entry: DevotionalEntry;
  isCompleted: boolean;
  isFavorited: boolean;
  onToggleComplete: () => void;
  onToggleFavorite: () => void;
  onBack: () => void;
}

const DevotionalDetail = ({
  entry,
  isCompleted,
  isFavorited,
  onToggleComplete,
  onToggleFavorite,
  onBack,
}: DevotionalDetailProps) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const passage = entry.verse_start
    ? `${entry.book} ${entry.chapter_start}:${entry.verse_start}${entry.verse_end ? `-${entry.verse_end}` : ""}`
    : `${entry.book} ${entry.chapter_start}${entry.chapter_end && entry.chapter_end !== entry.chapter_start ? `-${entry.chapter_end}` : ""}`;

  const fetchAiInsight = async () => {
    if (aiInsight) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("devotional-enrich", {
        body: {
          book: entry.book,
          chapter_start: entry.chapter_start,
          chapter_end: entry.chapter_end,
          verse_start: entry.verse_start,
          verse_end: entry.verse_end,
          title: entry.title,
          gospel_revelation: entry.gospel_revelation,
        },
      });
      if (error) throw error;
      setAiInsight(data?.insight || "Não foi possível gerar insight adicional.");
    } catch (e: any) {
      toast({ title: "Erro", description: "Falha ao gerar insight. Tente novamente.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = (method: "copy" | "whatsapp" | "native") => {
    const text = `📖 ${entry.title}\n${passage}\n\n✝️ ${entry.christocentric_connection}\n\n— Revela: O Evangelho Revelado nas Escrituras`;
    const url = window.location.origin;

    if (method === "native" && navigator.share) {
      navigator.share({ title: entry.title, text, url });
    } else if (method === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
    } else {
      navigator.clipboard.writeText(text + "\n" + url);
      toast({ title: "Copiado!", description: "Devocional copiado para a área de transferência." });
    }
    setShowShare(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <Star className={`w-4 h-4 ${isFavorited ? "text-accent fill-accent" : "text-muted-foreground"}`} />
            </button>
            <button
              onClick={onToggleComplete}
              className={`p-1.5 rounded-lg transition-colors ${
                isCompleted ? "bg-accent/10 text-accent" : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 py-6 max-w-2xl mx-auto w-full space-y-6 pb-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-xs text-accent font-medium">{passage}</p>
            <h2 className="font-scripture text-xl font-semibold text-foreground leading-tight">
              {entry.title}
            </h2>
            <p className="text-sm text-muted-foreground font-scripture">
              {entry.subtitle}
            </p>
          </motion.div>

          {/* Gospel Revelation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-border bg-card p-5 space-y-2"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
              📖 Revelação do Evangelho no texto
            </p>
            <p className="font-scripture text-sm text-foreground/85 leading-relaxed">
              {entry.gospel_revelation}
            </p>
          </motion.div>

          {/* Christocentric Connection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-2"
          >
            <p className="text-[10px] uppercase tracking-widest text-accent font-medium flex items-center gap-1.5">
              ✝️ Conexão cristocêntrica
            </p>
            <p className="font-scripture text-sm text-foreground/85 leading-relaxed">
              {entry.christocentric_connection}
            </p>
          </motion.div>

          {/* Redemption Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <RedemptionTimeline book={entry.book} chapter={entry.chapter_start} />
          </motion.div>

          {/* Reflection Questions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
              🙏 Reflexão guiada
            </p>
            <div className="space-y-3">
              {entry.reflection_questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] text-accent font-bold mt-0.5">{i + 1}</span>
                  <p className="font-scripture text-sm text-foreground/80 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Enrichment */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            {!aiInsight ? (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAiInsight}
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {aiLoading ? "Gerando insight…" : "Aprofundar com IA"}
              </Button>
            ) : (
              <div className="rounded-xl border border-accent/20 bg-accent/[0.02] p-5 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-accent font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Insight complementar
                </p>
                <p className="font-scripture text-sm text-foreground/85 leading-relaxed">
                  {aiInsight}
                </p>
                <p className="text-[9px] text-muted-foreground italic">
                  Gerado por IA a partir do texto bíblico. Verifique sempre com as Escrituras.
                </p>
              </div>
            )}
          </motion.div>

          {/* Share */}
          <div className="space-y-2">
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar devocional
            </button>
            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ShareMenu onShare={handleShare} label="Compartilhar devocional" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant={isCompleted ? "default" : "outline"}
                size="sm"
                onClick={onToggleComplete}
                className="flex-1 h-9"
              >
                {isCompleted ? (
                  <>
                    <Check className="w-3 h-3 mr-2" />
                    Concluído
                  </>
                ) : (
                  "Marcar como concluído"
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className={cn(
                  "h-9 px-3",
                  isFavorited && "text-yellow-600"
                )}
              >
                {isFavorited ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
              </Button>
            </div>

            {/* Fluxo de continuidade */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-border pt-3 space-y-2"
              >
                <p className="text-xs text-muted-foreground text-center">
                  Continue sua jornada pela revelação do Evangelho
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex flex-col items-center gap-1 p-1"
                    onClick={onBack}
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-[10px]">Próximo</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex flex-col items-center gap-1 p-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span className="text-[10px]">Anotar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex flex-col items-center gap-1 p-1"
                  >
                    <Star className="w-3 h-3" />
                    <span className="text-[10px]">Refletir</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DevotionalDetail;
