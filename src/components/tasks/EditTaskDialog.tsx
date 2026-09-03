import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tasks";
import { toast } from "@/hooks/use-toast";

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onUpdateTask,
}: EditTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [reminderEmail, setReminderEmail] = useState(false);
  const [reminderSms, setReminderSms] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setAssignee(task.assignee);
      setDueDate(new Date(task.dueDate));
      setReminderEmail(task.reminder?.email || false);
      setReminderSms(task.reminder?.sms || false);
      setIsImportant(task.important || false);
    }
  }, [task, open]);

  const handleSubmit = () => {
    if (!task || !title.trim() || !assignee.trim() || !dueDate) return;

    onUpdateTask(task.id, {
      title: title.trim(),
      assignee: assignee.trim(),
      dueDate,
      important: isImportant,
      reminder: reminderEmail || reminderSms ? { email: reminderEmail, sms: reminderSms } : undefined,
    });

    toast({
      title: "Task Updated",
      description: `"${title}" has been updated successfully.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task Title *</Label>
            <Input
              id="taskTitle"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To *</Label>
            <Input
              id="assignee"
              placeholder="Enter assignee name"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Important Task */}
          <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <Checkbox
              id="important"
              checked={isImportant}
              onCheckedChange={(checked) => setIsImportant(checked === true)}
            />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <Label htmlFor="important" className="text-sm font-medium cursor-pointer">
                Mark as Important Task
              </Label>
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label>Reminder Settings</Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reminderEmail"
                  checked={reminderEmail}
                  onCheckedChange={(checked) => setReminderEmail(checked === true)}
                />
                <Label htmlFor="reminderEmail" className="text-sm font-normal cursor-pointer">
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reminderSms"
                  checked={reminderSms}
                  onCheckedChange={(checked) => setReminderSms(checked === true)}
                />
                <Label htmlFor="reminderSms" className="text-sm font-normal cursor-pointer">
                  SMS
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !assignee.trim() || !dueDate}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
