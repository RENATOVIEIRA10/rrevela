/**
 * useContemplation.ts
 *
 * Modo Contemplação — leitura em silêncio total.
 *
 * Quando ativo:
 * - Header do Reader é ocultado
 * - Barra de navegação inferior é ocultada
 * - Número dos versículos fica opaco (0.3)
 * - Tudo via CSS: .contemplation-mode no <html>
 *
 * Sair do modo:
 * - Toque duplo na tela
 * - Tecla Escape
 * - Botão flutuante (aparece 2s depois de entrar)
 */

import { useState, useEffect, useCallback } from "react";

export function useContemplation() {
  const [active, setActive] = useState(false);

  // Aplica/remove classe no <html>
  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add("contemplation-mode");
    } else {
      root.classList.remove("contemplation-mode");
    }
    return () => root.classList.remove("contemplation-mode");
  }, [active]);

  // Sair com Escape
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const enter  = useCallback(() => setActive(true), []);
  const exit   = useCallback(() => setActive(false), []);
  const toggle = useCallback(() => setActive((v) => !v), []);

  return { active, enter, exit, toggle };
}
