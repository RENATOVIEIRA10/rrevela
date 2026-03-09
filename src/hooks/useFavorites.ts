import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAnalytics } from "./useAnalytics";

export interface FavoriteVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  created_at: string;
  text?: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("favorite_verses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch verse texts
      const withTexts = await Promise.all(
        data.map(async (fav) => {
          const { data: verseData } = await supabase
            .from("bible_verses")
            .select("text")
            .eq("book", fav.book)
            .eq("chapter", fav.chapter)
            .eq("verse", fav.verse)
            .eq("translation", fav.translation)
            .maybeSingle();
          return { ...fav, text: verseData?.text ?? "" } as FavoriteVerse;
        })
      );
      setFavorites(withTexts);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const isFavorite = useCallback(
    (book: string, chapter: number, verse: number) =>
      favorites.some((f) => f.book === book && f.chapter === chapter && f.verse === verse),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (book: string, chapter: number, verse: number, translation = "acf") => {
      if (!user) return;
      const existing = favorites.find(
        (f) => f.book === book && f.chapter === chapter && f.verse === verse
      );

      if (existing) {
        // Remove
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        await supabase.from("favorite_verses").delete().eq("id", existing.id);
        track("favorite_removed", { book, chapter, verse });
      } else {
        // Add optimistically
        const tempId = crypto.randomUUID();
        const newFav: FavoriteVerse = {
          id: tempId,
          book,
          chapter,
          verse,
          translation,
          created_at: new Date().toISOString(),
        };
        setFavorites((prev) => [newFav, ...prev]);
        await supabase.from("favorite_verses").insert({
          user_id: user.id,
          book,
          chapter,
          verse,
          translation,
        });
        track("favorite_added", { book, chapter, verse });
        // Refresh to get server id
        fetchFavorites();
      }
    },
    [user, favorites, track, fetchFavorites]
  );

  return { favorites, loading, isFavorite, toggleFavorite };
}
