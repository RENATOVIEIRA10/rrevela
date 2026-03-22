/**
 * EstudoRevela.tsx
 *
 * O coração do Método Revela — fluxo de estudo guiado em 3 perguntas.
 *
 * CONCEITO:
 * Protestantes estudam a Bíblia seguindo o fluxo natural:
 *   1. VER    → O que o texto diz? (Observação)
 *   2. REVELAR → Para onde Cristo aparece? (Cristocêntrico — IA pré-preenche)
 *   3. VIVER  → O que muda em mim? (Aplicação)
 *
 * UX:
 * - Uma pergunta por vez, visualmente destacada
 * - O versículo fica fixo no topo durante todo o estudo
 * - A IA pré-preenche o campo "Revelar" se o usuário já gerou a revelação
 * - Oração é opcional e aparece só depois de Viver
 * - Salvar fecha suavemente, como fechar um diário
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Sparkles, Flame, Heart, ChevronRight, Save, Loader2, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";

// ─── Tipos ───────────────────────────────────────────────────
interface EstudoRevelaProps {
  book: string;
  chapter: number;
  verse?: number;
  verseText?: string;
  /** Revelação da IA já gerada (do VerseRevealSection) */
  aiRevelation?: string;
  /** Nota existente para edição */
  existingNote?: StructuredNote;
  onSave: (note: Partial<StructuredNote> & { type: NoteType }) => Promise<StructuredNote | null>;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
}

// ─── Etapas do Método Revela ─────────────────────────────────
interface Step {
  id: "ver" | "revelar" | "viver" | "orar";
  number: number;
  icon: React.ReactNode;
  label: string;
  pergunta: string;
  dica: string;
  field: keyof Pick<StructuredNote, "observation" | "christocentric" | "application" | "prayer">;
  obrigatorio: boolean;
}

const STEPS: Step[] = [
  {
    id: "ver",
    number: 1,
    icon: <Eye className="w-4 h-4" />,
    label: "Ver",
    pergunta: "O que o texto diz?",
    dica: "Escreva o que você realmente vê — personagens, verbos, contrastes, repetições. Sem interpretar ainda.",
    field: "observation",
    obrigatorio: true,
  },
  {
    id: "revelar",
    number: 2,
    icon: <Sparkles className="w-4 h-4" />,
    label: "Revelar",
    pergunta: "Para onde Cristo aparece aqui?",
    dica: "Como este texto aponta para Jesus — cumprimento, promessa, padrão ou eco? Baseie-se no texto.",
    field: "christocentric",
    obrigatorio: true,
  },
  {
    id: "viver",
    number: 3,
    icon: <Flame className="w-4 h-4" />,
    label: "Viver",
    pergunta: "O que muda em mim hoje?",
    dica: "Não invente conselho. O que o próprio texto encoraja, adverte ou promete para você agora?",
    field: "application",
    obrigatorio: true,
  },
  {
    id: "orar",
    number: 4,
    icon: <Heart className="w-4 h-4" />,
    label: "Orar",
    pergunta: "Transforme em oração.",
    dica: "Opcional. Deixe o que compreendeu virar resposta ao Pai — agradeça, peça, confesse.",
    field: "prayer",
    obrigatorio: false,
  },
];

// ─── Componente principal ─────────────────────────────────────
const EstudoRevela = ({
  book,
  chapter,
  verse,
  verseText,
  aiRevelation,
  existingNote,
  onSave,
  onDelete,
  onClose,
}: EstudoRevelaProps) => {
  const noteType: NoteType = verse !== undefined ? "verse" : "chapter";
  const reference = verse !== undefined ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

  // ─── Estado ────────────────────────────────────────────────
  const [values, setValues] = useState<Record<string, string>>(() => ({
    observation:    existingNote?.observation    || "",
    christocentric: existingNote?.christocentric || aiRevelation || "",
    application:    existingNote?.application    || "",
    prayer:         existingNote?.prayer         || "",
  }));
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showPrayer, setShowPrayer] = useState(!!(existingNote?.prayer));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-foca o textarea ao trocar de etapa
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [activeStep]);

  // Se a IA gerou revelação depois que o componente montou, preenche
  useEffect(() => {
    if (aiRevelation && !values.christocentric) {
      setValues((v) => ({ ...v, christocentric: aiRevelation }));
    }
  }, [aiRevelation]);

  const visibleSteps = showPrayer ? STEPS : STEPS.slice(0, 3);
  const currentStep = visibleSteps[activeStep];
  const hasContent = Object.values(values).some((v) => v.trim());

  const handleNext = () => {
    if (activeStep < visibleSteps.length - 1) {
      setActiveStep((s) => s + 1);
    }
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  const handleSave = async () => {
    if (!hasContent) return;
    setSaving(true);
    await onSave({
      ...(existingNote ? { id: existingNote.id } : {}),
      type: noteType,
      book,
      chapter,
      verse: verse ?? null,
      observation:    values.observation    || "",
      interpretation: "",
      christocentric: values.christocentric || "",
      application:    values.application    || "",
      prayer:         values.prayer         || "",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose?.();
    }, 800);
  };

  // ─── Renderização ───────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-4">
      {/* Versículo — sempre visível */}
      {verseText && (
        <div className="bg-accent/5 border border-accent/15 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-accent/60 mb-1.5 font-ui">
            {reference}
          </p>
          <p className="font-scripture text-sm text-foreground/85 leading-relaxed italic">
            "{verseText}"
          </p>
        </div>
      )}

      {/* Indicador de etapas — clicável */}
      <div className="flex items-center gap-1.5">
        {visibleSteps.map((step, i) => {
          const isActive   = i === activeStep;
          const isComplete = values[step.field]?.trim().length > 0;
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(i)}
              className="flex items-center gap-1.5 group"
            >
              <div className={[
                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground scale-110"
                  : isComplete
                  ? "bg-accent/20 text-accent"
                  : "bg-secondary/60 text-muted-foreground",
              ].join(" ")}>
                {isComplete && !isActive
                  ? <Check className="w-3 h-3" />
                  : <span className="text-[10px] font-medium font-ui">{step.number}</span>
                }
              </div>
              <span className={[
                "text-[10px] font-ui transition-colors duration-200",
                isActive ? "text-foreground font-medium" : "text-muted-foreground",
              ].join(" ")}>
                {step.label}
              </span>
              {i < visibleSteps.length - 1 && (
                <div className={[
                  "w-4 h-px transition-colors duration-200",
                  isComplete ? "bg-accent/40" : "bg-border/60",
                ].join(" ")} />
              )}
            </button>
          );
        })}
      </div>

      {/* Etapa ativa */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Header da etapa */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              {currentStep.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground font-scripture">
                {currentStep.pergunta}
              </p>
            </div>
          </div>

          {/* Dica contextual */}
          <p className="text-[11px] text-muted-foreground leading-relaxed font-ui px-0.5">
            {currentStep.dica}
          </p>

          {/* IA pré-preenchida (só no campo Revelar) */}
          {currentStep.id === "revelar" && aiRevelation && !existingNote && (
            <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-lg px-3 py-2">
              <Sparkles className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
              <p className="text-[11px] text-foreground/70 leading-relaxed font-ui">
                O Revela já revelou algo sobre este verso — pré-preenchido abaixo. Edite à vontade.
              </p>
            </div>
          )}

          {/* Textarea */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden
                          focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/20
                          transition-all duration-200">
            <Textarea
              ref={textareaRef}
              value={values[currentStep.field] || ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [currentStep.field]: e.target.value }))
              }
              placeholder="Escreva aqui…"
              className="min-h-[110px] border-0 bg-transparent font-scripture text-sm
                         resize-none focus-visible:ring-0 p-4
                         placeholder:text-muted-foreground/40 leading-relaxed"
            />
          </div>

          {/* Avançar para próxima etapa */}
          {activeStep < visibleSteps.length - 1 && (
            <button
              onClick={handleNext}
              disabled={currentStep.obrigatorio && !values[currentStep.field]?.trim()}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80
                         transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-ui ml-auto"
            >
              Próximo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Adicionar oração (aparece depois de Viver) */}
      {!showPrayer && activeStep === 2 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setShowPrayer(true); setActiveStep(3); }}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent
                     transition-colors py-1 font-ui"
        >
          <Heart className="w-3.5 h-3.5" />
          Transformar em oração (opcional)
        </motion.button>
      )}

      {/* Rodapé: salvar + apagar */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          onClick={handleSave}
          disabled={saving || !hasContent || saved}
          size="sm"
          className="flex-1 font-scripture h-9"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-1.5" />
              Guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              {existingNote ? "Atualizar estudo" : "Guardar estudo"}
            </>
          )}
        </Button>
        {existingNote && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(existingNote.id)}
            className="text-muted-foreground hover:text-destructive h-9 px-3 font-ui text-xs"
          >
            Apagar
          </Button>
        )}
        {onClose && !existingNote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground h-9 px-3 font-ui text-xs"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default EstudoRevela;
