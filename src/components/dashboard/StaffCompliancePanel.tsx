import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Period, complianceMetrics } from "@/utils/dashboardMetrics";
import { cn } from "@/lib/utils";

interface Props { period: Period }

export function StaffCompliancePanel({ period }: Props) {
  const navigate = useNavigate();
  const c = complianceMetrics(period);

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            Staff & Compliance
          </h3>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/compliance")}>
            View <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Cert expiries */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Cert expiries (next 60d)</p>
          <div className="space-y-1.5">
            {c.certExpiries.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.name}</p>
                  <p className="text-[10px] text-muted-foreground">{e.cert}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-md ml-2 shrink-0",
                    e.expiresIn <= 14 ? "bg-destructive/10 text-destructive" :
                    e.expiresIn <= 30 ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {e.expiresIn}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding */}
        <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Expired</p>
            <p className="text-lg font-bold text-destructive">{c.expired}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Expiring soon</p>
            <p className="text-lg font-bold text-warning">{c.expiringSoon}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
