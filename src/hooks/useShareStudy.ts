import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAnalytics } from "./useAnalytics";
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export type StudyMode = "essencial" | "intermediario" | "profundo" | "messianica" | "padroes" | "harmonia";

interface ShareStudyParams {
  book: string;
  chapter: number;
  mode: StudyMode;
  title: string;
  summary: string;
  insightText: string;
}

function buildStudyLink(book: string, chapter: number, mode: StudyMode) {
  const slug = encodeURIComponent(book);
  return `${window.location.origin}/study/${slug}/${chapter}?mode=${mode}`;
}

function buildStudyShareText(params: ShareStudyParams): string {
  const link = buildStudyLink(params.book, params.chapter, params.mode);
  const insight = params.insightText.length > 300
    ? params.insightText.slice(0, 297) + "…"
    : params.insightText;

  return `Estudo de ${params.book} ${params.chapter} no Revela\n\n${params.summary}\n\nTrecho do estudo: ${insight}\n\n📖 Ver estudo no Revela: ${link}`;
}

export function useShareStudy() {
  const { user } = useAuth();
  const { track } = useAnalytics();

  const shareStudy = useCallback(async (params: ShareStudyParams, method: "copy" | "whatsapp" | "native") => {
    const shareText = buildStudyShareText(params);

    // Save to shared_studies
    if (user) {
      supabase.from("shared_studies" as any).insert({
        user_id: user.id,
        book: params.book,
        chapter: params.chapter,
        mode: params.mode,
        share_type: "study",
        share_text: shareText,
        insight_text: params.insightText,
        title: params.title,
      }).then(() => {});
      track("share_created", { book: params.book, chapter: params.chapter, mode: params.mode, type: "study", method });
    }

    if (method === "native" && navigator.share) {
      try {
        await navigator.share({
          title: `${params.title} — Revela`,
          text: shareText,
        });
        return;
      } catch {
        // User cancelled
      }
    }

    if (method === "whatsapp") {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(url, "_blank");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copiado!", description: "Estudo copiado para a área de transferência." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  }, [user]);

  return { shareStudy };
}
