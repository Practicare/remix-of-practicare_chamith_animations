import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDays, format, startOfWeek } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Send,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Timesheet,
  TimesheetEntry,
  TimesheetTemplate,
  TimesheetTemplateDay,
  DAY_LABELS,
  calcTemplateWeeklyHours,
} from "@/types/timesheets";
import { mockDepartments } from "@/data/mockDepartments";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { timesheetStore } from "@/data/timesheetStore";

const STEPS = [
  { id: 1, label: "Basics", icon: Building2 },
  { id: 2, label: "Schedule", icon: CalendarDays },
  { id: 3, label: "Allocate", icon: Users },
  { id: 4, label: "Review", icon: CheckCircle2 },
] as const;

const defaultDays = (): TimesheetTemplateDay[] =>
  [1, 2, 3, 4, 5, 6, 0].map((dow) => ({
    dayOfWeek: dow,
    enabled: dow >= 1 && dow <= 5,
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 30,
  }));

export default function NewTimesheetTemplate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Period preselected from list page (optional)
  const initialPeriod = useMemo(() => {
    const ps = params.get("periodStart");
    if (ps) {
      const d = new Date(ps);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }, [params]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<Date>(initialPeriod);
  const [days, setDays] = useState<TimesheetTemplateDay[]>(defaultDays());
  const [allocatedIds, setAllocatedIds] = useState<string[]>([]);

  const periodEnd = addDays(periodStart, 13);
  const weeklyHours = useMemo(() => calcTemplateWeeklyHours({ days }), [days]);
  const department = mockDepartments.find((d) => d.id === departmentId);

  const departmentMembers = useMemo(() => {
    if (!departmentId) return mockTeamMembers;
    return mockTeamMembers.filter((m) => m.categoryId === departmentId);
  }, [departmentId]);

  const updateDay = (idx: number, patch: Partial<TimesheetTemplateDay>) => {
    setDays(days.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const toggleAll = () => {
    if (allocatedIds.length === departmentMembers.length) setAllocatedIds([]);
    else setAllocatedIds(departmentMembers.map((m) => m.id));
  };

  const canNext = () => {
    if (step === 1) return name.trim().length > 0 && !!departmentId;
    if (step === 2) return weeklyHours > 0;
    if (step === 3) return allocatedIds.length > 0;
    return true;
  };

  const handlePublish = () => {
    const tpl: TimesheetTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      departmentId,
      days,
      allocatedTeamMemberIds: allocatedIds,
      periodStart,
      periodEnd,
      published: true,
      createdAt: new Date(),
      createdBy: "Admin",
    };

    const generated: Timesheet[] = allocatedIds.map((memberId) => {
      const member = mockTeamMembers.find((m) => m.id === memberId);
      const entries: TimesheetEntry[] = [];
      for (let i = 0; i < 14; i++) {
        const date = addDays(periodStart, i);
        const dow = date.getDay();
        const tplDay = days.find((d) => d.dayOfWeek === dow);
        if (!tplDay || !tplDay.enabled) continue;
        entries.push({
          id: `tse-${memberId}-${i}-${Date.now()}`,
          date,
          scheduledStart: tplDay.startTime,
          scheduledEnd: tplDay.endTime,
          actualStart: tplDay.startTime,
          actualEnd: tplDay.endTime,
          breaks: [],
          breakMinutes: tplDay.breakMinutes,
          slots: [],
          isOvertime: false,
        });
      }
      return {
        id: `ts-${memberId}-${tpl.id}`,
        templateId: tpl.id,
        departmentId,
        teamMemberId: memberId,
        teamMemberName: member?.name || "Unknown",
        periodStart,
        periodEnd,
        status: "draft",
        entries,
        comments: [],
        createdBy: "admin",
        createdAt: new Date(),
        publishedAt: new Date(),
      };
    });

    // Replace any existing draft timesheets for the same member+period
    const existing = timesheetStore.getAll();
    const filtered = existing.filter(
      (t) =>
        !generated.some(
          (g) =>
            g.teamMemberId === t.teamMemberId &&
            g.periodStart.getTime() === t.periodStart.getTime() &&
            t.status === "draft"
        )
    );
    timesheetStore.setAll([...filtered, ...generated]);

    toast({
      title: "Timesheet published",
      description: `Allocated to ${allocatedIds.length} staff member(s).`,
    });
    navigate(`/timesheets?periodStart=${periodStart.toISOString()}`);
  };

  return (
    <AdminLayout>
      <MobileHeader title="New Timesheet" subtitle="Step-by-step template builder" />
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/timesheets")}
              className="h-9 w-9"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">New Timesheet Template</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(periodStart, "dd MMM")} – {format(periodEnd, "dd MMM yyyy")} · Fortnightly
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const active = step === s.id;
                const done = step > s.id;
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors flex-1",
                        active && "bg-primary/10 text-primary",
                        done && "text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0",
                          active && "bg-primary text-primary-foreground",
                          done && "bg-emerald-600 text-white",
                          !active && !done && "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wide opacity-70">
                          Step {s.id}
                        </p>
                        <p className="text-sm font-semibold leading-tight">{s.label}</p>
                      </div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 rounded-full",
                          step > s.id ? "bg-emerald-600" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step content */}
        <Card>
          <CardContent className="p-6 space-y-5">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Basic details</h2>
                  <p className="text-xs text-muted-foreground">
                    Name your template and choose the department it applies to.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Template name</Label>
                    <Input
                      placeholder="e.g. Reception standard week"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Department
                    </Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
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
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Fortnight start (Monday)
                    </Label>
                    <Input
                      type="date"
                      value={format(periodStart, "yyyy-MM-dd")}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        if (!Number.isNaN(d.getTime())) {
                          setPeriodStart(startOfWeek(d, { weekStartsOn: 1 }));
                        }
                      }}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Adjusts to the Monday of the chosen week.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">Weekly schedule</h2>
                    <p className="text-xs text-muted-foreground">
                      Set start, end and unpaid break for each day. Disable days off.
                    </p>
                  </div>
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
                <p className="text-[11px] text-muted-foreground">
                  Break is unpaid and deducted from each day's total.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">Allocate to staff</h2>
                    <p className="text-xs text-muted-foreground">
                      Pick one, several, or all staff members in {department?.name || "this department"}.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleAll}>
                    {allocatedIds.length === departmentMembers.length
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                </div>

                <div className="border rounded-lg divide-y max-h-[420px] overflow-y-auto">
                  {departmentMembers.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-8">
                      No staff in this department.
                    </p>
                  )}
                  {departmentMembers.map((m) => {
                    const checked = allocatedIds.includes(m.id);
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
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {allocatedIds.length} selected
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Review & publish</h2>
                  <p className="text-xs text-muted-foreground">
                    Confirm the details below. Publishing creates draft timesheets for each staff member.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Template</p>
                    <p className="font-semibold">{name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Department</p>
                    <p className="font-semibold">{department?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Period</p>
                    <p className="font-semibold">
                      {format(periodStart, "dd MMM")} – {format(periodEnd, "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Weekly hours</p>
                    <p className="font-semibold">
                      {weeklyHours.toFixed(2)}h <span className="text-xs text-muted-foreground">× 2 weeks = {(weeklyHours * 2).toFixed(2)}h</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="px-3 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Schedule
                  </div>
                  <div className="divide-y">
                    {days.map((d, idx) => (
                      <div
                        key={d.dayOfWeek}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm",
                          !d.enabled && "text-muted-foreground"
                        )}
                      >
                        <span className="font-medium w-12">{DAY_LABELS[idx]}</span>
                        {d.enabled ? (
                          <span className="tabular-nums">
                            {d.startTime} – {d.endTime}
                            <span className="text-xs text-muted-foreground ml-2">
                              · {d.breakMinutes}m break
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs italic">Off</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="px-3 py-2 border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                    <span>Allocated staff</span>
                    <span>{allocatedIds.length} member(s)</span>
                  </div>
                  <div className="p-3 flex flex-wrap gap-1.5">
                    {allocatedIds.map((id) => {
                      const m = mockTeamMembers.find((mm) => mm.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {m?.name || id}
                        </Badge>
                      );
                    })}
                    {allocatedIds.length === 0 && (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? navigate("/timesheets") : setStep((step - 1) as any))}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button disabled={!canNext()} onClick={() => setStep((step + 1) as any)}>
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={allocatedIds.length === 0}>
              <Send className="w-4 h-4" /> Publish timesheet
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
