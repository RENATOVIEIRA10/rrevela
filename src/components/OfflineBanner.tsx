/**
 * OfflineBanner.tsx
 *
 * Banner sutil que aparece no topo quando o usuário perde conexão,
 * e mostra confirmação verde quando ela é restaurada.
 *
 * - Offline  → banner vermelho/âmbar com WifiOff
 * - Restaurado → banner verde por 3s, depois some
 *
 * Posicionamento: fixo no topo, abaixo da safe-area do iOS.
 * Não bloqueia interação com o app.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);

  // Quando volta online depois de ter ficado offline, mostra "Restaurado" por 3s
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const show = !isOnline || showRestored;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className={[
            "fixed top-0 left-0 right-0 z-[9999] safe-top",
            "flex items-center justify-center gap-2",
            "px-4 py-2 text-xs font-medium font-ui",
            !isOnline
              ? "bg-amber-500/95 text-white backdrop-blur-sm"
              : "bg-green-500/95 text-white backdrop-blur-sm",
          ].join(" ")}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>Sem conexão — usando dados offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 shrink-0" />
              <span>Conexão restaurada</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
