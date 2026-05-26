import { Link } from "react-router-dom";
import { ArrowRight, Brain, MessageSquare, ClipboardList, Camera, ShieldCheck, Sparkles, LineChart, Mic, Activity, BarChart3, FileText, Lock, Eye, Zap, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const features = [
  { icon: Brain, title: "Text Emotion Analysis", desc: "NLP-powered sentiment and emotion detection from written text using transformer models." },
  { icon: Mic, title: "Audio Emotion Analysis", desc: "Voice tone, pitch, and speech pattern analysis using MFCC acoustic feature extraction." },
  { icon: Camera, title: "Facial Expression Analysis", desc: "Real-time micro-expression detection via webcam using deep learning classifiers." },
  { icon: Sparkles, title: "Fusion AI Engine", desc: "Weighted multi-modal fusion combining text, audio, and face signals into unified insight." },
  { icon: Eye, title: "Explainable AI", desc: "Transparent reasoning with confidence scores, modality agreement, and detection factors." },
  { icon: Activity, title: "Behavioral Stability Score", desc: "Longitudinal tracking of emotional volatility and behavioral consistency over sessions." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Radar charts, trend lines, heatmaps, and distribution bars for comprehensive visualization." },
  { icon: FileText, title: "Report Generation", desc: "Professional PDF reports with executive summaries, charts, and AI recommendations." },
  { icon: LineChart, title: "Session History", desc: "Complete audit trail of every analysis session with timestamped records." },
  { icon: Zap, title: "Real-Time Monitoring", desc: "Live emotion tracking during chat sessions with instant behavioral feedback." },
];

const workflow = [
  { step: "01", title: "User Input", desc: "Text, voice recording, or webcam capture collected through the clinical workspace." },
  { step: "02", title: "AI Processing", desc: "Each modality processed by specialized deep learning models trained on behavioral data." },
  { step: "03", title: "Fusion Analysis", desc: "Weighted combination of all modality signals into a unified emotional assessment." },
  { step: "04", title: "Behavioral Insights", desc: "Explainable AI generates detection factors, confidence scores, and wellness indicators." },
  { step: "05", title: "Report Generation", desc: "Professional report with recommendations, risk assessment, and downloadable PDF." },
];

const trustCards = [
  { icon: Brain, title: "Multi-Modal AI", desc: "Three specialized neural networks working in concert for robust emotional analysis." },
  { icon: Zap, title: "Real-Time Analysis", desc: "Sub-second inference with live feedback during interactive chat sessions." },
  { icon: Sparkles, title: "Fusion Intelligence", desc: "Weighted ensemble approach combining independent modality predictions." },
  { icon: Eye, title: "Explainable AI", desc: "Every prediction backed by human-readable reasoning and confidence metrics." },
  { icon: Activity, title: "Behavioral Analytics", desc: "Longitudinal stability tracking with trend analysis and wellness indicators." },
  { icon: Lock, title: "Secure & Private", desc: "JWT authentication, protected sessions, and privacy-first data handling." },
];

const explainReasons = [
  "Elevated stress markers detected in textual sentiment patterns",
  "Reduced vocal energy and irregular speech cadence in audio signal",
  "Neutral-to-tense facial muscle activation in visual analysis",
];

const Index = () => (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
    <Navbar />

    {/* ===== HERO ===== */}
    <section className="relative overflow-hidden border-b border-[#E2E8F0]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/[0.03] via-transparent to-[#4338CA]/[0.03]" />
      <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs text-[#64748B] shadow-sm">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" /></span>
            AI-Powered Behavioral Intelligence Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-[#0F172A]">
            AI-Powered Behavioral &amp; Emotional Analysis Platform
          </h1>
          <p className="text-lg text-[#334155] max-w-xl leading-relaxed">
            Advanced multimodal AI system for analyzing human emotions through text, voice, and facial expressions using intelligent fusion analysis and explainable behavioral insights.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 shadow-md">
              <Link to="/register">Start Analysis <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-[#CBD5E1] text-[#334155]">
              <Link to="/login">Explore Dashboard</Link>
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-4 text-sm text-[#64748B]">
            {[{ n: "4", l: "AI Modules" }, { n: "6", l: "Emotion Classes" }, { n: "3", l: "Input Modalities" }].map((s, i) => (
              <div key={s.l} className="flex items-center gap-3">
                {i > 0 && <div className="h-8 w-px bg-[#E2E8F0]" />}
                <div><div className="text-2xl font-bold text-[#0F172A]">{s.n}</div><div className="text-xs">{s.l}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
              <div className="h-8 w-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center"><Brain className="h-4 w-4 text-white" /></div>
              <div><div className="text-sm font-semibold text-[#0F172A]">Fusion Analysis Result</div><div className="text-[10px] text-[#64748B]">Multi-Modal AI Assessment</div></div>
              <div className="ml-auto px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase">Live</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ l: "Text", e: "Stress", c: 87, clr: "#F59E0B" }, { l: "Audio", e: "Anxiety", c: 72, clr: "#4338CA" }, { l: "Face", e: "Neutral", c: 64, clr: "#0EA5E9" }].map((m) => (
                <div key={m.l} className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1">{m.l}</div>
                  <div className="text-sm font-bold text-[#0F172A]">{m.e}</div>
                  <div className="mt-2 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${m.c}%`, backgroundColor: m.clr }} /></div>
                  <div className="text-[10px] text-[#64748B] mt-1">{m.c}%</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#0F172A]">Final Fusion Result</span>
                <span className="text-[10px] font-bold text-[#1E3A8A] bg-[#1E3A8A]/10 px-2 py-0.5 rounded-full">WEIGHTED ENSEMBLE</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-[#1E3A8A]">Moderate Stress</div>
                <div className="ml-auto text-right"><div className="text-xl font-bold text-[#0F172A]">78%</div><div className="text-[10px] text-[#64748B]">Confidence</div></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
              <ShieldCheck className="h-3 w-3" /> End-to-end encrypted · HIPAA-aware design · Research-grade output
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== TRUST HIGHLIGHTS ===== */}
    <section className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A8A] mb-3">Platform Capabilities</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Built for Research. Designed for Impact.</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trustCards.map((c) => (
          <div key={c.title} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all group">
            <div className="mb-4 h-11 w-11 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-1.5">{c.title}</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ===== ABOUT PLATFORM ===== */}
    <section className="bg-white border-y border-[#E2E8F0]">
      <div className="container py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4338CA] mb-3">About the Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">Why Multi-Modal Emotional AI Matters</h2>
          <p className="text-[#334155] leading-7 mb-5">
            Single-modality emotion detection captures only a fraction of human expression. Our platform fuses text sentiment, vocal acoustics, and facial micro-expressions into a unified behavioral signal — dramatically improving accuracy and reducing false positives.
          </p>
          <p className="text-[#334155] leading-7 mb-6">
            Every prediction is accompanied by explainable AI reasoning, confidence metrics, and actionable wellness recommendations — making this system suitable for research presentations, clinical screening prototypes, and enterprise wellness platforms.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Transformer NLP", "MFCC Audio Features", "CNN Face Detection", "Weighted Fusion"].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-[#F1F5F9] text-[#334155] text-xs font-medium border border-[#E2E8F0]">{t}</span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[{ mod: "Text Analysis", desc: "Transformer-based NLP model classifying 6 emotional states from written input", pct: 40 },
            { mod: "Audio Analysis", desc: "MFCC feature extraction with acoustic pattern recognition for vocal emotion", pct: 30 },
            { mod: "Face Analysis", desc: "Deep CNN classifier detecting micro-expressions from webcam frames", pct: 30 }].map((m) => (
            <div key={m.mod} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0F172A] text-sm">{m.mod}</span>
                <span className="text-xs font-bold text-[#1E3A8A]">{m.pct}% weight</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">{m.desc}</p>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-[#1E3A8A] rounded-full" style={{ width: `${m.pct + 30}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== FEATURES ===== */}
    <section id="features" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A8A] mb-3">Complete Feature Set</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Everything You Need for Behavioral Intelligence</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all">
            <div className="mb-3 h-10 w-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-[#0F172A] mb-1">{f.title}</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ===== WORKFLOW ===== */}
    <section id="workflow" className="bg-white border-y border-[#E2E8F0]">
      <div className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4338CA] mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">From Input to Insight in Five Steps</h2>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {workflow.map((w, i) => (
            <div key={w.step} className="relative bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6">
              <div className="text-4xl font-bold text-[#1E3A8A]/15 leading-none mb-3">{w.step}</div>
              <h3 className="font-semibold text-[#0F172A] mb-2 text-sm">{w.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{w.desc}</p>
              {i < workflow.length - 1 && <ChevronRight className="hidden md:block absolute top-1/2 -right-3 h-5 w-5 text-[#CBD5E1] -translate-y-1/2" />}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== DASHBOARD PREVIEW ===== */}
    <section id="dashboard" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A8A] mb-3">Live Dashboard Preview</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Enterprise-Grade Analytics at a Glance</h2>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[{ l: "Primary Emotion", v: "Moderate Stress", c: "#F59E0B" }, { l: "Confidence", v: "82.4%", c: "#1E3A8A" }, { l: "Stability Score", v: "74/100", c: "#10B981" }, { l: "Risk Level", v: "Watch", c: "#F59E0B" }].map((s) => (
            <div key={s.l} className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1">{s.l}</div>
              <div className="text-lg font-bold" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] p-5">
            <div className="text-sm font-semibold text-[#0F172A] mb-4">Emotion Distribution</div>
            {[{ n: "Positive", p: 15, c: "#10B981" }, { n: "Neutral", p: 22, c: "#0EA5E9" }, { n: "Stress", p: 35, c: "#F59E0B" }, { n: "Anxiety", p: 18, c: "#4338CA" }, { n: "Negative", p: 7, c: "#64748B" }, { n: "Depression", p: 3, c: "#EF4444" }].map((e) => (
              <div key={e.n} className="flex items-center gap-3 mb-2">
                <span className="w-20 text-xs text-[#64748B] text-right">{e.n}</span>
                <div className="flex-1 h-4 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${e.p}%`, backgroundColor: e.c }} /></div>
                <span className="w-10 text-xs font-bold text-right" style={{ color: e.c }}>{e.p}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] p-5">
            <div className="text-sm font-semibold text-[#0F172A] mb-3">AI Recommendation</div>
            <p className="text-sm text-[#334155] leading-relaxed mb-4">Based on the current session analysis, we recommend a 5-minute breathing exercise and reducing context-switching before your next high-effort activity.</p>
            <div className="text-sm font-semibold text-[#0F172A] mb-3">Session Insights</div>
            <div className="space-y-2">
              {["Wellness indicator: Watch", "Model agreement: Moderate (2/3 modalities aligned)", "Behavioral trend: Slightly elevated from baseline"].map((t) => (
                <div key={t} className="flex items-start gap-2 text-xs text-[#64748B]"><CheckCircle className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ===== EXPLAINABLE AI ===== */}
    <section className="bg-white border-y border-[#E2E8F0]">
      <div className="container py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4338CA] mb-3">Explainable AI</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-6">Every Prediction Includes a Reason</h2>
          <p className="text-[#334155] leading-7 mb-5">
            Unlike black-box models, our system provides transparent, human-readable explanations for every emotional assessment. Each prediction is backed by modality-specific evidence and cross-modal agreement analysis.
          </p>
          <p className="text-[#334155] leading-7">
            This level of transparency makes the system suitable for academic research, clinical screening prototypes, and enterprise compliance requirements.
          </p>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3A8A] border-b border-[#E2E8F0] pb-3">
            <Brain className="h-4 w-4" /> Behavioral Insight: Moderate Stress
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#64748B] mb-2">Detection Factors</div>
            {explainReasons.map((r) => (
              <div key={r} className="flex items-start gap-2 mb-2 text-xs text-[#334155]">
                <CheckCircle className="h-3.5 w-3.5 text-[#06B6D4] shrink-0 mt-0.5" />{r}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
            <div className="text-xs text-[#64748B]">Confidence: <span className="font-bold text-[#0F172A]">78.2%</span></div>
            <div className="text-[10px] uppercase bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-0.5 rounded-full font-bold">Multi-Modal Fusion</div>
          </div>
          <div className="text-[10px] text-[#94A3B8]">This is an AI-assisted emotional insight, not a medical diagnosis.</div>
        </div>
      </div>
    </section>

    {/* ===== RESEARCH ===== */}
    <section id="research" className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1E3A8A] mb-3">Research & Innovation</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Conference-Ready AI Research System</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ n: "6", l: "Emotion Classes", d: "Positive, Neutral, Stress, Anxiety, Negative, Depression" },
          { n: "3", l: "Input Modalities", d: "Text NLP, Audio MFCC, Face CNN working in parallel" },
          { n: "78%+", l: "Fusion Accuracy", d: "Weighted ensemble consistently outperforms single-modality baselines" },
          { n: "<2s", l: "Inference Time", d: "Real-time analysis with sub-second response for interactive sessions" }].map((r) => (
          <div key={r.l} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm text-center">
            <div className="text-3xl font-bold text-[#1E3A8A] mb-1">{r.n}</div>
            <div className="text-sm font-semibold text-[#0F172A] mb-2">{r.l}</div>
            <p className="text-xs text-[#64748B]">{r.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ===== SECURITY ===== */}
    <section className="bg-white border-y border-[#E2E8F0]">
      <div className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4338CA] mb-3">Security & Privacy</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Healthcare-Grade Data Protection</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ icon: Lock, t: "JWT Authentication", d: "Secure token-based access with encrypted credentials" },
            { icon: ShieldCheck, t: "Protected Sessions", d: "User data isolated with role-based access controls" },
            { icon: Eye, t: "Privacy-First AI", d: "No data retention beyond explicit user-saved sessions" },
            { icon: FileText, t: "Secure Reports", d: "Generated reports are user-scoped and access-controlled" }].map((s) => (
            <div key={s.t} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-6 text-center">
              <div className="mx-auto mb-3 h-11 w-11 rounded-lg bg-[#4338CA]/10 text-[#4338CA] flex items-center justify-center"><s.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-sm text-[#0F172A] mb-1">{s.t}</h3>
              <p className="text-xs text-[#64748B]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section className="container py-20">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1E3A8A] to-[#4338CA] p-12 md:p-20 text-center text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Next-Generation Behavioral Intelligence</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">Create your account and run your first multi-modal behavioral analysis in under two minutes.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-white text-[#1E3A8A] hover:bg-white/90 shadow-md font-semibold">
              <Link to="/register">Start Analysis <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
