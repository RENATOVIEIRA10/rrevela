import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type NoteType = "verse" | "chapter" | "theme";

export interface StructuredNote {
  id: string;
  type: NoteType;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  theme_label: string | null;
  observation: string;
  interpretation: string;
  christocentric: string;
  application: string;
  prayer: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(book?: string, chapter?: number, verse?: number | null) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StructuredNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user || !book) return;
    setLoading(true);
    let query = supabase
      .from("structured_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("book", book)
      .eq("chapter", chapter ?? 0)
      .order("created_at", { ascending: false });

    if (verse !== undefined && verse !== null) {
      query = query.eq("verse", verse);
    }

    const { data } = await query;
    setNotes((data as StructuredNote[]) ?? []);
    setLoading(false);
  }, [user, book, chapter, verse]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = async (note: Partial<StructuredNote> & { type: NoteType }) => {
    if (!user) return null;

    if (note.id) {
      const { id, created_at, updated_at, ...updates } = note as any;
      const { data, error } = await supabase
        .from("structured_notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? (data as StructuredNote) : n))
        );
      }
      return data as StructuredNote | null;
    } else {
      const { data, error } = await supabase
        .from("structured_notes")
        .insert({
          user_id: user.id,
          type: note.type,
          book: note.book ?? null,
          chapter: note.chapter ?? null,
          verse: note.verse ?? null,
          theme_label: note.theme_label ?? null,
          observation: note.observation ?? "",
          interpretation: note.interpretation ?? "",
          christocentric: note.christocentric ?? "",
          application: note.application ?? "",
          prayer: note.prayer ?? "",
        })
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) => [data as StructuredNote, ...prev]);
      }
      return data as StructuredNote | null;
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from("structured_notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, loading, saveNote, deleteNote, refetch: fetchNotes };
}
