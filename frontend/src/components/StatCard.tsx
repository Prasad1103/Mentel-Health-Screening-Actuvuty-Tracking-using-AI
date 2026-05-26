import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "accent" | "destructive";
}

export function StatCard({ icon: Icon, label, value, hint, accent = "primary" }: Props) {
  const tone =
    accent === "accent" ? "bg-accent/10 text-accent"
    : accent === "destructive" ? "bg-destructive/10 text-destructive"
    : "bg-primary/10 text-primary";

  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
