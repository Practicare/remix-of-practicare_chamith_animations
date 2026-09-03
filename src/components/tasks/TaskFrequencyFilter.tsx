import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export type FrequencyFilterValue = "all" | "daily" | "weekly" | "monthly" | "custom";

interface Props {
  value: FrequencyFilterValue;
  onChange: (v: FrequencyFilterValue) => void;
  customRange: { from?: Date; to?: Date };
  onCustomRangeChange: (r: { from?: Date; to?: Date }) => void;
  fullWidth?: boolean;
  size?: "sm" | "default" | "lg";
}

export const TaskFrequencyFilter = ({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
  fullWidth,
  size = "sm",
}: Props) => {
  const [open, setOpen] = useState(false);
  const handleChange = (v: FrequencyFilterValue) => {
    onChange(v);
    setOpen(v === "custom");
  };

  const selected: DateRange | undefined = customRange.from
    ? { from: customRange.from, to: customRange.to }
    : undefined;

  const fromLabel = customRange.from ? format(customRange.from, "MMM d, yyyy") : "From";
  const toLabel = customRange.to ? format(customRange.to, "MMM d, yyyy") : "To";

  return (
    <div className={cn("flex flex-col gap-3", fullWidth && "w-full")}>
      <SegmentedControl
        options={[
          { id: "all" as const, label: "All" },
          { id: "daily" as const, label: "Daily" },
          { id: "weekly" as const, label: "Weekly" },
          { id: "monthly" as const, label: "Monthly" },
          { id: "custom" as const, label: "Custom" },
        ]}
        value={value}
        onChange={(v) => handleChange(v as FrequencyFilterValue)}
        size={size}
        fullWidth={fullWidth}
      />
      {value === "custom" && (
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-2 rounded-lg justify-start",
                !customRange.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{fromLabel}</span>
              <span className="text-muted-foreground">→</span>
              <span>{toLabel}</span>
              {(customRange.from || customRange.to) && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onCustomRangeChange({});
                  }}
                  className="ml-1 p-0.5 rounded hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start">
            <Calendar
              mode="range"
              selected={selected}
              onSelect={(r) => {
                onCustomRangeChange({ from: r?.from, to: r?.to });
              }}
              numberOfMonths={2}
              defaultMonth={customRange.from}
              initialFocus
              className="pointer-events-auto"
            />
            <div className="flex justify-end gap-2 p-2 border-t border-border">
              <Button size="sm" variant="ghost" onClick={() => onCustomRangeChange({})}>
                Clear
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
