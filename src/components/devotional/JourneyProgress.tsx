import { motion } from "framer-motion";

interface JourneyProgressProps {
  completed: number;
  total: number;
}

const JourneyProgress = ({ completed, total }: JourneyProgressProps) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const currentDay = Math.max(1, completed + 1);
  const totalDays = Math.max(total, 40);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 px-1"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            O Evangelho Revelado
          </span>
          <p className="text-sm font-scripture text-foreground font-medium">
            Dia {currentDay} de {totalDays}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-scripture text-accent tabular-nums">{pct}%</span>
          <p className="text-[10px] text-muted-foreground tabular-nums">{completed}/{total} etapas</p>
        </div>
      </div>

      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-accent/60 rounded-full"
        />
      </div>

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
