/**
 * BrandUpdateBanner.tsx
 *
 * Aparece UMA VEZ para usuários que já tinham o app instalado,
 * informando sobre o novo visual e orientando a reinstalar
 * para ver o novo ícone na tela inicial.
 *
 * Por que é necessário:
 * O ícone do PWA é capturado pelo sistema operacional no momento
 * da instalação. Não é possível atualizá-lo remotamente.
 * Este banner é a forma honesta de comunicar isso ao usuário
 * e dar a ele a opção de reinstalar se quiser.
 *
 * Lógica:
 * - Só aparece se `display-mode: standalone` (app instalado)
 * - Só aparece uma vez (controlado por localStorage)
 * - Aparece após 5s de uso para não interromper a leitura
 * - Versão 1.4.0 inicia o novo ciclo de brand
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRAND_UPDATE_KEY = "revela-brand-update-v1.4-seen";

function isInstalledPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function BrandUpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só mostra se for PWA instalada E ainda não viu este banner
    if (!isInstalledPWA()) return;
    if (localStorage.getItem(BRAND_UPDATE_KEY)) return;

    // Aguarda 5s para não interromper abertura do app
    const t = setTimeout(() => setVisible(true), 5_000);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BRAND_UPDATE_KEY, "true");
    setVisible(false);
  };

  const handleReinstall = () => {
    localStorage.setItem(BRAND_UPDATE_KEY, "true");
    setVisible(false);
    // Redireciona para a página de instruções de instalação
    window.location.href = "/install";
  };

  const iosInstructions = isIOS()
    ? "Toque em Compartilhar → Adicionar à Tela de Início"
    : "Toque em Menu ⋮ → Instalar app";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-[9991] max-w-sm mx-auto"
        >
          <div className="rounded-2xl border border-accent/20 bg-card shadow-xl overflow-hidden">
            {/* Barra decorativa topo */}
            <div className="h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground font-scripture">
                    Novo visual do Revela ✨
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-ui">
                    Atualizamos a identidade visual. Para ver o novo ícone
                    na sua tela inicial, reinstale o app rapidinho.
                  </p>
                  {/* Instrução contextual por plataforma */}
                  <div className="mt-2 px-3 py-2 bg-secondary/40 rounded-lg">
                    <p className="text-[11px] text-foreground/70 font-ui">
                      <span className="font-medium text-accent">Como fazer: </span>
                      {iosInstructions}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleReinstall}
                      className="h-8 px-3 text-xs font-medium rounded-lg gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Ver instruções
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Continuar assim
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BrandUpdateBanner;
