import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Reader from "./pages/Reader";
import RevelaAgora from "./pages/RevelaAgora";
import MinhaJornada from "./pages/MinhaJornada";
import LinhaPromessa from "./pages/LinhaPromessa";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background" />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/leitor" replace /> : <Onboarding />} />
      <Route path="/auth" element={user ? <Navigate to="/leitor" replace /> : <Auth />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/leitor" element={<Reader />} />
        <Route path="/revela" element={<RevelaAgora />} />
        <Route path="/promessa" element={<LinhaPromessa />} />
        <Route path="/jornada" element={<MinhaJornada />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
