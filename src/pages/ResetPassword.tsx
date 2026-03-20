import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RevelaLogo from "@/components/RevelaLogo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Supabase insere o token na URL como hash — precisa estar autenticado via magic link
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Usuário chegou via link de reset — pode redefinir
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "A senha precisa ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao redefinir", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/home", { replace: true }), 2500);
  };

  const ease = [0.22, 1, 0.36, 1] as const;

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-scripture text-xl font-semibold">Senha redefinida!</h2>
          <p className="text-sm text-muted-foreground font-ui">Redirecionando para o app...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <motion.div
        className="max-w-[360px] w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-5">
            <RevelaLogo size={28} color="hsl(var(--primary))" />
          </div>
          <h1 className="font-scripture text-[1.5rem] font-semibold text-foreground">
            Nova senha
          </h1>
          <p className="text-[0.8125rem] text-muted-foreground mt-2">
            Escolha uma senha segura para sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground/50" />
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 bg-card/80 border-border/70 text-[0.875rem] placeholder:text-muted-foreground/40"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-muted-foreground/50" />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-10 h-11 bg-card/80 border-border/70 text-[0.875rem] placeholder:text-muted-foreground/40"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 font-scripture text-[0.9375rem] mt-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar nova senha"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
