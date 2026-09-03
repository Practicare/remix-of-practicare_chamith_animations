import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCompleteTickProps {
  completed: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function TaskCompleteTick({ completed, onToggle, size = "md", className }: TaskCompleteTickProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
  };
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
        sizes[size],
        completed
          ? "bg-success border-success text-success-foreground"
          : "border-muted-foreground/25 hover:border-success hover:bg-success/10",
        className
      )}
    >
      <Check className={cn(iconSizes[size], completed ? "opacity-100" : "opacity-30")} />
    </button>
  );
}
