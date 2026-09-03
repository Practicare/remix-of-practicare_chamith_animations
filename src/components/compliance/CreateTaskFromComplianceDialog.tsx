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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar as CalendarIcon, ChevronDown, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ComplianceItem } from "@/types/compliance";
import { Task } from "@/types/tasks";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { toast } from "sonner";

interface CreateTaskFromComplianceDialogProps {
  complianceItem: ComplianceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
}

export function CreateTaskFromComplianceDialog({
  complianceItem,
  open,
  onOpenChange,
  onCreateTask,
}: CreateTaskFromComplianceDialogProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [reminderEmail, setReminderEmail] = useState(false);
  const [reminderSms, setReminderSms] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [showReminders, setShowReminders] = useState(true);

  const activeMembers = mockTeamMembers.filter(
    (m) => m.status === "accepted" || m.status === "confirmed"
  );

  useEffect(() => {
    if (complianceItem && open) {
      const actionPrefix = complianceItem.status === "expired" ? "Renew expired" : "Review/Renew";
      setTitle(`${actionPrefix}: ${complianceItem.title}`);
      setDueDate(complianceItem.status === "expired" ? new Date() : complianceItem.expiryDate);
      setIsImportant(complianceItem.status === "expired");
      // Pre-fill assignee if available
      if (complianceItem.assignee) {
        const matchedMember = activeMembers.find(m => m.name === complianceItem.assignee);
        if (matchedMember) {
          setAssignee(matchedMember.name);
        }
      }
    }
  }, [complianceItem, open]);

  const resetForm = () => {
    setTitle("");
    setAssignee("");
    setDueDate(undefined);
    setReminderEmail(false);
    setReminderSms(false);
    setIsImportant(false);
    setShowReminders(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !assignee || !dueDate) return;

    onCreateTask({
      title: title.trim(),
      assignee,
      dueDate,
      important: isImportant,
      reminder: reminderEmail || reminderSms ? { email: reminderEmail, sms: reminderSms } : undefined,
    });

    toast.success("Task Created", {
      description: `Task "${title}" has been created successfully.`,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task from Compliance Item</DialogTitle>
          <DialogDescription>
            Create a task related to this compliance item for tracking and follow-up.
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
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Collapsible open={showReminders} onOpenChange={setShowReminders}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-4 py-2 h-auto">
                <span className="text-sm font-medium">Reminder Settings</span>
                <ChevronDown
                  className={cn("w-4 h-4 transition-transform", showReminders && "rotate-180")}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="reminderEmail"
                  checked={reminderEmail}
                  onCheckedChange={(checked) => setReminderEmail(checked === true)}
                />
                <Label htmlFor="reminderEmail" className="text-sm cursor-pointer">
                  Email Reminder
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="reminderSms"
                  checked={reminderSms}
                  onCheckedChange={(checked) => setReminderSms(checked === true)}
                />
                <Label htmlFor="reminderSms" className="text-sm cursor-pointer">
                  SMS Reminder
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !assignee || !dueDate}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
