import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

const DAILY_CHECKIN_KEY = "revela_daily_checkin";

interface DailyCheckInState {
  lastCheckIn: string | null;
  hasCheckedInToday: boolean;
}

export function useDailyCheckIn() {
  const { user } = useAuth();
  const [state, setState] = useState<DailyCheckInState>({
    lastCheckIn: null,
    hasCheckedInToday: false,
  });

  useEffect(() => {
    if (!user) {
      setState({ lastCheckIn: null, hasCheckedInToday: false });
      return;
    }

    const storageKey = `${DAILY_CHECKIN_KEY}_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const lastCheckIn = stored;
      const today = new Date().toDateString();
      const lastCheckInDate = new Date(lastCheckIn).toDateString();
      
      setState({
        lastCheckIn,
        hasCheckedInToday: today === lastCheckInDate,
      });
    } else {
      setState({
        lastCheckIn: null,
        hasCheckedInToday: false,
      });
    }
  }, [user]);

  const markCheckInComplete = () => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const storageKey = `${DAILY_CHECKIN_KEY}_${user.id}`;
    
    localStorage.setItem(storageKey, now);
    setState({
      lastCheckIn: now,
      hasCheckedInToday: true,
    });
  };

  const shouldShowMomentoRevela = user && !state.hasCheckedInToday;

  return {
    shouldShowMomentoRevela,
    hasCheckedInToday: state.hasCheckedInToday,
    lastCheckIn: state.lastCheckIn,
    markCheckInComplete,
  };
}