import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerseOfDay } from "@/hooks/useDevotional";
import { useJourneyStats } from "@/hooks/useJourneyStats";

interface MomentoRevelaProps {
  onContinue: () => void;
}

const MomentoRevela = ({ onContinue }: MomentoRevelaProps) => {
  const { verse, loading } = useVerseOfDay();
  const { studiedChapters } = useJourneyStats();
  const [showInsight, setShowInsight] = useState(false);

  // Gerar insight baseado nos padrões do usuário
  const generatePersonalInsight = (): string => {
    if (studiedChapters.length === 0) {
      return "O texto mostra o coração de Deus revelado em cada palavra.";
    }

    const recentBooks = studiedChapters.slice(0, 3).map(ch => ch.book);
    const hasGospels = recentBooks.some(book => 
      ["Mateus", "Marcos", "Lucas", "João"].includes(book)
    );
    const hasOT = recentBooks.some(book => 
      studiedChapters.find(ch => ch.book === book)?.testament === "VT"
    );

    if (hasGospels && hasOT) {
      return "Esta passagem conecta a promessa antiga com o cumprimento em Cristo.";
    } else if (hasGospels) {
      return "Aqui vemos Cristo revelado — o centro de toda a Escritura.";
    } else if (hasOT) {
      return "O texto mostra como Deus prepara o caminho para a redenção.";
    } else {
      return "Esta palavra revela o caráter imutável de Deus para nós hoje.";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowInsight(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Preparando seu momento...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/5 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-accent mr-2" />
          </div>
          <h1 className="font-scripture text-xl font-semibold text-foreground">
            Seu Momento com a Palavra
          </h1>
          <p className="text-xs text-muted-foreground tracking-wide">
            3 minutos para começar o dia
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        {verse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Verse Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span>{verse.book} {verse.chapter}:{verse.verse}</span>
                </div>
                
                <blockquote className="text-sm font-scripture leading-relaxed text-foreground/95 italic">
                  "{verse.text}"
                </blockquote>
              </div>
            </div>

            {/* Insight */}
            <AnimatePresence>
              {showInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent/10 border border-accent/20 rounded-xl p-4"
                >
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {generatePersonalInsight()}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-3"
        >
          <Button 
            onClick={onContinue}
            className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-medium"
          >
            <span>Continuar Jornada</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground">
            Que este momento prepare seu coração para o dia
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MomentoRevela;