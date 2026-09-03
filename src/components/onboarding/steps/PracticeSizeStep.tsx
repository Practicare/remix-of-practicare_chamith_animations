import { Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData, PRACTICE_SIZES, PracticeSize } from "@/types/onboarding";
import { Badge } from "@/components/ui/badge";

interface PracticeSizeStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function PracticeSizeStep({ data, onChange }: PracticeSizeStepProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">How big is your team?</h2>
        <p className="text-muted-foreground mt-2">This helps us recommend the right plan for you</p>
        <div className="mt-4 flex flex-col items-center gap-1">
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 px-4 py-1.5 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-1.5" />
            14 Day FREE Trial
          </Badge>
          <span className="text-xs text-muted-foreground">No credit card required</span>
        </div>
      </div>

      <div className="grid gap-3">
        {PRACTICE_SIZES.map((size, index) => (
          <button
            key={size.value}
            onClick={() => onChange({ practiceSize: size.value, selectedPlan: size.value })}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all duration-300 group",
              "hover:border-primary/50 hover:bg-primary/5",
              data.practiceSize === size.value
                ? "border-primary bg-primary/5 shadow-card"
                : "border-border bg-card"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  data.practiceSize === size.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{size.label}</h3>
                  <p className="text-sm text-muted-foreground">{size.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  {size.isCustom ? (
                    <>
                      <span className="text-lg font-bold text-primary">Custom</span>
                      <p className="text-xs text-muted-foreground">Contact us for pricing</p>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-primary">${size.fortnightPrice}</span>
                      <span className="text-sm text-muted-foreground">/fortnight</span>
                      <p className="text-xs text-muted-foreground">Billed monthly</p>
                    </>
                  )}
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  data.practiceSize === size.value
                    ? "border-primary bg-primary"
                    : "border-border"
                )}>
                  {data.practiceSize === size.value && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
