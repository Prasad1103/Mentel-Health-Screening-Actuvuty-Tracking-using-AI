import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Loader2,
  Camera,
  Brain,
  Activity,
  CheckCircle,
  BarChart,
  HeartPulse,
  Download,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Mic,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import {
  analyzeChatMultiModal,
  finalizeChat,
  type AnalysisResult,
  type ChatTurn,
} from "@/lib/api";

import WebcamCapture from "@/components/WebcamCapture";
import AudioRecorder from "@/components/AudioRecorder";

type ExtendedChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult;
};

const getPrimaryEmotion = (result?: AnalysisResult | null) =>
  result?.emotion || result?.final?.emotion || result?.concern || "Neutral";

const getConcernLevel = (result?: AnalysisResult | null) =>
  result?.concern_level || result?.concern || "Neutral";

const getConfidence = (result?: AnalysisResult | null) => {
  const value = Number(result?.confidence || result?.final?.confidence || 0);
  return value <= 1 ? value * 100 : value;
};

const buildAssistantReply = (result: AnalysisResult): string => {
  const emotion = getPrimaryEmotion(result);
  const concern = getConcernLevel(result);
  const confidence = getConfidence(result).toFixed(1);
  const recommendation = result.recommendations?.items?.[0];

  const intro = (() => {
    if (emotion === "Positive") {
      return "I can hear a constructive tone in what you shared. Keep using that momentum while protecting your energy.";
    }

    if (emotion === "Neutral") {
      return "What you shared sounds fairly balanced right now, without one strong emotional signal taking over.";
    }

    if (emotion === "Anxiety") {
      return "Your message shows signs of anxiety and mental load. It may help to separate the review into smaller tasks instead of carrying the whole project at once.";
    }

    if (emotion === "Stress") {
      return "Your message suggests stress and pressure. A short reset, then one clearly chosen next task, may make the workload feel more manageable.";
    }

    return `Your message shows signs of ${emotion.toLowerCase()} in the current context. Try to treat this as useful signal, not a judgment about you.`;
  })();

  const nextStep = recommendation || "Try naming one next action you can control and take a short pause before continuing.";

  return `${intro}\n\nDetected emotion: ${emotion}\nConcern level: ${concern}\nConfidence: ${confidence}%\n\nSuggested next step: ${nextStep}`;
};

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ExtendedChatTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to your Behavioral Intelligence Session. Please share your thoughts, and I will analyze your emotional and behavioral signals.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const [sendError, setSendError] = useState<string | null>(null);
  const sendRetryCount = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [facialEmotion, setFacialEmotion] = useState("");
  const [audioResult, setAudioResult] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  type SessionEmotionEntry = { emotion: string; confidence: number; concern_level: string; timestamp: string };
  const [sessionEmotions, setSessionEmotions] = useState<SessionEmotionEntry[]>([]);

  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Clear phase timers on unmount
  useEffect(() => {
    return () => {
      for (const t of phaseTimerRef.current) clearTimeout(t);
      phaseTimerRef.current = [];
    };
  }, []);

  const userTranscript = useCallback((items = messages): ChatTurn[] =>
    items
      .filter((msg) => msg.id !== "welcome" && msg.role === "user")
      .map((msg) => ({
        role: "user",
        content: msg.content,
      })), [messages]);

  const fullTranscript = useCallback((items = messages): ChatTurn[] =>
    items
      .filter((msg) => msg.id !== "welcome")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      })), [messages]);

  const resetSession = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to your Behavioral Intelligence Session. Please share your thoughts, and I will analyze your emotional and behavioral signals.",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setLatestAnalysis(null);
    setFacialEmotion("");
    setAudioResult("");
    setAudioFile(null);
    setFaceFile(null);
    setSessionEmotions([]);
    setShowClearConfirm(false);
    toast.success("Chat session cleared");
  };

  const exportChatReport = () => {
    const content = fullTranscript()
      .map((msg) => {
        const timestamp = messages.find(m => m.content === msg.content)?.timestamp || new Date();
        return `${msg.role === "user" ? "You" : "Behavioral AI"} (${formatTime(timestamp)}):\n${msg.content}`;
      })
      .join("\n\n");

    const metrics = latestAnalysis
      ? [
          "Latest Analysis",
          `Type: ${latestAnalysis.type}`,
          `Detected emotion: ${getPrimaryEmotion(latestAnalysis)}`,
          `Concern level: ${getConcernLevel(latestAnalysis)}`,
          `Confidence: ${getConfidence(latestAnalysis).toFixed(1)}%`,
          `Wellness status: ${latestAnalysis.wellness_status || latestAnalysis.recommendations?.risk_level || "Not available"}`,
        ].join("\n")
      : "Latest Analysis\nNo analysis generated yet.";

    const blob = new Blob([`${metrics}\n\nConversation\n${content}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chat report exported");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const savedChat = localStorage.getItem("chat_session");
    if (savedChat && messages.length === 1) {
      try {
        const parsed = JSON.parse(savedChat);
        setMessages(parsed.messages.map((m: Record<string, unknown>) => ({ ...m, timestamp: new Date((m as { timestamp: string }).timestamp) })));
        setSessionEmotions(parsed.sessionEmotions || []);
        setLatestAnalysis(parsed.latestAnalysis || null);
      } catch (err: unknown) {
        console.error("Failed to restore chat session:", err);
      }
    }
  }, [messages.length]);

  // Debounced localStorage save
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      const chatData = {
        messages: messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        sessionEmotions,
        latestAnalysis,
      };
      try {
        localStorage.setItem("chat_session", JSON.stringify(chatData));
      } catch {
        // Silently handle localStorage quota exceeded
      }
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [messages, sessionEmotions, latestAnalysis]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !user || streaming) return;

    const userMsg: ExtendedChatTurn = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setSendError(null);
    setAnalysisPhase("Transcribing input...");

    // Clear any stale phase timers
    for (const t of phaseTimerRef.current) clearTimeout(t);
    phaseTimerRef.current = [];

    try {
      const transcript = userTranscript([...messages, userMsg]);

      setAnalysisPhase("Running text analysis...");
      await new Promise(r => setTimeout(r, 100));

      phaseTimerRef.current.push(setTimeout(() => {
        setAnalysisPhase("Analyzing emotional signals...");
      }, 800));

      if (audioFile) {
        phaseTimerRef.current.push(setTimeout(() => setAnalysisPhase("Processing audio features..."), 1600));
      }
      if (faceFile) {
        phaseTimerRef.current.push(setTimeout(() => setAnalysisPhase("Analyzing facial expressions..."), 2400));
      }
      phaseTimerRef.current.push(setTimeout(() => setAnalysisPhase("Fusing multi-modal signals..."), 3200));

      const res = await analyzeChatMultiModal({
        message: text,
        transcript,
        audioFile: audioFile || undefined,
        faceFile: faceFile || undefined,
        sessionEmotions,
      });

      // Clear all phase timers
      for (const t of phaseTimerRef.current) clearTimeout(t);
      phaseTimerRef.current = [];
      setAnalysisPhase("");

      setLatestAnalysis(res);

      const emotion = res.emotion || res.final?.emotion || res.concern || "Neutral";
      const concernLevel = res.concern_level || res.concern || "Neutral";
      setSessionEmotions((prev) => [
        ...prev,
        {
          emotion,
          confidence: Number(res.confidence || 0),
          concern_level: concernLevel,
          timestamp: new Date().toISOString(),
        },
      ]);

      const replyContent = res.ai_response || buildAssistantReply(res);

      const aiMsg: ExtendedChatTurn = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
        analysis: res,
      };

      setMessages((prev) => [...prev, aiMsg]);
      sendRetryCount.current = 0;
    } catch (err: unknown) {
      sendRetryCount.current += 1;
      const errMsg = err instanceof Error ? err.message : "Failed to analyze message";
      setSendError(errMsg);
      toast.error(errMsg);
    } finally {
      setStreaming(false);
      setAnalysisPhase("");
    }
  }, [input, user, streaming, messages, audioFile, faceFile, sessionEmotions, userTranscript]);

  const retrySend = useCallback(() => {
    if (sendRetryCount.current >= 3) {
      toast.error("Maximum retry attempts reached. Please try again later.");
      return;
    }
    setSendError(null);
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      setInput(lastUserMsg.content);
      setMessages(prev => prev.filter(m => m.id !== lastUserMsg.id));
      setTimeout(() => send(), 100);
    }
  }, [messages, send]);

  const generateReport = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!latestAnalysis) {
      toast.error("Please interact with the AI first to generate data.");
      return;
    }

    const transcript = fullTranscript();
    const latestUserMessage = userTranscript()[userTranscript().length - 1]?.content || "";

    if (!latestUserMessage) {
      toast.error("Please send a chat message before finalizing.");
      return;
    }

    try {
      setAnalyzing(true);
      toast.success("Finalizing comprehensive report...");

      const result = await finalizeChat({
        latest_message: latestUserMessage,
        transcript,
        audio_summary: audioResult || null,
        facial_emotion: facialEmotion || null,
        audioFile: audioFile || undefined,
        faceFile: faceFile || undefined,
      });

      setLatestAnalysis(result);

      navigate("/app", {
        replace: true,
        state: {
          refresh: true,
          result,
        },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate report";
      toast.error(errMsg);
    } finally {
      setAnalyzing(false);
    }
  };
  // No useCallback wrapper needed — only used as an onClick handler, always renders with latest messages

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            AI Chat Workspace
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Session Active - Behavioral Insight Hub
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showClearConfirm && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              <span className="text-sm text-destructive font-medium">Clear all messages?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={resetSession}
                className="h-7 px-2"
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="h-7 px-2"
              >
                Cancel
              </Button>
            </div>
          )}
          {!showClearConfirm && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                disabled={streaming || analyzing || messages.length <= 1}
                aria-label="Clear chat session"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
              <Button
                variant="outline"
                onClick={exportChatReport}
                disabled={messages.length <= 1}
                aria-label="Export chat report"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={generateReport} disabled={analyzing || !latestAnalysis}>
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BarChart className="h-4 w-4 mr-2" />
                )}
                Finalize Report
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* MAIN CHAT AREA */}
        <div className="lg:col-span-2 bg-card border shadow-sm rounded-xl flex flex-col h-[70vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.role === "user" ? "You" : "Behavioral AI"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  }`}
                >
                  {msg.content}
                </div>

                {/* EXPLAINABLE AI PANEL */}
                {msg.analysis && (
                  <div className="mt-2 max-w-[85%] bg-secondary/30 border rounded-xl p-4 space-y-3 w-full">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b pb-2">
                      <Brain className="h-4 w-4" />
                      Behavioral Insight: {getPrimaryEmotion(msg.analysis)}
                    </div>

                    {msg.analysis.explanation && (
                      <div className="text-sm space-y-1.5">
                        <p className="font-medium text-foreground text-xs uppercase tracking-wide">
                          Detection Factors
                        </p>
                        <ul className="list-none space-y-1">
                          {msg.analysis.explanation.reasons.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-muted-foreground text-xs">
                              <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="text-foreground">{getConfidence(msg.analysis).toFixed(1)}%</span>
                      </div>
                      <div className="text-[10px] uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                        {getConcernLevel(msg.analysis)}
                      </div>
                      
                      {msg.analysis.type === "Fusion" && (
                        <div className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          Multi-Modal Fusion
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {streaming && (
              <div className="flex flex-col items-start">
                <div className="bg-background border rounded-2xl px-4 py-3 text-sm flex items-center gap-3 shadow-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {analysisPhase || (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Analyzing behavioral signals...
                    </span>
                  )}
                </div>
                {analysisPhase && (
                  <div className="mt-1.5 flex items-center gap-2 px-4 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {audioFile && (
                      <span className="flex items-center gap-1">
                        <Mic className="h-3 w-3" /> Audio
                      </span>
                    )}
                    {faceFile && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Face
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" /> Multi-modal
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error overlay with retry */}
            {sendError && !streaming && (
              <div className="flex flex-col items-start">
                <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-4 shadow-sm max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <span className="text-sm font-semibold text-destructive">
                      Analysis Failed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {sendError}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSendError(null);
                        sendRetryCount.current = 0;
                      }}
                      className="h-7 text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={retrySend}
                      disabled={sendRetryCount.current >= 3}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {sendRetryCount.current >= 3 ? "Max Retries" : `Retry (${sendRetryCount.current}/3)`}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t rounded-b-xl">
            <div className="flex gap-3">
              <Textarea
                placeholder="Type your response... (Shift+Enter for new line)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[50px] max-h-[150px] resize-none border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
                rows={2}
              />

              <div className="flex flex-col justify-end gap-2">
                <AudioRecorder
                  onResult={(text) => {
                    setAudioResult(text);
                  }}
                  onFileReady={(file) => {
                    setAudioFile(file);
                  }}
                />
                <Button
                  size="icon"
                  onClick={send}
                  disabled={streaming || !input.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
              Your data is processed securely in this session
            </div>
          </div>
        </div>

        {/* SIDEBAR INTELLIGENCE PANEL */}
        <div className="flex flex-col gap-6 h-[70vh] overflow-y-auto pr-1">
          {/* Live Multi-Modal Status */}
          <div className="bg-card border shadow-sm rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 border-b pb-2">
              <Camera className="h-4 w-4 text-primary" />
              Live Visual Feed
            </h3>
            <WebcamCapture
              compact
              onEmotion={(emotion) => {
                setFacialEmotion(emotion);
              }}
              onFileReady={(file) => {
                setFaceFile(file);
              }}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current State:</span>
              <span className="font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs">
                {facialEmotion || "Standby..."}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Audio Analysis:</span>
              {audioResult ? (
                <span className="font-medium px-2.5 py-1 bg-accent/10 text-accent rounded-md text-xs">
                  {audioResult}
                </span>
              ) : (
                <span className="font-medium px-2.5 py-1 bg-secondary text-muted-foreground rounded-md text-xs">
                  Not attached
                </span>
              )}
            </div>
          </div>

          {/* Session Analytics Preview */}
          <div className="bg-card border shadow-sm rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 border-b pb-2">
              <Activity className="h-4 w-4 text-primary" />
              Session Analytics
            </h3>

            {!latestAnalysis ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Awaiting sufficient data to generate analytics...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background border rounded-lg text-center shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                      Primary
                    </div>
                    <div className="font-bold text-foreground">{getPrimaryEmotion(latestAnalysis)}</div>
                  </div>
                  <div className="p-3 bg-background border rounded-lg text-center shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                      Confidence
                    </div>
                    <div className="font-bold text-accent">
                      {getConfidence(latestAnalysis).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {latestAnalysis.recommendations?.risk_level && (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-medium">
                      <HeartPulse className="h-4 w-4" /> Wellness Status
                    </span>
                    <span className="font-bold text-foreground">
                      {latestAnalysis.recommendations.risk_level}
                    </span>
                  </div>
                )}

                {latestAnalysis.type === "Fusion" && latestAnalysis.weights && (
                  <div className="pt-2 border-t space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Modality Weights
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${latestAnalysis.weights.text * 100}%` }} title="Text" />
                        <div className="bg-accent h-full" style={{ width: `${latestAnalysis.weights.audio * 100}%` }} title="Audio" />
                        <div className="bg-indigo-400 h-full" style={{ width: `${latestAnalysis.weights.face * 100}%` }} title="Face" />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>TXT {latestAnalysis.weights.text * 100}%</span>
                      <span>AUD {latestAnalysis.weights.audio * 100}%</span>
                      <span>VIS {latestAnalysis.weights.face * 100}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
