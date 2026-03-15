/**
 * useRevelaHistory.ts
 *
 * Histórico de buscas do Revela Agora.
 * Persiste no localStorage com limite de 20 entradas.
 *
 * Cada entrada tem:
 * - query: o texto da busca
 * - theme: tema detectado pela IA (se disponível)
 * - timestamp: quando foi feita
 * - id: para o React key
 *
 * Buscas duplicadas são removidas e reinseridas no topo.
 */

import { useState, useCallback } from "react";

export interface RevelaHistoryEntry {
  id: string;
  query: string;
  theme?: string;
  timestamp: number;
}

const KEY = "revela-search-history";
const MAX = 20;

function load(): RevelaHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(entries: RevelaHistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // localStorage cheio ou indisponível
  }
}

export function useRevelaHistory() {
  const [history, setHistory] = useState<RevelaHistoryEntry[]>(load);

  /** Adiciona ou move para o topo uma entrada */
  const addEntry = useCallback((query: string, theme?: string) => {
    setHistory((prev) => {
      // Remove duplicatas da mesma query
      const filtered = prev.filter(
        (e) => e.query.toLowerCase() !== query.toLowerCase()
      );
      const entry: RevelaHistoryEntry = {
        id: crypto.randomUUID(),
        query,
        theme,
        timestamp: Date.now(),
      };
      const updated = [entry, ...filtered].slice(0, MAX);
      save(updated);
      return updated;
    });
  }, []);

  /** Remove uma entrada específica */
  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  /** Limpa todo o histórico */
  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
