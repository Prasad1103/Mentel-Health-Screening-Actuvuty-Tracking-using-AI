import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  ClipboardList,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { analyzeQuestionnaire } from "@/lib/api";
import WebcamCapture from "@/components/WebcamCapture";
import { toast } from "sonner";

/* ─── Types ─── */
interface MCQ {
  id: string;
  q: string;
  options: { value: string; label: string }[];
}

interface DraftState {
  step: number;
  answers: Record<string, string>;
  free: string;
  facialEmotion: string | null;
  consentGiven: boolean;
}

/* ─── Constants ─── */
const DRAFT_KEY_PREFIX = "questionnaire_draft_";
function getDraftKey(userId?: string): string {
  return userId ? `${DRAFT_KEY_PREFIX}${userId}` : `questionnaire_draft_anonymous`;
}

const LOADING_MESSAGES = [
  "Analyzing questionnaire responses...",
  "Generating behavioral insights...",
  "Preparing assessment report...",
];

const QUESTIONS: MCQ[] = [
  {
    id: "morning",
    q: "When your alarm goes off in the morning, what's your first instinct?",
    options: [
      { value: "up", label: "Get up right away — I have things to do" },
      { value: "snooze", label: "Hit snooze a couple of times" },
      { value: "scroll", label: "Lie there scrolling on my phone" },
      { value: "dread", label: "Wish I could stay in bed all day" },
    ],
  },
  {
    id: "weekend",
    q: "An unexpected free Saturday opens up. You picture yourself…",
    options: [
      { value: "social", label: "Calling friends to make plans" },
      { value: "create", label: "Working on a personal project" },
      { value: "rest", label: "Quietly recharging at home alone" },
      { value: "blank", label: "Honestly not knowing what to do" },
    ],
  },
  {
    id: "music",
    q: "Which playlist have you reached for most this week?",
    options: [
      { value: "upbeat", label: "Upbeat / dance" },
      { value: "focus", label: "Lo-fi or instrumental focus" },
      { value: "melancholy", label: "Soft, melancholy songs" },
      { value: "silence", label: "I've preferred silence" },
    ],
  },
  {
    id: "messages",
    q: "A close friend hasn't replied to your message in two days. You think:",
    options: [
      { value: "busy", label: "They're busy, no big deal" },
      { value: "check", label: "I'll check in again later" },
      { value: "worry", label: "Hope I didn't say something wrong" },
      { value: "withdraw", label: "Maybe they don't want to talk to me" },
    ],
  },
  {
    id: "mirror",
    q: "When you catch yourself in the mirror lately, the first thought is…",
    options: [
      { value: "fine", label: "Looking good, all set" },
      { value: "neutral", label: "Just a quick glance, nothing notable" },
      { value: "tired", label: "I look tired" },
      { value: "critical", label: "Something I want to change" },
    ],
  },
  {
    id: "meals",
    q: "How have your meals looked over the past few days?",
    options: [
      { value: "regular", label: "Regular and enjoyed" },
      { value: "rushed", label: "Rushed but eaten" },
      { value: "skipped", label: "Skipped one or two" },
      { value: "appetite", label: "Little appetite at all" },
    ],
  },
  {
    id: "task",
    q: "You sit down to do an important task. What usually happens?",
    options: [
      { value: "flow", label: "I get into flow quickly" },
      { value: "warmup", label: "Slow start, then I'm in" },
      { value: "distract", label: "I drift to other tabs constantly" },
      { value: "stuck", label: "I freeze and avoid it" },
    ],
  },
  {
    id: "stranger",
    q: "A stranger smiles at you on the street. You…",
    options: [
      { value: "smile", label: "Smile back warmly" },
      { value: "polite", label: "Give a quick nod" },
      { value: "avoid", label: "Avoid eye contact" },
      { value: "suspicious", label: "Wonder what they wanted" },
    ],
  },
  {
    id: "future",
    q: "Thinking about the next month, the strongest feeling is…",
    options: [
      { value: "excited", label: "Curiosity and excitement" },
      { value: "neutral", label: "Steady, just keeping going" },
      { value: "anxious", label: "Quiet worry I can't place" },
      { value: "heavy", label: "Heaviness — too much ahead" },
    ],
  },
  {
    id: "compliment",
    q: "Someone gives you a sincere compliment. Internally you…",
    options: [
      { value: "accept", label: "Accept it and feel good" },
      { value: "deflect", label: "Deflect or change the subject" },
      { value: "doubt", label: "Doubt they really mean it" },
      { value: "uncomfortable", label: "Feel uncomfortable" },
    ],
  },
  {
    id: "night",
    q: "When you finally lie down to sleep, your mind is usually…",
    options: [
      { value: "quiet", label: "Quiet, drifting off easily" },
      { value: "planning", label: "Planning tomorrow" },
      { value: "replaying", label: "Replaying the day's conversations" },
      { value: "racing", label: "Racing through worries" },
    ],
  },
  {
    id: "hobby",
    q: "The activities that used to make you lose track of time…",
    options: [
      { value: "still", label: "Still light me up the same" },
      { value: "less", label: "Feel a little less exciting lately" },
      { value: "rare", label: "I rarely make time for them" },
      { value: "flat", label: "Don't really pull me in anymore" },
    ],
  },
  {
    id: "criticism",
    q: "Your work gets unexpected criticism. The first reaction is…",
    options: [
      { value: "curious", label: "Curiosity — what can I learn?" },
      { value: "defend", label: "Mild urge to defend myself" },
      { value: "spiral", label: "It plays in my head for hours" },
      { value: "deflate", label: "I feel deflated for days" },
    ],
  },
  {
    id: "body",
    q: "Where do you most often feel tension in your body lately?",
    options: [
      { value: "none", label: "Nowhere in particular" },
      { value: "shoulders", label: "Shoulders or neck" },
      { value: "chest", label: "Chest or shallow breathing" },
      { value: "stomach", label: "Stomach knot" },
    ],
  },
  {
    id: "phone",
    q: "When your phone buzzes with a notification, you…",
    options: [
      { value: "calm", label: "Check it calmly" },
      { value: "curious", label: "Feel curious to see what it is" },
      { value: "tense", label: "Tense up a little" },
      { value: "dread", label: "Hope it's not bad news" },
    ],
  },
];

/* ─── Helpers ─── */
function getOptionLabel(questionId: string, value: string): string {
  const q = QUESTIONS.find((x) => x.id === questionId);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}

function isRepeatedText(text: string): boolean {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 4) return false;
  const chunk = cleaned.substring(0, Math.min(4, Math.floor(cleaned.length / 2)));
  const repeated = chunk.repeat(Math.ceil(cleaned.length / chunk.length)).substring(0, cleaned.length);
  return repeated === cleaned;
}

function saveDraft(userId: string | undefined, draft: DraftState) {
  try {
    localStorage.setItem(getDraftKey(userId), JSON.stringify(draft));
  } catch { /* ignore quota errors */ }
}

function loadDraft(userId: string | undefined): DraftState | null {
  try {
    const raw = localStorage.getItem(getDraftKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

function clearDraft(userId: string | undefined) {
  localStorage.removeItem(getDraftKey(userId));
}

/* ─── Component ─── */
export default function Questionnaire() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [consentGiven, setConsentGiven] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [free, setFree] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [facialEmotion, setFacialEmotion] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [freeTextError, setFreeTextError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitRetryCount = useRef(0);

  const total = QUESTIONS.length + 1; // +1 for free-text step
  const isDescriptive = step === QUESTIONS.length;
  const current = !isDescriptive ? QUESTIONS[step] : null;

  // Fixed progress: step 1 never shows 0%
  const progress = Math.round(((step + 1) / total) * 100);

  /* ─── Draft restore on mount ─── */
  useEffect(() => {
    const draft = loadDraft(user?.id);
    if (draft && !draftRestored) {
      setStep(draft.step);
      setAnswers(draft.answers);
      setFree(draft.free);
      setFacialEmotion(draft.facialEmotion);
      setConsentGiven(draft.consentGiven);
      setDraftRestored(true);
      if (draft.consentGiven && Object.keys(draft.answers).length > 0) {
        toast.success("Draft restored", { duration: 3000 });
      }
    }
  }, [draftRestored, user?.id]);

  /* ─── Autosave on state change ─── */
  useEffect(() => {
    if (consentGiven && user) {
      saveDraft(user.id, { step, answers, free, facialEmotion, consentGiven });
    }
  }, [step, answers, free, facialEmotion, consentGiven, user]);

  /* ─── Loading message rotation ─── */
  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [submitting]);

  /* ─── Free-text validation ─── */
  const validateFreeText = useCallback((text: string): string => {
    const trimmed = text.trim();
    if (trimmed.length < 20) return `Minimum 20 characters required (${trimmed.length}/20).`;
    if (isRepeatedText(trimmed)) return "Please provide meaningful, non-repeated text.";
    return "";
  }, []);

  /* ─── Navigation ─── */
  const answeredCurrent = isDescriptive
    ? free.trim().length >= 20 && !isRepeatedText(free.trim())
    : !!answers[current!.id];

  const next = () => {
    if (!answeredCurrent) return;
    if (step < total - 1) setStep(step + 1);
  };

  const prev = () => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const handleSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, [current!.id]: val }));
    if (step < total - 1) {
      setTimeout(() => setStep((s) => s + 1), 400);
    }
  };

  const handleFreeTextChange = (text: string) => {
    setFree(text);
    if (text.trim().length > 0) {
      setFreeTextError(validateFreeText(text));
    } else {
      setFreeTextError("");
    }
  };

  /* ─── Reset ─── */
  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setFree("");
    setFacialEmotion(null);
    setShowReview(false);
    setShowResetConfirm(false);
    setFreeTextError("");
    if (user) clearDraft(user.id);
    toast.success("Questionnaire reset");
  };

  /* ─── Go to Review ─── */
  const goToReview = () => {
    const err = validateFreeText(free);
    if (err) {
      setFreeTextError(err);
      return;
    }
    setShowReview(true);
  };

  /* ─── Submit ─── */
  const submit = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setLoadingMsgIdx(0);

      const structuredAnswers: Record<string, { value: string; label: string }> = {};
      for (const q of QUESTIONS) {
        if (answers[q.id]) {
          structuredAnswers[q.id] = {
            value: answers[q.id],
            label: getOptionLabel(q.id, answers[q.id]),
          };
        }
      }

      await analyzeQuestionnaire({
        answers: structuredAnswers,
        free_text: free,
        facial_emotion: facialEmotion,
      });

      if (user) clearDraft(user.id);
      toast.success("Assessment completed!");
      navigate("/app");
    } catch (err: any) {
      const message = err?.message || "Unable to generate questionnaire report. Please try again.";
      setSubmitError(message);
      toast.error(message, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Retry Submit ─── */
  const retrySubmit = () => {
    submitRetryCount.current += 1;
    if (submitRetryCount.current <= 3) {
      submit();
    } else {
      setSubmitError("Maximum retry attempts reached. Please start a new session.");
      toast.error("Maximum retry attempts reached");
    }
  };

  /* ─── CONSENT SCREEN ─── */
  if (!consentGiven) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 max-w-2xl mx-auto"
      >
        <div className="bg-card border shadow-sm rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold">Before You Begin</h1>
          </div>

          <div className="rounded-lg bg-secondary/40 border border-border/60 p-5 mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This system provides <strong>AI-assisted behavioral insights</strong> and
              is <strong>not a medical diagnosis</strong>. Results are generated by machine
              learning models and should be interpreted as supportive guidance, not clinical
              advice. If you are in crisis, please contact a qualified professional.
            </p>
          </div>

          <label
            className="flex items-start gap-3 cursor-pointer select-none mb-6"
            htmlFor="consent-checkbox"
          >
            <input
              id="consent-checkbox"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              aria-label="I understand and agree to continue"
            />
            <span className="text-sm text-foreground">
              I understand and agree to continue.
            </span>
          </label>

          <Button
            onClick={() => setConsentGiven(true)}
            disabled={!consentChecked}
            className="w-full"
            aria-label="Start questionnaire"
          >
            <ClipboardList className="h-4 w-4" />
            Start Questionnaire
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ─── REVIEW SCREEN ─── */
  if (showReview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 max-w-4xl mx-auto"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Review Your Responses</h1>
            <p className="text-sm text-muted-foreground">Verify answers before submission</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="bg-card border shadow-sm rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Question {i + 1}</p>
              <p className="text-sm font-medium mb-1.5">{q.q}</p>
              <p className="text-sm text-primary font-semibold">
                {answers[q.id] ? getOptionLabel(q.id, answers[q.id]) : "—"}
              </p>
            </div>
          ))}

          <div className="bg-card border shadow-sm rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Free-text Response</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{free || "—"}</p>
          </div>

          {facialEmotion && (
            <div className="bg-card border shadow-sm rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Facial Emotion (Optional)</p>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> {facialEmotion}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" onClick={prev} aria-label="Go back and edit">
            <Edit className="h-4 w-4" /> Back & Edit
          </Button>
          <Button onClick={submit} disabled={submitting} aria-label="Submit questionnaire">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {LOADING_MESSAGES[loadingMsgIdx]}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Submit Assessment
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ─── SUBMITTING OVERLAY ─── */
  if (submitting || submitError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]"
      >
        {submitting ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold mb-2">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            <p className="text-sm text-muted-foreground">This may take a few seconds…</p>
          </>
        ) : (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-semibold mb-2">Submission Failed</p>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">{submitError}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setSubmitError(null); submitRetryCount.current = 0; setShowReview(true); }}>
                <Edit className="h-4 w-4" /> Back to Review
              </Button>
              <Button onClick={retrySubmit}>
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  /* ─── MAIN QUESTIONNAIRE ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Smart Questionnaire</h1>
            <p className="text-sm text-muted-foreground">
              Adaptive psychometric prompts · {total} steps · facial signals fused in
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          aria-label="Reset questionnaire"
          className="text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="mb-6 bg-card border border-destructive/30 shadow-sm rounded-xl p-5">
          <p className="text-sm font-medium mb-3">
            Are you sure you want to reset? All answers will be cleared.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReset} aria-label="Confirm reset">
              Yes, Reset
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {total}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        <div className="bg-card border shadow-sm rounded-xl p-6 md:p-8 min-h-[360px] flex flex-col">
          {/* MCQ Step */}
          {!isDescriptive && current && (
            <>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-6">{current.q}</h2>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-3 flex-1"
                  role="radiogroup"
                  aria-label={current.q}
                >
                  {current.options.map((o, i) => {
                    const active = answers[current.id] === o.value;
                    return (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={o.label}
                        onClick={() => handleSelect(o.value)}
                        className={`text-left rounded-xl border px-4 py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                        }`}
                      >
                        <span className="text-sm">{o.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* Free-text Step */}
          {isDescriptive && (
            <>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-2">In your own words…</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Describe how you've been feeling lately. The more specific, the richer your report.
              </p>
              <p className="text-xs text-muted-foreground mb-5 italic">
                Please describe your emotional condition in meaningful detail.
              </p>
              <Textarea
                value={free}
                onChange={(e) => handleFreeTextChange(e.target.value)}
                maxLength={2000}
                placeholder="I've been feeling…"
                aria-label="Describe your emotional condition"
                className="flex-1 min-h-[180px] bg-secondary/40 border-border/60 focus-visible:border-primary resize-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex justify-between items-center mt-2">
                {freeTextError ? (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" /> {freeTextError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Min 20 characters</p>
                )}
                <span className="text-xs text-muted-foreground">{free.length}/2000</span>
              </div>
            </>
          )}
        </div>

        {/* Webcam Panel */}
        <div className="lg:sticky lg:top-6 space-y-3">
          <WebcamCapture onEmotion={setFacialEmotion} />
          <div className="rounded-lg bg-secondary/40 border border-border/60 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Optional.</strong> Facial emotion analysis is optional and only improves
              behavioral insight accuracy. When enabled, facial signals are fused into your final report.
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              If camera access was blocked, please allow camera permission from your browser settings,
              or continue without camera.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0} aria-label="Previous question">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < total - 1 ? (
          <Button onClick={next} disabled={!answeredCurrent} aria-label="Next question">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={goToReview} disabled={!answeredCurrent} aria-label="Review responses">
            Review & Submit <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
