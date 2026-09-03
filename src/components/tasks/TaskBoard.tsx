import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Star, Calendar, User, ClipboardList } from "lucide-react";
import { Task } from "@/types/tasks";
import { format, isPast, isToday } from "date-fns";
import { TaskCompleteTick } from "./TaskCompleteTick";

interface TaskBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
}

export function TaskBoard({
  tasks,
  onToggleComplete,
  onUpdateTask,
  onToggleImportant,
}: TaskBoardProps) {
  const pendingTasks = tasks.filter(t => !t.completed && (!isPast(t.dueDate) || isToday(t.dueDate)));
  const overdueTasks = tasks.filter(t => !t.completed && isPast(t.dueDate) && !isToday(t.dueDate));
  const completedTasks = tasks.filter(t => t.completed);

  const columns = [
    { id: "pending", title: "Pending", tasks: pendingTasks, color: "bg-warning" },
    { id: "overdue", title: "Overdue", tasks: overdueTasks, color: "bg-destructive" },
    { id: "completed", title: "Completed", tasks: completedTasks, color: "bg-success" },
  ];

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="w-[320px] shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {column.tasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${
                        task.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onToggleImportant(task.id)}
                              >
                                <Star
                                  className={`w-3 h-3 ${task.important ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                                />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            {task.important && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Important
                              </Badge>
                            )}
                            <div className="ml-auto">
                              <TaskCompleteTick
                                completed={task.completed}
                                onToggle={() => onToggleComplete(task.id)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
