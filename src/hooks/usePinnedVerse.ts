import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PinnedVerseData {
  translation: string;
  book: string;
  chapter: number;
  verse: number;
  text?: string; // loaded lazily from bible_verses
}

const IDB_STORE = "pinned_verse_queue";
const IDB_DB = "revela_offline";

// ── IndexedDB helpers ──
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueOffline(action: "pin" | "unpin", data?: PinnedVerseData) {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    // Always replace with latest action
    tx.objectStore(IDB_STORE).put({ id: "pending", action, data, ts: Date.now() });
    tx.oncomplete = () => db.close();
  } catch { /* indexedDB unavailable */ }
}

async function dequeueOffline(): Promise<{ action: "pin" | "unpin"; data?: PinnedVerseData } | null> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    return new Promise((resolve) => {
      const req = tx.objectStore(IDB_STORE).get("pending");
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
      tx.oncomplete = () => db.close();
    });
  } catch { return null; }
}

async function clearOfflineQueue() {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete("pending");
    tx.oncomplete = () => db.close();
  } catch { /* */ }
}

async function saveToLocalCache(data: PinnedVerseData | null) {
  try {
    if (data) {
      localStorage.setItem("revela_pinned", JSON.stringify(data));
    } else {
      localStorage.removeItem("revela_pinned");
    }
  } catch { /* */ }
}

function loadFromLocalCache(): PinnedVerseData | null {
  try {
    const raw = localStorage.getItem("revela_pinned");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function usePinnedVerse() {
  const { user } = useAuth();
  const [pinned, setPinned] = useState<PinnedVerseData | null>(loadFromLocalCache);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  // ── Fetch verse text helper ──
  const fetchVerseText = useCallback(async (book: string, chapter: number, verse: number): Promise<string> => {
    const { data } = await supabase
      .from("bible_verses")
      .select("text")
      .eq("book", book)
      .eq("chapter", chapter)
      .eq("verse", verse)
      .eq("translation", "acf")
      .maybeSingle();
    return data?.text ?? "";
  }, []);

  // ── Sync offline queue ──
  const syncOfflineQueue = useCallback(async () => {
    if (!user) return;
    const pending = await dequeueOffline();
    if (!pending) return;

    if (pending.action === "pin" && pending.data) {
      await supabase.from("pinned_verses").upsert(
        { user_id: user.id, ...pending.data },
        { onConflict: "user_id" }
      );
    } else if (pending.action === "unpin") {
      await supabase.from("pinned_verses").delete().eq("user_id", user.id);
    }
    await clearOfflineQueue();
  }, [user]);

  // ── Rehydrate on mount ──
  useEffect(() => {
    if (!user || syncedRef.current) return;
    syncedRef.current = true;

    const rehydrate = async () => {
      setLoading(true);
      // Sync any offline actions first
      await syncOfflineQueue();

      const { data } = await supabase
        .from("pinned_verses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const text = await fetchVerseText(data.book, data.chapter, data.verse);
        const pinData: PinnedVerseData = {
          translation: data.translation,
          book: data.book,
          chapter: data.chapter,
          verse: data.verse,
          text,
        };
        setPinned(pinData);
        saveToLocalCache(pinData);
      } else {
        setPinned(null);
        saveToLocalCache(null);
      }
      setLoading(false);
    };

    rehydrate();
  }, [user, syncOfflineQueue, fetchVerseText]);

  // ── Online event listener to sync queue ──
  useEffect(() => {
    const handler = () => { syncOfflineQueue(); };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [syncOfflineQueue]);

  // ── Pin ──
  const pin = useCallback(async (data: PinnedVerseData) => {
    if (!user) return;
    const withText = { ...data };
    if (!withText.text) {
      withText.text = await fetchVerseText(data.book, data.chapter, data.verse);
    }
    // Optimistic UI
    setPinned(withText);
    saveToLocalCache(withText);

    if (!navigator.onLine) {
      await enqueueOffline("pin", { translation: data.translation, book: data.book, chapter: data.chapter, verse: data.verse });
      return;
    }

    const { translation, book, chapter, verse } = data;
    await supabase.from("pinned_verses").upsert(
      { user_id: user.id, translation, book, chapter, verse },
      { onConflict: "user_id" }
    );
  }, [user, fetchVerseText]);

  // ── Unpin ──
  const unpin = useCallback(async () => {
    if (!user) return;
    setPinned(null);
    saveToLocalCache(null);

    if (!navigator.onLine) {
      await enqueueOffline("unpin");
      return;
    }

    await supabase.from("pinned_verses").delete().eq("user_id", user.id);
  }, [user]);

  return { pinned, loading, pin, unpin };
}
