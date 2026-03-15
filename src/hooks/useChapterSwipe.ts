/**
 * useChapterSwipe.ts
 *
 * Swipe horizontal entre capítulos no mobile.
 *
 * COMPORTAMENTO:
 * - Swipe left  → próximo capítulo
 * - Swipe right → capítulo anterior
 * - Threshold: 60px de deslocamento horizontal
 * - Velocidade mínima: 0.3 (evita swipes acidentais ao rolar)
 * - Ignora swipes verticais (para não conflitar com scroll)
 *
 * USO:
 *   const swipeHandlers = useChapterSwipe({ onPrev, onNext, disabled });
 *   <div {...swipeHandlers}>...</div>
 */

import { useRef, useCallback } from "react";

interface UseChapterSwipeOptions {
  onPrev: () => void;
  onNext: () => void;
  /** Desativa o swipe quando um sheet/drawer está aberto */
  disabled?: boolean;
}

export function useChapterSwipe({ onPrev, onNext, disabled = false }: UseChapterSwipeOptions) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isSwiping.current = false;
  }, [disabled]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    // Se movimento vertical dominante → é scroll, não swipe
    if (Math.abs(dy) > Math.abs(dx) * 1.5) {
      touchStart.current = null;
      return;
    }

    // Inicia swipe horizontal se deslocamento significativo
    if (Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
  }, [disabled]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !touchStart.current || !isSwiping.current) {
      touchStart.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dt = Date.now() - touchStart.current.time;
    const velocity = Math.abs(dx) / dt; // px/ms

    const THRESHOLD = 60;   // px mínimos
    const MIN_VEL = 0.3;    // px/ms mínimos

    if (Math.abs(dx) > THRESHOLD || velocity > MIN_VEL) {
      if (dx < 0) {
        onNext();  // swipe left → próximo
      } else {
        onPrev();  // swipe right → anterior
      }
    }

    touchStart.current = null;
    isSwiping.current = false;
  }, [disabled, onPrev, onNext]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
