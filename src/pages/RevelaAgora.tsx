import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Cross, Heart, Loader2, Anchor, ArrowRight, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import ShareMenu from "@/components/ShareMenu";
import { CONNECTION_TYPE_LABELS, type ConnectionType } from "@/lib/christocentric-index";
import ReferenceChip from "@/components/ReferenceChip";
import RichText from "@/components/RichText";
import { parseReferences } from "@/lib/reference-parser";

const SUGGESTIONS = [
  "Estou com medo do futuro",
  "Quero desistir",
  "Tenho culpa",
  "Estou cansado",
  "Preciso de esperança",
  "Onde encontrar Jesus em Gênesis?",
];

interface Passage {
  reference: string;
  text: string;
  why: string;
}

interface AnchorData {
  category: string;
  at_reference: string;
  at_summary: string;
  nt_references: string[];
  nt_summary: string;
  connection_type: ConnectionType;
}

interface RevelaResponse {
  intent: string;
  theme: string;
  passages: Passage[];
  context: string;
  christocentric_connection: string;
  application: string;
  anchors: AnchorData[];
  error?: string;
  raw?: string;
}

const RevelaAgora = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<RevelaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { track } = useAnalytics();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("revela-agora", {
        body: { query: query.trim() },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      setResponse(data as RevelaResponse);
      track("revela_search", { query: query.trim() });
      track("revela_used", { query: query.trim() });
      track("question_asked", { query: query.trim() });
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e?.message || "Não foi possível buscar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollHeader />

      <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {!response && !loading ? (
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

              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full space-y-4"
            >
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground font-scripture">
                Buscando na Palavra…
              </p>
            </motion.div>
          ) : response ? (
            <motion.div
              key="search-result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-8"
            >
              <button
                onClick={() => { setResponse(null); setQuery(""); }}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                ← Nova busca
              </button>

              <div className="bg-card rounded-xl p-5 shadow-soft space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Sua busca
                </p>
                <p className="font-scripture text-lg text-foreground italic">"{query}"</p>
                {response.intent && (
                  <span className="inline-block text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {response.intent === "EMOCIONAL" && "Emocional / Prática"}
                    {response.intent === "DOUTRINARIA" && "Doutrinária"}
                    {response.intent === "CRISTOCENTRICA" && "Cristocêntrica"}
                    {response.intent === "REFERENCIA" && "Referência direta"}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {response.theme && (
                  <ResultSection
                    icon={<BookOpen className="w-4 h-4" />}
                    title="Tema detectado"
                    content={<RichText text={response.theme} />}
                  />
                )}

                {response.passages?.length > 0 && (
                  <ResultSection
                    icon={<BookOpen className="w-4 h-4" />}
                    title="Passagens bíblicas"
                    content={
                      <div className="space-y-3">
                        {response.passages.map((p, i) => (
                          <VerseCard
                            key={i}
                            reference={p.reference}
                            text={p.text}
                            why={p.why}
                          />
                        ))}
                      </div>
                    }
                  />
                )}

                {response.context && (
                  <ResultSection
                    icon={<BookOpen className="w-4 h-4" />}
                    title="Contexto"
                    content={<RichText text={response.context} />}
                  />
                )}

                {response.christocentric_connection && (
                  <ResultSection
                    icon={<Cross className="w-4 h-4" />}
                    title="Conexão cristocêntrica"
                    content={<RichText text={response.christocentric_connection} />}
                  />
                )}

                {response.anchors?.length > 0 && (
                  <ResultSection
                    icon={<Anchor className="w-4 h-4" />}
                    title="Âncoras cristocêntricas"
                    content={
                      <div className="space-y-4">
                        {response.anchors.map((a, i) => (
                          <AnchorCard key={i} anchor={a} />
                        ))}
                      </div>
                    }
                  />
                )}

                {response.application && (
                  <ResultSection
                    icon={<Heart className="w-4 h-4" />}
                    title="Aplicação"
                    content={<RichText text={response.application} />}
                  />
                )}
              </div>

              <RevelaShareSection query={query} response={response} />

              <p className="text-xs text-muted-foreground text-center pt-4">
                Todas as respostas são fundamentadas exclusivamente na Escritura.
              </p>
            </motion.div>
          ) : null}
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
      {content}
    </div>
  </motion.div>
);

const VerseCard = ({ reference, text, why }: { reference: string; text: string; why?: string }) => {
  const parsed = parseReferences(reference);
  return (
    <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
      {parsed.length > 0 ? (
        <ReferenceChip reference={parsed[0]} label={reference} />
      ) : (
        <p className="text-xs font-ui font-semibold text-accent">{reference}</p>
      )}
      <p className="font-scripture text-sm text-foreground/85 italic">{text}</p>
      {why && (
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Por que este texto:</span> {why}
        </p>
      )}
    </div>
  );
};

const AnchorCard = ({ anchor }: { anchor: AnchorData }) => {
  const connLabel = CONNECTION_TYPE_LABELS[anchor.connection_type];

  const renderRef = (refStr: string) => {
    const parsed = parseReferences(refStr);
    if (parsed.length > 0) {
      return <ReferenceChip reference={parsed[0]} label={refStr} />;
    }
    return <span className="text-xs font-ui font-semibold text-accent">{refStr}</span>;
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-scripture text-sm font-semibold text-foreground">{anchor.category}</h4>
        {connLabel && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            connLabel.strength === "forte"
              ? "bg-accent/15 text-accent"
              : connLabel.strength === "média"
              ? "bg-secondary text-foreground/70"
              : "bg-secondary/50 text-muted-foreground"
          }`}>
            {connLabel.label}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {renderRef(anchor.at_reference)}
        <RichText text={anchor.at_summary} className="text-sm text-foreground/80 font-scripture" />
      </div>

      <div className="flex items-center gap-1 text-muted-foreground">
        <ArrowRight className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest">Conexão NT</span>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap gap-1">
          {anchor.nt_references?.map((ref, i) => (
            <span key={i}>{renderRef(ref)}</span>
          ))}
        </div>
        <RichText text={anchor.nt_summary} className="text-sm text-foreground/80 font-scripture" />
      </div>
    </div>
  );
};

const RevelaShareSection = ({ query, response }: { query: string; response: RevelaResponse }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const buildShareText = () => {
    const parts: string[] = [`Revela Agora — "${query}"`];
    if (response.theme) parts.push(`\nTema: ${response.theme}`);
    if (response.passages?.length) {
      parts.push("\nPassagens:");
      response.passages.forEach((p) => parts.push(`• ${p.reference}: "${p.text}"`));
    }
    if (response.christocentric_connection) parts.push(`\nConexão cristocêntrica: ${response.christocentric_connection}`);
    if (response.application) parts.push(`\nAplicação: ${response.application}`);
    parts.push(`\n📖 Descubra mais no Revela: ${window.location.origin}`);
    return parts.join("\n");
  };

  const handleShare = async (method: "copy" | "whatsapp" | "native") => {
    const text = buildShareText();
    setShowMenu(false);

    if (method === "native" && navigator.share) {
      try { await navigator.share({ title: `Revela — "${query}"`, text }); return; } catch { /* cancelled */ }
    }
    if (method === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado!", description: "Revelação copiada para a área de transferência." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Compartilhar revelação
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ShareMenu onShare={handleShare} label="Compartilhar revelação" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevelaAgora;
