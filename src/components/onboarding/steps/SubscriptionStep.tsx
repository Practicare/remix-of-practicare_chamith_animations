import { CreditCard, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData, SUBSCRIPTION_PLANS } from "@/types/onboarding";
import { Badge } from "@/components/ui/badge";

interface SubscriptionStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function SubscriptionStep({ data, onChange }: SubscriptionStepProps) {
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Choose your plan</h2>
        <p className="text-muted-foreground mt-2">Select the plan that fits your practice needs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <button
            key={plan.id}
            onClick={() => onChange({ selectedPlan: plan.id, practiceSize: plan.id as any })}
            className={cn(
              "relative p-6 rounded-xl border-2 text-left transition-all duration-300 flex flex-col",
              "hover:border-primary/50 hover:shadow-card",
              data.selectedPlan === plan.id
                ? "border-primary bg-primary/5 shadow-elevated"
                : "border-border bg-card",
              plan.recommended && "ring-2 ring-accent ring-offset-2"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {plan.recommended && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            )}
            
            <div className="mb-4">
              <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-primary">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${plan.pricePerUser}/user/month
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className={cn(
                "py-2 px-4 rounded-lg text-center font-medium transition-colors",
                data.selectedPlan === plan.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {data.selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
