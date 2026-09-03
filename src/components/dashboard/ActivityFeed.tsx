import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckSquare, ClipboardList, Package, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { activityFeed } from "@/utils/dashboardMetrics";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  task: ClipboardList,
  checklist: CheckSquare,
  stock: Package,
  compliance: ShieldCheck,
} as const;

const TONE_MAP = {
  task: "text-primary bg-primary/10",
  checklist: "text-success bg-success/10",
  stock: "text-warning bg-warning/10",
  compliance: "text-accent bg-accent/10",
} as const;

export function ActivityFeed() {
  const events = activityFeed(15);

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Activity feed
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => {
              const Icon = ICON_MAP[e.type];
              return (
                <div key={e.id} className="flex items-start gap-3 py-1.5">
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", TONE_MAP[e.type])}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {e.actor && <span>{e.actor} · </span>}
                      {formatDistanceToNow(e.at, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
