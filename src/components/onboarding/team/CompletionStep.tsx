import { ClipboardList, DoorOpen, Package, Rocket, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamOnboardingState } from "@/types/onboardingTeam";

interface Props {
  state: TeamOnboardingState;
  onComplete: () => void;
}

export function CompletionStep({ state, onComplete }: Props) {
  const summary = [
    {
      icon: Rocket,
      label: "Practice",
      value: state.practiceName || "Your practice",
      detail: [state.industry, state.country].filter(Boolean).join(" · ") || "Setup complete",
    },
    {
      icon: DoorOpen,
      label: "Locations",
      value: `${state.rooms.length} room${state.rooms.length === 1 ? "" : "s"}`,
      detail: state.siteName || "Main Site",
    },
    {
      icon: Package,
      label: "Inventory",
      value: `${state.stockItems.length} item${state.stockItems.length === 1 ? "" : "s"}`,
      detail: state.stockMethod ? `Imported via ${state.stockMethod === "ai" ? "AI scan" : state.stockMethod === "csv" ? "CSV" : "manual entry"}` : "Add later",
    },
    {
      icon: UserPlus,
      label: "Team",
      value: `${state.staff.length} invite${state.staff.length === 1 ? "" : "s"}`,
      detail: `${state.roles.length} role${state.roles.length === 1 ? "" : "s"} configured`,
    },
    {
      icon: ClipboardList,
      label: "Checklists",
      value: `${state.activeTemplates.length} activated`,
      detail: "Ready to run today",
    },
    {
      icon: ShieldCheck,
      label: "Access control",
      value: "Role-based",
      detail: "Every invitee has a role assigned",
    },
  ];

  const quickLinks = [
    { label: "Run your first checklist", href: "/checklists" },
    { label: "View inventory & low stock", href: "/stock" },
    { label: "Invite remaining staff", href: "/staff" },
    { label: "Set up accreditation", href: "/accreditation" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Rocket className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">You're ready to go live</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Here's everything you configured. You can finish any of it later from Settings.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wide">{s.label}</span>
              </div>
              <div className="text-sm font-semibold mt-1 truncate">{s.value}</div>
              <div className="text-xs text-muted-foreground truncate">{s.detail}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Quick links</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg border bg-background px-4 py-3 text-sm font-medium",
                "border-border text-primary hover:bg-primary/5 transition-colors"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <Button type="button" size="lg" className="w-full h-12" onClick={onComplete}>
        <Rocket className="w-5 h-5 mr-2" /> Go to Dashboard
      </Button>
    </div>
  );
}
