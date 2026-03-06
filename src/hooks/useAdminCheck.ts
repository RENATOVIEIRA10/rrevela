import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ADMIN_EMAIL_ALLOWLIST = new Set(["renatovieiraaurelio@gmail.com"]);

export function useAdminCheck() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const userEmail = user.email?.toLowerCase() ?? "";
      if (ADMIN_EMAIL_ALLOWLIST.has(userEmail)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
