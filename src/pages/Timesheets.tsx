import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import { downloadCSV } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  RefreshCw,
  Check,
  X,
  Search,
  Library,
  Pencil,
  Users,
  Clock,
  Trash2,
} from "lucide-react";
import {
  Timesheet,
  TimesheetStatus,
  TimesheetTemplate,
  TimesheetEntry,
  STATUS_LABEL,
  calcTimesheetTotals,
  calcTemplateWeeklyHours,
  DAY_LABELS,
} from "@/types/timesheets";
import { mockTeamMembersForRoster } from "@/data/mockRosters";
import { mockRosters } from "@/data/mockRosters";
import { mockDepartments } from "@/data/mockDepartments";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { TimesheetEditorDialog } from "@/components/timesheets/TimesheetEditorDialog";
import { EditTimesheetTemplateDialog } from "@/components/timesheets/EditTimesheetTemplateDialog";
import { timesheetStore } from "@/data/timesheetStore";
import { timesheetTemplateStore } from "@/data/timesheetTemplateStore";

const statusVariant: Record<TimesheetStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  rejected: "bg-destructive/15 text-destructive",
};

export default function Timesheets() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [timesheets, setTimesheets] = useState<Timesheet[]>(timesheetStore.getAll());
  const [periodStart, setPeriodStart] = useState<Date>(() => {
    const ps = params.get("periodStart");
    if (ps) {
      const d = new Date(ps);
      if (!Number.isNaN(d.getTime())) return startOfWeek(d, { weekStartsOn: 1 });
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });
  const [statusFilter, setStatusFilter] = useState<"all" | TimesheetStatus>("all");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Timesheet | null>(null);
  const [view, setView] = useState<"timesheets" | "templates">("timesheets");
  const [templates, setTemplates] = useState<TimesheetTemplate[]>(
    timesheetTemplateStore.getAll()
  );
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateDeptFilter, setTemplateDeptFilter] = useState<string>("all");
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TimesheetTemplate | null>(null);

  // Sync with shared store (e.g. after returning from /timesheets/new)
  useEffect(() => {
    const unsub = timesheetStore.subscribe(() => setTimesheets([...timesheetStore.getAll()]));
    const unsubTpl = timesheetTemplateStore.subscribe(() =>
      setTemplates([...timesheetTemplateStore.getAll()])
    );
    return () => {
      unsub();
      unsubTpl();
    };
  }, []);


  const periodEnd = addDays(periodStart, 13);

  const visible = useMemo(() => {
    return timesheets
      .filter(
        (t) =>
          t.periodStart.getTime() === periodStart.getTime() &&
          (statusFilter === "all" || t.status === statusFilter) &&
          (search === "" ||
            t.teamMemberName.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => a.teamMemberName.localeCompare(b.teamMemberName));
  }, [timesheets, periodStart, statusFilter, search]);

  const summary = useMemo(() => {
    const stats = { total: visible.length, submitted: 0, approved: 0, draft: 0, hours: 0 };
    visible.forEach((t) => {
      if (t.status === "submitted") stats.submitted++;
      if (t.status === "approved") stats.approved++;
      if (t.status === "draft") stats.draft++;
      stats.hours += calcTimesheetTotals(t).actual;
    });
    return stats;
  }, [visible]);

  const handlePrev = () => setPeriodStart(subWeeks(periodStart, 2));
  const handleNext = () => setPeriodStart(addWeeks(periodStart, 2));

  const handleRegenerate = () => {
    // Re-pull from rosters for missing members in this fortnight
    const existingIds = new Set(
      timesheets
        .filter((t) => t.periodStart.getTime() === periodStart.getTime())
        .map((t) => t.teamMemberId)
    );
    const newOnes: Timesheet[] = [];
    mockTeamMembersForRoster.forEach((m) => {
      if (existingIds.has(m.id)) return;
      const entries = mockRosters
        .flatMap((r) => r.shifts)
        .filter((s) => s.teamMemberId === m.id)
        .filter((s) => {
          const t = new Date(s.date).getTime();
          return t >= periodStart.getTime() && t <= addDays(periodEnd, 1).getTime();
        })
        .map((s) => ({
          id: `tse-${s.id}`,
          date: new Date(s.date),
          shiftId: s.id,
          scheduledStart: s.startTime,
          scheduledEnd: s.endTime,
          actualStart: s.startTime,
          actualEnd: s.endTime,
          breaks: s.breaks.map((b) => ({ ...b })),
          isOvertime: s.isOvertime,
        }));
      newOnes.push({
        id: `ts-${m.id}-${periodStart.getTime()}`,
        teamMemberId: m.id,
        teamMemberName: m.name,
        periodStart,
        periodEnd,
        status: "draft",
        entries,
        createdBy: "system",
        createdAt: new Date(),
      });
    });
    if (newOnes.length === 0) {
      toast({ title: "Up to date", description: "All staff already have timesheets for this period." });
      return;
    }
    timesheetStore.setAll([...timesheets, ...newOnes]);
    toast({ title: "Generated", description: `Created ${newOnes.length} timesheet(s) from roster.` });
  };

  const handleSave = (updated: Timesheet) => {
    timesheetStore.setAll(timesheets.map((t) => (t.id === updated.id ? updated : t)));
    setEditorOpen(false);
  };

  const handleApprove = (ts: Timesheet) => {
    timesheetStore.setAll(
      timesheets.map((t) =>
        t.id === ts.id
          ? { ...t, status: "approved", approvedAt: new Date(), approvedBy: "Admin User" }
          : t
      )
    );
    toast({ title: "Approved", description: `${ts.teamMemberName}'s timesheet approved.` });
  };

  const handleReject = (ts: Timesheet) => {
    timesheetStore.setAll(
      timesheets.map((t) =>
        t.id === ts.id ? { ...t, status: "rejected", rejectedReason: "Needs revision" } : t
      )
    );
    toast({ title: "Rejected", description: `${ts.teamMemberName}'s timesheet was rejected.` });
  };

  const handleExport = (ts?: Timesheet) => {
    const list = ts ? [ts] : visible;
    const headers = [
      "Staff",
      "Period",
      "Status",
      "Scheduled Hours",
      "Actual Hours",
      "Overtime",
      "Variance",
    ];
    const rows = list.map((t) => {
      const tot = calcTimesheetTotals(t);
      return [
        t.teamMemberName,
        `${format(t.periodStart, "dd MMM")} – ${format(t.periodEnd, "dd MMM yyyy")}`,
        STATUS_LABEL[t.status],
        tot.scheduled.toString(),
        tot.actual.toString(),
        tot.overtime.toString(),
        tot.variance.toString(),
      ];
    });
    downloadCSV(
      headers,
      rows,
      `timesheets-${format(periodStart, "yyyy-MM-dd")}${ts ? `-${ts.teamMemberName}` : ""}`
    );
  };

  // ---- Template library handlers ----
  const visibleTemplates = useMemo(() => {
    return templates
      .filter(
        (t) =>
          (templateDeptFilter === "all" || t.departmentId === templateDeptFilter) &&
          (templateSearch === "" ||
            t.name.toLowerCase().includes(templateSearch.toLowerCase()))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [templates, templateDeptFilter, templateSearch]);

  const generateTimesheetsForTemplate = (
    tpl: TimesheetTemplate,
    memberIds: string[]
  ): Timesheet[] => {
    return memberIds.map((memberId) => {
      const member = mockTeamMembers.find((m) => m.id === memberId);
      const entries: TimesheetEntry[] = [];
      for (let i = 0; i < 14; i++) {
        const date = addDays(tpl.periodStart, i);
        const dow = date.getDay();
        const tplDay = tpl.days.find((d) => d.dayOfWeek === dow);
        if (!tplDay || !tplDay.enabled) continue;
        entries.push({
          id: `tse-${memberId}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
        id: `ts-${memberId}-${tpl.id}-${Date.now()}`,
        templateId: tpl.id,
        departmentId: tpl.departmentId,
        teamMemberId: memberId,
        teamMemberName: member?.name || "Unknown",
        periodStart: tpl.periodStart,
        periodEnd: tpl.periodEnd,
        status: "draft",
        entries,
        comments: [],
        createdBy: "admin",
        createdAt: new Date(),
        publishedAt: new Date(),
      } as Timesheet;
    });
  };

  const handleSaveTemplate = (tpl: TimesheetTemplate) => {
    timesheetTemplateStore.update(tpl.id, tpl);
    setTemplateEditorOpen(false);
    toast({ title: "Template saved", description: `"${tpl.name}" updated.` });
  };

  const handleSaveAsNewTemplate = (tpl: TimesheetTemplate) => {
    const cloned: TimesheetTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (copy)`,
      createdAt: new Date(),
      createdBy: "Admin",
      published: false,
    };
    timesheetTemplateStore.add(cloned);
    setTemplateEditorOpen(false);
    toast({ title: "Saved as new template", description: `"${cloned.name}" added.` });
  };

  const handleAssignAdditional = (
    tpl: TimesheetTemplate,
    addedMemberIds: string[]
  ) => {
    timesheetTemplateStore.update(tpl.id, tpl);
    const generated = generateTimesheetsForTemplate(tpl, addedMemberIds);
    timesheetStore.add(generated);
    setTemplateEditorOpen(false);
    toast({
      title: "Assigned",
      description: `Allocated to ${addedMemberIds.length} additional staff.`,
    });
  };

  const handleDeleteTemplate = (tpl: TimesheetTemplate) => {
    timesheetTemplateStore.remove(tpl.id);
    toast({ title: "Template deleted", description: `"${tpl.name}" removed.` });
  };

  return (
    <AdminLayout>
      <MobileHeader title="Timesheets" subtitle="Fortnightly pay periods" />
      <PageHeader
        title="Timesheets"
        subtitle="Auto-generated from roster · staff edit & submit · admin reviews and approves"
        icon={CalendarClock}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="w-4 h-4" /> Generate from roster
            </Button>
            <Button
              size="sm"
              onClick={() =>
                navigate(`/timesheets/new?periodStart=${periodStart.toISOString()}`)
              }
            >
              <Plus className="w-4 h-4" /> New template
            </Button>
          </>
        }
      />
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <PageIntro
          highlight="Fair pay periods, tracked without the paperwork."
          description="Run fortnightly timesheets, build reusable templates and keep every shift and adjustment recorded in one clean workspace."
        />


        <Tabs value={view} onValueChange={(v: any) => setView(v)}>
          <TabsList>
            <TabsTrigger value="timesheets" className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Timesheets
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <Library className="w-3.5 h-3.5" /> Template Library
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">
                {templates.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timesheets" className="space-y-6 mt-4">
        {/* Period nav */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold">
                  {format(periodStart, "dd MMM")} – {format(periodEnd, "dd MMM yyyy")}
                </span>
                <Badge variant="outline" className="text-[10px]">Fortnightly</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport()}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total", value: summary.total },
            { label: "Pending", value: summary.submitted },
            { label: "Approved", value: summary.approved },
            { label: "Total Hours", value: summary.hours.toFixed(1) },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead className="text-right">Sched</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">OT</TableHead>
                  <TableHead className="text-right">Var</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No timesheets for this period. Generate from roster or create a new template.
                    </TableCell>
                  </TableRow>
                )}
                {visible.map((t) => {
                  const tot = calcTimesheetTotals(t);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.teamMemberName}</TableCell>
                      <TableCell className="text-right tabular-nums">{tot.scheduled.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{tot.actual.toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums">{tot.overtime.toFixed(1)}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          tot.variance > 0
                            ? "text-amber-600"
                            : tot.variance < 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {tot.variance > 0 ? "+" : ""}
                        {tot.variance.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${statusVariant[t.status]}`}>
                          {STATUS_LABEL[t.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {t.status === "submitted" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600"
                                onClick={() => handleApprove(t)}
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleReject(t)}
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleExport(t)}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(t);
                              setEditorOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            {/* Template filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={templateDeptFilter} onValueChange={setTemplateDeptFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {mockDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() =>
                  navigate(`/timesheets/new?periodStart=${periodStart.toISOString()}`)
                }
              >
                <Plus className="w-4 h-4" /> New
              </Button>
            </div>

            {/* Templates list */}
            {visibleTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <Library className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No templates yet. Create one to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {visibleTemplates.map((tpl) => {
                  const dept = mockDepartments.find((d) => d.id === tpl.departmentId);
                  const hours = calcTemplateWeeklyHours(tpl);
                  const enabledDays = tpl.days.filter((d) => d.enabled);
                  return (
                    <Card key={tpl.id} className="hover:border-primary/40 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{tpl.name}</h3>
                              {tpl.published ? (
                                <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 text-[10px]">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dept?.name || "—"} · Created {format(tpl.createdAt, "dd MMM yyyy")}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {enabledDays.map((d) => (
                                <Badge
                                  key={d.dayOfWeek}
                                  variant="outline"
                                  className="text-[10px] font-normal"
                                >
                                  {DAY_LABELS[[1, 2, 3, 4, 5, 6, 0].indexOf(d.dayOfWeek)]}{" "}
                                  {d.startTime}–{d.endTime}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {hours.toFixed(2)}h/week
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />{" "}
                                {tpl.allocatedTeamMemberIds.length} staff
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTemplate(tpl);
                                setTemplateEditorOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteTemplate(tpl)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TimesheetEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        timesheet={editing}
        mode="admin"
        onSave={handleSave}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <EditTimesheetTemplateDialog
        open={templateEditorOpen}
        onOpenChange={setTemplateEditorOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onSaveAsNew={handleSaveAsNewTemplate}
        onAssign={handleAssignAdditional}
      />

    </AdminLayout>
  );
}
