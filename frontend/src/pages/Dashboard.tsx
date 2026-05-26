
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Activity,
  Sparkles,
  AlertTriangle,
  Download,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Camera,
  Mic,
  Layers,
  FileText,
} from "lucide-react";
import ResultsPanel from "@/components/ResultsPanel";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  PolarRadiusAxis,
} from "recharts";

import jsPDF from "jspdf";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getLatest,
  listSessions,
  type SessionReport,
} from "@/lib/api";
import { getWellnessStatus, normalizeConfidence } from "@/lib/productInsights";

const PIE_COLORS = [
  "#10B981", // Positive
  "#0EA5E9", // Neutral
  "#F59E0B", // Stress
  "#4338CA", // Anxiety
  "#64748B", // Negative
  "#EF4444", // Depression
];

const FIXED_CLASSES = [
  "Positive",
  "Neutral",
  "Stress",
  "Anxiety",
  "Negative",
  "Depression",
];

const getRecommendation = (
  mood: string
) => {
  const map: Record<string, string> = {
    Positive:
      "Keep up your healthy routine and positive mindset.",
    Neutral:
      "Stay balanced with hydration, sleep, and regular breaks.",
    Stress:
      "Try 5-minute breathing exercises and reduce workload pressure.",
    Anxiety:
      "Practice mindfulness and grounding techniques today.",
    Negative:
      "Take a break, talk with someone trusted, and rest well.",
    Depression:
      "Please seek support, maintain routine, and stay connected with others.",
  };

  return (
    map[mood] ||
    "Maintain healthy habits and continue self-care."
  );
};

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  payload?: { subject?: string };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-xl shadow-glow-cyan border border-primary/20 backdrop-blur-md bg-background/80">
        <p className="text-foreground font-semibold">{`${payload[0].name || payload[0].payload?.subject || ''}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();

  const [report, setReport] =
    useState<SessionReport | null>(null);

  const [sessions, setSessions] =
    useState<SessionReport[]>([]);

  const [count, setCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [recommendation, setRecommendation] =
    useState(
      "Keep monitoring your emotional health regularly."
    );

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [latest, history] =
        await Promise.all([
          getLatest(),
          listSessions(),
        ]);

      setReport(latest);
      setSessions(history || []);
      setCount(history.length);

      if (latest) {
        setRecommendation(
          getRecommendation(
            latest.concern
          )
        );
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user, loadDashboard]);

  const downloadPdf = () => {
    if (!report) return;

    const doc = new jsPDF();

    // Premium styling for PDF
    doc.setFillColor(15, 23, 42); // Navy background header
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BE Analysis Report", 14, 25);

    doc.setTextColor(30, 41, 59); // Dark text
    doc.setFontSize(11);
    doc.text(
      `Generated: ${new Date(report.created_at).toLocaleString()}`,
      14,
      50
    );

    // A nice stat box
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, 58, 180, 25, 3, 3);

    doc.setFontSize(10);
    doc.text("TYPE", 20, 68);
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text(`${report.type || "Unknown"}`, 20, 75);

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text("CONCERN", 80, 68);
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text(`${report.concern}`, 80, 75);

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text("CONFIDENCE", 140, 68);
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text(`${confidence.toFixed(1)}%`, 140, 75);

    doc.setFont("helvetica", 'normal');
    doc.setFontSize(14);
    doc.text("Executive Summary", 14, 98);
    doc.setLineWidth(0.5);
    doc.line(14, 102, 194, 102);

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(report.summary, 180);
    doc.text(lines, 14, 110);

    doc.save(
      `report-${report.id}.pdf`
    );

    toast.success(
      "PDF downloaded"
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-8 animate-fade-in">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-secondary" />
            <Skeleton className="h-10 w-64 bg-secondary" />
            <Skeleton className="h-4 w-40 bg-secondary" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 bg-secondary" />
            <Skeleton className="h-10 w-36 bg-secondary" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-secondary" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-96 rounded-2xl bg-secondary" />
          <Skeleton className="h-96 rounded-2xl bg-secondary" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10">
        <div className="glass rounded-3xl p-12 text-center max-w-3xl mx-auto relative overflow-hidden shadow-elevated">
          <div className="absolute inset-0 bg-gradient-hero opacity-30" />
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 mb-6 shadow-glow-cyan"
            >
              <Brain className="h-10 w-10 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Welcome,{" "}
              <span className="text-gradient">{user?.name}</span>
            </h1>

            <p className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto">
              You haven't run any analysis yet. Start a session to generate your first behavioral & emotional report.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              <Button
                asChild
                variant="hero"
              >
                <Link to="/app/questionnaire">
                  <ClipboardList className="h-4 w-4" />
                  Questionnaire
                </Link>
              </Button>

              <Button
                asChild
                variant="glass"
              >
                <Link to="/app/chat">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const confidence =
    Number(report.confidence) <= 1
      ? Number(report.confidence) *
      100
      : Number(
        report.confidence
      );

  const normalizedConcern = report.concern ? report.concern.charAt(0).toUpperCase() + report.concern.slice(1).toLowerCase() : "Neutral";
  const detectedEmotion = report.emotion || normalizedConcern;
  const wellnessStatus = getWellnessStatus(normalizedConcern);
  const reportType = (report.type || "").toLowerCase();
  const isQuestionnaireType = reportType === "questionnaire";
  const isChatType = reportType === "chat";
  const isFusionType = reportType === "fusion";
  const chatTranscript = report.structured_data?.transcript || [];
  const questionnaireScore = isQuestionnaireType ? (report.structured_data?.score ?? null) : null;
  const questionnaireCompletion = isQuestionnaireType ? (report.structured_data?.completion_pct ?? null) : null;
  const questionnaireTotalAnswers = isQuestionnaireType ? (report.structured_data?.total_answers ?? null) : null;
  // Fusion-specific
  const fusionModalities = report.structured_data?.modalities_used;
  const fusionTextResult = report.structured_data?.text_result;
  const fusionAudioResult = report.structured_data?.audio_result;
  const fusionFaceResult = report.structured_data?.face_result;

  /* TYPE FIX */
  const latestType =
    report.type ||
    (report.summary
      ?.toLowerCase()
      .includes("fusion")
      ? "Fusion"
      : "Text");

  /* RADAR GRAPH */
  const radarData =
    FIXED_CLASSES.map(
      (item) => ({
        subject: item,
        value:
          item ===
          normalizedConcern
            ? confidence
            : 15,
      })
    );

  /* PIE CHART 6 CLASS DISTRIBUTION */
  const pieData =
    FIXED_CLASSES.map(
      (label) => {
        const total =
          sessions.filter(
            (s) =>
              s.concern ===
              label
          ).length;

        return {
          name: label,
          value:
            total || 0.1,
        };
      }
    );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-2">
            Latest Analysis
          </p>

          <h1 className="text-3xl font-bold">
            {normalizedConcern}
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            {new Date(
              report.created_at
            ).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            variant="glass"
          >
            <Link to="/app/history">
              History
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="hero"
            onClick={downloadPdf}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Sparkles}
          label="Detected Emotion"
          value={detectedEmotion}
          hint="Model prediction"
        />

        <StatCard
          icon={AlertTriangle}
          label="Concern Level"
          value={normalizedConcern}
          hint="Severity category"
        />

        <StatCard
          icon={Activity}
          label="Confidence"
          value={`${confidence.toFixed(
            1
          )}%`}
          hint="Prediction certainty"
        />

        <StatCard
          icon={TrendingUp}
          label="Sessions"
          value={count}
          hint="Total history"
        />
      </div>

      {/* Module-specific detail card */}          {(isQuestionnaireType || isChatType || isFusionType) && (
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            {isFusionType ? (
              <Layers className="h-5 w-5 text-primary" />
            ) : isChatType ? (
              <MessageSquare className="h-5 w-5 text-primary" />
            ) : (
              <ClipboardList className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-bold">{isFusionType ? "Multi-modal Fusion Analysis" : isChatType ? "AI Chat Session" : "Questionnaire Assessment"}</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-secondary/30 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Module Type</div>
              <div className="mt-2 text-sm font-bold text-foreground">{latestType}</div>
            </div>
            <div className="rounded-lg border bg-secondary/30 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detected Emotion</div>
              <div className="mt-2 text-sm font-bold text-foreground">{detectedEmotion}</div>
            </div>
            <div className="rounded-lg border bg-secondary/30 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wellness Status</div>
              <div className="mt-2 text-sm font-bold text-foreground">{wellnessStatus}</div>
            </div>
            {isFusionType ? (
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Modalities Used</div>
                <div className="mt-2 text-sm font-bold text-foreground flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {fusionModalities?.length || 3} signals
                </div>
              </div>
            ) : isQuestionnaireType ? (
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wellness Score</div>
                <div className="mt-2 text-sm font-bold text-foreground">
                  {questionnaireScore !== null ? `${questionnaireScore}/100` : "—"}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Conversation</div>
                <div className="mt-2 text-sm font-bold text-foreground flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {chatTranscript.length} turn{chatTranscript.length === 1 ? "" : "s"}
                </div>
              </div>
            )}
          </div>
          {isFusionType && (
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border bg-secondary/20 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  <FileText className="h-3 w-3" /> Text Signal
                </div>
                <div className="text-sm font-bold text-foreground">{fusionTextResult?.emotion || "—"}</div>
                {fusionTextResult?.confidence != null && (
                  <div className="text-[11px] text-muted-foreground">{normalizeConfidence(fusionTextResult.confidence).toFixed(0)}%</div>
                )}
              </div>
              <div className="rounded-lg border bg-secondary/20 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  <Mic className="h-3 w-3" /> Audio Signal
                </div>
                <div className="text-sm font-bold text-foreground">{fusionAudioResult?.emotion || "—"}</div>
                {fusionAudioResult?.confidence != null && (
                  <div className="text-[11px] text-muted-foreground">{normalizeConfidence(fusionAudioResult.confidence).toFixed(0)}%</div>
                )}
              </div>
              <div className="rounded-lg border bg-secondary/20 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  <Camera className="h-3 w-3" /> Face Signal
                </div>
                <div className="text-sm font-bold text-foreground">{fusionFaceResult?.emotion || "—"}</div>
                {fusionFaceResult?.confidence != null && (
                  <div className="text-[11px] text-muted-foreground">{normalizeConfidence(fusionFaceResult.confidence).toFixed(0)}%</div>
                )}
              </div>
            </div>
          )}
          {isQuestionnaireType && (
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              {questionnaireScore !== null && (
                <div className="rounded-lg border bg-secondary/20 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Score</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${questionnaireScore}%`,
                          backgroundColor: questionnaireScore >= 70 ? '#10B981' : questionnaireScore >= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold">{questionnaireScore}/100</span>
                  </div>
                </div>
              )}
              {questionnaireCompletion !== null && (
                <div className="rounded-lg border bg-secondary/20 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Completion</div>
                  <div className="mt-1 text-sm font-bold text-foreground">{questionnaireCompletion}%</div>
                </div>
              )}
              {questionnaireTotalAnswers !== null && (
                <div className="rounded-lg border bg-secondary/20 p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Answers</div>
                  <div className="mt-1 text-sm font-bold text-foreground">{questionnaireTotalAnswers} questions</div>
                </div>
              )}
            </div>
          )}
          {isChatType && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              Latest message: {report.structured_data?.message || report.summary}
            </p>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h3 className="font-bold mb-4">Emotion Radar</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis axisLine={false} tick={false} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Distribution - horizontal bars + legend */}
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h3 className="font-bold mb-1">Emotion Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Sessions per detected emotional state</p>

          <div className="space-y-3">
            {pieData.map((entry, i) => {
              const total = pieData.reduce((s, d) => s + d.value, 0);
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">{entry.name}</span>
                  <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, entry.value > 0 ? 4 : 0)}%`, backgroundColor: PIE_COLORS[i] }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold tabular-nums" style={{ color: PIE_COLORS[i] }}>
                    {entry.value > 0 ? `${pct}%` : "-"}
                  </span>
                  <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-card border shadow-sm rounded-xl p-6">
        <h3 className="font-bold mb-3">
          AI Recommendation
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          {recommendation}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-card border shadow-sm rounded-xl p-6">
        <h3 className="font-bold mb-3">
          Summary
        </h3>

        <p className="text-muted-foreground leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Results */}
      <ResultsPanel
        results={[
          {
            label: "Detected Emotion",
            value: detectedEmotion,
            confidence: confidence,
          },
          {
            label: "Concern Level",
            value: normalizedConcern,
          },
          {
            label: "Type",
            value: latestType,
          },
          {
            label: "Sessions",
            value: count,
          },
        ]}
      />
    </motion.div>
  );
}
