import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="max-w-lg w-full text-center space-y-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Scripture quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-3"
        >
          <p className="font-scripture text-xl md:text-2xl leading-relaxed text-foreground italic">
            "Então lhes abriu o entendimento para compreenderem as Escrituras."
          </p>
          <cite className="block text-sm text-muted-foreground font-ui not-italic tracking-wide">
            — Lucas 24:45
          </cite>
        </motion.blockquote>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-12 h-px bg-border mx-auto"
        />

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-2xl md:text-3xl font-scripture font-semibold text-foreground">
            Revela
          </h1>

          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>Uma ferramenta pessoal para:</p>
            <ul className="space-y-2 text-left max-w-xs mx-auto">
              {[
                "Estudar a Palavra com profundidade",
                "Buscar respostas fundamentadas na Escritura",
                "Registrar sua jornada espiritual",
                "Enxergar Cristo nas Escrituras",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Commitment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="bg-card rounded-xl p-5 shadow-soft space-y-2"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Nosso compromisso
          </p>
          <div className="space-y-1 text-sm text-foreground/80">
            <p>Sempre baseado na Bíblia.</p>
            <p>Nunca opinião pessoal.</p>
            <p>Nunca revelação fora do texto.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/leitor")}
            size="lg"
            className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 font-scripture text-base tracking-wide"
          >
            Abrir a Palavra
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
