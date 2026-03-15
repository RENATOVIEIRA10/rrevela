import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerseOfDay } from "@/hooks/useDevotional";
import RevelaLogo from "./RevelaLogo";

interface MomentoRevelaProps {
  onContinue: () => void;
}

const MomentoRevela = ({ onContinue }: MomentoRevelaProps) => {
  const { verse, loading } = useVerseOfDay();
  const [showVerse, setShowVerse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowVerse(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1a1008] z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <RevelaLogo size={36} color="#F9F7F2" />
          <div className="w-1 h-1 rounded-full bg-[#F9F7F2]/30 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "linear-gradient(160deg, #1a1008 0%, #2a1a10 60%, #1a1008 100%)" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center pt-14 pb-2"
      >
        <RevelaLogo size={32} color="#F9F7F2" />
      </motion.div>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-[10px] uppercase tracking-[0.22em] text-[#F9F7F2]/35 font-ui"
      >
        Palavra do dia
      </motion.p>

      {/* Versículo — protagonista */}
      <div className="flex-1 flex flex-col justify-center px-8 max-w-sm mx-auto w-full">
        <AnimatePresence>
          {showVerse && verse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              {/* Aspas decorativas */}
              <span className="block text-[#F9F7F2]/10 font-scripture text-6xl leading-none select-none">
                "
              </span>

              <blockquote className="font-scripture text-[1.1875rem] text-[#F9F7F2]/90 leading-[1.75] italic -mt-8">
                {verse.text}
              </blockquote>

              <p className="text-[11px] text-[#F9F7F2]/40 font-ui tracking-wide">
                {verse.book} {verse.chapter}:{verse.verse}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="px-6 pb-10 space-y-3"
      >
        <Button
          onClick={onContinue}
          className="w-full h-12 rounded-xl font-scripture text-sm gap-2"
          style={{ backgroundColor: "#632A26", color: "#F9F7F2" }}
        >
          Continuar para a Palavra
          <ArrowRight className="w-4 h-4" />
        </Button>
        <p className="text-[10px] text-center text-[#F9F7F2]/25 font-ui">
          Que este momento prepare seu coração para o dia
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MomentoRevela;
