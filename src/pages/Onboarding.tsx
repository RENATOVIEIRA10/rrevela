import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle top accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
      />

      <motion.div
        className="max-w-sm w-full flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <RevelaLogo size={44} className="text-primary" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-10 text-center space-y-3"
        >
          <h1 className="font-scripture text-[1.75rem] md:text-3xl font-semibold text-foreground leading-[1.3] tracking-tight">
            Entendimento aberto.
            <br />
            Olhar fixo em Cristo.
          </h1>
          <p className="text-[0.8125rem] text-muted-foreground leading-relaxed max-w-[280px] mx-auto font-ui">
            Estudo bíblico profundo, busca por linguagem natural e conexões teológicas.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-10 h-px bg-border my-8 origin-center"
        />

        {/* Scripture quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center space-y-2.5 max-w-[300px]"
        >
          <p className="font-scripture text-base md:text-lg leading-[1.8] text-foreground/75 italic">
            "Então lhes abriu o entendimento para compreenderem as Escrituras."
          </p>
          <cite className="block text-[0.65rem] text-muted-foreground font-ui not-italic tracking-[0.2em] uppercase font-medium">
            Lucas 24:45
          </cite>
        </motion.blockquote>

        {/* Commitment — subtle editorial card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-8 w-full notebook-page rounded-lg p-5 space-y-3"
        >
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground font-ui font-medium">
            Compromisso
          </p>
          <div className="space-y-1.5 text-[0.8125rem] text-foreground/75 font-scripture leading-[1.7]">
            <p>Sempre baseado na Bíblia.</p>
            <p>A Escritura interpretando a Escritura.</p>
            <p>Para onde a luz aponta: Cristo em cada página.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-10 w-full flex justify-center"
        >
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="w-full max-w-[280px] font-scripture text-[0.9375rem] tracking-wide h-12"
          >
            Entrar na Biblioteca
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom dot accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8"
      >
        <div className="w-1 h-1 rounded-full bg-primary/25" />
      </motion.div>
    </div>
  );
};

export default Onboarding;
