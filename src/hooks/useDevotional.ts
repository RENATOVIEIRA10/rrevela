import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DevotionalEntry {
  id: string;
  order_index: number;
  era_key: string;
  book: string;
  chapter_start: number;
  chapter_end: number | null;
  verse_start: number | null;
  verse_end: number | null;
  title: string;
  subtitle: string;
  gospel_revelation: string;
  christocentric_connection: string;
  reflection_questions: string[];
  created_at: string;
}

export interface UserProgress {
  devotional_id: string;
  completed: boolean;
  favorited: boolean;
  completed_at: string | null;
}

export function useDevotionalJourney() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DevotionalEntry[]>([]);
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (user) fetchProgress();
  }, [user]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("devotional_entries")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data) {
      setEntries(data.map(d => ({
        ...d,
        reflection_questions: (d.reflection_questions as any) || [],
      })));
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_devotional_progress")
      .select("devotional_id, completed, favorited, completed_at")
      .eq("user_id", user.id);

    if (!error && data) {
      const map = new Map<string, UserProgress>();
      data.forEach(p => map.set(p.devotional_id, p));
      setProgress(map);
    }
  };

  const toggleComplete = useCallback(async (devotionalId: string) => {
    if (!user) return;
    const existing = progress.get(devotionalId);
    const newCompleted = !existing?.completed;

    const { error } = await supabase
      .from("user_devotional_progress")
      .upsert({
        user_id: user.id,
        devotional_id: devotionalId,
        completed: newCompleted,
        favorited: existing?.favorited || false,
        completed_at: newCompleted ? new Date().toISOString() : null,
      }, { onConflict: "user_id,devotional_id" });

    if (!error) {
      setProgress(prev => {
        const next = new Map(prev);
        next.set(devotionalId, {
          devotional_id: devotionalId,
          completed: newCompleted,
          favorited: existing?.favorited || false,
          completed_at: newCompleted ? new Date().toISOString() : null,
        });
        return next;
      });
    }
  }, [user, progress]);

  const toggleFavorite = useCallback(async (devotionalId: string) => {
    if (!user) return;
    const existing = progress.get(devotionalId);
    const newFavorited = !existing?.favorited;

    const { error } = await supabase
      .from("user_devotional_progress")
      .upsert({
        user_id: user.id,
        devotional_id: devotionalId,
        completed: existing?.completed || false,
        favorited: newFavorited,
        completed_at: existing?.completed_at || null,
      }, { onConflict: "user_id,devotional_id" });

    if (!error) {
      setProgress(prev => {
        const next = new Map(prev);
        next.set(devotionalId, {
          devotional_id: devotionalId,
          completed: existing?.completed || false,
          favorited: newFavorited,
          completed_at: existing?.completed_at || null,
        });
        return next;
      });
    }
  }, [user, progress]);

  const completedCount = Array.from(progress.values()).filter(p => p.completed).length;
  const nextEntry = entries.find(e => !progress.get(e.id)?.completed);

  return {
    entries,
    progress,
    loading,
    completedCount,
    totalCount: entries.length,
    nextEntry,
    toggleComplete,
    toggleFavorite,
    refetch: fetchProgress,
  };
}

export function useVerseOfDay() {
  const [verse, setVerse] = useState<{ book: string; chapter: number; verse: number; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      // Deterministic verse based on day of year
      const now = new Date();
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
      
      // Expanded curated list organized by spiritual themes for better personalization
      const thematicVerses = {
        hope: [
          { book: "Jeremias", chapter: 29, verse: 11 },
          { book: "Romanos", chapter: 8, verse: 28 },
          { book: "Salmos", chapter: 27, verse: 1 },
          { book: "Isaías", chapter: 41, verse: 10 },
          { book: "Salmos", chapter: 46, verse: 1 },
        ],
        identity: [
          { book: "2 Coríntios", chapter: 5, verse: 17 },
          { book: "Gálatas", chapter: 2, verse: 20 },
          { book: "Efésios", chapter: 2, verse: 8 },
          { book: "1 João", chapter: 4, verse: 19 },
          { book: "Salmos", chapter: 139, verse: 14 },
        ],
        promises: [
          { book: "João", chapter: 3, verse: 16 },
          { book: "Filipenses", chapter: 4, verse: 13 },
          { book: "Mateus", chapter: 11, verse: 28 },
          { book: "João", chapter: 14, verse: 6 },
          { book: "Mateus", chapter: 28, verse: 20 },
        ],
        wisdom: [
          { book: "Provérbios", chapter: 3, verse: 5 },
          { book: "Salmos", chapter: 119, verse: 105 },
          { book: "2 Timóteo", chapter: 3, verse: 16 },
          { book: "Hebreus", chapter: 11, verse: 1 },
          { book: "Salmos", chapter: 34, verse: 8 },
        ],
        christ: [
          { book: "João", chapter: 1, verse: 14 },
          { book: "Isaías", chapter: 53, verse: 5 },
          { book: "Colossenses", chapter: 3, verse: 23 },
          { book: "1 Coríntios", chapter: 13, verse: 4 },
          { book: "Romanos", chapter: 6, verse: 23 },
        ],
        foundation: [
          { book: "Gênesis", chapter: 1, verse: 1 },
          { book: "Salmos", chapter: 23, verse: 1 },
          { book: "Romanos", chapter: 5, verse: 8 },
          { book: "Romanos", chapter: 12, verse: 2 },
          { book: "Apocalipse", chapter: 21, verse: 4 },
        ]
      };

      // Combine all verses in a balanced rotation
      const allVerses = [
        ...thematicVerses.hope,
        ...thematicVerses.identity, 
        ...thematicVerses.promises,
        ...thematicVerses.wisdom,
        ...thematicVerses.christ,
        ...thematicVerses.foundation
      ];

      const pick = allVerses[dayOfYear % allVerses.length];

      const { data, error } = await supabase
        .from("bible_verses")
        .select("book, chapter, verse, text")
        .eq("book", pick.book)
        .eq("chapter", pick.chapter)
        .eq("verse", pick.verse)
        .eq("translation", "acf")
        .single();

      if (!error && data) {
        setVerse(data);
      }
      setLoading(false);
    };

    fetchVerse();
  }, []);

  return { verse, loading };
}

// Hook personalizado para versículo baseado nos padrões do usuário
export function usePersonalizedVerseOfDay() {
  const { verse: dailyVerse, loading: dailyLoading } = useVerseOfDay();
  const [personalizedVerse, setPersonalizedVerse] = useState<{ book: string; chapter: number; verse: number; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalizedVerse = async () => {
      // TODO: Em versões futuras, usar os padrões de estudo do usuário
      // Por agora, usar o versículo do dia padrão
      if (dailyVerse) {
        setPersonalizedVerse(dailyVerse);
      }
      setLoading(dailyLoading);
    };

    fetchPersonalizedVerse();
  }, [dailyVerse, dailyLoading]);

  return { verse: personalizedVerse, loading };
}
