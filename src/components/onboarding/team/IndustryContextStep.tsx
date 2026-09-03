import { motion } from "framer-motion";
import { Sparkles, Stethoscope, Smile, HeartPulse, Sparkle, HelpCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COUNTRIES, type Country } from "@/types/onboarding";
import { TEAM_INDUSTRIES, type TeamIndustry, type TeamOnboardingState } from "@/types/onboardingTeam";

const INDUSTRY_ICONS: Record<TeamIndustry, typeof Stethoscope> = {
  "GP / Primary Care": Stethoscope,
  Dental: Smile,
  "Allied Health": HeartPulse,
  "Specialist & Cosmetic": Sparkle,
  Other: HelpCircle,
};

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function IndustryContextStep({ state, update }: Props) {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Setup takes about 10 minutes
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Let's set up your practice</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We'll tailor rooms, stock categories and checklists to how your practice works.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        <div className="space-y-2">
          <Label htmlFor="practiceName">Practice name</Label>
          <Input
            id="practiceName"
            placeholder="e.g. Bayside Medical Centre"
            value={state.practiceName}
            onChange={(e) => update({ practiceName: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={state.country ?? ""}
            onValueChange={(value) => update({ country: value as Country })}
          >
            <SelectTrigger id="country" className="h-11">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEAM_INDUSTRIES.map((ind) => {
              const Icon = INDUSTRY_ICONS[ind];
              const selected = state.industry === ind;
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => update({ industry: ind })}
                  className={cn(
                    "relative rounded-lg border p-3 text-left transition-all flex flex-col gap-2 min-h-[84px]",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-background"
                  )}
                >
                  <Icon className={cn("w-5 h-5", selected ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-medium leading-snug">{ind}</span>
                  {selected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-lg bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
