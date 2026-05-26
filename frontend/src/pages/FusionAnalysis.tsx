import { useMemo, useState } from "react";
import { Activity, Brain, Camera, CheckCircle2, FileText, Loader2, Mic, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import AudioRecorder from "@/components/AudioRecorder";
import WebcamCapture from "@/components/WebcamCapture";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeFusion, type AnalysisResult } from "@/lib/api";
import {
  buildExplanation,
  getRecommendation,
  getRiskLevel,
  normalizeConfidence,
} from "@/lib/productInsights";

const weights = [
  { name: "Text", value: 40, fill: "#1E3A8A" },
  { name: "Audio", value: 30, fill: "#06B6D4" },
  { name: "Face", value: 30, fill: "#4338CA" },
];

export default function FusionAnalysis() {
  const [text, setText] = useState("");
  const [audioSummary, setAudioSummary] = useState("");
  const [faceEmotion, setFaceEmotion] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const finalEmotion = result?.final?.emotion || result?.emotion || result?.concern || "Awaiting signal";
  const finalConfidence = normalizeConfidence(result?.final?.confidence || result?.confidence || 0);
  const risk = getRiskLevel(finalEmotion, finalConfidence);

  const modalityRows = useMemo(() => {
    const modalities = result?.modalities;

    return [
      {
        name: "Text",
        emotion: modalities?.text?.emotion || (text ? "Ready" : "Waiting"),
        confidence: normalizeConfidence(modalities?.text?.confidence || (text ? 72 : 0)),
        icon: FileText,
      },
      {
        name: "Audio",
        emotion: modalities?.audio?.emotion || (audioSummary ? "Captured" : "Waiting"),
        confidence: normalizeConfidence(modalities?.audio?.confidence || (audioSummary ? 68 : 0)),
        icon: Mic,
      },
      {
        name: "Face",
        emotion: modalities?.face?.emotion || faceEmotion || "Waiting",
        confidence: normalizeConfidence(modalities?.face?.confidence || (faceEmotion ? 70 : 0)),
        icon: Camera,
      },
    ];
  }, [audioSummary, faceEmotion, result, text]);

  const explanation = result?.explanation?.reasons?.length
    ? result.explanation.reasons
    : buildExplanation(finalEmotion, finalConfidence, result?.type || "Fusion");

  const runFusion = async () => {
    if (text.trim().length < 10) {
      toast.error("Please provide a detailed text description (at least 10 characters).");
      return;
    }

    if (!audioFile) {
      toast.error("Audio signal is required. Please record or upload an audio clip.");
      return;
    }

    if (!faceFile) {
      toast.error("Face image is required. Please capture or upload a facial image.");
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeFusion(text, audioFile, faceFile);
      setResult(response);
      toast.success("Multi-modal fusion analysis completed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fusion analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Multi-modal Intelligence
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Fusion Analysis Engine
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Combine language, voice, and facial signals into one explainable behavioral insight.
          </p>
        </div>

        <Button onClick={runFusion} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate fused result
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Text signal</h2>
              <p className="text-sm text-muted-foreground">Describe the current context or session transcript.</p>
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-52 resize-none border-border bg-muted/50"
            placeholder="Example: I have been feeling overloaded by deadlines, but I am trying to stay focused..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Audio signal</h2>
                <p className="text-sm text-muted-foreground">Capture vocal emotion and confidence.</p>
              </div>
            </div>
            <AudioRecorder
              onResult={(summary, file) => {
                setAudioSummary(summary);
                if (file) setAudioFile(file);
              }}
            />
            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {audioSummary || "No audio signal captured yet."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Face signal</h2>
                <p className="text-sm text-muted-foreground">Optional webcam-based expression estimate.</p>
              </div>
            </div>
            <WebcamCapture
              compact
              onEmotion={(emotion, file) => {
                setFaceEmotion(emotion);
                if (file) setFaceFile(file);
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Final fused result</p>
              <h2 className="mt-1 text-3xl font-bold text-foreground">{finalEmotion}</h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Brain className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">AI confidence</span>
                <span className="font-semibold text-foreground">{finalConfidence.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${finalConfidence}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Risk indicator</div>
              <div className="mt-1 text-lg font-bold" style={{ color: risk.color }}>
                {risk.label}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommendation</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {result?.recommendations?.items?.[0] || getRecommendation(finalEmotion)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-foreground">Model agreement and weighting</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {modalityRows.map((row) => (
              <div key={row.name} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <row.icon className="h-5 w-5 text-primary" />
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </div>
                <div className="text-sm font-semibold text-foreground">{row.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{row.emotion}</div>
                <div className="mt-3 text-2xl font-bold text-foreground">{row.confidence.toFixed(0)}%</div>
              </div>
            ))}
          </div>

          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weights}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 rounded-lg bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              Why this emotion was predicted
            </div>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {explanation.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

