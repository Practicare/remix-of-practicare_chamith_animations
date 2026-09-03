import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { mockDepartments } from "@/data/mockDepartments";

interface TaskHistoryFiltersProps {
  dateRange: { start: Date | undefined; end: Date | undefined };
  onDateRangeChange: (range: { start: Date | undefined; end: Date | undefined }) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (dept: string) => void;
  userFilter: string;
  onUserFilterChange: (user: string) => void;
  assignees: string[];
}

export function TaskHistoryFilters({
  dateRange,
  onDateRangeChange,
  departmentFilter,
  onDepartmentFilterChange,
  userFilter,
  onUserFilterChange,
  assignees,
}: TaskHistoryFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const calendarRange: DateRange | undefined =
    dateRange.start ? { from: dateRange.start, to: dateRange.end } : undefined;

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange({ start: range?.from, end: range?.to });
    if (range?.from && range?.to) {
      setCalendarOpen(false);
    }
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateRangeChange({ start, end });
  };

  const hasFilters = dateRange.start || departmentFilter || userFilter;

  const clearAll = () => {
    onDateRangeChange({ start: undefined, end: undefined });
    onDepartmentFilterChange("");
    onUserFilterChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Range */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5 rounded-lg",
              dateRange.start && "bg-primary/10 border-primary/30 text-primary"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {dateRange.start && dateRange.end
              ? `${format(dateRange.start, "MMM d")} – ${format(dateRange.end, "MMM d")}`
              : "Date range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <div className="flex gap-1 p-2 border-b border-border">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleQuickRange(7)}>7d</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleQuickRange(30)}>30d</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleQuickRange(90)}>90d</Button>
          </div>
          <Calendar
            mode="range"
            selected={calendarRange}
            onSelect={handleRangeSelect}
            numberOfMonths={1}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Department */}
      <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
        <SelectTrigger
          className={cn(
            "h-8 w-auto min-w-[130px] text-xs rounded-lg",
            departmentFilter && "bg-primary/10 border-primary/30 text-primary"
          )}
        >
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {mockDepartments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* User / Assignee */}
      <Select value={userFilter} onValueChange={onUserFilterChange}>
        <SelectTrigger
          className={cn(
            "h-8 w-auto min-w-[130px] text-xs rounded-lg",
            userFilter && "bg-primary/10 border-primary/30 text-primary"
          )}
        >
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {assignees.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={clearAll}>
          <X className="w-3 h-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
