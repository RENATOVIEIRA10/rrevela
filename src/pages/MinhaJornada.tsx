import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookMarked, Palette, BookOpen, RotateCcw, Sparkles, Eye, Map, Heart } from "lucide-react";
import { useJourneyStats } from "@/hooks/useJourneyStats";
import { useFavorites } from "@/hooks/useFavorites";
import { HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import SpiritualMirror from "@/components/SpiritualMirror";
import DoctrinalMap from "@/components/DoctrinalMap";
import FavoritesList from "@/components/FavoritesList";

const MinhaJornada = () => {
  const stats = useJourneyStats();
  const { favorites, loading: favsLoading, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const { track } = useAnalytics();

  useEffect(() => {
    track("study_opened", { area: "minha_jornada" });
  }, [track]);

  if (stats.loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <Header />
        <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-5">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  const hasData = stats.totalHighlights > 0 || stats.totalNotes > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      <Header />

      <ScrollArea className="flex-1">
        <div className="px-5 py-6 max-w-2xl mx-auto w-full space-y-7 pb-10">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 py-4"
          >
            <p className="font-scripture text-xl text-foreground tracking-wide">
              Sua caminhada, em silêncio.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Sem medalhas. Sem rótulos. Apenas o que você estudou, organizado.
            </p>
          </motion.div>

          {!hasData ? (
            <EmptyState />
          ) : (
            <>
              {/* Overview stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-4 gap-3"
              >
                <StatCard label="Marcações" value={stats.totalHighlights} icon="🖊️" />
                <StatCard label="Anotações" value={stats.totalNotes} icon="📝" />
                <StatCard label="Favoritos" value={favorites.length} icon="❤️" />
                <StatCard label="Capítulos" value={stats.studiedChapters.length} icon="📖" />
              </motion.div>

              {/* Versículos favoritos */}
              <SectionCard icon={<Heart className="w-4 h-4" />} title="Versículos favoritos" delay={0.12}>
                <FavoritesList
                  favorites={favorites}
                  loading={favsLoading}
                  onGoTo={(book, chapter, verse) =>
                    navigate(`/leitor?livro=${encodeURIComponent(book)}&cap=${chapter}`)
                  }
                  onRemove={(book, chapter, verse) => toggleFavorite(book, chapter, verse)}
                />
              </SectionCard>

              {/* Espelho Espiritual */}
              <SectionCard icon={<Eye className="w-4 h-4" />} title="Espelho espiritual" delay={0.12}>
                <SpiritualMirror
                  totalHighlights={stats.totalHighlights}
                  totalNotes={stats.totalNotes}
                  colorDistribution={stats.colorDistribution}
                  studiedChapters={stats.studiedChapters}
                  atCount={stats.atCount}
                  ntCount={stats.ntCount}
                />
              </SectionCard>

              {/* Color distribution */}
              {stats.colorDistribution.length > 0 && (
                <SectionCard icon={<Palette className="w-4 h-4" />} title="Distribuição de marcações" delay={0.15}>
                  <div className="space-y-2.5">
                    {HIGHLIGHT_COLORS.map((color) => {
                      const stat = stats.colorDistribution.find((s) => s.color_key === color.key);
                      const count = stat?.count ?? 0;
                      const pct = stats.totalHighlights > 0
                        ? Math.round((count / stats.totalHighlights) * 100)
                        : 0;
                      return (
                        <div key={color.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/80 flex items-center gap-1.5">
                              <span>{color.emoji}</span>
                              {color.label}
                            </span>
                            <span className="text-muted-foreground font-ui tabular-nums">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className={`h-full rounded-full ${color.cssClass}`}
                              style={{ opacity: 0.7 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* AT vs NT */}
              {(stats.atCount > 0 || stats.ntCount > 0) && (
                <SectionCard icon={<BookOpen className="w-4 h-4" />} title="Proporção AT vs NT" delay={0.2}>
                  <div className="space-y-3">
                    <div className="flex h-2 rounded-full overflow-hidden bg-secondary/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((stats.atCount / (stats.atCount + stats.ntCount)) * 100)}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-accent/50 rounded-l-full"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((stats.ntCount / (stats.atCount + stats.ntCount)) * 100)}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-accent rounded-r-full"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>AT: {stats.atCount} ({Math.round((stats.atCount / (stats.atCount + stats.ntCount)) * 100)}%)</span>
                      <span>NT: {stats.ntCount} ({Math.round((stats.ntCount / (stats.atCount + stats.ntCount)) * 100)}%)</span>
                    </div>
                    {stats.atCount > 0 && stats.ntCount === 0 && (
                      <p className="text-[10px] text-muted-foreground italic">Deseja explorar textos do Novo Testamento?</p>
                    )}
                    {stats.ntCount > 0 && stats.atCount === 0 && (
                      <p className="text-[10px] text-muted-foreground italic">Deseja explorar textos do Antigo Testamento?</p>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Mapa Doutrinário */}
              {stats.rawHighlights.length > 0 && (
                <SectionCard icon={<Map className="w-4 h-4" />} title="Mapa doutrinário pessoal" delay={0.25}>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Textos estudados, organizados por tema teológico.
                  </p>
                  <DoctrinalMap highlights={stats.rawHighlights} />
                </SectionCard>
              )}

              {/* Studied chapters */}
              {stats.studiedChapters.length > 0 && (
                <SectionCard icon={<BookMarked className="w-4 h-4" />} title="Capítulos estudados" delay={0.3}>
                  <div className="space-y-1.5">
                    {stats.studiedChapters.slice(0, 15).map((ch, i) => (
                      <motion.button
                        key={`${ch.book}-${ch.chapter}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.03 }}
                        onClick={() => navigate(`/leitor?livro=${encodeURIComponent(ch.book)}&cap=${ch.chapter}`)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/8 text-accent/80 font-ui font-medium">
                            {ch.testament}
                          </span>
                          <span className="text-sm font-scripture text-foreground/90">
                            {ch.book} {ch.chapter}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          {ch.highlight_count > 0 && <span>🖊️ {ch.highlight_count}</span>}
                          {ch.note_count > 0 && <span>📝 {ch.note_count}</span>}
                          <span className="hidden sm:inline">
                            {new Date(ch.last_studied).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                    {stats.studiedChapters.length > 15 && (
                      <p className="text-[10px] text-muted-foreground text-center pt-2">
                        + {stats.studiedChapters.length - 15} capítulos estudados
                      </p>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Recent notes */}
              {stats.recentNotes.length > 0 && (
                <SectionCard icon={<RotateCcw className="w-4 h-4" />} title="Revisitar com consciência" delay={0.3}>
                  <div className="space-y-4">
                    <p className="text-[10px] text-muted-foreground">
                      Suas anotações recentes. Revisitar permite comparar compreensão anterior e atual.
                    </p>
                    {stats.recentNotes.map((note, i) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.04 }}
                        className="space-y-2 pb-4"
                        style={{ borderBottom: i < stats.recentNotes.length - 1 ? '1px solid hsl(var(--border) / 0.5)' : 'none' }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-ui font-medium text-accent/80">
                            {note.book} {note.chapter}
                            {note.verse != null ? `:${note.verse}` : ""}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                              {note.type === "verse" ? "verso" : note.type === "chapter" ? "capítulo" : "tema"}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {new Date(note.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        {note.observation && (
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Observação</p>
                            <p className="text-sm text-foreground/80 font-scripture line-clamp-2">{note.observation}</p>
                          </div>
                        )}

                        {note.christocentric && (
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">Cristo</p>
                            <p className="text-sm text-foreground/80 font-scripture line-clamp-2">{note.christocentric}</p>
                          </div>
                        )}

                        <button
                          onClick={() => navigate(`/leitor?livro=${encodeURIComponent(note.book || "")}&cap=${note.chapter || 1}`)}
                          className="flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Revisitar este estudo
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </SectionCard>
              )}

              <p className="text-[10px] text-muted-foreground text-center pt-2 pb-4 italic">
                Sem avaliação. Sem julgamento. Apenas organização.
              </p>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const Header = () => (
  <div className="bg-card/80 backdrop-blur-sm px-5 py-4">
    <h1 className="font-scripture text-lg font-semibold text-foreground text-center tracking-wide">
      Minha Jornada
    </h1>
    <div className="editorial-divider mt-3" />
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="text-center py-16 space-y-3"
  >
    <div className="w-12 h-12 mx-auto rounded-full bg-accent/8 flex items-center justify-center">
      <BookMarked className="w-5 h-5 text-accent/60" />
    </div>
    <p className="text-sm text-foreground font-medium">Nenhum estudo registrado ainda</p>
    <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
      Comece a estudar no Leitor — marque textos, anote observações — e sua jornada será registrada aqui.
    </p>
  </motion.div>
);

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div className="text-center space-y-1.5 py-3">
    <span className="text-base">{icon}</span>
    <p className="text-xl font-semibold text-foreground font-ui tabular-nums">{value}</p>
    <p className="text-[10px] text-muted-foreground tracking-wide">{label}</p>
  </div>
);

const SectionCard = ({
  icon,
  title,
  delay,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  delay: number;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="space-y-3"
  >
    <div className="flex items-center gap-2.5 text-accent/70 px-1">
      {icon}
      <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium">{title}</h3>
      <div className="flex-1 editorial-divider" />
    </div>
    <div className="bg-card rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      {children}
    </div>
  </motion.div>
);

export default MinhaJornada;
