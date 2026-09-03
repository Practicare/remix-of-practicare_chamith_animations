import { STAGE_ORDER, STAGE_LABELS, AccreditationStage } from "@/data/mockAccreditation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  current: AccreditationStage;
  onSelect?: (s: AccreditationStage) => void;
}

export function ProjectTimeline({ current, onSelect }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(current);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center min-w-[720px] px-2 py-3">
        {STAGE_ORDER.map((stage, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => onSelect?.(stage)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-colors",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && "bg-primary/10 border-primary text-primary",
                    !done && !active && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center max-w-[80px]",
                    active ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {STAGE_LABELS[stage]}
                </span>
              </button>
              {i < STAGE_ORDER.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-5 rounded-full",
                    i < currentIdx ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
