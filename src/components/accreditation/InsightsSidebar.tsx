import { mockInsights, AccreditationInsight } from "@/data/mockAccreditation";
import { AlertTriangle, FileWarning, Clock, GraduationCap, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  risk: AlertTriangle,
  policy: FileWarning,
  task: Clock,
  training: GraduationCap,
  trend: TrendingUp,
};

const TONES: Record<AccreditationInsight["tone"], string> = {
  critical: "text-destructive bg-destructive/10",
  warning: "text-amber-600 bg-amber-500/10",
  info: "text-blue-600 bg-blue-500/10",
  success: "text-emerald-600 bg-emerald-500/10",
};

export function InsightsSidebar() {
  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-border/40 bg-card/40 p-4 gap-3 overflow-y-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Today's AI Insights</h3>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">Auto-generated from your latest data</p>

      <div className="space-y-2">
        {mockInsights.map((ins) => {
          const Icon = ICONS[ins.icon];
          return (
            <div
              key={ins.id}
              className="rounded-lg border border-border/60 bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-2.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", TONES[ins.tone])}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold leading-tight">{ins.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{ins.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3">
        <p className="text-[12px] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Recommended next
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
          Book anaphylaxis training for 4 staff before 30 Jul to close a critical gap.
        </p>
        <button className="mt-2 text-[11px] font-semibold text-primary hover:underline">Generate task →</button>
      </div>
    </aside>
  );
}
