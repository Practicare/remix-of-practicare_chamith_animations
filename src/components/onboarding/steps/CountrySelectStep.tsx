import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingData, Country } from "@/types/onboarding";

interface Props {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
  onSelect?: () => void;
}

const options: { value: Country; label: string; flag: string }[] = [
  { value: "Australia", label: "Australia", flag: "🇦🇺" },
  { value: "New Zealand", label: "New Zealand", flag: "🇳🇿" },
  { value: "Singapore", label: "Singapore", flag: "🇸🇬" },
  { value: "USA", label: "United States", flag: "🇺🇸" },
  { value: "Canada", label: "Canada", flag: "🇨🇦" },
];

export function CountrySelectStep({ data, onChange, onSelect }: Props) {
  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-lg tracking-[0.16em] uppercase">
          Regional Setup
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.05]">
          Where is your practice?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
          We'll tailor compliance, currency, and language to your region.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => {
          const selected = data.country === opt.value;
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onChange({ country: opt.value });
                onSelect?.();
              }}
              className={cn(
                "group flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 text-left bg-card",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/60 hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl leading-none">{opt.flag}</span>
                <span className={cn(
                  "font-semibold transition-colors",
                  selected ? "text-foreground" : "text-foreground/85 group-hover:text-foreground"
                )}>
                  {opt.label}
                </span>
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
