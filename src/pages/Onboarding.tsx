import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="max-w-md w-full text-center space-y-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <RevelaLogo size={48} className="text-primary" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="space-y-3"
        >
          <h1 className="font-scripture text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            Entendimento aberto.
            <br />
            Olhar fixo em Cristo.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Estudo bíblico profundo, busca por linguagem natural e conexões teológicas. Sem ruído. Sem distrações.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-10 h-px bg-border mx-auto"
        />

        {/* Scripture quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="space-y-2"
        >
          <p className="font-scripture text-base md:text-lg leading-relaxed text-foreground/80 italic">
            "Então lhes abriu o entendimento para compreenderem as Escrituras."
          </p>
          <cite className="block text-xs text-muted-foreground font-ui not-italic tracking-wide">
            Lucas 24:45
          </cite>
        </motion.blockquote>

        {/* Commitment card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="bg-card rounded border border-border p-5 space-y-2 text-left"
        >
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            Compromisso
          </p>
          <div className="space-y-1 text-sm text-foreground/80 font-scripture">
            <p>Sempre baseado na Bíblia.</p>
            <p>A Escritura interpretando a Escritura.</p>
            <p>Para onde a luz aponta: Cristo em cada página.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="w-full max-w-xs font-scripture text-base tracking-wide"
          >
            Entrar na Biblioteca
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
