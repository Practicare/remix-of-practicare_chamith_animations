import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar as CalendarIcon, User, Mail, MessageSquare, ChevronDown, ChevronUp, ThumbsUp, AlertTriangle } from "lucide-react";
import { Task } from "@/types/tasks";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskCompleteTick } from "./TaskCompleteTick";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onToggleImportant?: (taskId: string) => void;
}

export const TaskCard = ({ task, onToggleComplete, onUpdateTask, onToggleImportant }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editAssignee, setEditAssignee] = useState(task.assignee);
  const [editDueDate, setEditDueDate] = useState<Date>(task.dueDate);
  const [editReminderEmail, setEditReminderEmail] = useState(task.reminder?.email || false);
  const [editReminderSms, setEditReminderSms] = useState(task.reminder?.sms || false);

  const isOverdue = !task.completed && isPast(task.dueDate) && !isToday(task.dueDate);
  const isDueToday = isToday(task.dueDate);

  const getStatusBadge = () => {
    if (task.completed) {
      return <Badge className="bg-success/10 text-success">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-destructive/10 text-destructive">Overdue</Badge>;
    }
    if (isDueToday) {
      return <Badge className="bg-warning/10 text-warning">Due Today</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
  };

  const handleSave = () => {
    if (onUpdateTask) {
      onUpdateTask(task.id, {
        title: editTitle.trim(),
        assignee: editAssignee.trim(),
        dueDate: editDueDate,
        reminder: (editReminderEmail || editReminderSms) ? { email: editReminderEmail, sms: editReminderSms } : undefined,
      });
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditAssignee(task.assignee);
    setEditDueDate(task.dueDate);
    setEditReminderEmail(task.reminder?.email || false);
    setEditReminderSms(task.reminder?.sms || false);
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        "shadow-card hover:shadow-elevated transition-all duration-200",
        task.completed ? "opacity-60" : "",
        task.important && !task.completed && "border-l-4 border-l-destructive bg-destructive/5"
      )}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-4">
            <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
              <CollapsibleTrigger asChild>
                <div className="cursor-pointer group">
                  {/* Mobile Layout */}
                  <div className="flex flex-col gap-2 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {getStatusBadge()}
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{task.assignee}</span>
                        </div>
                        <div className={cn("flex items-center gap-1", isOverdue ? "text-destructive" : isDueToday ? "text-warning" : "")}>
                          <CalendarIcon className="w-3 h-3" />
                          <span>{format(task.dueDate, "MMM d")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {task.important && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </Badge>
                        )}
                        <TaskCompleteTick
                          completed={task.completed}
                          onToggle={() => onToggleComplete(task.id)}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium group-hover:text-primary transition-colors ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h3>
                        {task.important && (
                          <Badge variant="destructive" className="text-xs gap-1 px-1.5 py-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Important
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={task.important ? "destructive" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleImportant?.(task.id);
                          }}
                          className="h-6 w-6 p-0"
                          title={task.important ? "Remove important" : "Mark as important"}
                        >
                          <AlertTriangle className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 px-2 text-xs gap-1"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Accept
                        </Button>
                        {getStatusBadge()}
                        <TaskCompleteTick
                          completed={task.completed}
                          onToggle={() => onToggleComplete(task.id)}
                        />
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Metadata row - Desktop only */}
              <div className="hidden md:flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{task.assignee}</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isOverdue ? "text-destructive" : isDueToday ? "text-warning" : ""}`}>
                  <CalendarIcon className="w-4 h-4" />
                  <span>{format(task.dueDate, "MMM d, yyyy")}</span>
                </div>
                {(task.reminder?.email || task.reminder?.sms) && (
                  <div className="flex items-center gap-1.5">
                    {task.reminder.email && <Mail className="w-4 h-4" />}
                    {task.reminder.sms && <MessageSquare className="w-4 h-4" />}
                    <span>
                      {task.reminder.email && task.reminder.sms 
                        ? "Email & SMS reminder" 
                        : task.reminder.email 
                          ? "Email reminder" 
                          : "SMS reminder"}
                    </span>
                  </div>
                )}
              </div>

              {/* To-do list (line items) */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      To-do ({task.checklist.filter((i) => i.completed).length}/{task.checklist.length})
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {task.checklist.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          id={`tci-${task.id}-${item.id}`}
                          checked={item.completed}
                          onCheckedChange={(checked) => {
                            if (!onUpdateTask || !task.checklist) return;
                            const next = task.checklist.map((i) =>
                              i.id === item.id ? { ...i, completed: checked === true } : i
                            );
                            onUpdateTask(task.id, { checklist: next });
                          }}
                        />
                        <Label
                          htmlFor={`tci-${task.id}-${item.id}`}
                          className={cn(
                            "text-sm font-normal cursor-pointer flex-1",
                            item.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {item.text}
                        </Label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CollapsibleContent className="animate-accordion-down">
                <div className="pt-4 mt-4 border-t border-border space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${task.id}`}>Task</Label>
                    <Input id={`title-${task.id}`} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="What needs to be done?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`assignee-${task.id}`}>Assign to</Label>
                    <Input id={`assignee-${task.id}`} value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)} placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDueDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editDueDate ? format(editDueDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50">
                        <Calendar mode="single" selected={editDueDate} onSelect={(date) => date && setEditDueDate(date)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <Label>Reminder</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox id={`reminder-email-${task.id}`} checked={editReminderEmail} onCheckedChange={(checked) => setEditReminderEmail(checked === true)} />
                        <Label htmlFor={`reminder-email-${task.id}`} className="text-sm font-normal cursor-pointer">Email</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id={`reminder-sms-${task.id}`} checked={editReminderSms} onCheckedChange={(checked) => setEditReminderSms(checked === true)} />
                        <Label htmlFor={`reminder-sms-${task.id}`} className="text-sm font-normal cursor-pointer">SMS</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={!editTitle.trim() || !editAssignee.trim()}>Save Changes</Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
};
