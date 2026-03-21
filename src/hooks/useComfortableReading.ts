import { useState, useEffect } from "react";

const STORAGE_KEY = "revela-comfortable-reading";
const HTML_CLASS  = "comfortable-reading";

export function useComfortableReading() {
  const [active, setActive] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "1"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.classList.add(HTML_CLASS);
    } else {
      root.classList.remove(HTML_CLASS);
    }
    return () => root.classList.remove(HTML_CLASS);
  }, [active]);

  const toggle = () =>
    setActive((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });

  return { active, toggle };
}
