import { Task } from "@/types/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar as CalendarIcon,
  GripVertical,
  MoreHorizontal
} from "lucide-react";
import { format, isPast, isToday, isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskCompleteTick } from "./TaskCompleteTick";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskKanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
  viewMode: "day" | "week" | "custom";
  selectedDate: Date;
  customDateRange?: { start: Date; end: Date };
}

type KanbanColumn = "pending" | "overdue" | "completed";

const COLUMN_CONFIG: Record<KanbanColumn, { title: string; icon: React.ReactNode; bgColor: string; borderColor: string }> = {
  pending: {
    title: "Pending",
    icon: <Clock className="w-4 h-4" />,
    bgColor: "bg-muted/30",
    borderColor: "border-t-warning",
  },
  overdue: {
    title: "Overdue",
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: "bg-destructive/5",
    borderColor: "border-t-destructive",
  },
  completed: {
    title: "Completed",
    icon: <CheckCircle2 className="w-4 h-4" />,
    bgColor: "bg-success/5",
    borderColor: "border-t-success",
  },
};

export const TaskKanbanBoard = ({
  tasks,
  onToggleComplete,
  onUpdateTask,
  onToggleImportant,
  viewMode,
  selectedDate,
  customDateRange,
}: TaskKanbanBoardProps) => {
  // Filter tasks based on view mode and date
  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.dueDate);
    
    if (viewMode === "day") {
      return isSameDay(taskDate, selectedDate);
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return isWithinInterval(taskDate, { start: startOfDay(weekStart), end: endOfDay(weekEnd) });
    } else if (viewMode === "custom" && customDateRange) {
      return isWithinInterval(taskDate, { 
        start: startOfDay(customDateRange.start), 
        end: endOfDay(customDateRange.end) 
      });
    }
    return true;
  });

  // Categorize tasks into columns
  const getTaskStatus = (task: Task): KanbanColumn => {
    if (task.completed) return "completed";
    if (isPast(task.dueDate) && !isToday(task.dueDate)) return "overdue";
    return "pending";
  };

  const tasksByColumn: Record<KanbanColumn, Task[]> = {
    pending: filteredTasks.filter((t) => getTaskStatus(t) === "pending"),
    overdue: filteredTasks.filter((t) => getTaskStatus(t) === "overdue"),
    completed: filteredTasks.filter((t) => getTaskStatus(t) === "completed"),
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    
    if (task) {
      if (column === "completed" && !task.completed) {
        onToggleComplete(taskId);
      } else if (column !== "completed" && task.completed) {
        onToggleComplete(taskId);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-400px)] min-h-[500px]">
      {(Object.keys(COLUMN_CONFIG) as KanbanColumn[]).map((column) => (
        <div
          key={column}
          className={cn(
            "flex flex-col rounded-lg border border-border",
            COLUMN_CONFIG[column].bgColor,
            `border-t-4 ${COLUMN_CONFIG[column].borderColor}`
          )}
          onDrop={(e) => handleDrop(e, column)}
          onDragOver={handleDragOver}
        >
          <div className="p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {COLUMN_CONFIG[column].icon}
                <h3 className="font-semibold">{COLUMN_CONFIG[column].title}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {tasksByColumn[column].length}
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {tasksByColumn[column].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              ) : (
                tasksByColumn[column].map((task) => (
                  <KanbanTaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onToggleImportant={onToggleImportant}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

interface KanbanTaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleImportant: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const KanbanTaskCard = ({
  task,
  onToggleComplete,
  onToggleImportant,
  onDragStart,
}: KanbanTaskCardProps) => {
  const isOverdue = !task.completed && isPast(task.dueDate) && !isToday(task.dueDate);
  const isDueToday = isToday(task.dueDate);

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={cn(
        "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200 group",
        task.completed && "opacity-60",
        task.important && !task.completed && "border-l-4 border-l-destructive"
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className={cn(
              "font-medium text-sm line-clamp-2",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onToggleComplete(task.id)}>
                {task.completed ? "Mark as Pending" : "Mark as Complete"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleImportant(task.id)}>
                {task.important ? "Remove Important" : "Mark as Important"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.important && !task.completed && (
          <Badge variant="destructive" className="text-xs gap-1 px-1.5 py-0.5">
            <AlertTriangle className="w-3 h-3" />
            Important
          </Badge>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{task.assignee}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive",
              isDueToday && "text-warning"
            )}>
              <CalendarIcon className="w-3 h-3" />
              <span>{format(task.dueDate, "MMM d")}</span>
            </div>
            <TaskCompleteTick
              completed={task.completed}
              onToggle={() => onToggleComplete(task.id)}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
