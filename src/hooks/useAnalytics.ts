import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AnalyticsEvent =
  | "verse_read"
  | "chapter_read"
  | "revela_search"
  | "revela_verse"
  | "note_created"
  | "highlight_set"
  | "verse_shared"
  | "verse_pinned"
  | "promise_line_viewed"
  | "revelation_mode";

export function useAnalytics() {
  const { user } = useAuth();

  const track = useCallback(
    async (eventType: AnalyticsEvent, eventData: Record<string, unknown> = {}) => {
      if (!user) return;
      try {
        await supabase.from("analytics_events" as any).insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
        });
      } catch {
        // silent fail - analytics should never block UX
      }
    },
    [user]
  );

  return { track };
}
