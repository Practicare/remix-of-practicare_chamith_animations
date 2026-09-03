import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar as CalendarIcon,
  AlertTriangle,
  ClipboardList,
  Mail,
  MessageSquare,
  Users,
  Send,
  Repeat,
  CircleDot,
  CalendarDays,
  CalendarRange,
  Settings2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskFrequency, TaskCustomFrequency } from "@/types/tasks";
import { mockDepartments } from "@/data/mockDepartments";
import { mockStaffMembers } from "@/data/mockStaff";

interface CreateTaskDialogProps {
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
}

export const CreateTaskDialog = ({ onCreateTask }: CreateTaskDialogProps) => {
  const [departmentId, setDepartmentId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [isImportant, setIsImportant] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(false);
  const [reminderSms, setReminderSms] = useState(false);
  const [frequency, setFrequency] = useState<TaskFrequency>("once");
  const [customEvery, setCustomEvery] = useState(2);
  const [customUnit, setCustomUnit] = useState<TaskCustomFrequency["unit"]>("days");

  const deptMembers = useMemo(() => {
    if (!departmentId) return [];
    if (departmentId === "all") return mockStaffMembers;
    return mockStaffMembers.filter((m) => m.departmentId === departmentId);
  }, [departmentId]);

  const selectedMemberName = useMemo(() => {
    if (assignee === "all") {
      if (departmentId === "all") return "All Departments";
      const dept = mockDepartments.find((d) => d.id === departmentId);
      return dept ? `All ${dept.name}` : "All";
    }
    const member = mockStaffMembers.find((m) => m.id === assignee);
    return member ? `${member.firstName} ${member.lastName}` : "";
  }, [assignee, departmentId]);

  const resetForm = () => {
    setDepartmentId("");
    setAssignee("");
    setTitle("");
    setDescription("");
    setDueDate(undefined);
    setIsImportant(false);
    setReminderEmail(false);
    setReminderSms(false);
    setFrequency("once");
    setCustomEvery(2);
    setCustomUnit("days");
  };

  const handleSubmit = () => {
    if (!title.trim() || !assignee) return;

    onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assignee: selectedMemberName,
      departmentId: departmentId || undefined,
      dueDate: dueDate || new Date(),
      important: isImportant,
      frequency: frequency,
      customFrequency: frequency === "custom" ? { every: customEvery, unit: customUnit } : undefined,
      reminder: (reminderEmail || reminderSms) ? { email: reminderEmail, sms: reminderSms } : undefined,
    });

    resetForm();
  };

  const canSubmit = title.trim() && assignee;

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Create New Task
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Row 1: Department + Assign To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Department *</Label>
            <Select
              value={departmentId}
              onValueChange={(val) => {
                setDepartmentId(val);
                setAssignee("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    All Departments
                  </span>
                </SelectItem>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        dept.type === "internal" ? "bg-muted-foreground" : "bg-accent-foreground"
                      )} />
                      {dept.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Assign To *</Label>
            <Select
              value={assignee}
              onValueChange={setAssignee}
              disabled={!departmentId}
            >
              <SelectTrigger className={cn(!departmentId && "opacity-50")}>
                <SelectValue placeholder={departmentId ? "Select user" : "Select department first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    All Users
                  </span>
                </SelectItem>
                {deptMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Task Topic + Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Task Topic *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Restock supply room"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Completion Date <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Row 3: Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Task Description <span className="text-muted-foreground/60">(optional)</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details or instructions..."
            rows={2}
            className="resize-none"
          />
        </div>
        {/* Row 4: Frequency */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            Frequency
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              { id: "once" as const, label: "Once Off", description: "Single task", icon: CircleDot },
              { id: "daily" as const, label: "Daily", description: "Every day", icon: CalendarIcon },
              { id: "weekly" as const, label: "Weekly", description: "Once a week", icon: CalendarDays },
              { id: "monthly" as const, label: "Monthly", description: "Once a month", icon: CalendarRange },
              { id: "custom" as const, label: "Custom", description: "Set interval", icon: Settings2 },
            ]).map((opt) => {
              const Icon = opt.icon;
              const isActive = frequency === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFrequency(opt.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-[13px] font-medium", isActive ? "text-primary" : "text-foreground")}>{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                </button>
              );
            })}
          </div>
          {frequency === "custom" && (
            <div className="flex items-center gap-3 border border-border rounded-lg p-4 bg-muted/20">
              <span className="text-xs font-medium text-muted-foreground">Repeat every</span>
              <Input
                type="number"
                min={1}
                max={365}
                value={customEvery}
                onChange={(e) => setCustomEvery(Number(e.target.value) || 1)}
                className="w-16 h-8 text-xs"
              />
              <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as TaskCustomFrequency["unit"])}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>


        <div className="flex flex-col sm:flex-row gap-3">
          <div
            onClick={() => setIsImportant(!isImportant)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all flex-1",
              isImportant
                ? "bg-destructive/10 border-destructive/30"
                : "bg-muted/30 border-border hover:border-muted-foreground/30"
            )}
          >
            <Checkbox
              id="important"
              checked={isImportant}
              onCheckedChange={(checked) => setIsImportant(checked === true)}
              onClick={(e) => e.stopPropagation()}
            />
            <AlertTriangle className={cn(
              "w-4 h-4",
              isImportant ? "text-destructive" : "text-muted-foreground"
            )} />
            <Label htmlFor="important" className="text-xs font-medium cursor-pointer">
              Important Task
            </Label>
          </div>

          <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-muted/30 flex-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Reminders:</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={reminderEmail}
                  onCheckedChange={(checked) => setReminderEmail(checked === true)}
                />
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={reminderSms}
                  onCheckedChange={(checked) => setReminderSms(checked === true)}
                />
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">SMS</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={resetForm}>
            Clear
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Create Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
