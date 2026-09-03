import { motion } from "framer-motion";
import { Stethoscope, Smile, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData, Industry } from "@/types/onboarding";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onSelect?: () => void;
}

const TYPES: { value: Industry; label: string; Icon: typeof Stethoscope; desc: string }[] = [
  { value: "Primary Care", label: "Medical", Icon: Stethoscope, desc: "GP, primary & specialist care" },
  { value: "Allied Health", label: "Dental", Icon: Smile, desc: "Dental clinics & orthodontics" },
  { value: "Integrative Medicine", label: "Other", Icon: Sparkles, desc: "Allied health, vet, wellness" },
];

export function PracticeTypeStep({ data, onChange, onSelect }: Props) {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-lg tracking-[0.16em] uppercase">
          Practice Type
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.05]">
          What kind of practice?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
          We'll tailor every workflow to fit your team.
        </p>
      </motion.div>

      <div className="space-y-3">
        {TYPES.map((opt, i) => {
          const selected = data.industry === opt.value;
          const Icon = opt.Icon;
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onChange({ industry: opt.value });
                onSelect?.();
              }}
              className={cn(
                "group w-full flex items-center justify-between p-5 rounded-lg border-2 transition-all duration-200 text-left bg-card",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/60 hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-base font-bold text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                selected ? "border-primary bg-primary" : "border-border group-hover:border-primary/60"
              )}>
                {selected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
