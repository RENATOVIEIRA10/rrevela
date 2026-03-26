import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, CheckCircle, ArrowLeft, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import RevelaLogo from "@/components/RevelaLogo";

const ease = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  "Versículo do dia no WhatsApp todo manhã",
  "Leia qualquer capítulo da Bíblia pelo WhatsApp",
  "Planos de leitura com envio diário automático",
  "Pesquise versículos por tema ou referência",
  "Salve favoritos sincronizados com o app",
  "Sem abrir o app — tudo pelo WhatsApp",
];

const Pro = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"mensal" | "anual">("mensal");

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      // Chama edge function que cria sessão Stripe Checkout
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan, user_id: user.id, email: user.email },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || "Erro ao iniciar pagamento");
      }
      // Redireciona para o Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      toast({
        title: "Erro ao processar pagamento",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-safe pt-5 pb-4 border-b border-border/40">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <RevelaLogo size={18} variant="wine" />
          <span className="font-scripture text-sm font-medium text-foreground/80">Revela Pro</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto px-5 py-8 space-y-8">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="font-scripture text-2xl font-semibold text-foreground">
                A Bíblia no seu WhatsApp
              </h1>
              <p className="text-sm text-muted-foreground font-ui mt-2 leading-relaxed">
                Com o Revela Pro, sua jornada com a Palavra acontece onde você já está — no WhatsApp.
              </p>
            </div>
          </motion.div>

          {/* Plano toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            className="bg-secondary/40 rounded-xl p-1 flex gap-1"
          >
            {(["mensal", "anual"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-ui font-medium transition-all ${
                  plan === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {p === "mensal" ? "Mensal" : (
                  <span className="flex items-center justify-center gap-1">
                    Anual
                    <span className="text-[9px] text-accent font-semibold bg-accent/10 px-1 py-0.5 rounded">-32%</span>
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Preço */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="text-center"
          >
            {plan === "mensal" ? (
              <div>
                <span className="font-scripture text-4xl font-bold text-foreground">R$ 9,90</span>
                <span className="text-sm text-muted-foreground font-ui">/mês</span>
              </div>
            ) : (
              <div>
                <div className="text-sm text-muted-foreground font-ui line-through mb-0.5">R$ 118,80/ano</div>
                <span className="font-scripture text-4xl font-bold text-foreground">R$ 79,90</span>
                <span className="text-sm text-muted-foreground font-ui">/ano</span>
                <p className="text-xs text-accent font-ui font-medium mt-1">≈ R$ 6,66/mês — economize R$ 38,90</p>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
            className="space-y-3"
          >
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80 font-ui leading-snug">{f}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
            className="space-y-3"
          >
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              size="lg"
              className="w-full h-12 font-scripture text-base rounded-xl gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Assinar Revela Pro
                </>
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground/60 font-ui leading-relaxed">
              Pagamento seguro via cartão ou PIX. Cancele quando quiser.
            </p>
          </motion.div>

          {/* Versículo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center pt-4 border-t border-border/30"
          >
            <p className="font-scripture text-xs text-muted-foreground/50 italic leading-relaxed">
              "Não se afaste este Livro da Lei da tua boca; fala nele dia e noite."
            </p>
            <p className="text-[0.6rem] text-muted-foreground/35 font-ui mt-1.5 tracking-wide">Josué 1:8</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Pro;
