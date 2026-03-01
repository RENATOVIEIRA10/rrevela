import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Cross, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Estou com medo do futuro",
  "Quero desistir",
  "Tenho culpa",
  "Estou cansado",
  "Preciso de esperança",
  "Como perdoar?",
];

const RevelaAgora = () => {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollHeader />

      <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="search-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-accent" strokeWidth={1.5} />
                </div>
                <h2 className="font-scripture text-xl font-semibold text-foreground">
                  Revela Agora
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Escreva sua dúvida, sentimento ou pergunta. A Palavra revela.
                </p>
              </div>

              {/* Search input */}
              <div className="w-full max-w-md relative">
                <Input
                  placeholder="Escreva sua dúvida…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pr-10 bg-card border-border font-scripture text-base h-12 shadow-soft"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => { setQuery(s); }}
                    className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search-result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-8"
            >
              {/* Back to search */}
              <button
                onClick={() => { setHasSearched(false); setQuery(""); }}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                ← Nova busca
              </button>

              <div className="bg-card rounded-xl p-5 shadow-soft space-y-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Sua busca
                </p>
                <p className="font-scripture text-lg text-foreground italic">"{query}"</p>
              </div>

              {/* Placeholder response structure */}
              <div className="space-y-4">
                <ResultSection
                  icon={<BookOpen className="w-4 h-4" />}
                  title="Tema detectado"
                  content="Ansiedade e confiança em Deus"
                />
                <ResultSection
                  icon={<BookOpen className="w-4 h-4" />}
                  title="Passagens bíblicas"
                  content={
                    <div className="space-y-3">
                      <VerseCard reference="Filipenses 4:6-7" text="Não andeis ansiosos de coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças." />
                      <VerseCard reference="Salmos 55:22" text="Lança o teu cuidado sobre o Senhor, e ele te susterá; não permitirá jamais que o justo seja abalado." />
                      <VerseCard reference="1 Pedro 5:7" text="Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós." />
                    </div>
                  }
                />
                <ResultSection
                  icon={<Cross className="w-4 h-4" />}
                  title="Conexão cristocêntrica"
                  content="Cristo mesmo enfrentou angústia no Getsêmani (Mt 26:38), mas entregou-se inteiramente à vontade do Pai — modelo para nossa confiança."
                />
                <ResultSection
                  icon={<Heart className="w-4 h-4" />}
                  title="Aplicação"
                  content="A Escritura convida a lançar sobre Deus aquilo que pesa. Não como fórmula, mas como confiança: Ele sustenta."
                />
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4">
                Todas as respostas são fundamentadas exclusivamente na Escritura.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ScrollHeader = () => (
  <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
    <h1 className="font-scripture text-base font-semibold text-foreground text-center">
      Revela Agora
    </h1>
  </div>
);

const ResultSection = ({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <div className="flex items-center gap-2 text-accent">
      {icon}
      <span className="text-xs uppercase tracking-widest font-medium">{title}</span>
    </div>
    <div className="text-sm text-foreground/85 leading-relaxed font-scripture pl-6">
      {typeof content === "string" ? <p>{content}</p> : content}
    </div>
  </motion.div>
);

const VerseCard = ({ reference, text }: { reference: string; text: string }) => (
  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
    <p className="text-xs font-ui font-semibold text-accent">{reference}</p>
    <p className="font-scripture text-sm text-foreground/85 italic">{text}</p>
  </div>
);

export default RevelaAgora;
