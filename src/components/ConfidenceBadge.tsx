import { type ConnectionType } from "@/lib/christocentric-index";

export type ConfidenceLevel = "alto" | "medio" | "leve";

export const CONFIDENCE_STYLES: Record<ConfidenceLevel, { label: string; className: string }> = {
  alto: { label: "Confiança alta", className: "bg-accent/15 text-accent" },
  medio: { label: "Confiança média", className: "bg-secondary text-foreground/70" },
  leve: { label: "Confiança leve", className: "bg-secondary/50 text-muted-foreground" },
};

export const CONNECTION_TYPE_DISPLAY: Record<string, { label: string; icon: string }> = {
  citacao_cumprimento: { label: "Citação / Cumprimento", icon: "📖" },
  promessa_messianica: { label: "Promessa messiânica", icon: "✨" },
  padrao_tipologico: { label: "Padrão tipológico", icon: "🔄" },
  eco_tematico: { label: "Eco temático", icon: "🌊" },
  citacao_direta: { label: "Citação direta", icon: "📖" },
  alusao: { label: "Alusão", icon: "🔗" },
  mesmo_termo: { label: "Mesmo termo", icon: "🔤" },
  estrutura_semelhante: { label: "Estrutura semelhante", icon: "📐" },
  alusao_tematica: { label: "Alusão temática", icon: "🔗" },
  uso_messianico: { label: "Uso messiânico", icon: "✝️" },
};

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  className?: string;
}

export const ConfidenceBadge = ({ confidence, className = "" }: ConfidenceBadgeProps) => {
  const style = CONFIDENCE_STYLES[confidence];
  if (!style) return null;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${style.className} ${className}`}>
      {style.label}
    </span>
  );
};

interface ConnectionTypeBadgeProps {
  type: string;
  className?: string;
}

export const ConnectionTypeBadge = ({ type, className = "" }: ConnectionTypeBadgeProps) => {
  const display = CONNECTION_TYPE_DISPLAY[type];
  if (!display) return <span className={`text-[10px] text-muted-foreground ${className}`}>{type}</span>;
  return (
    <span className={`text-[10px] text-muted-foreground flex items-center gap-1 ${className}`}>
      <span>{display.icon}</span>
      <span>{display.label}</span>
    </span>
  );
};
