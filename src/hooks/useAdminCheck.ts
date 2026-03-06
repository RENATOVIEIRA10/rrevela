import { useAuth } from "./useAuth";

export function useAdminCheck() {
  const { user, role, loading } = useAuth();
  const isAdmin = !!user && role === "admin";

  return {
    isAdmin,
    loading,
    role: role ?? "user",
    email: user?.email ?? null,
  };
}
