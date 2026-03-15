/**
 * offline-bible.ts — Armazenamento offline da Bíblia via IndexedDB
 *
 * MUDANÇAS NESTA VERSÃO:
 * - Removidos os últimos `as any` em getOfflineInfo.
 *   Substituídos por interface tipada `OfflineMeta`.
 */
import { supabase } from "@/integrations/supabase/client";

const DB_NAME = "revela-bible-offline";
const DB_VERSION = 1;
const STORE_NAME = "verses";
const META_STORE = "meta";

// ─── Tipos internos ───────────────────────────────────────────
interface OfflineMeta {
  key: string;
  count: number;
  timestamp: number;
}

// ─── IndexedDB helpers ────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by_location", ["translation", "book", "chapter"], { unique: false });
        store.createIndex("by_translation", "translation", { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Tipos públicos ───────────────────────────────────────────
export interface OfflineVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

// ─── API pública ──────────────────────────────────────────────
/** Download de uma tradução inteira para o IndexedDB */
export async function downloadTranslationOffline(
  translation: string,
  onProgress?: (pct: number) => void
): Promise<number> {
  const db = await openDB();
  let totalStored = 0;
  let offset = 0;
  const batchSize = 1000;

  const { count } = await supabase
    .from("bible_verses")
    .select("*", { count: "exact", head: true })
    .eq("translation", translation);

  const total = count || 0;
  if (total === 0) return 0;

  while (offset < total) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("id, book, chapter, verse, text, translation")
      .eq("translation", translation)
      .order("book")
      .order("chapter")
      .order("verse")
      .range(offset, offset + batchSize - 1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      for (const row of data) store.put(row);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    totalStored += data.length;
    offset += batchSize;
    onProgress?.(Math.min(100, Math.round((totalStored / total) * 100)));
  }

  // Salva metadados
  const metaTx = db.transaction(META_STORE, "readwrite");
  const meta: OfflineMeta = {
    key: `downloaded_${translation}`,
    timestamp: Date.now(),
    count: totalStored,
  };
  metaTx.objectStore(META_STORE).put(meta);

  db.close();
  return totalStored;
}

/** Verifica se uma tradução está disponível offline */
export async function isTranslationOffline(translation: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(META_STORE, "readonly");
      const req = tx.objectStore(META_STORE).get(`downloaded_${translation}`);
      req.onsuccess = () => { db.close(); resolve(!!req.result); };
      req.onerror  = () => { db.close(); resolve(false); };
    });
  } catch {
    return false;
  }
}

/** Busca versículos do IndexedDB */
export async function getOfflineVerses(
  book: string,
  chapter: number,
  translation: string
): Promise<OfflineVerse[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("by_location");
    const request = index.getAll([translation, book, chapter]);
    request.onsuccess = () => {
      db.close();
      const results = (request.result as OfflineVerse[]).sort((a, b) => a.verse - b.verse);
      resolve(results);
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

/** Remove dados offline de uma tradução */
export async function deleteOfflineTranslation(translation: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, META_STORE], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("by_translation");
    const cursor = index.openCursor(IDBKeyRange.only(translation));
    cursor.onsuccess = () => {
      const c = cursor.result;
      if (c) { c.delete(); c.continue(); }
    };
    tx.objectStore(META_STORE).delete(`downloaded_${translation}`);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); reject(tx.error); };
  });
}

/** Informações sobre todas as traduções offline */
export async function getOfflineInfo(): Promise<
  Array<{ translation: string; count: number; timestamp: number }>
> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(META_STORE, "readonly");
      const req = tx.objectStore(META_STORE).getAll();
      req.onsuccess = () => {
        db.close();
        // Tipagem explícita — sem `as any`
        const all = (req.result ?? []) as OfflineMeta[];
        resolve(
          all
            .filter((m) => m.key.startsWith("downloaded_"))
            .map((m) => ({
              translation: m.key.replace("downloaded_", ""),
              count: m.count,
              timestamp: m.timestamp,
            }))
        );
      };
      req.onerror = () => { db.close(); resolve([]); };
    });
  } catch {
    return [];
  }
}
