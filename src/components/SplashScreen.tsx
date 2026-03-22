import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevelaLogo from "./RevelaLogo";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 600);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Top accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
          />

          {/* Logo animado — folheio rápido das páginas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            {/*
              animated=true ativa o folheio SMIL:
              as 11 páginas giram em cascata da posição fechada (+15°) para o leque aberto.
              A variante escolhida aqui é "dark" pois o splash usa bg-background.
              Em temas claros (papel), o logo fica sobre fundo claro mas as páginas dark
              ainda criam contraste suficiente — e o "r" creme é muito sutil.
              Consideração: para temas claros, mudar para variant="light".
            */}
            <RevelaLogo size={110} variant="dark" animated />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.55, ease: "easeOut" }}
            className="font-scripture text-[2rem] font-semibold text-foreground tracking-tight leading-none"
          >
            Revela
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 mb-4 h-px w-12 bg-border origin-center"
          />

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 1.05, duration: 0.7 }}
            className="text-[0.65rem] text-muted-foreground tracking-[0.25em] uppercase font-ui font-medium"
          >
            Estudo bíblico cristocêntrico
          </motion.p>

          {/* Bottom accent dot */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <div className="w-1 h-1 rounded-full bg-primary/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
