import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface JourneyProgressProps {
  completed: number;
  total: number;
}

const JourneyProgress = ({ completed, total }: JourneyProgressProps) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Calcular "dia" da jornada baseado no progresso
  const currentDay = Math.max(1, completed + 1); // +1 porque começamos do dia 1
  const totalDays = Math.max(total, 40); // Pelo menos 40 dias para a jornada completa

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      {/* Header com contador de dias */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            O Evangelho Revelado
          </span>
          <p className="text-sm font-scripture text-foreground font-medium">
            Dia {currentDay} de {totalDays}
          </p>
        </div>
        <span className="text-xs text-foreground font-medium bg-secondary/50 px-2 py-1 rounded-md">
          {completed}/{total}
        </span>
      </div>

      <Progress value={pct} className="h-2" />

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {pct === 0
          ? "Inicie sua caminhada pela história da redenção."
          : pct === 100
          ? "Jornada completa! Você caminhou por toda a revelação do Evangelho. 🎉"
          : completed === 0 
          ? "Você está no início de uma jornada transformadora."
          : `Você já caminhou ${completed} etapas — continue descobrindo Cristo nas Escrituras.`}
      </p>
    </motion.div>
  );
};

export default JourneyProgress;
