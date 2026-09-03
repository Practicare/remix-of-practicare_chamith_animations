import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Trash2, User, ClipboardList, Pencil, FileText } from "lucide-react";
import { TaskCompleteTick } from "./TaskCompleteTick";
import { exportSingleTaskPDF } from "@/utils/taskExport";
import { Task } from "@/types/tasks";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskTableProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onToggleImportant: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export function TaskTable({
  tasks,
  onToggleComplete,
  onUpdateTask,
  onToggleImportant,
  onDeleteTask,
  onEditTask,
}: TaskTableProps) {
  const getStatusBadge = (task: Task) => {
    if (task.completed) {
      return <Badge className="bg-success/10 text-success">Completed</Badge>;
    }
    if (isPast(task.dueDate) && !isToday(task.dueDate)) {
      return <Badge className="bg-destructive/10 text-destructive">Overdue</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
  };

  const getDueDateDisplay = (task: Task) => {
    const dueDate = new Date(task.dueDate);
    const isOverdue = isPast(dueDate) && !isToday(dueDate) && !task.completed;
    const daysUntil = differenceInDays(dueDate, new Date());

    return (
      <div className={`text-sm ${isOverdue ? 'text-destructive' : ''}`}>
        {format(dueDate, "MMM d, yyyy")}
        {isOverdue && (
          <span className="block text-xs">({Math.abs(daysUntil)}d overdue)</span>
        )}
        {!isOverdue && !task.completed && daysUntil <= 3 && daysUntil >= 0 && (
          <span className="block text-xs text-warning">({daysUntil === 0 ? 'Today' : `${daysUntil}d left`})</span>
        )}
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Done</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className={task.completed ? "opacity-60" : ""}>
              <TableCell>
                <TaskCompleteTick
                  completed={task.completed}
                  onToggle={() => onToggleComplete(task.id)}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  {task.important && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Important
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>{task.assignee}</span>
                </div>
              </TableCell>
              <TableCell>{getDueDateDisplay(task)}</TableCell>
              <TableCell>{getStatusBadge(task)}</TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                   <div className="flex items-center justify-end gap-1">
                    {onEditTask && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditTask(task)}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                    )}
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => exportSingleTaskPDF(task)}
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Export PDF</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onToggleImportant(task.id)}
                        >
                          <Star
                            className={`w-4 h-4 ${task.important ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{task.important ? "Remove Important" : "Mark Important"}</TooltipContent>
                    </Tooltip>
                    
                    {onDeleteTask && (
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{task.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
