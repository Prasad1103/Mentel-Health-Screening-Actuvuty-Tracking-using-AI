import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Bell, Mic, Camera, Moon, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

interface Prefs {
  notifications: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  darkMode: boolean;
}
const KEY = (uid: string) => `be.prefs.${uid}`;
const defaults: Prefs = { notifications: true, micEnabled: true, cameraEnabled: true, darkMode: false };

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(defaults);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(KEY(user.id));
      if (raw) setPrefs({ ...defaults, ...JSON.parse(raw) });
    } catch { /* noop */ }
  }, [user]);

  const update = (patch: Partial<Prefs>) => {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(KEY(user.id), JSON.stringify(next));
    toast.success("Preferences saved");
  };

  const wipeHistory = () => {
    if (!user) return;
    if (!confirm("Permanently delete all your sessions? This cannot be undone.")) return;
    localStorage.removeItem(`be.sessions.${user.id}`);
    toast.success("History cleared");
  };

  const Item = ({ icon: Icon, title, desc, value, onChange }: SettingsItemProps) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/40 last:border-0">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-secondary/60 border border-border/50 flex items-center justify-center text-muted-foreground shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Personalize your BE Analysis experience</p>
        </div>
      </div>

      {/* Account */}
      <div className="bg-card border shadow-sm rounded-xl p-6 mb-4">
        <h3 className="font-display font-bold mb-4">Account</h3>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold">{user?.name}</div>
            <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card border shadow-sm rounded-xl p-6 mb-4">
        <h3 className="font-display font-bold mb-2">Preferences</h3>
        <div>
          <Item icon={Bell} title="Notifications" desc="Reminders to check in with yourself."
            value={prefs.notifications} onChange={(v: boolean) => update({ notifications: v })} />
          <Item icon={Mic} title="Microphone" desc="Allow voice input in the AI Chat page."
            value={prefs.micEnabled} onChange={(v: boolean) => update({ micEnabled: v })} />
          <Item icon={Camera} title="Camera" desc="Allow webcam capture for facial emotion analysis."
            value={prefs.cameraEnabled} onChange={(v: boolean) => update({ cameraEnabled: v })} />
          <Item icon={Moon} title="Dark mode" desc="Use a calmer low-light interface where supported."
            value={prefs.darkMode} onChange={(v: boolean) => update({ darkMode: v })} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border shadow-sm rounded-xl p-6 border-destructive/30">
        <h3 className="font-display font-bold mb-1 text-destructive">Danger zone</h3>
        <p className="text-sm text-muted-foreground mb-4">These actions can't be undone.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={wipeHistory}>
            <Trash2 className="h-4 w-4" /> Clear all history
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
