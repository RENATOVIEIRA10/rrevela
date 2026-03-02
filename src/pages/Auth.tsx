import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import RevelaLogo from "@/components/RevelaLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!isLogin) {
      toast({
        title: "Verifique seu email",
        description: "Enviamos um link de confirmação para o seu email.",
      });
      return;
    }

    navigate("/leitor");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="max-w-sm w-full space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <RevelaLogo size={32} color="hsl(var(--accent))" />
          </div>
          <h1 className="font-scripture text-2xl font-semibold text-foreground">Revela</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Entre para continuar sua jornada." : "Crie sua conta para começar."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 bg-card border-border h-11"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 bg-card border-border h-11"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-scripture text-base h-11"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent hover:underline font-medium"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
