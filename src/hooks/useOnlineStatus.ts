/**
 * useOnlineStatus.ts
 *
 * Detecta o status de conectividade do dispositivo em tempo real.
 * Escuta os eventos nativos `online` e `offline` do browser.
 *
 * Retorna:
 * - `isOnline`      → true quando há conexão
 * - `wasOffline`    → true se ficou offline em algum momento desta sessão
 *                    (útil para mostrar "Conexão restaurada")
 *
 * Uso:
 *   const { isOnline } = useOnlineStatus();
 */
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // wasOffline permanece true para permitir mostrar "Conexão restaurada"
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
