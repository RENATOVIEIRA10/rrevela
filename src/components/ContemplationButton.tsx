/**
 * ContemplationButton.tsx
 *
 * Botão flutuante que aparece no modo contemplação para sair.
 * Aparece com delay de 2s (não interrompe a entrada no modo),
 * fica no canto inferior direito, pequeno e discreto.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";

interface ContemplationButtonProps {
  active: boolean;
  onExit: () => void;
}

const ContemplationButton = ({ active, onExit }: ContemplationButtonProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    // Aparece 2s depois de entrar no modo
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {active && visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1 }}
          onClick={onExit}
          className="fixed bottom-6 right-5 z-50 flex items-center gap-1.5
                     px-3 py-2 rounded-full bg-foreground/10 backdrop-blur-sm
                     border border-border/30 text-[10px] text-foreground/60
                     font-ui transition-opacity"
        >
          <Eye className="w-3 h-3" />
          Sair
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ContemplationButton;
