import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppUserRole = "admin" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppUserRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FORCED_ADMIN_EMAIL = "renatovieiraaurelio@gmail.com";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppUserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "user"]);

    if (!data || data.length === 0) {
      setRole("user");
      return;
    }

    const hasAdmin = data.some((entry) => entry.role === "admin");
    setRole(hasAdmin ? "admin" : "user");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      loadRole(session.user.id).finally(() => setLoading(false));
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      await loadRole(session.user.id);
      await loadRole(session.user.id, session.user.email);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const payload = {
        user_id: data.user.id,
        event_type: "user_signed_in",
      };

      Promise.allSettled([
        supabase.from("analytics_events").insert({
          ...payload,
          event_data: { email: data.user.email ?? "" },
        }),
        supabase.from("app_events" as any).insert({
          ...payload,
          metadata: { email: data.user.email ?? "" },
        }),
      ]).then(() => {});
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
