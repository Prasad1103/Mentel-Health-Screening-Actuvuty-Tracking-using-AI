import type { SessionReport } from "@/lib/api";

export const EMOTION_LABELS = [
  "Positive",
  "Neutral",
  "Stress",
  "Anxiety",
  "Negative",
  "Depression",
] as const;

export type EmotionLabel = (typeof EMOTION_LABELS)[number];

export const emotionColor: Record<string, string> = {
  Positive: "#10B981",
  Neutral: "#3B82F6",
  Stress: "#FACC15",
  Anxiety: "#F97316",
  Negative: "#DC2626",
  Depression: "#7F1D1D",
};

/**
 * Map a normalized confidence score (0–100) to a concern level.
 * This MUST stay in sync with backend app/services/concern_level.py
 *
 * | Range  | Level       |
 * |--------|-------------|
 * | 0–20   | Depression  |
 * | 21–40  | Negative    |
 * | 41–60  | Anxiety     |
 * | 61–75  | Stress      |
 * | 76–90  | Neutral     |
 * | 91–100 | Positive    |
 */
export function getConcernLevel(score: number): string {
  const s = score <= 1 ? score * 100 : score;
  if (s <= 20) return "Depression";
  if (s <= 40) return "Negative";
  if (s <= 60) return "Anxiety";
  if (s <= 75) return "Stress";
  if (s <= 90) return "Neutral";
  return "Positive";
}

export function getSeverityColor(concern: string): string {
  return emotionColor[concern] ?? "#3B82F6";
}

export function getWellnessStatus(concern: string): string {
  const map: Record<string, string> = {
    Depression: "Severe Emotional Concern",
    Negative: "High Emotional Concern",
    Anxiety: "Moderate-High Emotional Concern",
    Stress: "Moderate Emotional Strain",
    Neutral: "Balanced Emotional State",
    Positive: "Healthy Emotional State",
  };
  return map[concern] ?? "Balanced Emotional State";
}

export function normalizeConfidence(value?: number | null) {
  const numeric = Number(value || 0);
  return numeric <= 1 ? numeric * 100 : numeric;
}

export function getRiskLevel(concern: string, confidence = 0) {
  const level = concern || getConcernLevel(confidence);
  if (level === "Depression") return { label: "High Attention", color: "#7F1D1D", score: 95 };
  if (level === "Negative") return { label: "Elevated Concern", color: "#DC2626", score: 80 };
  if (level === "Anxiety") return { label: "Watch", color: "#F97316", score: 62 };
  if (level === "Stress") return { label: "Moderate", color: "#FACC15", score: 45 };
  if (level === "Neutral") return { label: "Stable", color: "#3B82F6", score: 25 };
  return { label: "Stable", color: "#10B981", score: 15 };
}

export function getRecommendation(emotion?: string) {
  const label = emotion || "Neutral";
  const copy: Record<string, string> = {
    Positive:
      "Maintain the routine that is supporting your current momentum. Keep sleep, movement, and social connection steady.",
    Neutral:
      "Use a light check-in today: hydration, short pauses, and a simple plan for the next important task.",
    Stress:
      "Try a five-minute paced breathing exercise and reduce context switching before your next high-effort activity.",
    Anxiety:
      "Use grounding: name five things you can see, slow your breathing, and write one next action you can control.",
    Negative:
      "Take a restorative break, avoid isolation if possible, and speak with someone trusted if the feeling persists.",
    Depression:
      "Prioritize support, routine, hydration, and rest. Consider reaching out to a qualified professional if this state continues.",
  };

  return copy[label] || copy.Neutral;
}

export function buildExplanation(emotion?: string, confidence = 0, type = "Text") {
  const normalized = normalizeConfidence(confidence);
  const label = emotion || "Neutral";
  const reasons = [
    `${type} model produced a ${label.toLowerCase()} signal with ${normalized.toFixed(1)}% confidence.`,
  ];

  if (label === "Stress") {
    reasons.push("Language or signal patterns suggest increased load, urgency, or tension.");
  } else if (label === "Anxiety") {
    reasons.push("The detected pattern is consistent with uncertainty, worry, or heightened alertness.");
  } else if (label === "Depression" || label === "Negative") {
    reasons.push("The analysis found lower-valence markers that may indicate reduced emotional energy.");
  } else if (label === "Positive") {
    reasons.push("The signal contains higher-valence markers associated with confidence or optimism.");
  } else {
    reasons.push("The result is balanced and does not strongly lean toward a high-risk emotional state.");
  }

  reasons.push("This is an AI-assisted emotional insight, not a medical diagnosis.");
  return reasons;
}

export function calculateStabilityScore(sessions: SessionReport[]) {
  if (!sessions.length) return null;

  const recent = sessions.slice(0, 8);
  const highRiskCount = recent.filter((session) =>
    ["Stress", "Anxiety", "Negative", "Depression"].includes(session.concern || session.emotion || "")
  ).length;
  const uniqueEmotions = new Set(recent.map((session) => session.concern || session.emotion)).size;
  const averageConfidence =
    recent.reduce((sum, session) => sum + normalizeConfidence(session.confidence), 0) /
    recent.length;

  const volatilityPenalty = Math.max(0, uniqueEmotions - 2) * 6;
  const riskPenalty = highRiskCount * 7;
  const confidenceBonus = Math.min(10, averageConfidence / 10);

  return Math.max(18, Math.min(96, Math.round(82 - volatilityPenalty - riskPenalty + confidenceBonus)));
}

export function getWellnessIndicator(score: number) {
  if (score >= 82) return { label: "Improving", tone: "text-emerald-600", color: "#10B981" };
  if (score >= 68) return { label: "Stable", tone: "text-blue-600", color: "#3B82F6" };
  if (score >= 48) return { label: "Watch", tone: "text-orange-500", color: "#F97316" };
  return { label: "High Attention", tone: "text-red-700", color: "#DC2626" };
}

export function emotionDistribution(sessions: SessionReport[]) {
  return EMOTION_LABELS.map((label) => ({
    name: label,
    value: sessions.filter((session) => (session.concern || session.emotion) === label).length || 0,
    fill: emotionColor[label],
  }));
}

export function weeklyTrend(sessions: SessionReport[]) {
  const recent = sessions.slice(0, 7).reverse();

  if (!recent.length) {
    return [];
  }

  return recent.map((session, index) => ({
    day: new Date(session.created_at).toLocaleDateString(undefined, { weekday: "short" }),
    stability: Math.max(30, calculateStabilityScore(sessions.slice(index)) ?? 50),
    confidence: Math.round(normalizeConfidence(session.confidence)),
  }));
}

export function heatmapData(sessions: SessionReport[]) {
  const source = sessions.length ? sessions.slice(0, 21) : [];

  return Array.from({ length: 21 }, (_, index) => {
    const session = source[index];
    const confidence = normalizeConfidence(session?.confidence || 0);
    return {
      id: index,
      label: session?.concern || session?.emotion || "No session",
      intensity: session ? Math.max(18, Math.round(confidence)) : 8,
      color: session ? emotionColor[session.concern || session.emotion || ""] || "#CBD5E1" : "#E2E8F0",
    };
  });
}
