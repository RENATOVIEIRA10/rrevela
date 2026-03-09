import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useLoginRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading || !user || location.pathname !== "/auth") return;

    const checkFirstAccess = async () => {
      setChecking(true);
      try {
        // Verificar se o profile foi criado nos últimos 30 segundos (primeiro acesso)
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;

          // Se criado há menos de 30 segundos, é primeiro acesso
          if (diffInSeconds < 30) {
            navigate("/", { replace: true });
          } else {
            navigate("/leitor", { replace: true });
          }
        } else {
          // Se não encontrou profile, vai para leitor (fallback)
          navigate("/leitor", { replace: true });
        }
      } catch (error) {
        // Em caso de erro, vai para leitor
        navigate("/leitor", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkFirstAccess();
  }, [user, loading, navigate, location.pathname]);

  return { checking };
};
