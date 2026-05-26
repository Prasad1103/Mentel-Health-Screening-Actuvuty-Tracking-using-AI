import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, Printer, Search, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listSessions, type SessionReport } from "@/lib/api";
import {
  buildExplanation,
  calculateStabilityScore,
  getRecommendation,
  getRiskLevel,
  getWellnessIndicator,
  normalizeConfidence,
} from "@/lib/productInsights";

export default function Reports() {
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listSessions()
      .then((data) => {
        if (active) setSessions(data);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load reports"))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sessions;

    return sessions.filter((session) =>
      [session.concern, session.type, session.summary, session.created_at]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [query, sessions]);

  const downloadPdf = (session: SessionReport) => {
    const stability = calculateStabilityScore([session]);
    const wellness = getWellnessIndicator(stability);
    const risk = getRiskLevel(session.concern, session.confidence);
    const confidence = normalizeConfidence(session.confidence);
    const explanation = session.explanation?.reasons?.length
      ? session.explanation.reasons
      : buildExplanation(session.concern, confidence, session.type);

    const doc = new jsPDF();
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 34, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Behavioral Intelligence Report", 14, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Session: #${session.id}`, 14, 48);
    doc.text(`Generated: ${new Date(session.created_at).toLocaleString()}`, 14, 56);
    doc.text(`Analysis type: ${session.type}`, 14, 64);

    doc.setFontSize(15);
    doc.text("Executive Summary", 14, 82);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(session.summary || "No summary available.", 180), 14, 91);

    doc.setFontSize(15);
    doc.text("Key Metrics", 14, 126);
    doc.setFontSize(11);
    doc.text(`Final emotion: ${session.concern}`, 14, 136);
    doc.text(`Confidence: ${confidence.toFixed(1)}%`, 14, 144);
    doc.text(`Behavioral stability: ${stability}/100`, 14, 152);
    doc.text(`Wellness indicator: ${wellness.label}`, 14, 160);
    doc.text(`Risk level: ${risk.label}`, 14, 168);

    doc.setFontSize(15);
    doc.text("Explainable AI", 14, 186);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(explanation.join(" "), 180), 14, 195);

    doc.setFontSize(15);
    doc.text("Recommendation", 14, 230);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(getRecommendation(session.concern), 180), 14, 239);
    doc.save(`behavioral-report-${session.id}.pdf`);
  };

  const exportJson = (session: SessionReport) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `behavioral-report-${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Clinical-style exports
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-950">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review, print, and export professional behavioral intelligence reports.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reports..."
            className="border-slate-200 bg-white pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-bold text-slate-950">{sessions.length}</div>
              <div className="text-sm text-slate-500">Saved reports</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold text-slate-950">Private</div>
              <div className="text-sm text-slate-500">Authenticated session access</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Printer className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="text-2xl font-bold text-slate-950">PDF/JSON</div>
              <div className="text-sm text-slate-500">Export-ready outputs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="font-display text-xl font-bold text-slate-950">No reports found</h2>
            <p className="mt-2 text-sm text-slate-500">Run an analysis session to create the first report.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((session) => {
              const confidence = normalizeConfidence(session.confidence);
              const stability = calculateStabilityScore([session]);
              const wellness = getWellnessIndicator(stability);
              const risk = getRiskLevel(session.concern, confidence);

              return (
                <div key={session.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-slate-950">{session.concern}</h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {session.type}
                      </span>
                      <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: risk.color }}>
                        {risk.label}
                      </span>
                    </div>
                    <p className="line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">{session.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>{new Date(session.created_at).toLocaleString()}</span>
                      <span>Confidence {confidence.toFixed(1)}%</span>
                      <span>Stability {stability}/100</span>
                      <span className={wellness.tone}>{wellness.label}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/reports/${session.id}`}>Open</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadPdf(session)}>
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => exportJson(session)}>
                      JSON
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

