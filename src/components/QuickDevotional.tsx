import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, ChevronRight, Sparkles, BookOpen, Heart, Loader2 } from "lucide-react";
import { useVerseOfDay } from "@/hooks/useDevotional";
import { useReadingPlan } from "@/hooks/useReadingPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REFLECTION_QUESTIONS = [
  "Como Cristo é revelado ou apontado neste texto?",
  "Que verdade sobre Deus este versículo me ensina?",
  "Como esta promessa se cumpre em Jesus?",
  "O que este texto diz sobre a condição humana?",
  "Como a graça de Deus aparece nesta passagem?",
  "De que forma este texto me convida a confiar em Cristo hoje?",
  "Qual promessa posso levar ao Pai em oração?",
];

function getDailyQuestion(): string {
  return REFLECTION_QUESTIONS[new Date().getDate() % REFLECTION_QUESTIONS.length];
}

interface QuickDevotionalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickDevotional = ({ open, onOpenChange }: QuickDevotionalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gratitude, setGratitude] = useState("");
  const [saved, setSaved] = useState(false);
  const { verse, loading: verseLoading } = useVerseOfDay();
  const { activePlan, todayReading } = useReadingPlan();
  const question = getDailyQuestion();

  useEffect(() => {
    if (!open) {
      setStep(0);
      setGratitude("");
      setSaved(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (gratitude.trim() && user) {
      const today = new Date().toLocaleDateString("pt-BR");
      await supabase.from("structured_notes").insert({
        user_id: user.id,
        type: "theme" as const,
        theme_label: `Devocional ${today}`,
        prayer: gratitude.trim(),
        observation: "",
        interpretation: "",
        christocentric: "",
        application: "",
      });
    }
    setSaved(true);
    setTimeout(() => onOpenChange(false), 1500);
  };

  const steps = [
    { icon: <BookOpen className="w-4 h-4" />, label: "Palavra" },
    { icon: <Sparkles className="w-4 h-4" />, label: "Reflexão" },
    { icon: <Heart className="w-4 h-4" />, label: "Gratidão" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0 max-h-[85vh]">
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Devocional Rápido</span>
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                ~3 min
              </span>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center px-5 py-3 gap-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    i < step ? "bg-accent text-accent-foreground" :
                    i === step ? "bg-accent/20 text-accent border border-accent/30" :
                    "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] transition-colors ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Sua Palavra para hoje
                  </p>
                  {verseLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : verse ? (
                    <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
                      <p className="font-scripture text-lg text-foreground leading-relaxed">
                        "{verse.text}"
                      </p>
                      <p className="text-xs text-accent font-semibold font-ui">
                        {verse.book} {verse.chapter}:{verse.verse}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-secondary/30 rounded-xl p-5">
                      <p className="font-scripture text-base text-foreground/70">
                        "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."
                      </p>
                      <p className="text-xs text-accent font-semibold mt-2">João 3:16</p>
                    </div>
                  )}

                  {todayReading && activePlan && (
                    <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        Seu plano de hoje
                      </p>
                      <p className="text-sm font-scripture text-foreground">{todayReading.label}</p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground italic text-center">
                    Leia com calma. Deixe a Palavra pousar.
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Pergunta para meditação
                  </p>
                  <div className="bg-secondary/30 rounded-xl p-5">
                    <p className="font-scripture text-lg text-foreground leading-relaxed">
                      {question}
                    </p>
                  </div>
                  <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                    <p className="text-xs text-muted-foreground">
                      💡 Não há resposta certa. Medite por 1–2 minutos. O Espírito Santo guia a compreensão.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {saved ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <span className="text-4xl">🙏</span>
                      <p className="text-lg font-scripture text-foreground">Salvo com gratidão</p>
                      <p className="text-sm text-muted-foreground">Que este dia seja abençoado.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Encerre com gratidão
                      </p>
                      <p className="text-sm text-foreground/80">
                        Por que você é grato a Deus hoje?
                      </p>
                      <Textarea
                        placeholder="Escreva um pensamento de gratidão..."
                        value={gratitude}
                        onChange={(e) => setGratitude(e.target.value)}
                        className="min-h-[100px] bg-secondary/30 border-border/50 resize-none font-scripture"
                        autoFocus
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          {!saved && (
            <div className="px-5 pb-6 pt-3 border-t border-border">
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} className="w-full" size="lg">
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSave} className="w-full" size="lg">
                  <Heart className="w-4 h-4 mr-1.5" />
                  {gratitude.trim() ? "Salvar e encerrar" : "Encerrar"}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickDevotional;
