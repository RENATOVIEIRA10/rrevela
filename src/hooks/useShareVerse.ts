import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAnalytics } from "./useAnalytics";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface ShareParams {
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  includeReveal?: boolean;
  revealText?: string;
}

function buildPublicLink(book: string, chapter: number, verse: number) {
  const slug = encodeURIComponent(book);
  return `${window.location.origin}/v/${slug}/${chapter}/${verse}`;
}

async function generateInsight(params: ShareParams, userId?: string): Promise<string> {
  // If user provided explicit reveal text, use it
  if (params.revealText?.trim()) {
    const text = params.revealText.trim();
    return text.length > 300 ? text.slice(0, 297) + "…" : text;
  }

  // 1. Try user's structured note (christocentric + application)
  if (userId) {
    const { data: notes } = await supabase
      .from("structured_notes")
      .select("christocentric, application")
      .eq("user_id", userId)
      .eq("book", params.book)
      .eq("chapter", params.chapter)
      .eq("verse", params.verse)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (notes && notes.length > 0) {
      const note = notes[0];
      const parts: string[] = [];
      if (note.christocentric?.trim()) parts.push(note.christocentric.trim());
      if (note.application?.trim()) parts.push(note.application.trim());
      if (parts.length > 0) {
        const combined = parts.join(" ");
        return combined.length > 300 ? combined.slice(0, 297) + "…" : combined;
      }
    }
  }

  // 2. Fallback: descriptive phrase based on text
  const text = params.verseText;
  if (text.length > 80) {
    return `O texto destaca: "${text.slice(0, 80).trim()}…"`;
  }
  return `O verso apresenta uma verdade central da Escritura.`;
}

function buildShareText(params: ShareParams, insight: string, includeReveal: boolean): string {
  const link = buildPublicLink(params.book, params.chapter, params.verse);
  
  if (includeReveal) {
    return `${params.book} ${params.chapter}:${params.verse} (Almeida)\n"${params.verseText}"\n\nRevela: ${insight}\n\n🔎 Ver no Revela: ${link}`;
  }
  
  return `${params.book} ${params.chapter}:${params.verse} (Almeida)\n"${params.verseText}"\n\n🔎 Ver no Revela: ${link}`;
}

export function useShareVerse() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const shareVerse = useCallback(async (params: ShareParams, method: "copy" | "whatsapp" | "native") => {
    const includeReveal = params.includeReveal ?? true;
    const insight = includeReveal ? await generateInsight(params, user?.id) : "";
    const shareText = buildShareText(params, insight, includeReveal);

    // Save to shared_verses
    if (user) {
      supabase.from("shared_verses").insert({
        user_id: user.id,
        book: params.book,
        chapter: params.chapter,
        verse: params.verse,
        share_text: shareText,
        insight_text: insight,
      }).then(() => {});
      track("verse_shared", { book: params.book, chapter: params.chapter, verse: params.verse, method, includeReveal });
      track("share_created", { book: params.book, chapter: params.chapter, verse: params.verse, method });
    }

    if (method === "native" && navigator.share) {
      try {
        await navigator.share({
          title: `${params.book} ${params.chapter}:${params.verse} — Revela`,
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or not supported, fall through
      }
    }

    if (method === "whatsapp") {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(url, "_blank");
      return;
    }

    // Copy
    try {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copiado!", description: "Versículo copiado para a área de transferência." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  }, [user]);

  return { shareVerse };
}
