import { Card, CardContent } from "@/components/ui/card";
import { Memo } from "@/types/memos";
import { FileText, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface MemoStatsProps {
  memos: Memo[];
  currentUserId: string;
}

export const MemoStats = ({ memos, currentUserId }: MemoStatsProps) => {
  const totalMemos = memos.length;
  const mandatoryMemos = memos.filter((m) => m.mandatoryRead);
  const unreadMandatory = mandatoryMemos.filter(
    (m) => !m.readBy.some((r) => r.userId === currentUserId)
  );
  const readMemos = memos.filter((m) => m.readBy.some((r) => r.userId === currentUserId));

  const stats = [
    {
      label: "Total",
      fullLabel: "Total Memos",
      value: totalMemos,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Mandatory",
      fullLabel: "Mandatory",
      value: mandatoryMemos.length,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Urgent",
      fullLabel: "Unread Mandatory",
      value: unreadMandatory.length,
      icon: EyeOff,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Read",
      fullLabel: "Read",
      value: readMemos.length,
      icon: Eye,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <>
      {/* Mobile: Compact horizontal stats */}
      <div className="md:hidden grid grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-2 flex flex-col items-center text-center">
              <div className={`p-1.5 rounded-lg ${stat.bg} mb-1`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold leading-tight">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Full stats row */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.fullLabel}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.fullLabel}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
