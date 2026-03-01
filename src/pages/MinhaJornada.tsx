import { motion } from "framer-motion";
import { Clock, BookMarked, TrendingUp } from "lucide-react";

const MinhaJornada = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <h1 className="font-scripture text-base font-semibold text-foreground text-center">
          Minha Jornada
        </h1>
      </div>

      <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-8"
        >
          <p className="font-scripture text-lg text-foreground">
            Sua caminhada, em silêncio.
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            O Revela registra discretamente seus estudos e buscas. Sem medalhas. Sem rótulos. Apenas sua jornada.
          </p>
        </motion.div>

        {/* Placeholder cards */}
        <div className="space-y-4">
          <JourneyCard
            icon={<Clock className="w-5 h-5" />}
            title="Linha do tempo"
            description="Seus estudos e buscas recentes aparecerão aqui."
            delay={0.1}
          />
          <JourneyCard
            icon={<BookMarked className="w-5 h-5" />}
            title="Temas recorrentes"
            description="Temas que você tem buscado com frequência serão mapeados organicamente."
            delay={0.2}
          />
          <JourneyCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Camadas construídas"
            description="Conexões entre passagens e temas que você explorou ao longo do tempo."
            delay={0.3}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground text-center pt-4"
        >
          Comece a estudar e sua jornada será registrada.
        </motion.p>
      </div>
    </div>
  );
};

const JourneyCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-card rounded-xl p-5 shadow-soft border border-border/50 space-y-2"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="font-medium text-sm text-foreground">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed pl-12">{description}</p>
  </motion.div>
);

export default MinhaJornada;
