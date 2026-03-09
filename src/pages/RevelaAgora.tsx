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

const ease = [0.22, 1, 0.36, 1] as const;

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
    <div className="flex flex-col h-full bg-background">
      {/* Header — editorial, minimal */}
      <div className="glass-surface border-b border-border/40 px-5 py-3.5 safe-top">
        <h1 className="font-scripture text-base font-semibold text-foreground text-center tracking-wide">
          Revela Agora
        </h1>
        <div className="editorial-divider mt-3" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-5 py-6">
          <AnimatePresence mode="wait">
            {!response && !loading ? (
              <SearchHome
                key="search-home"
                query={query}
                setQuery={setQuery}
                onSearch={handleSearch}
              />
            ) : loading ? (
              <LoadingState key="loading" />
            ) : response ? (
              <ResultView
                key="result"
                query={query}
                response={response}
                onReset={() => { setResponse(null); setQuery(""); }}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ── Search Home ─────────────────────────────────────── */

const SearchHome = ({
  query,
  setQuery,
  onSearch,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh] space-y-10"
  >
    {/* Icon + Title */}
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease }}
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
        <Search className="w-6 h-6 text-primary/70" strokeWidth={1.5} />
      </div>
      <h2 className="font-scripture text-[1.375rem] font-semibold text-foreground tracking-tight">
        O que a Palavra revela?
      </h2>
      <p className="text-[0.8125rem] text-muted-foreground mt-2.5 max-w-[320px] mx-auto leading-relaxed">
        Escreva sua dúvida, sentimento ou pergunta teológica. A Escritura responde.
      </p>
    </motion.div>

    {/* Search Input */}
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5, ease }}
    >
      <div className="relative">
        <Input
          placeholder="Escreva sua dúvida…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pr-11 h-12 bg-card/80 border-border/60 font-scripture text-[0.9375rem] shadow-soft placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-primary/10 transition-colors"
        />
        <button
          onClick={onSearch}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/[0.06] transition-all duration-200"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </motion.div>

    {/* Suggestions — editorial chips */}
    <motion.div
      className="flex flex-wrap gap-2 justify-center max-w-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {SUGGESTIONS.map((s, i) => (
        <motion.button
          key={s}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 + i * 0.04, duration: 0.3 }}
          onClick={() => setQuery(s)}
          className="px-3.5 py-1.5 text-[0.75rem] bg-card border border-border/50 text-muted-foreground rounded-full hover:border-primary/30 hover:text-primary transition-all duration-200 font-medium"
        >
          {s}
        </motion.button>
      ))}
    </motion.div>
  </motion.div>
);

/* ── Loading State ───────────────────────────────────── */

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[50vh] space-y-5"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-primary/60 animate-spin" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-[0.875rem] text-foreground/70 font-scripture">
        Buscando na Palavra…
      </p>
      <p className="text-[0.75rem] text-muted-foreground/50">
        Conectando passagens e revelações
      </p>
    </div>
  </motion.div>
);

/* ── Result View ─────────────────────────────────────── */

const ResultView = ({
  query,
  response,
  onReset,
}: {
  query: string;
  response: RevelaResponse;
  onReset: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease }}
    className="space-y-8 pb-10"
  >
    {/* Back */}
    <button
      onClick={onReset}
      className="text-[0.8125rem] text-muted-foreground/60 hover:text-primary transition-colors font-medium"
    >
      ← Nova busca
    </button>

    {/* Query Card — editorial quote style */}
    <div className="relative py-6 px-1">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/20 rounded-full" />
      <div className="pl-5 space-y-2.5">
        <p className="font-scripture text-lg text-foreground/90 italic leading-relaxed">
          "{query}"
        </p>
        {response.intent && (
          <span className="inline-block text-[0.6875rem] bg-primary/[0.06] text-primary/80 px-2.5 py-0.5 rounded-full font-medium tracking-wide">
            {response.intent === "EMOCIONAL" && "Emocional / Prática"}
            {response.intent === "DOUTRINARIA" && "Doutrinária"}
            {response.intent === "CRISTOCENTRICA" && "Cristocêntrica"}
            {response.intent === "REFERENCIA" && "Referência direta"}
          </span>
        )}
      </div>
    </div>

    <div className="editorial-divider" />

    {/* Sections */}
    <div className="space-y-7">
      {response.theme && (
        <ResultSection
          icon={<BookOpen className="w-4 h-4" />}
          title="Tema detectado"
          content={<RichText text={response.theme} />}
          delay={0}
        />
      )}

      {response.passages?.length > 0 && (
        <ResultSection
          icon={<BookOpen className="w-4 h-4" />}
          title="Passagens bíblicas"
          delay={0.05}
          content={
            <div className="space-y-3">
              {response.passages.map((p, i) => (
                <VerseCard key={i} reference={p.reference} text={p.text} why={p.why} />
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
          delay={0.1}
        />
      )}

      {response.christocentric_connection && (
        <ResultSection
          icon={<Cross className="w-4 h-4" />}
          title="Conexão cristocêntrica"
          content={<RichText text={response.christocentric_connection} />}
          delay={0.15}
        />
      )}

      {response.anchors?.length > 0 && (
        <ResultSection
          icon={<Anchor className="w-4 h-4" />}
          title="Âncoras cristocêntricas"
          delay={0.2}
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
          delay={0.25}
        />
      )}
    </div>

    <div className="editorial-divider" />

    <RevelaShareSection query={query} response={response} />

    <p className="text-[0.6875rem] text-muted-foreground/40 text-center pt-2 font-medium tracking-wide">
      Todas as respostas são fundamentadas exclusivamente na Escritura.
    </p>
  </motion.div>
);

/* ── Result Section ──────────────────────────────────── */

const ResultSection = ({
  icon,
  title,
  content,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease }}
    className="space-y-3"
  >
    <div className="flex items-center gap-2.5">
      <span className="text-primary/60">{icon}</span>
      <span className="text-[0.6875rem] uppercase tracking-[0.12em] font-semibold text-primary/70">
        {title}
      </span>
    </div>
    <div className="text-[0.875rem] text-foreground/80 leading-[1.85] font-scripture pl-[26px]">
      {content}
    </div>
  </motion.div>
);

/* ── Verse Card ──────────────────────────────────────── */

const VerseCard = ({ reference, text, why }: { reference: string; text: string; why?: string }) => {
  const parsed = parseReferences(reference);
  return (
    <div className="notebook-page rounded-lg p-4 space-y-2">
      {parsed.length > 0 ? (
        <ReferenceChip reference={parsed[0]} label={reference} />
      ) : (
        <p className="text-[0.75rem] font-semibold text-primary/70 tracking-wide">{reference}</p>
      )}
      <p className="font-scripture text-[0.875rem] text-foreground/80 italic leading-[1.9]">
        {text}
      </p>
      {why && (
        <p className="text-[0.75rem] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/50">Por que este texto:</span> {why}
        </p>
      )}
    </div>
  );
};

/* ── Anchor Card ─────────────────────────────────────── */

const AnchorCard = ({ anchor }: { anchor: AnchorData }) => {
  const connLabel = CONNECTION_TYPE_LABELS[anchor.connection_type];

  const renderRef = (refStr: string) => {
    const parsed = parseReferences(refStr);
    if (parsed.length > 0) {
      return <ReferenceChip reference={parsed[0]} label={refStr} />;
    }
    return <span className="text-[0.75rem] font-semibold text-primary/70">{refStr}</span>;
  };

  return (
    <div className="notebook-page rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-scripture text-[0.875rem] font-semibold text-foreground/90">
          {anchor.category}
        </h4>
        {connLabel && (
          <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-medium tracking-wide ${
            connLabel.strength === "forte"
              ? "bg-primary/10 text-primary"
              : connLabel.strength === "média"
              ? "bg-secondary text-foreground/60"
              : "bg-secondary/50 text-muted-foreground"
          }`}>
            {connLabel.label}
          </span>
        )}
      </div>
      
      <div className="space-y-1.5">
        {renderRef(anchor.at_reference)}
        <RichText text={anchor.at_summary} className="text-[0.8125rem] text-foreground/75 font-scripture leading-[1.8]" />
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground/50">
        <ArrowRight className="w-3 h-3" />
        <span className="text-[0.625rem] uppercase tracking-[0.12em] font-medium">Conexão NT</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {anchor.nt_references?.map((ref, i) => (
            <span key={i}>{renderRef(ref)}</span>
          ))}
        </div>
        <RichText text={anchor.nt_summary} className="text-[0.8125rem] text-foreground/75 font-scripture leading-[1.8]" />
      </div>
    </div>
  );
};

/* ── Share Section ───────────────────────────────────── */

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
    <div className="flex justify-center">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground/60 hover:text-primary transition-colors font-medium"
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
