import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { TaskCompleteTick } from "@/components/tasks/TaskCompleteTick";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { mockTasks } from "@/data/mockTasks";
import { Task } from "@/types/tasks";
import { format, isToday, isTomorrow, isPast, differenceInDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { TaskViewSelector, ViewMode } from "@/components/tasks/TaskViewSelector";

interface UserTaskListProps {
  preview?: boolean;
  limit?: number;
  minimal?: boolean;
}

export function UserTaskList({ preview = false, limit, minimal = false }: UserTaskListProps) {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  
  // Date filter state
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (!currentUser) return null;

  // Helper to check if task falls within date range
  const isTaskInDateRange = (task: Task): boolean => {
    const taskDate = new Date(task.dueDate);
    if (viewMode === "day") {
      return isWithinInterval(taskDate, {
        start: startOfDay(selectedDate),
        end: endOfDay(selectedDate),
      });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    } else if (viewMode === "custom" && customDateRange) {
      return isWithinInterval(taskDate, {
        start: startOfDay(customDateRange.start),
        end: endOfDay(customDateRange.end),
      });
    }
    return true;
  };

  // Filter tasks assigned to user
  const userTasks = tasks.filter(
    (task) =>
      task.assignee.toLowerCase().includes(currentUser.firstName.toLowerCase()) ||
      task.assignee.toLowerCase().includes(currentUser.lastName.toLowerCase())
  );

  // Filter by date range
  const dateFilteredTasks = userTasks.filter(isTaskInDateRange);

  // Sort by: incomplete first, then by due date
  const sortedTasks = [...dateFilteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const displayTasks = limit ? sortedTasks.slice(0, limit) : sortedTasks;

  const getDueBadge = (dueDate: Date, completed: boolean) => {
    if (completed) {
      return { label: "Completed", variant: "default" as const, className: "bg-success text-success-foreground" };
    }
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { label: "Overdue", variant: "destructive" as const, className: "" };
    }
    if (isToday(dueDate)) {
      return { label: "Today", variant: "outline" as const, className: "border-warning text-warning" };
    }
    if (isTomorrow(dueDate)) {
      return { label: "Tomorrow", variant: "outline" as const, className: "border-primary text-primary" };
    }
    const days = differenceInDays(dueDate, new Date());
    return { label: `${days} days`, variant: "secondary" as const, className: "" };
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      toast.success("Task marked as complete!");
    }
  };

  const handleCompleteWithNote = () => {
    if (selectedTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? { ...task, completed: true }
            : task
        )
      );
      toast.success("Task completed!");
      setSelectedTask(null);
      setCompletionNote("");
    }
  };

  if (displayTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tasks assigned to you</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
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
        
        <div className="space-y-2">
        {displayTasks.map((task) => {
          const dueBadge = getDueBadge(task.dueDate, task.completed);

          // Minimal view for dashboard overview
          if (minimal) {
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.assignee}</p>
                </div>
                <TaskCompleteTick
                  completed={task.completed}
                  onToggle={() => handleToggleComplete(task.id)}
                  size="sm"
                />
              </div>
            );
          }

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                task.completed
                  ? "bg-success/5 border-success/30"
                  : isPast(task.dueDate) && !isToday(task.dueDate)
                  ? "bg-destructive/5 border-destructive/30"
                  : "bg-card hover:border-primary/50"
              )}
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => !task.completed && setSelectedTask(task)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </h4>
                  <Badge variant={dueBadge.variant} className={cn("text-[10px] shrink-0", dueBadge.className)}>
                    {dueBadge.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(task.dueDate, "MMM d")}
                  </span>
                </div>
              </div>
              <TaskCompleteTick
                completed={task.completed}
                onToggle={() => handleToggleComplete(task.id)}
              />
            </div>
          );
        })}
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Task Details
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getDueBadge(selectedTask.dueDate, selectedTask.completed).variant === "destructive" ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Due: {format(selectedTask.dueDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border">
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Completion Note (Optional)
                </Label>
                <Textarea
                  placeholder="Add any notes about completing this task..."
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteWithNote}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
