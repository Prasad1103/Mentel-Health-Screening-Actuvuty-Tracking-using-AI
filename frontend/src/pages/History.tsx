import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ArrowRight,
  FileText,
  Camera,
  ClipboardList,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  listSessions,
  deleteSession,
  type SessionReport,
} from "@/lib/api";
import { toast } from "sonner";
import { emotionColor, getConcernLevel, getWellnessStatus, normalizeConfidence } from "@/lib/productInsights";

export default function History() {
  const { user } = useAuth();

  const [list, setList] = useState<SessionReport[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await listSessions(user.id);
      setList(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const baseFiltered = list.filter((s) => {
      const t = (s.type || "").toLowerCase();
      return t === "text" || t === "fusion" || t === "questionnaire" || t === "chat";
    });

    const term = q.trim().toLowerCase();

    if (!term) return baseFiltered;

    return baseFiltered.filter((s) => {
      const dateText = new Date(
        s.created_at
      ).toLocaleDateString();

      return (
        (s.concern || "").toLowerCase().includes(term) ||
        (s.type || "").toLowerCase().includes(term) ||
        (s.summary || "").toLowerCase().includes(term) ||
        (s.emotion || "").toLowerCase().includes(term) ||
        dateText.toLowerCase().includes(term)
      );
    });
  }, [list, q]);

  const remove = async (id: number) => {
    try {
      await deleteSession(id);
      setList((prev) => prev.filter((item) => item.id !== id));
      toast.success("Session deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <HistoryIcon className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Session History
            </h1>

            <p className="text-sm text-muted-foreground">
              {list.length} report
              {list.length === 1 ? "" : "s"} saved
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search concern, type, date..."
            className="pl-10"
            aria-label="Search history"
          />
        </div>
      </div>

      {/* States */}
      {loading ? (
        <p className="text-muted-foreground">
          Loading...
        </p>
      ) : filtered.length === 0 ? (
        <div className="bg-card border shadow-sm rounded-xl p-10 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />

          <h3 className="font-display text-xl font-bold mb-2">
            {list.length === 0
              ? "No sessions yet"
              : "No matches found"}
          </h3>

          <p className="text-muted-foreground mb-6">
            {list.length === 0
              ? "Run your first analysis to build history."
              : "Try another search term."}
          </p>

          {list.length === 0 && (
            <Button asChild>
              <Link to="/app/questionnaire">
                Start Session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const confPct = normalizeConfidence(s.confidence);
            const concern = s.concern || getConcernLevel(confPct);
            const emotion = s.emotion || concern;
            const color = emotionColor[concern] ?? "#3B82F6";
            const wellness = getWellnessStatus(concern);
            const isQuestionnaire = (s.type || "").toLowerCase() === "questionnaire";
            const sd = s.structured_data;
            const hasFacial = sd?.facial_emotion ? true : false;
            const freeTextPreview = sd?.free_text
              ? sd.free_text.length > 80 ? sd.free_text.substring(0, 80) + "..." : sd.free_text
              : null;
            const isChat = (s.type || "").toLowerCase() === "chat";
            const isFusion = (s.type || "").toLowerCase() === "fusion";
            const chatTurns = sd?.transcript?.length || 0;
            const qScore = isQuestionnaire ? (sd?.score ?? null) : null;
            const fusionModalities = isFusion ? sd?.modalities_used : null;

            return (
              <div
                key={s.id}
                className="bg-card border shadow-sm rounded-xl p-5 flex flex-wrap items-start justify-between gap-4 hover:border-primary/40 transition-colors"
              >
                {/* Left */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Severity color dot + confidence */}
                  <div
                    className="h-12 w-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold shrink-0 text-white"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-[10px] leading-none opacity-80">CONF</span>
                    <span className="text-sm font-bold">{confPct.toFixed(0)}%</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold" style={{ color }}>
                        {concern}
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                        {isQuestionnaire && <ClipboardList className="h-3 w-3" />}
                        {s.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: color }}>
                        {wellness}
                      </span>
                    </div>

                    {/* Emotion vs Concern (when different) */}
                    {isQuestionnaire && emotion !== concern && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected Emotion: <span className="font-medium text-foreground">{emotion}</span>
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground truncate max-w-xl mt-0.5">
                      {s.summary || "No summary available"}
                    </p>

                    {/* Module-specific info */}
                    {(isQuestionnaire || isChat || isFusion) && (
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {isFusion && fusionModalities && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <Layers className="h-3 w-3" /> {fusionModalities.length} signals fused
                          </span>
                        )}
                        {isChat && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {chatTurns} chat turn{chatTurns === 1 ? "" : "s"}
                          </span>
                        )}
                        {isQuestionnaire && qScore !== null && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                            style={{
                              backgroundColor: qScore >= 70 ? '#10B981' : qScore >= 40 ? '#F59E0B' : '#EF4444'
                            }}
                          >
                            Score: {qScore}/100
                          </span>
                        )}
                        {hasFacial ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <Camera className="h-3 w-3" /> Facial: {sd?.facial_emotion}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            Facial: Not used
                          </span>
                        )}
                        {freeTextPreview && (
                          <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                            "{freeTextPreview}"
                          </span>
                        )}
                      </div>
                    )}

                    {/* Severity bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 max-w-[160px] h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${confPct}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">
                        {new Date(s.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(s.id)}
                    aria-label={`Delete session ${s.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/app/reports/${s.id}`}>
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
