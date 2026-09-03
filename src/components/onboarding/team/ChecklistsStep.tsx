import { useState } from "react";
import { ClipboardCheck, CalendarClock, Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { defaultsFor } from "@/data/onboardingDefaults";
import type { TeamOnboardingState } from "@/types/onboardingTeam";

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function ChecklistsStep({ state, update }: Props) {
  const templates = defaultsFor(state.industry).checklistTemplates;
  const [activatingAll, setActivatingAll] = useState(false);

  const toggle = (id: string) => {
    update({
      activeTemplates: state.activeTemplates.includes(id)
        ? state.activeTemplates.filter((t) => t !== id)
        : [...state.activeTemplates, id],
    });
  };

  const activateAll = async () => {
    setActivatingAll(true);
    await new Promise((r) => setTimeout(r, 700));
    update({ activeTemplates: templates.map((t) => t.id) });
    setActivatingAll(false);
    toast.success(`${templates.length} checklist templates activated.`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Starter checklists</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            One tap activates proven templates for {state.industry ?? "your industry"}. You can
            customise them in the Checklist builder.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {templates.map((tpl) => {
          const active = state.activeTemplates.includes(tpl.id);
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => toggle(tpl.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-all flex items-start gap-3",
                active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5",
                  active ? "bg-primary border-primary text-primary-foreground" : "border-border"
                )}
              >
                {active && <Check className="w-4 h-4" />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{tpl.title}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarClock className="w-3 h-3" /> {tpl.frequency}
                  </span>
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">{tpl.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="button" onClick={activateAll} disabled={activatingAll} className="h-9">
          {activatingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Activating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1.5" /> Activate all {templates.length}
            </>
          )}
        </Button>
        {state.activeTemplates.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => update({ activeTemplates: [] })}
          >
            Clear selection
          </Button>
        )}
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-primary">First win:</span> after setup, open your first
        checklist and tick it off — that's the fastest way to see Practicare working.
      </div>
    </div>
  );
}
