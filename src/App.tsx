import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./components/SplashScreen";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import WhatsNewModal from "./components/WhatsNewModal";
import MomentoRevela from "./components/MomentoRevela";
import OfflineBanner from "./components/OfflineBanner";
import InstallBanner from "./components/InstallBanner";
import BrandUpdateBanner from "./components/BrandUpdateBanner";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Reader from "./pages/Reader";
import RevelaAgora from "./pages/RevelaAgora";
import MinhaJornada from "./pages/MinhaJornada";
import LinhaPromessa from "./pages/LinhaPromessa";
import Devocional from "./pages/Devocional";
import PlanoLeitura from "./pages/PlanoLeitura";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";
import PublicVerse from "./pages/PublicVerse";
import PublicStudy from "./pages/PublicStudy";
import InstallPWA from "./pages/InstallPWA";
import Admin from "./pages/Admin";
import Perfil from "./pages/Perfil";
import BuscaAvancada from "./pages/BuscaAvancada";
import { useAdminCheck } from "./hooks/useAdminCheck";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AdminRoute = () => {
  const { isAdmin, loading, email, role } = useAdminCheck();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 space-y-3 text-center">
          <h1 className="text-xl font-semibold">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">Este painel é exclusivo para administradores.</p>
          <div className="rounded-md bg-muted p-3 text-left text-xs space-y-1">
            <p><strong>Email logado:</strong> {email ?? "não autenticado"}</p>
            <p><strong>Role atual:</strong> {role}</p>
          </div>
          <Button asChild><Link to="/leitor">Voltar ao leitor</Link></Button>
        </div>
      </div>
    );
  }
  return <Admin />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { shouldShowMomentoRevela, markCheckInComplete } = useDailyCheckIn();
  if (loading) return <div className="min-h-screen bg-background" />;
  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowMomentoRevela && user && (
          <MomentoRevela key="momento-revela" onContinue={markCheckInComplete} />
        )}
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/v/:book/:chapter/:verse" element={<PublicVerse />} />
        <Route path="/study/:book/:chapter" element={<PublicStudy />} />
        <Route path="/install" element={<InstallPWA />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/leitor" element={<Reader />} />
          <Route path="/revela" element={<RevelaAgora />} />
          <Route path="/busca" element={<BuscaAvancada />} />
          <Route path="/devocional" element={<Devocional />} />
          <Route path="/plano" element={<PlanoLeitura />} />
          <Route path="/promessa" element={<LinhaPromessa />} />
          <Route path="/jornada" element={<MinhaJornada />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* Banners globais */}
          <OfflineBanner />
          <InstallBanner />
          <BrandUpdateBanner />
          {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
          <PWAUpdatePrompt />
          <WhatsNewModal />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
