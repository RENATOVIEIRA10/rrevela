import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, PenLine, Share2, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";
import { markOnboardingComplete, hasCompletedOnboarding } from "@/lib/app-version";
import { supabase } from "@/integrations/supabase/client";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const SLIDES = [
  {
    icon: BookOpen,
    emoji: "📖",
    title: "A Palavra de Deus sempre à mão",
    description: "Acesse a Bíblia completa com múltiplas traduções, busca inteligente e leitura offline.",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "Descubra revelações fundamentadas",
    description: "O Revela conecta passagens, revela padrões e mostra Cristo em cada página das Escrituras.",
  },
  {
    icon: PenLine,
    emoji: "✍️",
    title: "Anote e construa sua jornada",
    description: "Destaque versículos, faça anotações estruturadas e acompanhe seu crescimento espiritual.",
  },
  {
    icon: Share2,
    emoji: "📤",
    title: "Compartilhe com facilidade",
    description: "Crie imagens bonitas dos versículos e estudos para compartilhar nas redes sociais.",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Revela Pro — a Bíblia no seu WhatsApp",
    description: "Assine o Revela Pro e receba o versículo do dia, leia capítulos e siga planos de leitura direto pelo WhatsApp. Sem abrir o app.",
    isPro: true,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (hasCompletedOnboarding()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate("/home", { replace: true });
          return;
        }
        navigate("/auth", { replace: true });
        return;
      }
      setChecking(false);
    };
    checkSession();
  }, [navigate]);

  const isLastSlide = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  const handleNext = () => {
    if (isLastSlide) {
      markOnboardingComplete();
      navigate("/auth");
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingComplete();
    navigate("/auth");
  };

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
      />

      {!isLastSlide && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkip}
          className="absolute top-6 right-6 text-xs text-muted-foreground font-ui hover:text-foreground transition-colors z-10"
        >
          Pular
        </motion.button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease }}
              className="mb-10"
            >
              <RevelaLogo size={40} className="text-primary" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease }}
            className="max-w-sm w-full text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${
                slide.isPro
                  ? "bg-accent/15 border-accent/30"
                  : "bg-accent/8 border-accent/10"
              }`}>
                <span className="text-4xl">{slide.emoji}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className={`font-scripture text-xl font-semibold leading-snug ${
                slide.isPro ? "text-accent" : "text-foreground"
              }`}>
                {slide.title}
              </h2>
              <p className="text-sm text-muted-foreground font-ui leading-relaxed max-w-[280px] mx-auto">
                {slide.description}
              </p>
              {slide.isPro && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-ui font-medium text-accent">
                  ✦ Recurso exclusivo Pro
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-10 space-y-6">
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 6, opacity: i === step ? 1 : 0.3 }}
              transition={{ duration: 0.3, ease }}
              className={`h-1.5 rounded-full ${i === SLIDES.length - 1 ? "bg-accent" : "bg-accent"}`}
            />
          ))}
        </div>

        <div className="space-y-2.5 max-w-[320px] mx-auto w-full">
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full flex font-scripture text-sm h-12 rounded-xl gap-2"
          >
            {isLastSlide ? (
              "Começar gratuitamente"
            ) : (
              <>
                Continuar
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {isLastSlide && (
            <button
              onClick={() => { markOnboardingComplete(); navigate("/auth"); }}
              className="w-full text-xs text-muted-foreground font-ui hover:text-foreground transition-colors py-1"
            >
              Já tenho conta — entrar
            </button>
          )}
        </div>

        {step === 0 && (
          <motion.blockquote
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center pt-2"
          >
            <p className="accent-border font-scripture text-xs leading-relaxed text-foreground/50 italic text-left">
              "Então lhes abriu o entendimento para compreenderem as Escrituras."
            </p>
            <cite className="block text-[0.6rem] text-muted-foreground/60 font-ui not-italic tracking-widest uppercase mt-1">
              Lucas 24:45
            </cite>
          </motion.blockquote>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2"
      >
        <div className="w-1 h-1 rounded-full bg-primary/20" />
      </motion.div>
    </div>
  );
};

export default Onboarding;
