import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Mail,
  MessageSquare,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  Users,
  Bell,
  ListChecks,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { Task } from "@/types/tasks";
import { mockStaffMembers } from "@/data/mockStaff";
import { toast } from "sonner";

interface GeneratedTask {
  id: string;
  title: string;
  assignee: string;
  dueDate: Date;
  important: boolean;
  reminderEmail: boolean;
  reminderSms: boolean;
  sourceItemId: string;
  sourceCategory: string;
  selected: boolean;
}

interface AITaskGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ComplianceItem[];
  categories: ComplianceCategoryExtended[];
  onConfirmTasks: (tasks: Omit<Task, "id" | "createdAt">[]) => void;
}

function generateMockTasks(
  categories: ComplianceCategoryExtended[]
): GeneratedTask[] {
  const staffNames = mockStaffMembers.map(s => `${s.firstName} ${s.lastName}`);
  const now = Date.now();

  const mockItems: { title: string; catId: string; urgent: boolean }[] = [
    { title: "CPR Certification", catId: "cpr", urgent: true },
    { title: "Medical Registration Renewal", catId: "ahpra", urgent: false },
    { title: "Indemnity Insurance Policy", catId: "indemnity", urgent: true },
    { title: "Working with Children Check", catId: "wwcc", urgent: false },
    { title: "Fire Extinguisher Service", catId: "fire-extinguisher", urgent: true },
    { title: "Safety Inspection Report", catId: "safety", urgent: false },
    { title: "Exit Light Testing", catId: "exit-lights", urgent: false },
    { title: "Smoke Alarm Maintenance", catId: "smoke-alarms", urgent: true },
  ];

  return mockItems.map((item, i) => {
    const cat = categories.find(c => c.id === item.catId);
    const assignee = staffNames[i % staffNames.length];
    return {
      id: `gen-${i}-${now}`,
      title: item.urgent
        ? `URGENT: Renew ${item.title} - ${cat?.name || item.catId}`
        : `Renew ${item.title} before expiry - ${cat?.name || item.catId}`,
      assignee,
      dueDate: item.urgent
        ? new Date(now + 3 * 24 * 60 * 60 * 1000)
        : new Date(now + 21 * 24 * 60 * 60 * 1000),
      important: item.urgent,
      reminderEmail: true,
      reminderSms: item.urgent,
      sourceItemId: `mock-${i}`,
      sourceCategory: cat?.name || item.catId,
      selected: true,
    };
  });
}

export function AITaskGeneratorDialog({
  open,
  onOpenChange,
  items,
  categories,
  onConfirmTasks,
}: AITaskGeneratorDialogProps) {
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const expiredCount = items.filter((i) => i.status === "expired").length;
  const expiringCount = items.filter((i) => i.status === "expiring").length;
  const selectedCount = generatedTasks.filter((t) => t.selected).length;

  const STEPS = [
    { icon: Search, label: "Scanning categories" },
    { icon: Calendar, label: "Analyzing expiry dates" },
    { icon: Users, label: "Matching team members" },
    { icon: Bell, label: "Configuring alerts" },
    { icon: ListChecks, label: "Generating tasks" },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setActiveStep(0);
    setCompletedSteps([]);

    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i > 0) setCompletedSteps(prev => [...prev, i - 1]);
      }, i * 800);
    });

    setTimeout(() => {
      setCompletedSteps(prev => [...prev, STEPS.length - 1]);
      setTimeout(() => {
        const tasks = generateMockTasks(categories);
        setGeneratedTasks(tasks);
        setIsGenerating(false);
        setHasGenerated(true);
      }, 500);
    }, STEPS.length * 800);
  };

  const toggleTask = (taskId: string) => {
    setGeneratedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, selected: !t.selected } : t))
    );
  };

  const toggleAll = (selected: boolean) => {
    setGeneratedTasks((prev) => prev.map((t) => ({ ...t, selected })));
  };

  const updateTask = (taskId: string, updates: Partial<GeneratedTask>) => {
    setGeneratedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setGeneratedTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleConfirm = () => {
    const selected = generatedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    const tasksToCreate: Omit<Task, "id" | "createdAt">[] = selected.map((t) => ({
      title: t.title,
      assignee: t.assignee,
      dueDate: t.dueDate,
      completed: false,
      important: t.important,
      reminder:
        t.reminderEmail || t.reminderSms
          ? { email: t.reminderEmail, sms: t.reminderSms }
          : undefined,
    }));

    onConfirmTasks(tasksToCreate);
    toast.success(`${selected.length} task${selected.length > 1 ? "s" : ""} created successfully`);
    setGeneratedTasks([]);
    setHasGenerated(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setGeneratedTasks([]);
    setHasGenerated(false);
    setActiveStep(-1);
    setCompletedSteps([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Task Generator
          </DialogTitle>
          <DialogDescription>
            Scan all compliance categories and automatically create tasks for items
            that need attention.
          </DialogDescription>
        </DialogHeader>

        {/* Summary banner */}
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-[13px] space-y-1">
          <p className="font-medium">Compliance Summary</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-destructive" />
              {expiredCount} expired
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              {expiringCount} expiring soon
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {items.length - expiredCount - expiringCount} valid
            </span>
          </div>
        </div>

        {!hasGenerated ? (
          <div className="flex flex-col items-center justify-center py-8 gap-6 animate-fade-in">
            {isGenerating ? (
              <div className="w-full max-w-sm space-y-6">
                {/* Orbital spinner */}
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    {/* Outer ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                    </motion.div>
                    {/* Inner ring */}
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-primary/15"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
                    </motion.div>
                    {/* Centre glow */}
                    <motion.div
                      className="absolute inset-5 rounded-full bg-primary/10 flex items-center justify-center"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {STEPS.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = activeStep === i;
                    const isCompleted = completedSteps.includes(i);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.3 }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300 ${
                          isActive ? "bg-primary/10" : isCompleted ? "bg-muted/40" : "bg-transparent"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isCompleted ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                              <Check className="w-3.5 h-3.5" />
                            </motion.div>
                          ) : (
                            <StepIcon className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`} />
                          )}
                        </div>
                        <span className={`text-[13px] transition-colors duration-300 ${
                          isActive ? "text-foreground font-medium" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                        }`}>
                          {step.label}
                        </span>
                        {isActive && !isCompleted && (
                          <motion.div
                            className="ml-auto flex gap-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {[0, 1, 2].map(dot => (
                              <motion.div
                                key={dot}
                                className="w-1 h-1 rounded-full bg-primary"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((completedSteps.length) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center">
                    {completedSteps.length} of {STEPS.length} steps complete
                  </p>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Ready to scan compliance categories</p>
                  <p className="text-xs text-muted-foreground">
                    AI will read all category items, identify actions needed, and generate
                    tasks with assigned members and SMS/email alerts.
                  </p>
                </div>
                <Button onClick={handleGenerate} className="gap-2 transition-all duration-200 hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                  Generate Tasks
                </Button>
              </>
            )}
          </div>
        ) : generatedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <p className="text-sm font-medium">All compliance items are up to date!</p>
            <p className="text-xs text-muted-foreground">
              No expired or expiring items found.
            </p>
          </div>
        ) : (
          <>
            {/* Select all / Deselect */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 animate-fade-in">
              <span>{selectedCount} of {generatedTasks.length} tasks selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="text-primary hover:underline"
                >
                  Select all
                </button>
                <button
                  onClick={() => toggleAll(false)}
                  className="hover:underline"
                >
                  Deselect all
                </button>
              </div>
            </div>

            {/* Task list */}
            <ScrollArea className="flex-1 max-h-[45vh] -mx-1">
              <div className="space-y-2 px-1">
                {generatedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      task.selected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-muted/20 opacity-60"
                    }`}
                  >
                    {/* Row 1: Checkbox + Title + Delete */}
                    <div className="flex items-start gap-2 mb-2">
                      <Checkbox
                        checked={task.selected}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1.5"
                      />
                      <Input
                        value={task.title}
                        onChange={(e) => updateTask(task.id, { title: e.target.value })}
                        className="h-8 text-[13px] font-medium flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Row 2: Assignee + Due Date */}
                    <div className="flex items-center gap-2 ml-7 mb-2">
                      <Select
                        value={task.assignee}
                        onValueChange={(val) => updateTask(task.id, { assignee: val })}
                      >
                        <SelectTrigger className="h-7 text-[11px] flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockStaffMembers.map((s) => (
                            <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                              {s.firstName} {s.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-7 text-[11px] gap-1.5 px-2.5 flex-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(task.dueDate, "MMM d, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.dueDate}
                            onSelect={(d) => d && updateTask(task.id, { dueDate: d })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Row 3: Important + Reminders + Source */}
                    <div className="flex items-center gap-3 ml-7 flex-wrap">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={task.important}
                          onCheckedChange={(c) => updateTask(task.id, { important: c === true })}
                        />
                        <AlertTriangle className={cn("w-3 h-3", task.important ? "text-destructive" : "text-muted-foreground")} />
                        <span className="text-[11px]">Urgent</span>
                      </label>

                      <div className="w-px h-4 bg-border" />

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={task.reminderEmail}
                          onCheckedChange={(c) => updateTask(task.id, { reminderEmail: c === true })}
                        />
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px]">Email</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={task.reminderSms}
                          onCheckedChange={(c) => updateTask(task.id, { reminderSms: c === true })}
                        />
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px]">SMS</span>
                      </label>

                      <span className="text-[10px] text-muted-foreground/60 ml-auto">
                        {task.sourceCategory}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {hasGenerated && generatedTasks.length > 0 && (
            <Button onClick={handleConfirm} disabled={selectedCount === 0} className="gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Confirm {selectedCount} Task{selectedCount !== 1 ? "s" : ""}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
