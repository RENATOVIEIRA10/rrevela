/**
 * InstallBanner.tsx
 *
 * Banner contextual que sugere a instalação do Revela como app,
 * aparecendo automaticamente quando o navegador disponibiliza
 * o evento `beforeinstallprompt` (Chrome/Android/Edge/desktop).
 *
 * Comportamento:
 * - Aparece na parte inferior após 30s de uso (não intrusivo)
 * - Pode ser dispensado — não volta a aparecer em 7 dias
 * - Não aparece se o app já está instalado
 * - No iOS (Safari), mostra instrução manual pois o prompt nativo
 *   não existe nesse browser
 *
 * Posicionamento: acima da bottom nav (bottom-16 no mobile).
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const DISMISSED_KEY = "revela-install-banner-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < DISMISS_DURATION_MS;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallBanner() {
  const { canInstall, install } = useInstallPWA();
  const [visible, setVisible] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Não mostrar se já instalado ou dispensado recentemente
    if (isInStandaloneMode() || isDismissed()) return;

    // iOS: mostrar instrução manual após 30s
    if (isIOS()) {
      const t = setTimeout(() => setShowIOSHint(true), 30_000);
      return () => clearTimeout(t);
    }

    // Android/Chrome/Edge: mostrar quando prompt disponível
    if (canInstall) {
      const t = setTimeout(() => setVisible(true), 30_000);
      return () => clearTimeout(t);
    }
  }, [canInstall]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
    setShowIOSHint(false);
  };

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted") {
      setVisible(false);
    }
  };

  // ─── Banner iOS (instrução manual) ───────────────────────────
  if (showIOSHint) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-[9990] max-w-sm mx-auto"
        >
          <div className="rounded-2xl border border-accent/20 bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Share className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-scripture">
                  Instale o Revela no iPhone
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-ui">
                  Toque em{" "}
                  <span className="font-medium text-foreground">
                    Compartilhar
                  </span>{" "}
                  e depois em{" "}
                  <span className="font-medium text-foreground">
                    "Adicionar à Tela de Início"
                  </span>
                  .
                </p>
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
      </AnimatePresence>
    );
  }

  // ─── Banner nativo (Android / Chrome / Edge) ─────────────────
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-[9990] max-w-sm mx-auto"
        >
          <div className="rounded-2xl border border-accent/20 bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Download className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-scripture">
                  Instale o Revela
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-ui">
                  Acesse direto da tela inicial, sem abrir o navegador.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="h-8 px-4 text-xs font-medium rounded-lg"
                  >
                    Instalar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Agora não
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
}

export default InstallBanner;
