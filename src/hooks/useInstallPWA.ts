/**
 * useInstallPWA.ts
 *
 * Captura o evento nativo `beforeinstallprompt` do navegador,
 * que é disparado quando o app está apto para ser instalado como PWA.
 *
 * Expõe:
 * - `canInstall`   → true quando o prompt está disponível
 * - `isInstalled`  → true quando já está rodando como app instalado
 * - `install()`    → dispara o prompt nativo de instalação
 *
 * Uso:
 *   const { canInstall, install } = useInstallPWA();
 *   {canInstall && <button onClick={install}>Instalar app</button>}
 */
import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Já está rodando como PWA instalado
    const running = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(running);
    if (running) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Detecta quando o app é instalado (depois do prompt aceito)
    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    if (outcome === "accepted") setIsInstalled(true);
    return outcome;
  }, [deferredPrompt]);

  return { canInstall, isInstalled, install };
}
