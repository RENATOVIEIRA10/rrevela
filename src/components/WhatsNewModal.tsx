import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APP_VERSION,
  getCurrentChangelog,
  hasSeenVersion,
  markVersionSeen,
} from "@/lib/app-version";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const WhatsNewModal = () => {
  const [visible, setVisible] = useState(() => {
    // Only show if user hasn't seen this version
    return !hasSeenVersion(APP_VERSION);
  });

  const changelog = getCurrentChangelog();

  const handleDismiss = () => {
    markVersionSeen(APP_VERSION);
    setVisible(false);
  };

  if (!visible || !changelog) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.5, ease }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-7 pb-4">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-accent" />
                </div>
                <div>
                  <h2 className="font-scripture text-lg font-semibold text-foreground leading-tight">
                    Novidades no Revela
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-ui tracking-wide uppercase mt-0.5">
                    Versão {changelog.version}
                  </p>
                </div>
              </div>

              {changelog.title && (
                <p className="text-sm text-foreground/70 font-ui mt-1">
                  {changelog.title}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-border/60" />

            {/* Changes list */}
            <div className="px-6 py-5 space-y-3">
              {changelog.changes.map((change, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease }}
                  className="flex items-start gap-2.5"
                >
                  <span className="text-sm leading-relaxed text-foreground/80 font-ui">
                    {change}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              <Button
                onClick={handleDismiss}
                className="w-full font-scripture text-sm h-11 rounded-xl"
              >
                Continuar para o Revela
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsNewModal;
