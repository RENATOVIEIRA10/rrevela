import { useRef, useEffect, useCallback, useState } from "react";

/**
 * Hook that provides pinch-to-zoom on a container element.
 * Returns a ref to attach to the zoomable container, the current zoom level, and a setter.
 */
export function usePinchZoom(initialZoom = 1, min = 0.7, max = 1.6) {
  const [zoom, setZoom] = useState(initialZoom);
  const containerRef = useRef<HTMLDivElement>(null);
  const startDistRef = useRef<number | null>(null);
  const startZoomRef = useRef(initialZoom);

  const getDistance = (touches: TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      startDistRef.current = getDistance(e.touches);
      startZoomRef.current = zoom;
    }
  }, [zoom]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && startDistRef.current !== null) {
      e.preventDefault();
      const dist = getDistance(e.touches);
      const scale = dist / startDistRef.current;
      const newZoom = Math.min(max, Math.max(min, startZoomRef.current * scale));
      setZoom(Math.round(newZoom * 100) / 100);
    }
  }, [min, max]);

  const onTouchEnd = useCallback(() => {
    startDistRef.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return { containerRef, zoom, setZoom };
}
