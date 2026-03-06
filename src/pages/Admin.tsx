import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, BookOpen, Search, StickyNote, Palette, Share2, Sparkles, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  revelationMode: number;
  totalNotes: number;
  noteUserPct: number;
  recentShares: { book: string; chapter: number; verse: number; share_text: string; created_at: string }[];
  recentQueries: { event_data: { query?: string }; created_at: string; user_id: string }[];
  topPassages: { passage: string; count: number }[];
  growthData: { date: string; count: number }[];
  users: { user_id: string; display_name: string; email: string; created_at: string; last_sign_in: string | null }[];
}

const MetricCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const Admin = () => {
  const { isAdmin, loading: roleLoading } = useAdminCheck();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (roleLoading || !isAdmin) return;
    const fetchMetrics = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase.functions.invoke("admin-metrics");

        if (error) {
          setMetrics(null);
          setError("Não foi possível carregar métricas.");
          return;
        }

        if (!data) {
          setMetrics(null);
          setError("Painel sem dados no momento.");
          return;
        }

        setMetrics(data as AdminMetrics);
      } catch {
        setMetrics(null);
        setError("Não foi possível carregar métricas.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [isAdmin, roleLoading]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/leitor" replace />;
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Painel sem dados no momento.</p>
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

          {/* 1. General Metrics */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" /> Métricas Gerais
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard icon={Users} label="Total de Usuários" value={metrics.totalUsers} />
              <MetricCard icon={Users} label="Ativos Hoje" value={metrics.activeTodayCount} />
              <MetricCard icon={Users} label="Ativos na Semana" value={metrics.activeWeekCount} />
              <MetricCard icon={Users} label="Ativos no Mês" value={metrics.activeMonthCount} />
            </div>
          </section>

          {/* 2. Activity */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" /> Atividade no App
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard icon={BookOpen} label="Capítulos Lidos" value={metrics.versesRead} />
              <MetricCard icon={Search} label="Buscas no Revela" value={metrics.revelaUsage} />
              <MetricCard icon={StickyNote} label="Anotações Criadas" value={metrics.notesCreated} />
              <MetricCard icon={Palette} label="Destaques Feitos" value={metrics.highlightsMade} />
              <MetricCard icon={Share2} label="Compartilhamentos" value={metrics.sharesCount} />
            </div>
          </section>

          {/* 3. Revela Queries */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" /> Perguntas no Revela
            </h2>
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
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-4">Nenhuma pergunta ainda</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 4. Top Passages */}
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
                    <p className="text-sm text-muted-foreground text-center py-4">Sem dados ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 5. Revelation Mode + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" /> Modo Revelação
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={Sparkles} label="Vezes Ativado" value={metrics.revelationMode} />
                <MetricCard icon={Search} label="Revela por Verso" value={metrics.revelaVerse} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-accent" /> Anotações
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={StickyNote} label="Total de Notas" value={metrics.totalNotes} />
                <MetricCard icon={Users} label="Usuários que Anotam" value={`${metrics.noteUserPct}%`} />
              </div>
            </section>
          </div>

          {/* 6. Shares */}
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
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-4">Nenhum compartilhamento</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 7. Growth Chart */}
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
                  <p className="text-sm text-muted-foreground text-center py-8">Sem dados de crescimento</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* 8. User List */}
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
