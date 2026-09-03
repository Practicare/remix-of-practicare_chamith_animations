import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarX, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Period } from "@/utils/dashboardMetrics";
import {
  daysUntil,
  getAllExpiryRecords,
  ExpirySource,
} from "@/utils/expiryAggregator";
import { cn } from "@/lib/utils";

interface Props {
  period: Period;
}

const SOURCE_COLOR: Record<ExpirySource, string> = {
  stock: "bg-primary/10 text-primary border-primary/20",
  calibration: "bg-accent/10 text-accent-foreground border-accent/30",
  electrical: "bg-warning/10 text-warning border-warning/30",
  compliance: "bg-secondary text-secondary-foreground border-border",
};

export function StockExpiryPanel({ period }: Props) {
  const navigate = useNavigate();
  const all = getAllExpiryRecords();

  const expired = all.filter((r) => daysUntil(r.expiryDate) < 0);
  const lt7 = all.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d >= 0 && d <= 7;
  });
  const lt30 = all.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d > 7 && d <= 30;
  });

  const top = [...all]
    .filter((r) => daysUntil(r.expiryDate) <= 30)
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
    .slice(0, 5);

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CalendarX className="w-4 h-4 text-destructive" />
            Expiry Watch
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => navigate("/expiry-centre")}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
            <p className="text-xl font-bold">{expired.length}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">Expired</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 text-destructive">
            <p className="text-xl font-bold">{lt7.length}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">≤ 7 days</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 text-warning">
            <p className="text-xl font-bold">{lt30.length}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">≤ 30 days</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Most urgent
          </p>
          {top.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nothing expiring soon. </p>
          ) : (
            <div className="space-y-1">
              {top.map((r) => {
                const d = daysUntil(r.expiryDate);
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(r.route)}
                    className="w-full flex items-center gap-2 text-xs py-1.5 px-1 rounded hover:bg-muted/40 text-left"
                  >
                    <span className="truncate flex-1">{r.itemName}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] shrink-0", SOURCE_COLOR[r.source])}
                    >
                      {r.sourceLabel}
                    </Badge>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-medium tabular-nums",
                        d < 0 ? "text-destructive" : d <= 7 ? "text-destructive" : "text-warning",
                      )}
                    >
                      {d < 0 ? `${Math.abs(d)}d overdue` : `in ${d}d`}
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
