import { motion } from "framer-motion";
import { BookMarked, Palette, BookOpen, Clock, RotateCcw, Sparkles } from "lucide-react";
import { useJourneyStats } from "@/hooks/useJourneyStats";
import { HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

const MinhaJornada = () => {
  const stats = useJourneyStats();
  const navigate = useNavigate();

  if (stats.loading) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  const hasData = stats.totalHighlights > 0 || stats.totalNotes > 0;

  return (
    <div className="flex flex-col h-full">
      <Header />

      <ScrollArea className="flex-1">
        <div className="px-5 py-6 max-w-2xl mx-auto w-full space-y-6">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 py-4"
          >
            <p className="font-scripture text-lg text-foreground">
              Sua caminhada, em silêncio.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Sem medalhas. Sem rótulos. Apenas o que você estudou, organizado.
            </p>
          </motion.div>

          {!hasData ? (
            <EmptyState />
          ) : (
            <>
              {/* Overview cards */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3"
              >
                <StatCard label="Marcações" value={stats.totalHighlights} icon="🖊️" />
                <StatCard label="Anotações" value={stats.totalNotes} icon="📝" />
                <StatCard label="Capítulos" value={stats.studiedChapters.length} icon="📖" />
              </motion.div>

              {/* (5) Equilíbrio Espiritual — Color distribution */}
              {stats.colorDistribution.length > 0 && (
                <SectionCard
                  icon={<Palette className="w-4 h-4" />}
                  title="Distribuição de marcações"
                  delay={0.15}
                >
                  <div className="space-y-2">
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
                            <span className="text-muted-foreground font-ui">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className={`h-full rounded-full ${color.cssClass}`}
                              style={{ opacity: 0.8 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* (5) Equilíbrio Espiritual — AT vs NT */}
              {(stats.atCount > 0 || stats.ntCount > 0) && (
                <SectionCard
                  icon={<BookOpen className="w-4 h-4" />}
                  title="Proporção AT vs NT"
                  delay={0.2}
                >
                  <div className="space-y-3">
                    <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (stats.atCount / (stats.atCount + stats.ntCount)) * 100
                          )}%`,
                        }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-accent/60 rounded-l-full"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (stats.ntCount / (stats.atCount + stats.ntCount)) * 100
                          )}%`,
                        }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-accent rounded-r-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Antigo Testamento: {stats.atCount} (
                        {Math.round((stats.atCount / (stats.atCount + stats.ntCount)) * 100)}%)
                      </span>
                      <span>
                        Novo Testamento: {stats.ntCount} (
                        {Math.round((stats.ntCount / (stats.atCount + stats.ntCount)) * 100)}%)
                      </span>
                    </div>

                    {/* Suggestion */}
                    {stats.atCount > 0 && stats.ntCount === 0 && (
                      <p className="text-[10px] text-muted-foreground italic">
                        Deseja explorar textos do Novo Testamento?
                      </p>
                    )}
                    {stats.ntCount > 0 && stats.atCount === 0 && (
                      <p className="text-[10px] text-muted-foreground italic">
                        Deseja explorar textos do Antigo Testamento?
                      </p>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* (4) Mapa Doutrinário Pessoal — Studied chapters organized */}
              {stats.studiedChapters.length > 0 && (
                <SectionCard
                  icon={<BookMarked className="w-4 h-4" />}
                  title="Mapa doutrinário pessoal"
                  delay={0.25}
                >
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground mb-2">
                      Versos estudados, marcações aplicadas e anotações — organizados por capítulo.
                    </p>
                    {stats.studiedChapters.slice(0, 15).map((ch, i) => (
                      <motion.button
                        key={`${ch.book}-${ch.chapter}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.03 }}
                        onClick={() => navigate(`/leitor?livro=${encodeURIComponent(ch.book)}&cap=${ch.chapter}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-ui font-medium">
                            {ch.testament}
                          </span>
                          <span className="text-sm font-scripture text-foreground/90">
                            {ch.book} {ch.chapter}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          {ch.highlight_count > 0 && (
                            <span>🖊️ {ch.highlight_count}</span>
                          )}
                          {ch.note_count > 0 && (
                            <span>📝 {ch.note_count}</span>
                          )}
                          <span className="hidden sm:inline">
                            {new Date(ch.last_studied).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                    {stats.studiedChapters.length > 15 && (
                      <p className="text-[10px] text-muted-foreground text-center pt-1">
                        + {stats.studiedChapters.length - 15} capítulos estudados
                      </p>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* (9) Revisitar com Consciência — Recent notes */}
              {stats.recentNotes.length > 0 && (
                <SectionCard
                  icon={<RotateCcw className="w-4 h-4" />}
                  title="Revisitar com consciência"
                  delay={0.3}
                >
                  <div className="space-y-3">
                    <p className="text-[10px] text-muted-foreground">
                      Suas anotações recentes. Revisitar permite comparar compreensão anterior e atual.
                    </p>
                    {stats.recentNotes.map((note, i) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 + i * 0.04 }}
                        className="bg-card rounded-xl p-4 border border-border/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-ui font-semibold text-accent">
                            {note.book} {note.chapter}
                            {note.verse != null ? `:${note.verse}` : ""}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {note.type === "verse" ? "verso" : note.type === "chapter" ? "capítulo" : "tema"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(note.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        {note.observation && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              Observação
                            </p>
                            <p className="text-sm text-foreground/80 font-scripture line-clamp-2">
                              {note.observation}
                            </p>
                          </div>
                        )}

                        {note.christocentric && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              Cristo
                            </p>
                            <p className="text-sm text-foreground/80 font-scripture line-clamp-2">
                              {note.christocentric}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => navigate(`/leitor?livro=${encodeURIComponent(note.book || "")}&cap=${note.chapter || 1}`)}
                          className="flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Revisitar este estudo
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </SectionCard>
              )}

              <p className="text-[10px] text-muted-foreground text-center pt-2 pb-4">
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
  <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
    <h1 className="font-scripture text-base font-semibold text-foreground text-center">
      Minha Jornada
    </h1>
  </div>
);

const EmptyState = () => (
  <div className="space-y-4">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl p-5 shadow-soft border border-border/50 text-center space-y-2"
    >
      <div className="w-10 h-10 mx-auto rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        <BookMarked className="w-5 h-5" />
      </div>
      <p className="text-sm text-foreground font-medium">Nenhum estudo registrado ainda</p>
      <p className="text-xs text-muted-foreground">
        Comece a estudar no Leitor — marque textos, anote observações — e sua jornada será registrada aqui.
      </p>
    </motion.div>
  </div>
);

const StatCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div className="bg-card rounded-xl p-3 border border-border/50 text-center space-y-1">
    <span className="text-lg">{icon}</span>
    <p className="text-lg font-semibold text-foreground font-ui">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
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
    className="bg-card rounded-xl p-5 shadow-soft border border-border/50 space-y-3"
  >
    <div className="flex items-center gap-2 text-accent">
      {icon}
      <h3 className="text-xs uppercase tracking-widest font-medium">{title}</h3>
    </div>
    {children}
  </motion.div>
);

export default MinhaJornada;
