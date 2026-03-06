import { useState, useEffect } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, BookOpen, Search, StickyNote, Palette, Share2, Sparkles, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MetricStateEntry {
  key: string;
  status: "ok" | "empty" | "error";
  message?: string;
  source?: string;
}

interface AdminMetrics {
  totalUsers: number;
  activeTodayCount: number;
  activeWeekCount: number;
  activeMonthCount: number;
  versesRead: number;
  revelaUsage: number;
  revelaVerse: number;
  notesCreated: number;
  highlightsMade: number;
  sharesCount: number;
  questionsAsked: number;
  revelationMode: number;
  totalNotes: number;
  noteUserPct: number;
  recentShares: { book: string; chapter: number; verse: number; share_text: string; created_at: string }[];
  recentQueries: { event_data: { query?: string }; created_at: string; user_id: string }[];
  topPassages: { passage: string; count: number }[];
  growthData: { date: string; count: number }[];
  users: { user_id: string; display_name: string; email: string; created_at: string; last_sign_in: string | null }[];
  __meta?: {
    status: "ok" | "partial";
    metricErrors: Record<string, string>;
    metricState?: Record<string, MetricStateEntry>;
    analyticsAudit?: {
      events_table_selected: string | null;
      required_tables: Record<string, boolean>;
      missing_or_invalid: { key: string; reason: string; message: string }[];
    };
  };
}

interface AdminMetricsApiResponse {
  total_users?: number;
  active_today?: number;
  active_week?: number;
  active_month?: number;
  chapters_read?: number;
  revela_usage?: number;
  notes_created?: number;
  highlights_created?: number;
  shares_created?: number;
  questions?: { query?: string; created_at?: string; user_id?: string | null }[];
  top_passages?: { passage: string; count: number }[];
  __meta?: {
    endpoint?: string;
    status?: "ok" | "partial";
    metricErrors?: Record<string, string>;
    metricState?: Record<string, MetricStateEntry>;
    analyticsAudit?: {
      events_table_selected: string | null;
      required_tables: Record<string, boolean>;
      missing_or_invalid: { key: string; reason: string; message: string }[];
    };
  };
}

const EMPTY_METRICS: AdminMetrics = {
  totalUsers: 0,
  activeTodayCount: 0,
  activeWeekCount: 0,
  activeMonthCount: 0,
  versesRead: 0,
  revelaUsage: 0,
  revelaVerse: 0,
  notesCreated: 0,
  highlightsMade: 0,
  sharesCount: 0,
  questionsAsked: 0,
  revelationMode: 0,
  totalNotes: 0,
  noteUserPct: 0,
  recentShares: [],
  recentQueries: [],
  topPassages: [],
  growthData: [],
  users: [],
  __meta: {
    status: "ok",
    metricErrors: {},
  },
};

const MetricCard = ({ icon: Icon, label, value, sub, state }: { icon: any; label: string; value: string | number; sub?: string; state?: MetricStateEntry }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {state?.status === "error" ? (
          <p className="text-[10px] text-destructive">Erro ao carregar</p>
        ) : state?.status === "empty" ? (
          <p className="text-[10px] text-muted-foreground/70">Sem dados ainda</p>
        ) : (
          sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const Admin = () => {
  const { isAdmin, loading: roleLoading, role, email } = useAdminCheck();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metricsStatus, setMetricsStatus] = useState<"idle" | "loading" | "ok" | "partial" | "failed">("idle");
  const [metricsDebug, setMetricsDebug] = useState({
    endpoint: "admin-metrics",
    statusCode: 0,
    okKeys: [] as string[],
    failedKeys: [] as string[],
    error: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (roleLoading || !isAdmin) return;
    const fetchMetrics = async () => {
      setLoading(true);
      setError("");
      setMetricsStatus("loading");

      try {
        const endpoint = "admin-metrics";
        const { data, error } = await supabase.functions.invoke(endpoint);

        if (error) {
          const statusCode = (error as any)?.context?.status ?? 0;
          const endpointError = (error as any)?.message ?? "Erro desconhecido";
          console.error("[admin] admin-metrics invoke error:", error);
          setMetrics(EMPTY_METRICS);
          setMetricsStatus("failed");
          setMetricsDebug({ endpoint, statusCode, okKeys: [], failedKeys: [], error: endpointError });
          setError("Falha ao carregar endpoint de métricas.");
          return;
        }

        if (!data) {
          setMetrics(EMPTY_METRICS);
          setMetricsStatus("failed");
          setMetricsDebug({ endpoint, statusCode: 200, okKeys: [], failedKeys: [], error: "Resposta vazia" });
          setError("Painel sem dados no momento.");
          return;
        }

        const payload = data as AdminMetricsApiResponse;

        const parsed = {
          ...EMPTY_METRICS,
          totalUsers: payload.total_users ?? 0,
          activeTodayCount: payload.active_today ?? 0,
          activeWeekCount: payload.active_week ?? 0,
          activeMonthCount: payload.active_month ?? 0,
          versesRead: payload.chapters_read ?? 0,
          revelaUsage: payload.revela_usage ?? 0,
          notesCreated: payload.notes_created ?? 0,
          highlightsMade: payload.highlights_created ?? 0,
          sharesCount: payload.shares_created ?? 0,
          recentQueries: (payload.questions ?? []).map((q) => ({
            event_data: { query: q.query ?? "" },
            created_at: q.created_at ?? new Date(0).toISOString(),
            user_id: q.user_id ?? null,
          })),
          topPassages: payload.top_passages ?? [],
          __meta: {
            status: (payload.__meta?.status ?? "ok") as "ok" | "partial",
            metricErrors: payload.__meta?.metricErrors ?? {},
            metricState: payload.__meta?.metricState ?? {},
            analyticsAudit: payload.__meta?.analyticsAudit,
          },
        };

        const okKeys = Object.values(parsed.__meta?.metricState ?? {})
          .filter((m) => m.status !== "error")
          .map((m) => m.key);
        const failedKeys = Object.values(parsed.__meta?.metricState ?? {})
          .filter((m) => m.status === "error")
          .map((m) => m.key);

        setMetricsDebug({
          endpoint: payload.__meta?.endpoint ?? endpoint,
          statusCode: 200,
          okKeys,
          failedKeys,
          error: "",
        });

        if (Object.keys(parsed.__meta?.metricErrors ?? {}).length > 0) {
          console.warn("[admin] métricas parciais:", parsed.__meta?.metricErrors);
        }

        setMetrics(parsed);
        setMetricsStatus(parsed.__meta?.status ?? "ok");
      } catch (err) {
        console.error("[admin] falha inesperada ao buscar métricas:", err);
        setMetrics(EMPTY_METRICS);
        setMetricsStatus("failed");
        setMetricsDebug({ endpoint: "admin-metrics", statusCode: 0, okKeys: [], failedKeys: [], error: String(err) });
        setError("Falha inesperada ao carregar métricas.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [isAdmin, roleLoading]);

  const metricState = metrics.__meta?.metricState ?? {};
  const metricErrors = metrics.__meta?.metricErrors ?? {};

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando painel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/leitor")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-scripture text-lg font-semibold text-foreground">Painel Administrativo</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-53px)]">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debug de acesso (temporário)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p><strong>Email logado:</strong> {email ?? user?.email ?? "-"}</p>
              <p><strong>Role atual:</strong> {role}</p>
              <p><strong>Reconhecido como admin:</strong> {isAdmin ? "sim" : "não"}</p>
              <p><strong>Status das métricas:</strong> {metricsStatus}</p>
              <p><strong>Endpoint:</strong> {metricsDebug.endpoint}</p>
              <p><strong>Status HTTP:</strong> {metricsDebug.statusCode || "n/d"}</p>
              <p><strong>Fonte de eventos:</strong> {metrics.__meta?.analyticsAudit?.events_table_selected ?? "não detectada"}</p>
              <p><strong>Métricas com sucesso:</strong> {metricsDebug.okKeys.length > 0 ? metricsDebug.okKeys.join(", ") : "nenhuma"}</p>
              <p><strong>Métricas com falha:</strong> {metricsDebug.failedKeys.length > 0 ? metricsDebug.failedKeys.join(", ") : "nenhuma"}</p>
              {Object.keys(metricErrors).length > 0 ? (
                <div className="pt-1">
                  <p><strong>Métricas com falha ({Object.keys(metricErrors).length}):</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(metricErrors).map(([key, reason]) => (
                      <li key={key}><strong>{key}</strong>: {reason}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p><strong>Métricas com falha:</strong> nenhuma</p>
              )}
              {metricsDebug.error && <p className="text-destructive"><strong>Erro endpoint:</strong> {metricsDebug.error}</p>}
              {error && <p className="text-destructive"><strong>Observação:</strong> {error}</p>}
            </CardContent>
          </Card>

          {/* 1. General Metrics */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Métricas Gerais
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard icon={Users} label="Total de Usuários" value={metrics.totalUsers} state={metricState.total_users} />
              <MetricCard icon={Users} label="Ativos Hoje" value={metrics.activeTodayCount} state={metricState.active_today} />
              <MetricCard icon={Users} label="Ativos na Semana" value={metrics.activeWeekCount} state={metricState.active_week} />
              <MetricCard icon={Users} label="Ativos no Mês" value={metrics.activeMonthCount} state={metricState.active_month} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Atividade no App
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard icon={BookOpen} label="Capítulos Lidos" value={metrics.versesRead} state={metricState.chapters_read} />
              <MetricCard icon={Search} label="Uso do Revela" value={metrics.revelaUsage} state={metricState.revela_usage} />
              <MetricCard icon={StickyNote} label="Anotações Criadas" value={metrics.notesCreated} state={metricState.notes_created} />
              <MetricCard icon={Palette} label="Destaques Feitos" value={metrics.highlightsMade} state={metricState.highlights_created} />
              <MetricCard icon={Share2} label="Compartilhamentos" value={metrics.sharesCount} state={metricState.shares_created} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" /> Perguntas no Revela
            </h2>
            <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <MetricCard icon={Search} label="Perguntas Feitas" value={metrics.questionsAsked} state={metricState.questions_asked} />
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pergunta</TableHead>
                        <TableHead className="w-36">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.recentQueries.map((q, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-scripture text-sm">{q.event_data?.query || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(q.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                      {metrics.recentQueries.length === 0 && (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-4">{metricState.recent_questions?.status === "error" ? "Erro ao carregar" : "Nenhuma pergunta ainda"}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Passagens Mais Acessadas
            </h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {metrics.topPassages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-scripture text-foreground">{p.passage}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-accent/20 rounded-full" style={{ width: `${Math.min(200, (p.count / (metrics.topPassages[0]?.count || 1)) * 120)}px` }}>
                          <div className="h-full bg-accent rounded-full" style={{ width: "100%" }} />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{p.count}</span>
                      </div>
                    </div>
                  ))}
                  {metrics.topPassages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{metricState.most_accessed_passages?.status === "error" ? "Erro ao carregar" : "Sem dados ainda"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Modo Revelação
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={Sparkles} label="Vezes Ativado" value={metrics.revelationMode} state={metricState.revelation_mode} />
                <MetricCard icon={Search} label="Revela por Verso" value={metrics.revelaVerse} state={metricState.revela_verse} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-accent" /> Anotações
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={StickyNote} label="Total de Notas" value={metrics.totalNotes} state={metricState.total_notes} />
                <MetricCard icon={Users} label="Usuários que Anotam" value={`${metrics.noteUserPct}%`} state={metricState.note_user_pct} />
              </div>
            </section>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-accent" /> Compartilhamentos Recentes
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead className="w-36">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.recentShares.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-scripture text-sm">{s.book} {s.chapter}:{s.verse}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(s.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                      {metrics.recentShares.length === 0 && (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-4">{metricState.recent_shares?.status === "error" ? "Erro ao carregar" : "Nenhum compartilhamento"}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Crescimento (últimos 30 dias)
            </h2>
            <Card>
              <CardContent className="p-4">
                {metrics.growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={metrics.growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v: string) => v.slice(5)}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "hsl(var(--accent))" }}
                        name="Novos usuários"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">{metricState.growth_data?.status === "error" ? "Erro ao carregar" : "Sem dados de crescimento"}</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Lista de Usuários
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Criação</TableHead>
                        <TableHead>Último acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="text-sm font-medium">{u.display_name || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString("pt-BR") : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
};

export default Admin;
