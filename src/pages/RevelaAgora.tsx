/**
 * RevelaAgora.tsx — Atualizado
 *
 * MUDANÇAS PRINCIPAIS:
 *
 * 1. QUERY INICIAL VIA NAVEGAÇÃO (corrige o bug "Abrir modo Revela vazio"):
 *    Aceita `location.state.initialQuery` passado por qualquer tela.
 *    Quando recebido, dispara a busca automaticamente ao montar.
 *    Fluxo corrigido:
 *      Versículo → Revelar → Abrir no Modo Revelação
 *      → RevelaAgora abre com query "Revelação bíblica de Lucas 24:45"
 *      → busca é feita automaticamente → resultado aparece sem clique extra.
 *
 * 2. BUSCA AVANÇADA DENTRO DA TELA (não mais tab separada):
 *    Botão "Busca avançada" discreto abre BuscaAvancadaSheet inline.
 *    Remove o link para /busca do header.
 *    A lupa da nav bottom leva direto para o Modo Revela (não para /busca).
 *
 * 3. SUGESTÕES ATUALIZADAS:
 *    Exemplos mais naturais para uso bíblico protestante.
 */
import { useState, useEffect, useRef } from "react";
import { useRevelaHistory } from "@/hooks/useRevelaHistory";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, Cross, Heart, Loader2, Anchor,
  ArrowRight, Share2, ZoomIn, ZoomOut, SlidersHorizontal, X, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import ShareMenu from "@/components/ShareMenu";
import { CONNECTION_TYPE_LABELS, type ConnectionType } from "@/lib/christocentric-index";
import ReferenceChip from "@/components/ReferenceChip";
import RichText from "@/components/RichText";
import { parseReferences } from "@/lib/reference-parser";
import BuscaAvancadaSheet from "@/components/BuscaAvancadaSheet";
// ─── Tipos ───────────────────────────────────────────────────
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
// Estado de navegação passado por outras telas
interface RevelaLocationState {
  initialQuery?: string;  // query pré-preenchida (ex: "Revelação bíblica de Lucas 24:45")
  autoSearch?: boolean;   // disparar busca automaticamente ao abrir
}
const ease = [0.22, 1, 0.36, 1] as const;
const SUGGESTIONS = [
  "Onde encontrar Jesus em Gênesis?",
  "O que a Bíblia fala sobre fé?",
  "Estou com medo do futuro",
  "Quero desistir",
  "Tenho culpa",
  "Preciso de esperança",
];
// ─── Componente principal ─────────────────────────────────────
const RevelaAgora = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { track } = useAnalytics();
  const { history, addEntry, removeEntry, clearHistory } = useRevelaHistory();
  // Recebe query inicial de outra tela (ex: VerseRevealSection)
  const locationState = location.state as RevelaLocationState | null;
  const initialQuery = locationState?.initialQuery ?? "";
  const shouldAutoSearch = locationState?.autoSearch ?? false;
  const [query, setQuery] = useState(initialQuery);
  const [response, setResponse] = useState<RevelaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscaAvancadaOpen, setBuscaAvancadaOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setResponse(null);
    try {
      const { data, error } = await supabase.functions.invoke("revela-agora", {
        body: { query: searchQuery },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        setLoading(false);
        return;
      }
      setResponse(data as RevelaResponse);
      addEntry(searchQuery, (data as RevelaResponse).theme);
      track("revela_search", { query: searchQuery });
      track("revela_used", { query: searchQuery });
      track("question_asked", { query: searchQuery });
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
  // Auto-busca quando recebe query via navegação
  useEffect(() => {
    if (initialQuery && shouldAutoSearch) {
      handleSearch(initialQuery);
    } else if (initialQuery) {
      // Só preenche o campo, não busca (usuário pode editar antes)
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleReset = () => {
    setResponse(null);
    setQuery("");
    // Limpa o state de navegação para não re-preencher ao voltar
    navigate("/revela", { replace: true, state: null });
  };
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="glass-surface border-b border-border/40 px-5 py-3.5 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="font-scripture text-base font-semibold text-foreground tracking-wide">
            Revela Agora
          </h1>
          {/* Busca avançada — acesso secundário, discreto */}
          <button
            onClick={() => setBuscaAvancadaOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent
                       transition-colors font-ui px-2.5 py-1.5 rounded-lg hover:bg-accent/5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Busca avançada
          </button>
        </div>
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
                onSearch={() => handleSearch()}
                inputRef={inputRef}
                history={history}
                onSelectHistory={(q: string) => { setQuery(q); }}
                onRemoveHistory={removeEntry}
                onClearHistory={clearHistory}
              />
            ) : loading ? (
              <LoadingState key="loading" query={query} />
            ) : response ? (
              <ResultView
                key="result"
                query={query}
                response={response}
                onReset={handleReset}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      {/* Busca Avançada — sheet lateral */}
      <BuscaAvancadaSheet
        open={buscaAvancadaOpen}
        onOpenChange={setBuscaAvancadaOpen}
      />
    </div>
  );
};
// ─── Search Home ──────────────────────────────────────────────
const SearchHome = ({
  query,
  setQuery,
  onSearch,
  inputRef,
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  history: import("@/hooks/useRevelaHistory").RevelaHistoryEntry[];
  onSelectHistory: (q: string) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh] space-y-10"
  >
    {/* Título */}
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
        Pergunte algo à Bíblia
      </h2>
      <p className="text-[0.8125rem] text-muted-foreground mt-2.5 max-w-[320px] mx-auto leading-relaxed">
        Escreva sua dúvida, sentimento ou referência. A Escritura responde.
      </p>
    </motion.div>
    {/* Campo de busca */}
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5, ease }}
    >
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Onde encontrar esperança na Bíblia…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pr-11 h-12 bg-card/80 border-border/60 font-scripture text-[0.9375rem]
                     shadow-soft placeholder:text-muted-foreground/40
                     focus:border-primary/30 focus:ring-primary/10 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground/40
                       hover:text-muted-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onSearch}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg
                     flex items-center justify-center text-muted-foreground/50
                     hover:text-primary hover:bg-primary/[0.06] transition-all duration-200"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
    {/* Sugestões */}
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
          className="px-3.5 py-1.5 text-[0.75rem] bg-card border border-border/50
                     text-muted-foreground rounded-full hover:border-primary/30
                     hover:text-primary transition-all duration-200 font-medium"
        >
          {s}
        </motion.button>
      ))}
    </motion.div>
    {/* Histórico */}
    {history.length > 0 && (
      <motion.div
        className="w-full max-w-md space-y-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-ui">Buscas recentes</p>
          <button
            onClick={onClearHistory}
            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground font-ui transition-colors"
          >
            Limpar
          </button>
        </div>
        <div className="space-y-1">
          {history.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 group">
              <button
                onClick={() => onSelectHistory(entry.query)}
                className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-card border border-border/40 text-left hover:border-border/70 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-scripture text-foreground/80 truncate">{entry.query}</p>
                  {entry.theme && (
                    <p className="text-[10px] text-muted-foreground/50 font-ui truncate mt-0.5">{entry.theme}</p>
                  )}
                </div>
              </button>
              <button
                onClick={() => onRemoveHistory(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    )}
  </motion.div>
);
// ─── Loading ──────────────────────────────────────────────────
const LoadingState = ({ query }: { query: string }) => (
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
      {query && (
        <p className="text-[0.75rem] text-muted-foreground/50 italic max-w-xs mx-auto">
          "{query}"
        </p>
      )}
    </div>
  </motion.div>
);
// ─── Result View ──────────────────────────────────────────────
const ResultView = ({
  query,
  response,
  onReset,
}: {
  query: string;
  response: RevelaResponse;
  onReset: () => void;
}) => {
  const { containerRef: pinchRef, zoom, setZoom } = usePinchZoom(1, 0.7, 1.6);
  const navigate = useNavigate();
  const handleNavigateToRef = (book: string, chapter: number, verse: number) => {
    navigate(`/leitor?livro=${encodeURIComponent(book)}&cap=${chapter}&v=${verse}`, {
      state: { fromRevela: true },
    });
  };
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.6));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.7));
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 pb-10"
    >
      {/* Controles */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="text-[0.8125rem] text-muted-foreground/60 hover:text-primary transition-colors font-medium"
        >
          ← Nova busca
        </button>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[0.625rem] text-muted-foreground/50 w-8 text-center font-ui">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Query card */}
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
      {/* Conteúdo com zoom */}
      <div ref={pinchRef} className="space-y-7 touch-manipulation" style={{ fontSize: `${zoom}em` }}>
        {response.theme && (
          <ResultSection
            icon={<BookOpen className="w-4 h-4" />}
            title="Tema detectado"
            content={<RichText text={response.theme} onNavigate={handleNavigateToRef} />}
            delay={0}
          />
        )}
        {response.passages?.length > 0 && (
          <ResultSection
            icon={<BookOpen className="w-4 h-4" />}
            title="Versículos relacionados"
            delay={0.05}
            content={
              <div className="space-y-3">
                {response.passages.map((p, i) => (
                  <VerseCard key={i} reference={p.reference} text={p.text} why={p.why} onNavigate={handleNavigateToRef} />
                ))}
              </div>
            }
          />
        )}
        {response.context && (
          <ResultSection
            icon={<BookOpen className="w-4 h-4" />}
            title="Contexto bíblico"
            content={<RichText text={response.context} onNavigate={handleNavigateToRef} />}
            delay={0.1}
          />
        )}
        {response.christocentric_connection && (
          <ResultSection
            icon={<Cross className="w-4 h-4" />}
            title="Conexão cristocêntrica"
            content={<RichText text={response.christocentric_connection} onNavigate={handleNavigateToRef} />}
            delay={0.15}
          />
        )}
        {response.anchors?.length > 0 && (
          <ResultSection
            icon={<Anchor className="w-4 h-4" />}
            title="Linha messiânica"
            delay={0.2}
            content={
              <div className="space-y-4">
                {response.anchors.map((a, i) => (
                  <AnchorCard key={i} anchor={a} onNavigate={handleNavigateToRef} />
                ))}
              </div>
            }
          />
        )}
        {response.application && (
          <ResultSection
            icon={<Heart className="w-4 h-4" />}
            title="Aplicação"
            content={<RichText text={response.application} onNavigate={handleNavigateToRef} />}
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
};
// ─── Sub-componentes ──────────────────────────────────────────
const ResultSection = ({
  icon, title, content, delay = 0,
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
const VerseCard = ({
  reference, text, why, onNavigate,
}: {
  reference: string;
  text: string;
  why?: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}) => {
  const parsed = parseReferences(reference);
  return (
    <div className="notebook-page rounded-lg p-4 space-y-2">
      {parsed.length > 0 ? (
        <ReferenceChip reference={parsed[0]} label={reference} onNavigate={onNavigate} />
      ) : (
        <p className="text-[0.75rem] font-semibold text-primary/70 tracking-wide">{reference}</p>
      )}
      <RichText text={text} className="font-scripture text-[0.875rem] text-foreground/80 italic leading-[1.9]" onNavigate={onNavigate} />
      {why && <RichText text={why} className="text-[0.75rem] text-muted-foreground leading-relaxed" onNavigate={onNavigate} />}
    </div>
  );
};
const AnchorCard = ({
  anchor, onNavigate,
}: {
  anchor: AnchorData;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}) => {
  const connLabel = CONNECTION_TYPE_LABELS[anchor.connection_type];
  const renderRef = (refStr: string) => {
    const parsed = parseReferences(refStr);
    if (parsed.length > 0) return <ReferenceChip reference={parsed[0]} label={refStr} onNavigate={onNavigate} />;
    return <span className="text-[0.75rem] font-semibold text-primary/70">{refStr}</span>;
  };
  return (
    <div className="notebook-page rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-scripture text-[0.875rem] font-semibold text-foreground/90">{anchor.category}</h4>
        {connLabel && (
          <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-medium tracking-wide ${
            connLabel.strength === "forte" ? "bg-primary/10 text-primary"
            : connLabel.strength === "média" ? "bg-secondary text-foreground/60"
            : "bg-secondary/50 text-muted-foreground"
          }`}>
            {connLabel.label}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {renderRef(anchor.at_reference)}
        <RichText text={anchor.at_summary} className="text-[0.8125rem] text-foreground/75 font-scripture leading-[1.8]" onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground/50">
        <ArrowRight className="w-3 h-3" />
        <span className="text-[0.625rem] uppercase tracking-[0.12em] font-medium">Conexão NT</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          {anchor.nt_references?.map((ref, i) => <span key={i}>{renderRef(ref)}</span>)}
        </div>
        <RichText text={anchor.nt_summary} className="text-[0.8125rem] text-foreground/75 font-scripture leading-[1.8]" onNavigate={onNavigate} />
      </div>
    </div>
  );
};
const RevelaShareSection = ({
  query, response,
}: {
  query: string;
  response: RevelaResponse;
}) => {
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
