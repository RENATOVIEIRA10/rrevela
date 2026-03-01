import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export type DepthLevel = "essencial" | "intermediario" | "profundo";

interface DepthConfig {
  key: DepthLevel;
  label: string;
  description: string;
  icon: string;
}

const DEPTHS: DepthConfig[] = [
  {
    key: "essencial",
    label: "Essencial",
    description: "Contexto + Identidade de Cristo",
    icon: "🌱",
  },
  {
    key: "intermediario",
    label: "Intermediário",
    description: "Harmonia bíblica + Padrões",
    icon: "🌿",
  },
  {
    key: "profundo",
    label: "Profundo",
    description: "Tipologia + Linha messiânica + AT ↔ NT",
    icon: "🌳",
  },
];

interface DepthSelectorProps {
  value: DepthLevel;
  onChange: (depth: DepthLevel) => void;
}

const DepthSelector = ({ value, onChange }: DepthSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Layers className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-widest font-medium">
          Nível de profundidade
        </span>
      </div>

      <div className="flex gap-1.5">
        {DEPTHS.map((d) => {
          const isActive = value === d.key;
          return (
            <motion.button
              key={d.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(d.key)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-center transition-all border ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-secondary/30 text-foreground/60 hover:bg-secondary/50"
              }`}
            >
              <span className="text-base">{d.icon}</span>
              <span className="text-[10px] font-ui font-semibold leading-tight">{d.label}</span>
              <span className="text-[9px] leading-tight text-muted-foreground hidden sm:block">
                {d.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DepthSelector;
