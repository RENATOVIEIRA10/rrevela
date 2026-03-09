import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getPlanById, getCurrentDayNumber, type DayReading, type ReadingPlan } from "@/lib/reading-plans";

interface UserReadingProgress {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  completed_days: number[];
  created_at: string;
  updated_at: string;
}

export const useReadingPlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allProgress, isLoading } = useQuery({
    queryKey: ["reading_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("user_reading_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as UserReadingProgress[];
    },
    enabled: !!user,
  });

  const activeProgress = allProgress?.[0] ?? null;
  const activePlan: ReadingPlan | null = activeProgress
    ? getPlanById(activeProgress.plan_id) ?? null
    : null;
  const currentDay = activeProgress && activePlan
    ? getCurrentDayNumber(activeProgress.started_at, activePlan.totalDays)
    : 1;
  const todayReading: DayReading | null = activePlan
    ? activePlan.schedule[currentDay - 1] ?? null
    : null;
  const isTodayComplete = activeProgress?.completed_days?.includes(currentDay) ?? false;
  const completedCount = activeProgress?.completed_days?.length ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["reading_progress", user?.id] });

  const enrollMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any)
        .from("user_reading_progress")
        .upsert(
          { user_id: user.id, plan_id: planId, completed_days: [], started_at: new Date().toISOString() },
          { onConflict: "user_id,plan_id" }
        );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const markDayCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activeProgress) throw new Error("No active progress");
      const current = activeProgress.completed_days || [];
      const newCompleted = [...new Set([...current, currentDay])];
      const { error } = await (supabase as any)
        .from("user_reading_progress")
        .update({ completed_days: newCompleted })
        .eq("id", activeProgress.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const switchPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Not authenticated");
      if (activeProgress) {
        await (supabase as any)
          .from("user_reading_progress")
          .delete()
          .eq("id", activeProgress.id);
      }
      const { error } = await (supabase as any)
        .from("user_reading_progress")
        .insert({ user_id: user.id, plan_id: planId, completed_days: [], started_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    activeProgress,
    activePlan,
    currentDay,
    todayReading,
    isTodayComplete,
    completedCount,
    isLoading,
    enroll: enrollMutation.mutate,
    enrolling: enrollMutation.isPending,
    markDayComplete: markDayCompleteMutation.mutate,
    markingComplete: markDayCompleteMutation.isPending,
    switchPlan: switchPlanMutation.mutate,
    switching: switchPlanMutation.isPending,
  };
};
