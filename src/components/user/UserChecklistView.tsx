import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { mockChecklists } from "@/data/mockChecklists";
import { Checklist } from "@/types/checklists";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { ChecklistContent } from "@/components/checklists/ChecklistContent";
import { TaskViewSelector, ViewMode } from "@/components/tasks/TaskViewSelector";
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, isToday } from "date-fns";

interface UserChecklistViewProps {
  preview?: boolean;
  limit?: number;
  minimal?: boolean;
  onSelectChecklist?: (checklist: Checklist) => void;
  initialSelectedChecklistId?: string;
}

export function UserChecklistView({ preview = false, limit, minimal = false, onSelectChecklist, initialSelectedChecklistId }: UserChecklistViewProps) {
  const { currentUser } = useUser();
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(() => {
    if (initialSelectedChecklistId) {
      return mockChecklists.find(c => c.id === initialSelectedChecklistId) || null;
    }
    return null;
  });
  
  // Date filter state
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (!currentUser) return null;

  // Helper to check if checklist falls within date range
  const isChecklistInDateRange = (checklist: Checklist): boolean => {
    // For now, show all checklists for "day" view if recurring is daily or no specific date
    // In a real app, you'd check against the checklist's scheduled date
    if (viewMode === "day") {
      // Show daily checklists on any day, or match specific dates
      if (checklist.recurring === "daily") return true;
      if (checklist.recurring === "weekly") {
        // Show weekly checklists on specific days (simplified: show all)
        return true;
      }
      return true; // Show all for now since we don't have specific dates
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      // Show all recurring checklists for the week
      if (checklist.recurring) return true;
      return true;
    } else if (viewMode === "custom" && customDateRange) {
      // Show all checklists in custom range
      return true;
    }
    return true;
  };

  // Filter checklists assigned to user's department or all
  const userChecklists = mockChecklists.filter((checklist) => {
    if (checklist.assignment?.type === "all") return true;
    if (checklist.assignment?.type === "department") {
      return checklist.assignment.departmentIds?.includes(currentUser.departmentId);
    }
    if (checklist.assignment?.type === "users") {
      return checklist.assignment.userIds?.includes(currentUser.id);
    }
    // Default: match by category (department)
    return checklist.categoryId === currentUser.departmentId;
  });

  // Filter checklists by date range
  const dateFilteredChecklists = userChecklists.filter(isChecklistInDateRange);

  const displayChecklists = limit ? dateFilteredChecklists.slice(0, limit) : dateFilteredChecklists;

  const getChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter((item) => item.completed).length;
    return { completed, total: checklist.items.length, percentage: (completed / checklist.items.length) * 100 };
  };

  const handleSubmitChecklist = () => {
    toast.success("Checklist completed successfully!");
    setSelectedChecklist(null);
  };

  const handleResetChecklist = () => {
    toast.info("Checklist reset");
  };

  const categoryName = selectedChecklist
    ? getDepartmentById(DEFAULT_DEPARTMENTS, selectedChecklist.categoryId)?.name
    : undefined;

  if (displayChecklists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No checklists assigned to you</p>
      </div>
    );
  }

  // If in full view and a checklist is selected, show it in a container
  if (!preview && selectedChecklist) {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedChecklist(null)}
          className="gap-1.5 -ml-2"
        >
          <X className="w-4 h-4" />
          Back to Checklists
        </Button>

        {/* Checklist Container using shared component */}
        <ChecklistContent
          checklist={selectedChecklist}
          categoryName={categoryName}
          deviceView="desktop"
          onSubmit={handleSubmitChecklist}
          onReset={handleResetChecklist}
          showSubmitButton={true}
          currentUserName={currentUser.firstName}
        />
      </div>
    );
  }

  // Checklist list view
  return (
    <div className={cn("space-y-3 md:space-y-4", preview && "")}>
      {/* Date Filter - Only show in full view */}
      {!preview && (
        <TaskViewSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
        />
      )}
      
      {/* Minimal view for dashboard overview - checklist with checkboxes */}
      {minimal && displayChecklists.length > 0 && (
        <div className="space-y-1">
          {displayChecklists[0].items.slice(0, limit || 5).map((item, index) => (
            <div 
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                item.completed 
                  ? "bg-primary border-primary" 
                  : "border-muted-foreground/30"
              )}>
                {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className={cn(
                "text-sm",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.text}
              </span>
            </div>
          ))}
          {/* Progress indicator */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Progress</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={getChecklistProgress(displayChecklists[0]).percentage} 
                className="w-24 h-2" 
              />
              <span className="text-xs font-medium">
                {getChecklistProgress(displayChecklists[0]).completed}/{getChecklistProgress(displayChecklists[0]).total}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Regular list view */}
      {!minimal && (
      <div className="space-y-2 md:space-y-3">
        {displayChecklists.map((checklist) => {
        const prog = getChecklistProgress(checklist);
        const dept = getDepartmentById(DEFAULT_DEPARTMENTS, checklist.categoryId);
        const isChecklistComplete = prog.percentage === 100;

        return (
          <div
            key={checklist.id}
            className={cn(
              "p-3 md:p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm",
              isChecklistComplete
                ? "bg-success/5 border-success/30"
                : "bg-card hover:border-primary/50"
            )}
            onClick={() => {
              if (preview && onSelectChecklist) {
                onSelectChecklist(checklist);
              } else {
                setSelectedChecklist(checklist);
              }
            }}
          >
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {isChecklistComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{checklist.title}</h4>
                    {checklist.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {checklist.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {prog.completed}/{prog.total}
                  </span>
                  <div className="w-12">
                    <Progress
                      value={prog.percentage}
                      className={cn("h-1", isChecklistComplete && "[&>div]:bg-success")}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 ml-6">
                {dept && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                    {dept.name}
                  </Badge>
                )}
                {checklist.recurring && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 capitalize">
                    {checklist.recurring}
                  </Badge>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isChecklistComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-sm truncate">{checklist.title}</h4>
                  </div>
                  {checklist.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 ml-6">
                      {checklist.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 ml-6">
                    {dept && (
                      <Badge variant="secondary" className="text-[10px]">
                        {dept.name}
                      </Badge>
                    )}
                    {checklist.recurring && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {checklist.recurring}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-medium">
                    {prog.completed}/{prog.total}
                  </span>
                  <div className="w-16">
                    <Progress
                      value={prog.percentage}
                      className={cn("h-1.5", isChecklistComplete && "[&>div]:bg-success")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
      )}
    </div>
  );
}