import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, CalendarDays, RefreshCcw, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listSessions, type SessionReport } from "@/lib/api";
import {
  calculateStabilityScore,
  emotionDistribution,
  heatmapData,
  normalizeConfidence,
  weeklyTrend,
} from "@/lib/productInsights";

const StatSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <Skeleton className="mb-4 h-10 w-10 rounded-lg bg-muted" />
    <Skeleton className="mb-2 h-3 w-24 bg-muted" />
    <Skeleton className="h-8 w-16 bg-muted" />
  </div>
);

const ChartSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
    <Skeleton className="mb-5 h-5 w-40 bg-muted" />
    <Skeleton className="h-80 w-full rounded-lg bg-muted" />
  </div>
);

export default function Analytics() {
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load analytics";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stability = calculateStabilityScore(sessions);
  const trend = weeklyTrend(sessions);
  const distribution = emotionDistribution(sessions);
  const heatmap = heatmapData(sessions);

  const hasData = sessions.length > 0;

  const confidenceByType = useMemo(() => {
    // Derive types dynamically from actual session data instead of hardcoding
    const types = [...new Set(sessions.map((s) => s.type))].filter(Boolean) as string[];
    if (types.length === 0) return [];

    return types.map((type) => {
      const matches = sessions.filter((session) => session.type === type);
      const average = matches.length
        ? matches.reduce((sum, session) => sum + normalizeConfidence(session.confidence), 0) / matches.length
        : 0;
      return { type, confidence: Math.round(average) };
    });
  }, [sessions]);

  const statCards = [
    {
      label: "Behavioral stability",
      value: stability !== null ? `${stability}/100` : "—",
      icon: Activity,
    },
    {
      label: "Total sessions",
      value: sessions.length || 0,
      icon: CalendarDays,
    },
    {
      label: "Fusion sessions",
      value: sessions.filter((s) => s.type === "Fusion").length,
      icon: TrendingUp,
    },
    {
      label: "Average confidence",
      value: sessions.length
        ? `${Math.round(sessions.reduce((sum, s) => sum + normalizeConfidence(s.confidence), 0) / sessions.length)}%`
        : "—",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Longitudinal intelligence
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Monitor emotional trends, modality confidence, and behavioral stability across sessions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</div>
                <div className="mt-2 text-3xl font-bold text-foreground">{item.value}</div>
              </div>
            ))}
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !hasData && (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">No session data yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete a questionnaire, chat, fusion, or text analysis session to see longitudinal trends, emotion distribution,
            and behavioral stability metrics.
          </p>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && hasData && (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-foreground">Recent stability trend</h2>
              {trend.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="stability" stroke="#1E3A8A" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="confidence" stroke="#06B6D4" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                  Not enough session data to generate a trend.
                </div>
              )}
            </section>

            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-foreground">Modality confidence</h2>
              {confidenceByType.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidenceByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="type" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="confidence" fill="#4338CA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
                  No modality data available.
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-1 font-semibold text-foreground">Emotion distribution</h2>
              <p className="text-xs text-muted-foreground mb-5">Sessions per detected emotional state</p>
              <div className="space-y-3">
                {distribution.map((entry) => {
                  const total = distribution.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">{entry.name}</span>
                      <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, entry.value > 0 ? 4 : 0)}%`, backgroundColor: entry.fill }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-bold tabular-nums" style={{ color: entry.fill }}>
                        {entry.value > 0 ? `${pct}%` : "—"}
                      </span>
                      <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{entry.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-foreground">Session heatmap</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {heatmap.map((cell) => (
                  <div
                    key={cell.id}
                    title={cell.label}
                    className="aspect-square rounded-lg"
                    style={{
                      backgroundColor: cell.color,
                      opacity: Math.max(0.18, cell.intensity / 100),
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Each square represents a recent session. Darker color means stronger model confidence.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
