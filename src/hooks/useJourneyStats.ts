import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import type { HighlightColor } from "./useHighlights";
import type { StructuredNote } from "./useNotes";

export interface HighlightStat {
  color_key: HighlightColor;
  count: number;
}

export interface StudiedChapter {
  book: string;
  chapter: number;
  testament: "VT" | "NT";
  highlight_count: number;
  note_count: number;
  last_studied: string;
}

export interface RawHighlight {
  book: string;
  chapter: number;
  verse: number;
  color_key: HighlightColor;
}

export interface JourneyStats {
  totalHighlights: number;
  totalNotes: number;
  colorDistribution: HighlightStat[];
  atCount: number;
  ntCount: number;
  studiedChapters: StudiedChapter[];
  recentNotes: StructuredNote[];
  rawHighlights: RawHighlight[];
  loading: boolean;
}

export function useJourneyStats(): JourneyStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<JourneyStats>({
    totalHighlights: 0,
    totalNotes: 0,
    colorDistribution: [],
    atCount: 0,
    ntCount: 0,
    studiedChapters: [],
    recentNotes: [],
    rawHighlights: [],
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats((s) => ({ ...s, loading: false }));
      return;
    }

    const [highlightsRes, notesRes] = await Promise.all([
      supabase
        .from("highlights")
        .select("id, book, chapter, verse, color_key, created_at")
        .eq("user_id", user.id),
      supabase
        .from("structured_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const highlights = (highlightsRes.data ?? []) as Array<{
      id: string;
      book: string;
      chapter: number;
      verse: number;
      color_key: HighlightColor;
      created_at: string;
    }>;

    const notes = (notesRes.data ?? []) as StructuredNote[];

    // Color distribution
    const colorMap = new Map<HighlightColor, number>();
    highlights.forEach((h) => {
      colorMap.set(h.color_key, (colorMap.get(h.color_key) || 0) + 1);
    });
    const colorDistribution: HighlightStat[] = Array.from(colorMap.entries()).map(
      ([color_key, count]) => ({ color_key, count })
    );

    // AT vs NT
    const bookTestament = new Map<string, "VT" | "NT">();
    BIBLE_BOOKS.forEach((b) => bookTestament.set(b.name, b.testament));

    let atCount = 0;
    let ntCount = 0;
    highlights.forEach((h) => {
      const t = bookTestament.get(h.book);
      if (t === "VT") atCount++;
      else if (t === "NT") ntCount++;
    });

    // Studied chapters (from highlights + notes)
    const chapterMap = new Map<string, StudiedChapter>();

    highlights.forEach((h) => {
      const key = `${h.book}|${h.chapter}`;
      const existing = chapterMap.get(key);
      if (existing) {
        existing.highlight_count++;
        if (h.created_at > existing.last_studied) existing.last_studied = h.created_at;
      } else {
        chapterMap.set(key, {
          book: h.book,
          chapter: h.chapter,
          testament: bookTestament.get(h.book) || "VT",
          highlight_count: 1,
          note_count: 0,
          last_studied: h.created_at,
        });
      }
    });

    notes.forEach((n) => {
      if (!n.book || n.chapter == null) return;
      const key = `${n.book}|${n.chapter}`;
      const existing = chapterMap.get(key);
      if (existing) {
        existing.note_count++;
        if (n.created_at > existing.last_studied) existing.last_studied = n.created_at;
      } else {
        chapterMap.set(key, {
          book: n.book,
          chapter: n.chapter,
          testament: bookTestament.get(n.book) || "VT",
          highlight_count: 0,
          note_count: 1,
          last_studied: n.created_at,
        });
      }
    });

    const studiedChapters = Array.from(chapterMap.values()).sort(
      (a, b) => new Date(b.last_studied).getTime() - new Date(a.last_studied).getTime()
    );

    setStats({
      totalHighlights: highlights.length,
      totalNotes: notes.length,
      colorDistribution,
      atCount,
      ntCount,
      studiedChapters,
      recentNotes: notes.slice(0, 10),
      loading: false,
    });
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return stats;
}
