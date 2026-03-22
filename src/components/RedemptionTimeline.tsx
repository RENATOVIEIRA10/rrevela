import { motion } from "framer-motion";
import { REDEMPTION_ERAS, getEraForPassage } from "@/lib/redemption-timeline";

interface RedemptionTimelineProps {
  book: string;
  chapter: number;
}

const RedemptionTimeline = ({ book, chapter }: RedemptionTimelineProps) => {
  const currentEra = getEraForPassage(book, chapter);

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
        Na história da redenção
      </p>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

        <div className="space-y-1">
          {REDEMPTION_ERAS.map((era, i) => {
            const isActive = currentEra?.key === era.key;
            return (
              <motion.div
                key={era.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative flex items-start gap-3 pl-1 py-1.5 rounded-lg transition-all ${
                  isActive ? "bg-accent/8" : ""
                }`}
              >
                {/* Dot */}
                <div
                  className={`relative z-10 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isActive
                      ? "bg-accent text-accent-foreground ring-2 ring-accent/20"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {era.emoji}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium leading-tight ${
                      isActive ? "text-accent" : "text-foreground/60"
                    }`}
                  >
                    {era.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[10px] text-muted-foreground mt-0.5 leading-snug"
                    >
                      {era.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {currentEra && (
        <p className="text-[10px] text-muted-foreground italic text-center">
          {book} {chapter} se encaixa na era: {currentEra.label}
        </p>
      )}
    </div>
  );
};

export default RedemptionTimeline;
