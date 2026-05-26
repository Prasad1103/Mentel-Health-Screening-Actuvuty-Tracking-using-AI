import { useEffect, useState } from "react";
import { Bell, Bot, Moon, Search, ShieldCheck, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export function AppTopbar() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("be.theme") === "dark");
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("be.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900" />

        <div className="hidden h-6 w-px bg-slate-200 md:block" />

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Search sessions and reports"
            className="h-10 border-slate-200 bg-slate-50 pl-10 text-sm"
            placeholder="Search sessions, reports, emotions..."
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure session
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 lg:flex">
            <Bot className="h-3.5 w-3.5" />
            AI ready
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? (
              <Moon className="h-4 w-4 text-slate-600" />
            ) : (
              <Sun className="h-4 w-4 text-slate-600" />
            )}
          </Button>

          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4 text-slate-600" />
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="hidden min-w-0 pr-2 sm:block">
              <div className="max-w-32 truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </div>
              <div className="max-w-32 truncate text-xs text-slate-500">
                {user?.email || "Signed in"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
