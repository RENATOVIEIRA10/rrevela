import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import RevelaLogo from "@/components/RevelaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLoginRedirect } from "@/hooks/useLoginRedirect";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const { signIn, signUp } = useAuth();
  const { checking } = useLoginRedirect();
  const { toast } = useToast();

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("access_denied") || msg.includes("cancelled") || msg.includes("popup_closed")) {
          toast({ title: "Login cancelado", description: "Você pode tentar novamente quando quiser." });
        } else if (msg.includes("already registered") || msg.includes("email")) {
          toast({ title: "Email já cadastrado", description: "Tente entrar com outro método usando o mesmo email.", variant: "destructive" });
        } else {
          toast({ title: "Erro ao entrar", description: "Algo deu errado. Tente novamente em alguns instantes.", variant: "destructive" });
        }
        return;
      }
    } catch {
      toast({ title: "Erro inesperado", description: "Não foi possível conectar. Verifique sua internet.", variant: "destructive" });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    if (!isLogin) {
      toast({ title: "Verifique seu email", description: "Enviamos um link de confirmação para o seu email." });
    }
  };

  const isBusy = loading || !!socialLoading || checking;

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle warm radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <motion.div
        className="max-w-[360px] w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        {/* Header — editorial, contemplative */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5">
            <RevelaLogo size={28} color="hsl(var(--primary))" />
          </div>
          <h1 className="font-scripture text-[1.75rem] font-semibold text-foreground tracking-tight leading-tight">
            Revela
          </h1>
          <p className="text-[0.8125rem] text-muted-foreground mt-2 leading-relaxed max-w-[280px] mx-auto">
            {isLogin
              ? "Entre para continuar sua jornada com a Palavra."
              : "Crie sua conta e comece a estudar a Escritura."}
          </p>
        </motion.div>

        {/* Social login — premium buttons */}
        <motion.div
          className="space-y-2.5 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialLogin("google")}
            className="w-full h-12 rounded-lg border border-border bg-card hover:bg-secondary/60 flex items-center justify-center gap-3 text-[0.8125rem] font-medium text-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            {socialLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continuar com Google
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialLogin("apple")}
            className="w-full h-12 rounded-lg border border-border bg-card hover:bg-secondary/60 flex items-center justify-center gap-3 text-[0.8125rem] font-medium text-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            {socialLoading === "apple" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AppleIcon />}
            Continuar com Apple
          </button>
        </motion.div>

        {/* Divider — editorial */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 editorial-divider" />
          <span className="text-[0.6875rem] text-muted-foreground/60 uppercase tracking-[0.15em] font-medium select-none">
            ou com email
          </span>
          <div className="flex-1 editorial-divider" />
        </div>

        {/* Email form — refined, minimal */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground/50" />
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 bg-card/80 border-border/70 text-[0.875rem] placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/10 transition-colors"
              required
              disabled={isBusy}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground/50" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 bg-card/80 border-border/70 text-[0.875rem] placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/10 transition-colors"
              required
              minLength={6}
              disabled={isBusy}
            />
          </div>

          <Button
            type="submit"
            disabled={isBusy}
            className="w-full h-11 font-scripture text-[0.9375rem] tracking-wide mt-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </motion.form>

        {/* Toggle — subtle, elegant */}
        <motion.p
          className="text-center text-[0.8125rem] text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary/60"
            disabled={isBusy}
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </motion.p>

        {/* Scripture quote — editorial touch */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <p className="font-scripture text-[0.8125rem] text-muted-foreground/50 italic leading-relaxed">
            "Então lhes abriu o entendimento para compreenderem as Escrituras."
          </p>
          <p className="text-[0.6875rem] text-muted-foreground/35 mt-1.5 tracking-wide">
            Lucas 24:45
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
