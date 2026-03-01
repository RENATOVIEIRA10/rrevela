import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DepthLevel } from "./DepthSelector";

interface RevealingQuestion {
  id: string;
  text: string;
  category: string;
  depth: DepthLevel[];
}

const QUESTIONS_LIBRARY: RevealingQuestion[] = [
  // Essencial
  { id: "q1", text: "O que este texto revela sobre o caráter de Deus?", category: "Caráter de Deus", depth: ["essencial", "intermediario", "profundo"] },
  { id: "q2", text: "Onde há promessa aqui?", category: "Promessa", depth: ["essencial", "intermediario", "profundo"] },
  { id: "q3", text: "Como isso aponta para Cristo?", category: "Cristocentrismo", depth: ["essencial", "intermediario", "profundo"] },
  { id: "q4", text: "Qual é o mandamento ou encorajamento central?", category: "Aplicação", depth: ["essencial", "intermediario", "profundo"] },

  // Intermediário
  { id: "q5", text: "Qual é a tensão principal neste texto?", category: "Tensão narrativa", depth: ["intermediario", "profundo"] },
  { id: "q6", text: "Existe um padrão maior acontecendo?", category: "Padrão", depth: ["intermediario", "profundo"] },
  { id: "q7", text: "Como este texto se conecta ao que vem antes e depois?", category: "Contexto literário", depth: ["intermediario", "profundo"] },
  { id: "q8", text: "Que palavras ou frases se repetem? Por quê?", category: "Repetição", depth: ["intermediario", "profundo"] },

  // Profundo
  { id: "q9", text: "Há uma tipologia ou sombra cristológica neste texto?", category: "Tipologia", depth: ["profundo"] },
  { id: "q10", text: "Como o AT e o NT dialogam sobre este tema?", category: "Harmonia canônica", depth: ["profundo"] },
  { id: "q11", text: "Que tipo de aliança está operando neste contexto?", category: "Aliança", depth: ["profundo"] },
  { id: "q12", text: "Como a redenção progride do AT para o NT neste tema?", category: "Revelação progressiva", depth: ["profundo"] },
];

interface RevealingQuestionsProps {
  depth: DepthLevel;
  onApplyQuestion?: (question: string) => void;
}

const RevealingQuestions = ({ depth, onApplyQuestion }: RevealingQuestionsProps) => {
  const [open, setOpen] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const filteredQuestions = QUESTIONS_LIBRARY.filter((q) => q.depth.includes(depth));

  const handleApply = (q: RevealingQuestion) => {
    setAppliedIds((prev) => new Set(prev).add(q.id));
    onApplyQuestion?.(q.text);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="w-full justify-between text-xs text-foreground/80 hover:text-accent hover:bg-accent/5 h-9"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Perguntas reveladoras
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-4">
              <p className="text-[10px] text-muted-foreground px-1">
                Aplique ao capítulo atual e salve como anotação estruturada.
              </p>

              {filteredQuestions.map((q, i) => {
                const isApplied = appliedIds.has(q.id);
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isApplied
                        ? "border-accent/30 bg-accent/5"
                        : "border-border/50 bg-card hover:bg-secondary/30"
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-scripture text-foreground/90 leading-relaxed">
                        {q.text}
                      </p>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {q.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApply(q)}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                        isApplied
                          ? "text-accent bg-accent/10"
                          : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                      }`}
                      aria-label={isApplied ? "Aplicada" : "Aplicar ao capítulo"}
                    >
                      {isApplied ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </motion.div>
                );
              })}

              <p className="text-[10px] text-muted-foreground text-center pt-1">
                {filteredQuestions.length} perguntas para o nível {depth}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevealingQuestions;
