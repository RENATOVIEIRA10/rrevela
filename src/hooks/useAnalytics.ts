import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AnalyticsEvent =
  | "user_signed_in"
  | "verse_read"
  | "verse_opened"
  | "chapter_read"
  | "revela_used"
  | "revela_search"
  | "question_asked"
  | "revela_verse"
  | "note_created"
  | "highlight_set"
  | "share_created"
  | "verse_shared"
  | "verse_pinned"
  | "promise_line_viewed"
  | "study_opened"
  | "revelation_mode";

export function useAnalytics() {
  const { user } = useAuth();

  const track = useCallback(
    async (eventType: AnalyticsEvent, eventData: Record<string, unknown> = {}) => {
      if (!user) return;
      try {
        const book = typeof eventData.book === "string" ? eventData.book : null;
        const chapter = typeof eventData.chapter === "number" ? eventData.chapter : null;
        const verse = typeof eventData.verse === "number" ? eventData.verse : null;

        await Promise.allSettled([
          supabase.from("analytics_events" as any).insert({
            user_id: user.id,
            event_type: eventType,
            event_data: eventData,
          }),
          supabase.from("app_events" as any).insert({
            user_id: user.id,
            event_type: eventType,
            book,
            chapter,
            verse,
            metadata: eventData,
          }),
        ]);
      } catch {
        // silent fail - analytics should never block UX
      }
    },
    [user]
  );

  return { track };
}
