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

  // Group entries by era
  const grouped = entries.reduce<Record<string, DevotionalEntry[]>>((acc, entry) => {
    if (!acc[entry.era_key]) acc[entry.era_key] = [];
    acc[entry.era_key].push(entry);
    return acc;
  }, {});

  const favorites = entries.filter(e => progress.get(e.id)?.favorited);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 space-y-3">
        <h1 className="font-scripture text-base font-semibold text-foreground text-center">
          O Evangelho Revelado
        </h1>
        <p className="text-[10px] text-muted-foreground text-center tracking-wide">
          Uma jornada pela história da redenção
        </p>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("journey")}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              viewMode === "journey" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Jornada
          </button>
          <button
            onClick={() => setViewMode("favorites")}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              viewMode === "favorites" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Favoritos{favorites.length > 0 ? ` (${favorites.length})` : ""}
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-5 max-w-2xl mx-auto w-full space-y-6 pb-8">
          {/* Quick Devotional CTA */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setQuickOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Devocional Rápido · 3 min</span>
          </motion.button>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "journey" ? (
                <motion.div
                  key="journey"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Verse of the Day */}
                  <VerseOfDayCard verse={dailyVerse} loading={verseLoading} />

                  {/* Progress */}
                  <JourneyProgress completed={completedCount} total={totalCount} />

                  {/* Journey grouped by era */}
                  {Object.entries(grouped).map(([eraKey, eraEntries]) => {
                    const era = ERA_LABELS[eraKey] || { label: eraKey, emoji: "📖" };
                    return (
                      <div key={eraKey} className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-sm">{era.emoji}</span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                            {era.label}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="space-y-2">
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
                    <div className="flex flex-col items-center py-16 space-y-3">
                      <span className="text-3xl">⭐</span>
                      <p className="text-sm text-muted-foreground text-center">
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
    </div>
  );
};

export default Devocional;
