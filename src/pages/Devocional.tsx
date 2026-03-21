import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { useDevotionalJourney, useVerseOfDay } from "@/hooks/useDevotional";
import VerseOfDayCard from "@/components/devotional/VerseOfDayCard";
import JourneyProgress from "@/components/devotional/JourneyProgress";
import DevotionalCard from "@/components/devotional/DevotionalCard";
import DevotionalDetail from "@/components/devotional/DevotionalDetail";
import QuickDevotional from "@/components/QuickDevotional";
import type { DevotionalEntry } from "@/hooks/useDevotional";

const ERA_LABELS: Record<string, { label: string; emoji: string }> = {
  criacao: { label: "Criação", emoji: "🌅" },
  promessa: { label: "Promessa", emoji: "🌟" },
  israel: { label: "Israel", emoji: "⛺" },
  messias: { label: "Messias", emoji: "✝️" },
  igreja: { label: "Igreja", emoji: "🕊️" },
  consumacao: { label: "Consumação", emoji: "👑" },
};

type ViewMode = "journey" | "favorites";

const Devocional = () => {
  const { entries, progress, loading, completedCount, totalCount, toggleComplete, toggleFavorite } = useDevotionalJourney();
  const { verse: dailyVerse, loading: verseLoading } = useVerseOfDay();
  const [selectedEntry, setSelectedEntry] = useState<DevotionalEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("journey");
  const [quickOpen, setQuickOpen] = useState(false);

  if (selectedEntry) {
    const p = progress.get(selectedEntry.id);
    return (
      <DevotionalDetail
        entry={selectedEntry}
        isCompleted={p?.completed || false}
        isFavorited={p?.favorited || false}
        onToggleComplete={() => toggleComplete(selectedEntry.id)}
        onToggleFavorite={() => toggleFavorite(selectedEntry.id)}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  const grouped = entries.reduce<Record<string, DevotionalEntry[]>>((acc, entry) => {
    if (!acc[entry.era_key]) acc[entry.era_key] = [];
    acc[entry.era_key].push(entry);
    return acc;
  }, {});

  const favorites = entries.filter(e => progress.get(e.id)?.favorited);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Premium Header */}
      <div className="bg-card/80 backdrop-blur-sm px-5 pb-5 space-y-4 safe-top-header">
        <div className="text-center space-y-1">
          <h1 className="font-scripture text-xl font-semibold text-foreground tracking-wide">
            O Evangelho Revelado
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
            Uma jornada pela história da redenção
          </p>
        </div>

        {/* Elegant tab switcher */}
        <div className="flex items-center justify-center gap-8 pt-1">
          <button
            onClick={() => setViewMode("journey")}
            className={`relative text-sm pb-2 transition-colors min-h-[44px] ${
              viewMode === "journey" ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            Jornada
            {viewMode === "journey" && (
              <motion.div layoutId="devocional-tab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent rounded-full" />
            )}
          </button>
          <button
            onClick={() => setViewMode("favorites")}
            className={`relative text-sm pb-2 transition-colors min-h-[44px] ${
              viewMode === "favorites" ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            Favoritos{favorites.length > 0 ? ` (${favorites.length})` : ""}
            {viewMode === "favorites" && (
              <motion.div layoutId="devocional-tab" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent rounded-full" />
            )}
          </button>
        </div>

        <div className="editorial-divider" />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 py-6 max-w-2xl mx-auto w-full space-y-6 pb-10">
          {/* Quick Devotional CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setQuickOpen(true)}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-accent/[0.04] border border-accent/15 text-accent hover:bg-accent/[0.08] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Devocional Rápido · 3 min</span>
          </motion.button>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "journey" ? (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-7"
                >
                  <VerseOfDayCard verse={dailyVerse} loading={verseLoading} />
                  <JourneyProgress completed={completedCount} total={totalCount} />

                  {/* Journey grouped by era */}
                  {Object.entries(grouped).map(([eraKey, eraEntries]) => {
                    const era = ERA_LABELS[eraKey] || { label: eraKey, emoji: "📖" };
                    return (
                      <div key={eraKey} className="space-y-3">
                        <div className="flex items-center gap-2.5 px-1">
                          <span className="text-sm">{era.emoji}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                            {era.label}
                          </span>
                          <div className="flex-1 editorial-divider" />
                        </div>

                        <div className="space-y-2.5">
                          {eraEntries.map((entry, i) => (
                            <DevotionalCard
                              key={entry.id}
                              entry={entry}
                              isCompleted={progress.get(entry.id)?.completed || false}
                              isFavorited={progress.get(entry.id)?.favorited || false}
                              index={i}
                              onSelect={() => setSelectedEntry(entry)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {favorites.length === 0 ? (
                    <div className="flex flex-col items-center py-20 space-y-3">
                      <span className="text-2xl opacity-60">⭐</span>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Marque devocionais como favoritos para acessá-los aqui.
                      </p>
                    </div>
                  ) : (
                    favorites.map((entry, i) => (
                      <DevotionalCard
                        key={entry.id}
                        entry={entry}
                        isCompleted={progress.get(entry.id)?.completed || false}
                        isFavorited={true}
                        index={i}
                        onSelect={() => setSelectedEntry(entry)}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <QuickDevotional open={quickOpen} onOpenChange={setQuickOpen} />
    </div>
  );
};

export default Devocional;
