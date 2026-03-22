import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface FavoriteTagLink {
  favorite_id: string;
  tag_id: string;
}

const TAG_COLORS = [
  "#c4a882", "#e8b4b8", "#a8c8a6", "#8bb8d0", "#d4a8d0",
  "#d4c878", "#e8a87c", "#9cb8b8", "#c8a8e0", "#b8c888",
];

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [links, setLinks] = useState<FavoriteTagLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const [tagsRes, linksRes] = await Promise.all([
      supabase
        .from("favorite_tags")
        .select("*")
        .eq("user_id", user.id)
        .order("name"),
      supabase
        .from("favorite_verse_tags")
        .select("favorite_id, tag_id"),
    ]);

    setTags((tagsRes.data as Tag[]) ?? []);
    setLinks((linksRes.data as FavoriteTagLink[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createTag = useCallback(async (name: string) => {
    if (!user || !name.trim()) return;
    const color = TAG_COLORS[tags.length % TAG_COLORS.length];
    const { data } = await supabase
      .from("favorite_tags")
      .insert({ user_id: user.id, name: name.trim(), color })
      .select()
      .single();
    if (data) setTags((prev) => [...prev, data as Tag]);
    return data as Tag | undefined;
  }, [user, tags.length]);

  const deleteTag = useCallback(async (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setLinks((prev) => prev.filter((l) => l.tag_id !== tagId));
    await supabase.from("favorite_tags").delete().eq("id", tagId);
  }, []);

  const assignTag = useCallback(async (favoriteId: string, tagId: string) => {
    const exists = links.some((l) => l.favorite_id === favoriteId && l.tag_id === tagId);
    if (exists) return;
    setLinks((prev) => [...prev, { favorite_id: favoriteId, tag_id: tagId }]);
    await supabase.from("favorite_verse_tags").insert({ favorite_id: favoriteId, tag_id: tagId });
  }, [links]);

  const removeTag = useCallback(async (favoriteId: string, tagId: string) => {
    setLinks((prev) => prev.filter((l) => !(l.favorite_id === favoriteId && l.tag_id === tagId)));
    await supabase
      .from("favorite_verse_tags")
      .delete()
      .eq("favorite_id", favoriteId)
      .eq("tag_id", tagId);
  }, []);

  const getTagsForFavorite = useCallback(
    (favoriteId: string) => {
      const tagIds = links.filter((l) => l.favorite_id === favoriteId).map((l) => l.tag_id);
      return tags.filter((t) => tagIds.includes(t.id));
    },
    [tags, links]
  );

  const getFavoritesForTag = useCallback(
    (tagId: string) => links.filter((l) => l.tag_id === tagId).map((l) => l.favorite_id),
    [links]
  );

  return {
    tags, loading, createTag, deleteTag,
    assignTag, removeTag, getTagsForFavorite, getFavoritesForTag,
    TAG_COLORS,
  };
}
