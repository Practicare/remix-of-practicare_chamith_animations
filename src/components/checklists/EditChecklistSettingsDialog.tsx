import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  RefreshCw, 
  Users, 
  Calendar,
  CalendarDays,
  CalendarRange,
  Globe,
  Building2,
  User,
  X
} from "lucide-react";
import { Checklist, ChecklistAssignment, DEFAULT_CHECKLIST_CATEGORIES } from "@/types/checklists";
import { TeamMember } from "@/types/teamMembers";
import { cn } from "@/lib/utils";

type RecurringType = "daily" | "weekly" | "monthly" | null;

interface EditChecklistSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: Checklist;
  onSave: (settings: { recurring: RecurringType; assignment: ChecklistAssignment }) => void;
  teamMembers: TeamMember[];
  departmentNames: Record<string, string>;
  onOpenAssignDialog: () => void;
}

export const EditChecklistSettingsDialog = ({
  open,
  onOpenChange,
  checklist,
  onSave,
  teamMembers,
  departmentNames,
  onOpenAssignDialog,
}: EditChecklistSettingsDialogProps) => {
  const [recurring, setRecurring] = useState<RecurringType>(checklist.recurring || null);

  useEffect(() => {
    if (open) {
      setRecurring(checklist.recurring || null);
    }
  }, [open, checklist]);

  const handleSave = () => {
    onSave({
      recurring,
      assignment: checklist.assignment || { type: "all" },
    });
    onOpenChange(false);
  };

  const getAssignmentDisplay = () => {
    const assignment = checklist.assignment;
    if (!assignment || assignment.type === "all") {
      return { icon: Globe, label: "All Users", sublabel: "Everyone in the organization" };
    }
    if (assignment.type === "department") {
      const deptNames = assignment.departmentIds
        ?.map((id) => departmentNames[id] || id)
        .join(", ");
      return { 
        icon: Building2, 
        label: deptNames || "Selected Departments",
        sublabel: `${assignment.departmentIds?.length || 0} department(s)`
      };
    }
    if (assignment.type === "users") {
      const userNames = assignment.userIds
        ?.map((id) => teamMembers.find((m) => m.id === id)?.name || id)
        .slice(0, 3)
        .join(", ");
      const remaining = (assignment.userIds?.length || 0) - 3;
      return { 
        icon: User, 
        label: remaining > 0 ? `${userNames} +${remaining} more` : userNames || "Selected Users",
        sublabel: `${assignment.userIds?.length || 0} user(s)`
      };
    }
    return { icon: Globe, label: "All Users", sublabel: "Everyone" };
  };

  const assignmentDisplay = getAssignmentDisplay();

  const frequencyOptions = [
    { value: null, label: "No Repeat", icon: X, description: "One-time checklist" },
    { value: "daily", label: "Daily", icon: Calendar, description: "Resets every day" },
    { value: "weekly", label: "Weekly", icon: CalendarDays, description: "Resets every week" },
    { value: "monthly", label: "Monthly", icon: CalendarRange, description: "Resets every month" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Checklist Settings
          </DialogTitle>
          <DialogDescription>
            Configure frequency and assignment for "{checklist.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Frequency</Label>
            </div>
            <RadioGroup
              value={recurring || "none"}
              onValueChange={(value) => setRecurring(value === "none" ? null : value as RecurringType)}
              className="grid grid-cols-2 gap-2"
            >
              {frequencyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = (recurring === null && option.value === null) || recurring === option.value;
                return (
                  <div
                    key={option.value || "none"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setRecurring(option.value)}
                  >
                    <RadioGroupItem value={option.value || "none"} id={option.value || "none"} className="sr-only" />
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Assignment Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-semibold">Assignment</Label>
            </div>
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                "border-cyan-300 bg-cyan-50/50 hover:bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/50 dark:hover:bg-cyan-950"
              )}
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => onOpenAssignDialog(), 100);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <assignmentDisplay.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{assignmentDisplay.label}</p>
                  <p className="text-xs text-muted-foreground">{assignmentDisplay.sublabel}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-700 dark:text-cyan-400">
                Edit
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
