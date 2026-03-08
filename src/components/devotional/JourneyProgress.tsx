import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface JourneyProgressProps {
  completed: number;
  total: number;
}

const JourneyProgress = ({ completed, total }: JourneyProgressProps) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-border bg-card p-4 space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Sua jornada
        </span>
        <span className="text-xs text-foreground font-medium">
          {completed}/{total}
        </span>
      </div>

      <Progress value={pct} className="h-1.5" />

      <p className="text-[10px] text-muted-foreground">
        {pct === 0
          ? "Comece sua caminhada pela história da redenção."
          : pct === 100
          ? "Você completou toda a jornada! 🎉"
          : `${pct}% concluído — continue caminhando.`}
      </p>
    </motion.div>
  );
};

export default JourneyProgress;
