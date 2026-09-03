import { motion } from "framer-motion";
import { CheckSquare, ClipboardCheck, Calendar, Package, Shield, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData, FeaturePriority, FEATURE_PRIORITIES } from "@/types/onboarding";

interface PrioritiesStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckSquare,
  ClipboardCheck,
  Calendar,
  Package,
  Shield,
};

export function PrioritiesStep({ data, onChange }: PrioritiesStepProps) {
  const togglePriority = (priority: FeaturePriority) => {
    const current = data.priorities || [];
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onChange({ priorities: updated });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Target className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">When it's all organised, you can breathe</h2>
        <p className="text-muted-foreground mt-2">Select all that interest you</p>
      </div>

      <div className="space-y-3">
        {FEATURE_PRIORITIES.map((feature, index) => {
          const Icon = iconMap[feature.icon] || CheckSquare;
          const isSelected = (data.priorities || []).includes(feature.value);
          
          return (
            <motion.button
              key={feature.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => togglePriority(feature.value)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300 group",
                isSelected
                  ? "border-primary bg-primary/5 shadow-card"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {/* Checkbox */}
              <div className={cn(
                "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              )}>
                {isSelected && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-primary-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </div>
              
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Label */}
              <span className={cn(
                "font-medium transition-colors",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {feature.label}
              </span>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
