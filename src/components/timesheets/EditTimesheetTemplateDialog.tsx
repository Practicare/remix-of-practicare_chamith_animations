import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Save, Copy, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TimesheetTemplate,
  TimesheetTemplateDay,
  DAY_LABELS,
  calcTemplateWeeklyHours,
} from "@/types/timesheets";
import { mockDepartments } from "@/data/mockDepartments";
import { mockTeamMembers } from "@/data/mockTeamMembers";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  template: TimesheetTemplate | null;
  onSave: (tpl: TimesheetTemplate) => void;
  onSaveAsNew: (tpl: TimesheetTemplate) => void;
  onAssign: (tpl: TimesheetTemplate, addedMemberIds: string[]) => void;
}

export function EditTimesheetTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
  onSaveAsNew,
  onAssign,
}: Props) {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [days, setDays] = useState<TimesheetTemplateDay[]>([]);
  const [allocatedIds, setAllocatedIds] = useState<string[]>([]);
  const [tab, setTab] = useState("schedule");

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDepartmentId(template.departmentId);
    setDays(template.days.map((d) => ({ ...d })));
    setAllocatedIds([...template.allocatedTeamMemberIds]);
    setTab("schedule");
  }, [template]);

  const weeklyHours = useMemo(() => calcTemplateWeeklyHours({ days }), [days]);

  const departmentMembers = useMemo(() => {
    if (!departmentId) return mockTeamMembers;
    return mockTeamMembers.filter((m) => m.categoryId === departmentId);
  }, [departmentId]);

  if (!template) return null;

  const updateDay = (idx: number, patch: Partial<TimesheetTemplateDay>) =>
    setDays(days.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const buildPayload = (): TimesheetTemplate => ({
    ...template,
    name,
    departmentId,
    days,
    allocatedTeamMemberIds: allocatedIds,
  });

  const newlyAddedIds = allocatedIds.filter(
    (id) => !template.allocatedTeamMemberIds.includes(id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit timesheet template</DialogTitle>
          <DialogDescription>
            Update the schedule, save as a new template, or assign to additional staff.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Template name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="staff">
              Staff ({allocatedIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Adjust each day's start, end, and unpaid break.
              </p>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {weeklyHours.toFixed(2)}h / week
              </Badge>
            </div>
            <div className="border rounded-lg divide-y">
              <div className="hidden md:grid grid-cols-12 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40">
                <div className="col-span-3">Day</div>
                <div className="col-span-3">Start</div>
                <div className="col-span-3">End</div>
                <div className="col-span-3">Break (min)</div>
              </div>
              {days.map((d, idx) => (
                <div
                  key={d.dayOfWeek}
                  className={cn(
                    "grid grid-cols-12 items-center gap-2 px-3 py-2.5",
                    !d.enabled && "opacity-50"
                  )}
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <Checkbox
                      checked={d.enabled}
                      onCheckedChange={(c) => updateDay(idx, { enabled: !!c })}
                    />
                    <span className="text-sm font-medium">{DAY_LABELS[idx]}</span>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={d.startTime}
                      disabled={!d.enabled}
                      onChange={(e) => updateDay(idx, { startTime: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={d.endTime}
                      disabled={!d.enabled}
                      onChange={(e) => updateDay(idx, { endTime: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      step={5}
                      value={d.breakMinutes}
                      disabled={!d.enabled}
                      onChange={(e) =>
                        updateDay(idx, { breakMinutes: parseInt(e.target.value) || 0 })
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Tick staff to assign the template. Newly ticked members will be
                allocated when you save.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAllocatedIds(
                    allocatedIds.length === departmentMembers.length
                      ? []
                      : departmentMembers.map((m) => m.id)
                  )
                }
              >
                {allocatedIds.length === departmentMembers.length
                  ? "Deselect all"
                  : "Select all"}
              </Button>
            </div>
            <div className="border rounded-lg divide-y max-h-[360px] overflow-y-auto">
              {departmentMembers.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-6">
                  No staff in this department.
                </p>
              )}
              {departmentMembers.map((m) => {
                const checked = allocatedIds.includes(m.id);
                const isNew = checked && !template.allocatedTeamMemberIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        if (c) setAllocatedIds([...allocatedIds, m.id]);
                        else setAllocatedIds(allocatedIds.filter((id) => id !== m.id));
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.email}</p>
                    </div>
                    {isNew && (
                      <Badge className="bg-primary/10 text-primary text-[10px]">
                        New
                      </Badge>
                    )}
                  </label>
                );
              })}
            </div>
            {newlyAddedIds.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAssign(buildPayload(), newlyAddedIds)}
                className="w-full"
              >
                <Send className="w-4 h-4" />
                Assign to {newlyAddedIds.length} new staff
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => onSaveAsNew(buildPayload())}
          >
            <Copy className="w-4 h-4" />
            Save as new template
          </Button>
          <Button onClick={() => onSave(buildPayload())}>
            <Save className="w-4 h-4" />
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
