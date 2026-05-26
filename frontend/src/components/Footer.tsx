import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 inline-flex hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A]">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">Behavioral AI</span>
          </Link>
          <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
            An AI-driven Behavioral &amp; Emotional analysis platform — combining adaptive conversation,
            vision, and psychometrics into a single insight engine for research and enterprise wellness.
          </p>
          <p className="text-xs text-[#94A3B8]">
            Designed for academic research, conference demonstrations, and enterprise behavioral intelligence.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm text-[#64748B]">
            <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors">Features</a></li>
            <li><a href="#workflow" className="hover:text-[#1E3A8A] transition-colors">Workflow</a></li>
            <li><a href="#dashboard" className="hover:text-[#1E3A8A] transition-colors">Dashboard</a></li>
            <li><a href="#research" className="hover:text-[#1E3A8A] transition-colors">Research</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] mb-4">Account</h4>
          <ul className="space-y-2.5 text-sm text-[#64748B]">
            <li><Link to="/login" className="hover:text-[#1E3A8A] transition-colors">Log In</Link></li>
            <li><Link to="/register" className="hover:text-[#1E3A8A] transition-colors">Create Account</Link></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0]">
        <div className="container py-6 text-xs text-[#94A3B8] flex flex-col md:flex-row justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Behavioral AI. All rights reserved.</span>
          <span>AI-Powered Behavioral &amp; Emotional Analysis System · v2.0</span>
        </div>
      </div>
    </footer>
  );
}
