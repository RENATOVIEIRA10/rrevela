import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/hooks/useHighlights";
import type { StudiedChapter } from "@/hooks/useJourneyStats";

interface SpiritualMirrorProps {
  totalHighlights: number;
  totalNotes: number;
  colorDistribution: Array<{ color_key: HighlightColor; count: number }>;
  studiedChapters: StudiedChapter[];
  atCount: number;
  ntCount: number;
}

interface Insight {
  text: string;
  emoji: string;
}

function generateInsights(props: SpiritualMirrorProps): Insight[] {
  const { totalHighlights, totalNotes, colorDistribution, studiedChapters, atCount, ntCount } = props;
  const insights: Insight[] = [];

  if (totalHighlights + totalNotes < 3) return insights;

  // Find dominant theme
  if (colorDistribution.length > 0) {
    const sorted = [...colorDistribution].sort((a, b) => b.count - a.count);
    const top = sorted[0];
    const colorInfo = HIGHLIGHT_COLORS.find((c) => c.key === top.color_key);
    if (colorInfo && top.count >= 3) {
      const themeMessages: Record<HighlightColor, string> = {
        PROMESSA: "Seus estudos mostram atenção especial às promessas de Deus.",
        RESPOSTA_HUMANA: "Você tem buscado entender como viver o que o texto ensina.",
        ATRIBUTOS_DE_DEUS: "Sua jornada revela um foco em conhecer quem Deus é.",
        EMOCOES_ORACAO: "Seus estudos mostram sensibilidade aos clamores e orações do texto.",
        VERDADE_DOUTRINARIA: "Você tem se dedicado a compreender os ensinos centrais das Escrituras.",
      };
      insights.push({ text: themeMessages[top.color_key], emoji: colorInfo.emoji });
    }

    // Check for balanced study
    if (sorted.length >= 3) {
      const topPct = top.count / totalHighlights;
      if (topPct < 0.4) {
        insights.push({
          text: "Sua leitura é equilibrada — você observa múltiplas dimensões do texto.",
          emoji: "⚖️",
        });
      }
    }
  }

  // AT vs NT balance
  if (atCount > 0 && ntCount > 0) {
    const atPct = atCount / (atCount + ntCount);
    if (atPct > 0.7) {
      insights.push({
        text: "Você tem mergulhado mais no Antigo Testamento — fundamento da revelação.",
        emoji: "📜",
      });
    } else if (atPct < 0.3) {
      insights.push({
        text: "Seu foco recente tem sido no Novo Testamento — o cumprimento em Cristo.",
        emoji: "✝️",
      });
    }
  }

  // Frequency / depth
  if (studiedChapters.length >= 10) {
    insights.push({
      text: `Você já estudou ${studiedChapters.length} capítulos diferentes — sua jornada ganha amplitude.`,
      emoji: "🗺️",
    });
  }

  // Revisiting patterns
  const revisited = studiedChapters.filter((ch) => ch.highlight_count >= 3 || ch.note_count >= 2);
  if (revisited.length >= 2) {
    const topRevisited = revisited[0];
    insights.push({
      text: `Você retornou várias vezes a ${topRevisited.book} ${topRevisited.chapter} — a profundidade vem da revisitação.`,
      emoji: "🔄",
    });
  }

  // Notes engagement
  if (totalNotes >= 5) {
    insights.push({
      text: "Suas anotações mostram que você não apenas lê — você dialoga com o texto.",
      emoji: "📝",
    });
  }

  return insights.slice(0, 4);
}

const SpiritualMirror = (props: SpiritualMirrorProps) => {
  const insights = generateInsights(props);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10"
        >
          <span className="text-base mt-0.5 shrink-0">{insight.emoji}</span>
          <p className="text-sm font-scripture text-foreground/85 leading-relaxed">
            {insight.text}
          </p>
        </motion.div>
      ))}

      <p className="text-[10px] text-muted-foreground text-center italic">
        Baseado exclusivamente nos seus padrões de estudo.
      </p>
    </div>
  );
};

export default SpiritualMirror;
