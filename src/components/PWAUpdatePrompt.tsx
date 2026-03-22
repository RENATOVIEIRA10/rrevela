import { useRegisterSW } from "virtual:pwa-register/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-20 left-4 right-4 z-[9998] max-w-sm mx-auto"
        >
          <div className="rounded-2xl border border-accent/20 bg-card shadow-xl overflow-hidden">
            {/* Accent top bar */}
            <div className="h-1 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

            <div className="p-4 flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-scripture">
                  ✨ O Revela foi atualizado!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-ui">
                  Uma nova versão está disponível com melhorias e novidades.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    className="h-8 px-4 text-xs font-medium rounded-lg"
                  >
                    Atualizar agora
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Continuar
                  </Button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-secondary/60 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground/60" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;
