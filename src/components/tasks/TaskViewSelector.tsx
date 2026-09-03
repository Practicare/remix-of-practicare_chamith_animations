import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl, SegmentOption } from "@/components/ui/segmented-control";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { format, addDays, addWeeks, startOfWeek, endOfWeek, subDays, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export type ViewMode = "day" | "week" | "custom";

interface TaskViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  customDateRange?: { start: Date; end: Date };
  onCustomDateRangeChange?: (range: { start: Date; end: Date }) => void;
}

export const TaskViewSelector = ({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  customDateRange,
  onCustomDateRangeChange,
}: TaskViewSelectorProps) => {
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    customDateRange ? { from: customDateRange.start, to: customDateRange.end } : undefined
  );
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);

  const handlePrevious = () => {
    if (viewMode === "day") {
      onDateChange(subDays(selectedDate, 1));
    } else if (viewMode === "week") {
      onDateChange(subWeeks(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "day") {
      onDateChange(addDays(selectedDate, 1));
    } else if (viewMode === "week") {
      onDateChange(addWeeks(selectedDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to && onCustomDateRangeChange) {
      onCustomDateRangeChange({ start: range.from, end: range.to });
      setCustomPopoverOpen(false);
    }
  };

  const handleCustomButtonClick = () => {
    onViewModeChange("custom");
    setCustomPopoverOpen(true);
  };

  const getDateLabel = () => {
    if (viewMode === "day") {
      return format(selectedDate, "EEEE, MMMM d, yyyy");
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else if (viewMode === "custom" && customDateRange) {
      return `${format(customDateRange.start, "MMM d")} - ${format(customDateRange.end, "MMM d, yyyy")}`;
    }
    return "";
  };

  const getMobileDateLabel = () => {
    if (viewMode === "day") {
      return format(selectedDate, "EEE, MMM d, yyyy");
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "d")}`;
    } else if (viewMode === "custom" && customDateRange) {
      return `${format(customDateRange.start, "MMM d")} - ${format(customDateRange.end, "d")}`;
    }
    return "";
  };

  const viewModeOptions: SegmentOption<"day" | "week">[] = [
    { id: "day", label: "Day", icon: CalendarIcon },
    { id: "week", label: "Week", icon: CalendarDays },
  ];

  const handleViewModeChange = (mode: "day" | "week") => {
    onViewModeChange(mode);
  };

  return (
    <div className="flex flex-col gap-2.5 md:gap-3 bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm">
      {/* View Mode Segmented Control */}
      <div className="flex items-center justify-start">
        <div className="inline-flex items-center bg-muted/50 rounded-full p-1 gap-0.5">
          {/* Day/Week using SegmentedControl pattern */}
          {viewModeOptions.map((option) => {
            const Icon = option.icon!;
            const isActive = viewMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleViewModeChange(option.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
          
          {/* Custom with Popover */}
          <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={handleCustomButtonClick}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  "active:scale-[0.98]",
                  viewMode === "custom"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <CalendarRange className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Custom</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="center">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={1}
                initialFocus
                className="pointer-events-auto md:hidden"
              />
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={2}
                initialFocus
                className="pointer-events-auto hidden md:block"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date Navigation */}
      {viewMode !== "custom" && (
        <div className="flex items-center justify-start gap-1.5 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevious} 
            className="h-8 w-8 md:h-9 md:w-9 rounded-full hover:bg-muted active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="h-8 md:h-9 text-xs md:text-sm px-3 md:px-4 min-w-0 rounded-full border-border/50 bg-background hover:bg-muted/50 font-medium active:scale-[0.98]"
              >
                <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 text-primary shrink-0" />
                <span className="md:hidden">{getMobileDateLabel()}</span>
                <span className="hidden md:inline">{getDateLabel()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext} 
            className="h-8 w-8 md:h-9 md:w-9 rounded-full hover:bg-muted active:scale-95"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleToday} 
            className="h-8 md:h-9 text-xs md:text-sm px-3 md:px-4 rounded-full font-medium active:scale-[0.98]"
          >
            Today
          </Button>
        </div>
      )}

      {/* Custom Range Display */}
      {viewMode === "custom" && customDateRange && (
        <div className="flex justify-start">
          <Badge 
            variant="secondary" 
            className="text-xs md:text-sm py-1.5 px-4 rounded-full font-medium bg-primary/10 text-primary border-0"
          >
            <CalendarRange className="w-3.5 h-3.5 mr-1.5" />
            {getMobileDateLabel()}
          </Badge>
        </div>
      )}
    </div>
  );
};