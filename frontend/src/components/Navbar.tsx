import { Link, useNavigate } from "react-router-dom";
import { Brain, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Research", href: "#research" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A8A]">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-[#0F172A] tracking-tight">Behavioral AI</span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#64748B]">Behavioral · Emotional</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#334155] hover:text-[#1E3A8A] transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-[#64748B]">
                Hi, <span className="text-[#0F172A] font-medium">{user?.name.split(" ")[0]}</span>
              </span>
              <Button size="sm" asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Link to="/app">Open Console</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-white p-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[#334155]"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-3 border-t border-border/40">
            {isAuthenticated ? (
              <Button size="sm" asChild className="w-full bg-[#1E3A8A]">
                <Link to="/app">Open Console</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="flex-1 bg-[#1E3A8A]">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
