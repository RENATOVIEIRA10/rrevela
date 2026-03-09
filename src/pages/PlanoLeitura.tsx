import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  BookOpen, CheckCircle2, ChevronRight, Bell, BellOff,
  Calendar, Loader2, ArrowLeft,
} from "lucide-react";
import { READING_PLANS, type ReadingPlan } from "@/lib/reading-plans";
import { useReadingPlan } from "@/hooks/useReadingPlan";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PlanoLeitura = () => {
  const navigate = useNavigate();
  const {
    activePlan, activeProgress, currentDay, todayReading,
    isTodayComplete, completedCount, isLoading,
    enroll, enrolling, markDayComplete, markingComplete, switchPlan, switching,
  } = useReadingPlan();
  const { isSubscribed, isLoading: pushLoading, isSupported, subscribe, unsubscribe } = usePushNotifications();
  const [showPicker, setShowPicker] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  const handleReadNow = () => {
    if (!todayReading?.entries?.length) return;
    const first = todayReading.entries[0];
    navigate(`/leitor?livro=${encodeURIComponent(first.book)}&cap=${first.chapter}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  // ─── PLAN PICKER ───
  if (!activePlan || showPicker) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <ScrollArea className="flex-1">
          <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
            {showPicker && (
              <button
                onClick={() => setShowPicker(false)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 py-2"
            >
              <p className="font-scripture text-xl text-foreground">
                Escolha sua jornada
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Um plano de leitura cria o hábito de encontrar Cristo na Palavra todos os dias.
              </p>
            </motion.div>

            <div className="space-y-3">
              {READING_PLANS.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  onSelect={() => {
                    if (showPicker) switchPlan(plan.id);
                    else enroll(plan.id);
                    setShowPicker(false);
                  }}
                  loading={enrolling || switching}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ─── ACTIVE PLAN VIEW ───
  const progress = activePlan.totalDays > 0 ? Math.round((completedCount / activePlan.totalDays) * 100) : 0;
  const tomorrowReading = currentDay < activePlan.totalDays ? activePlan.schedule[currentDay] : null;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
          {/* Active plan info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 bg-accent/5 border border-accent/20"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activePlan.emoji}</span>
                  <span className="text-sm font-semibold text-foreground">{activePlan.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dia {currentDay} de {activePlan.totalDays}
                  {completedCount > 0 && ` · ${completedCount} concluídos`}
                </p>
              </div>
              <button
                onClick={() => setShowPicker(true)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Trocar
              </button>
            </div>

            <div className="mt-3 space-y-1">
              <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{completedCount} concluídos</span>
                <span>{progress}%</span>
              </div>
            </div>
          </motion.div>

          {/* Today's reading */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-5 border space-y-4 ${
              isTodayComplete ? "border-accent/30 bg-accent/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2">
              {isTodayComplete ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : (
                <BookOpen className="w-5 h-5 text-accent" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {isTodayComplete ? "Leitura de hoje — Concluída ✓" : "Leitura de hoje"}
              </span>
            </div>

            {todayReading && (
              <div className="space-y-1">
                <p className="font-scripture text-xl text-foreground leading-snug">
                  {todayReading.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {todayReading.entries.length} capítulo{todayReading.entries.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {!isTodayComplete && (
              <div className="flex gap-2">
                <Button onClick={handleReadNow} className="flex-1" size="sm">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Ler agora
                </Button>
                <Button
                  onClick={() => markDayComplete()}
                  variant="outline"
                  size="sm"
                  disabled={markingComplete}
                >
                  {markingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {isTodayComplete && tomorrowReading && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Amanhã</p>
                <p className="text-sm text-foreground/70 font-scripture">{tomorrowReading.label}</p>
              </div>
            )}
          </motion.div>

          {/* Notifications toggle */}
          {isSupported && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4 border border-border bg-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {isSubscribed ? (
                  <Bell className="w-5 h-5 text-accent" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Lembretes diários</p>
                  <p className="text-xs text-muted-foreground">
                    {isSubscribed ? "Notificações ativas" : "Receba um lembrete todos os dias"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={isSubscribed ? unsubscribe : subscribe}
                disabled={pushLoading}
              />
            </motion.div>
          )}

          {/* Completed days grid */}
          {completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-4 border border-border bg-card space-y-3"
            >
              <div className="flex items-center gap-2 text-accent">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-medium">Histórico</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(showAllDays
                  ? [...(activeProgress?.completed_days ?? [])]
                  : [...(activeProgress?.completed_days ?? [])].slice(-20)
                )
                  .sort((a, b) => b - a)
                  .map((day) => {
                    const dayData = activePlan.schedule[day - 1];
                    return (
                      <div
                        key={day}
                        title={dayData?.label}
                        className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-[10px] font-semibold text-accent"
                      >
                        {day}
                      </div>
                    );
                  })}
              </div>
              {(activeProgress?.completed_days?.length ?? 0) > 20 && (
                <button
                  onClick={() => setShowAllDays(!showAllDays)}
                  className="text-[10px] text-accent hover:text-accent/80 transition-colors"
                >
                  {showAllDays ? "Mostrar menos" : `Ver todos (${activeProgress?.completed_days?.length})`}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const Header = () => (
  <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
    <h1 className="font-scripture text-base font-semibold text-foreground text-center">
      Plano de Leitura
    </h1>
  </div>
);

const PlanCard = ({
  plan,
  index,
  onSelect,
  loading,
}: {
  plan: ReadingPlan;
  index: number;
  onSelect: () => void;
  loading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="rounded-2xl p-5 bg-card border border-border/50 space-y-3"
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl mt-0.5">{plan.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{plan.name}</p>
        <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{plan.totalDays} dias</span>
    </div>
    <p className="text-sm text-foreground/80">{plan.description}</p>
    <Button onClick={onSelect} disabled={loading} className="w-full" size="sm">
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      Começar este plano
      <ChevronRight className="w-4 h-4 ml-1" />
    </Button>
  </motion.div>
);

export default PlanoLeitura;
