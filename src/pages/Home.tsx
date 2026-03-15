/**
 * Home.tsx — Fixes aplicados
 *
 * FIX 1 — Header mais limpo:
 *   - Data removida do header (era pequena demais no iPhone)
 *   - Logo + título no lugar, Perfil acessível pela nav
 *
 * FIX 2 — "Ler contexto" vai para Gênesis:
 *   - Bug: navigate passava só livro+cap via URL, mas se o Reader
 *     já estava montado em estado diferente, havia race condition.
 *   - Fix: navigate agora usa { state: { book, chapter, verse } }
 *     ALÉM do URL param — o Reader tem fallback via location.state.
 *   - Também passa o número do versículo (&v=) para scroll futuro.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Sparkles, ArrowRight, StickyNote } from "lucide-react";
import { useVerseOfDay } from "@/hooks/useDevotional";
import { useJourneyStats } from "@/hooks/useJourneyStats";
import { useAnalytics } from "@/hooks/useAnalytics";
import RevelaLogo from "@/components/RevelaLogo";

const ease = [0.22, 1, 0.36, 1] as const;

const Home = () => {
  const navigate = useNavigate();
  const { verse, loading } = useVerseOfDay();
  const stats = useJourneyStats();
  const { track } = useAnalytics();

  useEffect(() => {
    track("study_opened", { area: "home" });
  }, [track]);

  const recentChapter = stats.studiedChapters[0];

  const handleContinueReading = () => {
    const book    = recentChapter?.book    || localStorage.getItem("revela-last-book")    || "Gênesis";
    const chapter = recentChapter?.chapter || Number(localStorage.getItem("revela-last-chapter") || 1);
    navigate(`/leitor?livro=${encodeURIComponent(book)}&cap=${chapter}`, {
      state: { book, chapter },
    });
  };

  /**
   * "Ler contexto" — navega para o capítulo correto.
   *
   * Usa DOIS mecanismos para garantir que o Reader abre no lugar certo:
   * 1. URL params: ?livro=Mateus&cap=28
   * 2. location.state: { book, chapter, verse } — lido pelo Reader como fallback
   */
  const handleReadContext = () => {
    if (!verse) return;
    navigate(
      `/leitor?livro=${encodeURIComponent(verse.book)}&cap=${verse.chapter}`,
      {
        state: {
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Header minimalista — sem data para não apertar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-2.5 px-5 pb-3 safe-top"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}
      >
        <RevelaLogo size={22} color="hsl(var(--accent))" />
        <span className="font-scripture text-base font-medium text-foreground/80">
          Revela
        </span>
      </motion.div>

      <ScrollArea className="flex-1">
        <div className="px-5 pb-10 space-y-5 max-w-lg mx-auto w-full">

          {/* ── Versículo do Dia ─── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease }}
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5"
              style={{ boxShadow: "var(--shadow-elevated)" }}
            >
              {/* Linha dourada no topo */}
              <div
                className="absolute top-0 left-6 right-6 h-[1.5px]"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--gold, 43 52% 52%)), transparent)",
                }}
              />

              <p
                className="text-[9px] uppercase tracking-[0.3em] font-ui font-medium mb-3"
                style={{ color: "hsl(var(--gold, 43 52% 52%))" }}
              >
                Palavra do dia
              </p>

              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-full" />
                  <div className="h-4 bg-secondary/50 rounded animate-pulse w-2/3" />
                </div>
              ) : verse ? (
                <>
                  <blockquote className="font-scripture text-[1.15rem] leading-[1.7] text-foreground/90 font-light italic mb-4">
                    "{verse.text}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <cite
                      className="not-italic text-xs font-ui font-medium"
                      style={{ color: "hsl(var(--gold, 43 52% 52%))" }}
                    >
                      {verse.book} {verse.chapter}:{verse.verse}
                    </cite>
                    {/* Fix: usa handleReadContext com state para evitar bug de navegação */}
                    <button
                      onClick={handleReadContext}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-ui"
                    >
                      Ler contexto
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>

          {/* ── Ações rápidas ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={handleContinueReading}
              className="flex flex-col gap-2.5 p-4 rounded-xl bg-card border border-border/50 text-left active:scale-[0.97] transition-transform"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground font-ui">Continuar</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-scripture">
                  {recentChapter
                    ? `${recentChapter.book} ${recentChapter.chapter}`
                    : "Bíblia"}
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/revela")}
              className="flex flex-col gap-2.5 p-4 rounded-xl text-left active:scale-[0.97] transition-transform"
              style={{
                background: "hsl(var(--accent))",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-accent-foreground font-ui">
                  Revela Agora
                </p>
                <p className="text-[10px] text-accent-foreground/70 mt-0.5 font-scripture">
                  Pergunte à Palavra
                </p>
              </div>
            </button>
          </motion.div>

          {/* ── Jornada ─── */}
          {!stats.loading && (stats.totalHighlights > 0 || stats.totalNotes > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-ui font-medium">
                  Sua jornada
                </p>
                <div className="flex-1 editorial-divider" />
                <button
                  onClick={() => navigate("/jornada")}
                  className="text-[10px] text-accent/70 hover:text-accent transition-colors font-ui"
                >
                  Ver tudo
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: stats.studiedChapters.length, label: "Capítulos" },
                  { value: stats.totalHighlights,        label: "Marcados"  },
                  { value: stats.totalNotes,             label: "Anotações" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-card rounded-xl p-3 text-center border border-border/40"
                  >
                    <p className="font-scripture text-xl text-foreground/90">{value}</p>
                    <p className="text-[9px] text-muted-foreground font-ui mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Notas recentes ─── */}
          {!stats.loading && stats.recentNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-ui font-medium">
                  Últimas anotações
                </p>
                <div className="flex-1 editorial-divider" />
              </div>
              <div className="space-y-2">
                {stats.recentNotes.slice(0, 3).map((note) => (
                  <button
                    key={note.id}
                    onClick={() =>
                      navigate(
                        `/leitor?livro=${encodeURIComponent(note.book || "")}&cap=${note.chapter || 1}`,
                        { state: { book: note.book, chapter: note.chapter } }
                      )
                    }
                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-card border border-border/40 text-left active:bg-secondary/30 transition-colors"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-accent/50 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-accent/80 font-ui">
                        {note.book} {note.chapter}
                        {note.verse != null ? `:${note.verse}` : ""}
                      </p>
                      {note.observation && (
                        <p className="text-xs text-foreground/70 font-scripture mt-0.5 line-clamp-2">
                          {note.observation}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Estado vazio */}
          {!stats.loading &&
            stats.totalHighlights === 0 &&
            stats.totalNotes === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center py-6"
              >
                <p className="font-scripture text-sm text-foreground/60 italic leading-relaxed">
                  "Então lhes abriu o entendimento para compreenderem as Escrituras."
                </p>
                <p className="text-[10px] text-muted-foreground font-ui mt-2">
                  — Lucas 24:45
                </p>
                <button
                  onClick={() => navigate("/leitor")}
                  className="mt-5 flex items-center gap-2 mx-auto text-sm text-accent font-ui font-medium"
                >
                  Começar a estudar
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Home;
