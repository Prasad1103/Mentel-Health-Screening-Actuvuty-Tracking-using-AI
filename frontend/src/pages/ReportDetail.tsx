import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Download,
  ShieldAlert,
  ClipboardList,
  Camera,
  FileText,
  AlertCircle,
  MessageSquare,
  Mic,
  Layers,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { getSessionById, type SessionReport } from "@/lib/api";
import {
  buildExplanation,
  calculateStabilityScore,
  emotionColor,
  getConcernLevel,
  getRecommendation,
  getRiskLevel,
  getWellnessIndicator,
  getWellnessStatus,
  normalizeConfidence,
} from "@/lib/productInsights";

export default function ReportDetail() {
  const { id } = useParams();
  const [session, setSession] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSessionById(Number(id))
      .then((data) => {
        if (active) setSession(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const metrics = useMemo(() => {
    if (!session) return null;
    const confidence = normalizeConfidence(session.confidence);
    const stability = calculateStabilityScore([session]);
    const wellness = getWellnessIndicator(stability);
    const risk = getRiskLevel(session.concern, confidence);
    const concern = session.concern || getConcernLevel(confidence);
    const emotion = session.emotion || concern;
    const wellnessStatus = getWellnessStatus(concern);
    const explanation = session.explanation?.reasons?.length
      ? session.explanation.reasons
      : buildExplanation(session.concern, confidence, session.type);

    return { confidence, stability, wellness, risk, concern, emotion, wellnessStatus, explanation };
  }, [session]);

  const isQuestionnaire = (session?.type || "").toLowerCase() === "questionnaire";
  const isChat = (session?.type || "").toLowerCase() === "chat";
  const isFusion = (session?.type || "").toLowerCase() === "fusion";
  const sd = session?.structured_data;

  // Safely extract structured answers
  const answers = sd?.answers ?? {};
  const freeText = sd?.free_text ?? null;
  const facialEmotion = sd?.facial_emotion ?? null;
  const answerEntries = Object.entries(answers);
  const chatTranscript = sd?.transcript ?? [];
  const chatMessage = sd?.message ?? null;
  const audioSummary = sd?.audio_summary ?? null;

  // Questionnaire score metrics
  const qScore = isQuestionnaire ? (sd?.score ?? null) : null;
  const qCompletion = isQuestionnaire ? (sd?.completion_pct ?? null) : null;
  const qTotalAnswers = isQuestionnaire ? (sd?.total_answers ?? null) : null;

  // Fusion structured data
  const fusionModalities = sd?.modalities_used;
  const fusionTextResult = sd?.text_result;
  const fusionAudioResult = sd?.audio_result;
  const fusionFaceResult = sd?.face_result;
  const fusionMethod = sd?.fusion_method;
  const fusionWeights = sd?.fusion_weights;
  const fusionText = sd?.text;

  const downloadPdf = () => {
    if (!session || !metrics) return;

    const doc = new jsPDF();
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Behavioral Intelligence Report", 14, 22);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);

    let y = 46;
    doc.text(`Type: ${session.type}`, 14, y); y += 10;
    doc.text(`Detected Emotion: ${metrics.emotion}`, 14, y); y += 10;
    doc.text(`Concern Level: ${metrics.concern}`, 14, y); y += 10;
    doc.text(`Confidence: ${metrics.confidence.toFixed(1)}%`, 14, y); y += 10;
    doc.text(`Wellness: ${metrics.wellnessStatus}`, 14, y); y += 10;
    doc.text(`Risk Level: ${metrics.risk.label}`, 14, y); y += 14;

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(session.summary || "", 180);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 10;

    if (isQuestionnaire && answerEntries.length > 0) {
      doc.setFontSize(12);
      doc.text("Questionnaire Responses", 14, y); y += 8;
      doc.setFontSize(10);
      answerEntries.forEach(([qId, ans]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${qId}: ${ans.label}`, 14, y);
        y += 6;
      });
      if (freeText) {
        y += 4;
        doc.setFontSize(11);
        doc.text("Free-text Response:", 14, y); y += 6;
        doc.setFontSize(10);
        const ftLines = doc.splitTextToSize(freeText, 180);
        doc.text(ftLines, 14, y);
      }
    }

    if (isChat && chatTranscript.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text("Chat Transcript", 14, y); y += 8;
      doc.setFontSize(10);
      chatTranscript.forEach((turn) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`${turn.role}: ${turn.content}`, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 4;
      });
    }

    doc.save(`behavioral-report-${session.id}.pdf`);
  };

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading report...</div>;
  }

  if (!session || !metrics) {
    return (
      <div className="p-10">
        <Button variant="outline" asChild>
          <Link to="/app/history">
            <ArrowLeft className="h-4 w-4" />
            Back to history
          </Link>
        </Button>
        <div className="mt-8 bg-card border rounded-xl p-10 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-display text-xl font-bold mb-2">Report not found</h3>
          <p className="text-muted-foreground">This session may have been deleted or does not exist.</p>
        </div>
      </div>
    );
  }

  const color = emotionColor[metrics.concern] || "#3B82F6";

  const chartData = [
    { name: metrics.concern, value: metrics.confidence, fill: color },
    { name: "Remaining uncertainty", value: Math.max(0, 100 - metrics.confidence), fill: "#E2E8F0" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-10 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" asChild>
          <Link to="/app/history">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <Button onClick={downloadPdf} aria-label="Download PDF report">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Main Report Card */}
      <section className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {isFusion ? "Multi-modal Fusion Report" : isQuestionnaire ? "Questionnaire Report" : isChat ? "AI Chat Report" : "Analysis Report"}
              </p>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                {isFusion && <Layers className="h-3 w-3" />}
                {isQuestionnaire && <ClipboardList className="h-3 w-3" />}
                {isChat && <MessageSquare className="h-3 w-3" />}
                {session.type}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold" style={{ color }}>
              {metrics.concern}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {session.summary || "No summary available"}
            </p>

            {/* Clear Emotion vs Concern breakdown */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detected Emotion</div>
                <div className="mt-2 text-lg font-bold text-foreground">{metrics.emotion}</div>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Concern Level</div>
                <div className="mt-2 text-lg font-bold" style={{ color }}>{metrics.concern}</div>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confidence</div>
                <div className="mt-2 text-lg font-bold text-foreground">{metrics.confidence.toFixed(1)}%</div>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wellness Status</div>
                <div className="mt-2 text-sm font-bold text-foreground">{metrics.wellnessStatus}</div>
              </div>
            </div>

            {/* Additional metrics */}
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stability</div>
                <div className="mt-2 text-lg font-bold text-foreground">{metrics.stability}/100</div>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Level</div>
                <div className="mt-2 text-lg font-bold text-foreground">{metrics.risk.label}</div>
              </div>
              <div className="rounded-lg border bg-secondary/30 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Report ID</div>
                <div className="mt-2 text-lg font-bold text-foreground">#{session.id}</div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Generated: {new Date(session.created_at).toLocaleString()}
            </p>
          </div>

          {/* Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={74} outerRadius={104} paddingAngle={2}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Questionnaire Structured Data */}
      {isQuestionnaire && (
        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <ClipboardList className="h-5 w-5 text-primary" />
            Questionnaire Responses
          </div>

          {/* Score metrics row */}
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Wellness Score</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${qScore ?? 0}%`,
                      backgroundColor: qScore !== null && qScore >= 70 ? '#10B981' : qScore !== null && qScore >= 40 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <span className="text-lg font-bold">{qScore !== null ? `${qScore}/100` : "—"}</span>
              </div>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Completion</div>
              <div className="mt-2 text-lg font-bold">{qCompletion !== null ? `${qCompletion}%` : "—"}</div>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Answers</div>
              <div className="mt-2 text-lg font-bold">{qTotalAnswers !== null ? `${qTotalAnswers} questions` : "—"}</div>
            </div>
          </div>

          {answerEntries.length > 0 ? (
            <div className="space-y-2 mb-6">
              {answerEntries.map(([qId, ans], i) => (
                <div key={qId} className="rounded-lg border bg-secondary/20 p-3">
                  <p className="text-xs text-muted-foreground">Question {i + 1} - {qId}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{ans?.label || ans?.value || "-"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">Answers not available for this session.</p>
          )}

          {/* Free-text */}
          <div className="rounded-lg border bg-secondary/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Free-text Response</p>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {freeText || "Not provided"}
            </p>
          </div>

          {/* Facial emotion */}
          <div className="rounded-lg border bg-secondary/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Facial Emotion Signal</p>
            </div>
            <p className="text-sm text-foreground">
              {facialEmotion || "Not used"}
            </p>
          </div>
        </section>
      )}

      {/* Fusion Structured Data */}
      {isFusion && fusionModalities && (
        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Layers className="h-5 w-5 text-primary" />
            Multi-modal Fusion Breakdown
          </div>

          <div className="grid gap-3 md:grid-cols-3 mb-5">
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                <FileText className="h-3.5 w-3.5" /> Text Result
              </div>
              <div className="text-lg font-bold text-foreground">{fusionTextResult?.emotion || "—"}</div>
              {fusionTextResult?.confidence != null && (
                <div className="text-xs text-muted-foreground">
                  {normalizeConfidence(fusionTextResult.confidence).toFixed(1)}% confidence
                </div>
              )}
              {fusionWeights && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: "#1E3A8A"}} /> Weight: {fusionWeights.text * 100}%
                </div>
              )}
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                <Mic className="h-3.5 w-3.5" /> Audio Result
              </div>
              <div className="text-lg font-bold text-foreground">{fusionAudioResult?.emotion || "—"}</div>
              {fusionAudioResult?.confidence != null && (
                <div className="text-xs text-muted-foreground">
                  {normalizeConfidence(fusionAudioResult.confidence).toFixed(1)}% confidence
                </div>
              )}
              {fusionWeights && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: "#06B6D4"}} /> Weight: {fusionWeights.audio * 100}%
                </div>
              )}
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                <Camera className="h-3.5 w-3.5" /> Face Result
              </div>
              <div className="text-lg font-bold text-foreground">{fusionFaceResult?.emotion || "—"}</div>
              {fusionFaceResult?.confidence != null && (
                <div className="text-xs text-muted-foreground">
                  {normalizeConfidence(fusionFaceResult.confidence).toFixed(1)}% confidence
                </div>
              )}
              {fusionWeights && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{backgroundColor: "#4338CA"}} /> Weight: {fusionWeights.face * 100}%
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fusion Method</div>
              <p className="mt-1 text-sm font-medium text-foreground capitalize">
                {fusionMethod?.replace(/_/g, " ") || "Weighted average"}
              </p>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Modalities Combined</div>
              <p className="mt-1 text-sm font-medium text-foreground">
                {fusionModalities?.join(" + ") || "text + audio + face"}
              </p>
            </div>
          </div>

          {fusionText && (
            <div className="mt-4 rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Input Text</p>
              </div>
              <p className="text-sm text-foreground line-clamp-4">{fusionText}</p>
            </div>
          )}
        </section>
      )}

      {/* Chat Structured Data */}
      {isChat && (
        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat Session
          </div>

          <div className="grid gap-3 md:grid-cols-3 mb-5">
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest Message</div>
              <p className="mt-2 text-sm text-foreground line-clamp-4">{chatMessage || session.summary || "Not available"}</p>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Mic className="h-3.5 w-3.5" />
                Audio Signal
              </div>
              <p className="mt-2 text-sm text-foreground">{audioSummary || "Not used"}</p>
            </div>
            <div className="rounded-lg border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Camera className="h-3.5 w-3.5" />
                Facial Signal
              </div>
              <p className="mt-2 text-sm text-foreground">{facialEmotion || "Not used"}</p>
            </div>
          </div>

          {chatTranscript.length > 0 ? (
            <div className="space-y-3">
              {chatTranscript.map((turn, i) => (
                <div key={`${turn.role}-${i}`} className="rounded-lg border bg-secondary/20 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {turn.role === "user" ? "User" : "Assistant"}
                  </p>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{turn.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Transcript not available for this chat report.</p>
          )}
        </section>
      )}

      {/* Explanation + Recommendation */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Brain className="h-5 w-5 text-primary" />
            Why this was predicted
          </div>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {metrics.explanation.map((reason, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Professional Recommendation
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {session.recommendations?.items?.[0] || getRecommendation(session.concern)}
          </p>
          {session.recommendations?.items && session.recommendations.items.length > 1 && (
            <ul className="mt-3 space-y-1">
              {session.recommendations.items.slice(1).map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Disclaimer */}
          <div className="mt-4 rounded-lg bg-secondary/40 border border-border/60 p-3">
            <p className="text-xs leading-5 text-muted-foreground">
              This is an AI-assisted behavioral insight and not a medical diagnosis.
              Results are generated by machine learning models and should be interpreted as
              supportive guidance, not clinical advice.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
