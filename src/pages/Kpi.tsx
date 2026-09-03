import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Plus,
  Target,
  Trash2,
  ListChecks,
  UserPlus,
  Search,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  CalendarIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { useUser } from "@/contexts/UserContext";
import { Kpi, KPI_PERIODS, KpiPeriod } from "@/types/kpi";
import {
  addKpi,
  deleteKpi,
  getKpis,
  kpiProgress,
  kpiTaskTitle,
  subscribeKpis,
  updateKpi,
} from "@/data/kpiStore";


const emptyDraft = {
  memberId: "",
  title: "",
  period: "monthly" as KpiPeriod,
  target: "",
  unit: "",
  current: "",
  autoTask: true,
};

type StatusFilter = "all" | "ontrack" | "atrisk" | "achieved";
type SortKey = "attainment-asc" | "attainment-desc" | "name" | "count";

const statusOf = (pct: number): Exclude<StatusFilter, "all"> =>
  pct >= 100 ? "achieved" : pct >= 50 ? "ontrack" : "atrisk";

const toneFor = (pct: number) =>
  pct >= 100
    ? "bg-success/10 text-success"
    : pct >= 80
    ? "bg-primary/10 text-primary"
    : pct < 50
    ? "bg-destructive/10 text-destructive"
    : "bg-warning/10 text-warning";

const KpiPage = () => {
  const { currentUser } = useUser();
  const meId = currentUser?.id ?? mockStaffMembers[0]?.id ?? "";
  const meName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : `${mockStaffMembers[0]?.firstName ?? ""} ${mockStaffMembers[0]?.lastName ?? ""}`.trim();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<KpiPeriod | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("attainment-asc");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [deptIds, setDeptIds] = useState<string[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const load = () => setKpis(getKpis());
    load();
    return subscribeKpis(load);
  }, []);

  const deptOfMember = useMemo(() => {
    const map: Record<string, string> = {};
    mockStaffMembers.forEach((s) => {
      map[s.id] = s.departmentId;
    });
    return map;
  }, []);

  const matches = (k: Kpi) => {
    const q = search.trim().toLowerCase();
    if (q && !`${k.title} ${k.memberName}`.toLowerCase().includes(q)) return false;
    if (period !== "all" && k.period !== period) return false;
    if (status !== "all" && statusOf(kpiProgress(k)) !== status) return false;
    if (memberIds.length && !memberIds.includes(k.memberId)) return false;
    if (deptIds.length && !deptIds.includes(deptOfMember[k.memberId] ?? "")) return false;
    if (range?.from) {
      const created = new Date(k.createdAt);
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      if (created < from) return false;
      if (range.to) {
        const to = new Date(range.to);
        to.setHours(23, 59, 59, 999);
        if (created > to) return false;
      }
    }
    return true;
  };

  const filtered = useMemo(
    () => kpis.filter(matches),
    [kpis, search, period, status, memberIds, deptIds, range, deptOfMember]
  );

  const activeFilters =
    deptIds.length + memberIds.length + (range?.from ? 1 : 0) + (period !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0);

  const clearFilters = () => {
    setDeptIds([]);
    setMemberIds([]);
    setRange(undefined);
    setPeriod("all");
    setStatus("all");
    setSearch("");
  };


  const members = useMemo(() => {
    const map = new Map<string, { id: string; name: string; items: Kpi[] }>();
    filtered.forEach((k) => {
      if (!map.has(k.memberId)) map.set(k.memberId, { id: k.memberId, name: k.memberName, items: [] });
      map.get(k.memberId)!.items.push(k);
    });
    const list = Array.from(map.values()).map((m) => ({
      ...m,
      avg: Math.round(m.items.reduce((s, k) => s + kpiProgress(k), 0) / m.items.length),
      atRisk: m.items.filter((k) => kpiProgress(k) < 50).length,
    }));
    switch (sort) {
      case "attainment-desc":
        return list.sort((a, b) => b.avg - a.avg);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "count":
        return list.sort((a, b) => b.items.length - a.items.length);
      default:
        return list.sort((a, b) => a.avg - b.avg);
    }
  }, [filtered, sort]);

  const totals = useMemo(() => {
    const all = kpis;
    const avg = all.length
      ? Math.round(all.reduce((s, k) => s + kpiProgress(k), 0) / all.length)
      : 0;
    return {
      people: new Set(all.map((k) => k.memberId)).size,
      total: all.length,
      avg,
      onTrack: all.filter((k) => kpiProgress(k) >= 80).length,
      atRisk: all.filter((k) => kpiProgress(k) < 50).length,
    };
  }, [kpis]);

  const myKpis = useMemo(
    () => filtered.filter((k) => k.memberId === meId),
    [filtered, meId]
  );


  const openFor = (memberId?: string) => {
    setDraft({ ...emptyDraft, memberId: memberId ?? "" });
    setOpen(true);
  };

  const handleSave = (keepOpen: boolean) => {
    const member = mockStaffMembers.find((s) => s.id === draft.memberId);
    if (!member) return toast.error("Select a team member");
    if (!draft.title.trim()) return toast.error("Enter a KPI name");
    const target = Number(draft.target);
    if (!target || target <= 0) return toast.error("Enter a valid target");

    addKpi({
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      title: draft.title.trim(),
      period: draft.period,
      target,
      unit: draft.unit.trim() || undefined,
      current: Number(draft.current) || 0,
      autoTask: draft.autoTask,
    });

    toast.success(draft.autoTask ? "KPI added and task auto-generated" : "KPI added");

    if (keepOpen) {
      setDraft((d) => ({ ...d, title: "", target: "", unit: "", current: "" }));
    } else {
      setOpen(false);
    }
  };

  const allExpanded = members.length > 0 && members.every((m) => expanded[m.id]);
  const toggleAll = () =>
    setExpanded(
      allExpanded ? {} : Object.fromEntries(members.map((m) => [m.id, true]))
    );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader
            title="KPI"
            subtitle="Set and track performance targets for every team member"
            icon={Target}
            actions={
              <Button className="rounded-lg gap-2" onClick={() => openFor()}>
                <Plus className="w-4 h-4" />
                Add KPI
              </Button>
            }
          />

          <PageIntro
            highlight="Turn expectations into measurable outcomes."
            description="Track attainment across the whole team at a glance, drill into any individual, and let the system auto-generate the tasks that keep everyone moving towards target."
          />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard icon={Users} label="People" value={String(totals.people)} tone="primary" />
            <StatCard icon={Target} label="Active KPIs" value={String(totals.total)} tone="primary" />
            <StatCard icon={TrendingUp} label="Avg attainment" value={`${totals.avg}%`} tone="primary" />
            <StatCard icon={CheckCircle2} label="On track" value={String(totals.onTrack)} tone="success" />
            <StatCard icon={AlertTriangle} label="At risk" value={String(totals.atRisk)} tone="warning" />
          </div>

          <Tabs defaultValue="team">
            <TabsList className="bg-transparent p-0 gap-2 h-auto">
              <TabsTrigger
                value="team"
                className="rounded-lg border border-border/60 px-3 h-8 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Team overview
              </TabsTrigger>
              <TabsTrigger
                value="mine"
                className="rounded-lg border border-border/60 px-3 h-8 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                My KPIs
              </TabsTrigger>
            </TabsList>

            {/* Filters shared by both views */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search person or KPI…"
                  className="rounded-lg h-9 pl-9 text-sm"
                />
              </div>
              <Select value={period} onValueChange={(v) => setPeriod(v as KpiPeriod | "all")}>
                <SelectTrigger className="rounded-lg h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All periods</SelectItem>
                  {KPI_PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger className="rounded-lg h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="atrisk">At risk</SelectItem>
                  <SelectItem value="ontrack">On track</SelectItem>
                  <SelectItem value="achieved">Achieved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="rounded-lg h-9 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="attainment-asc">Lowest attainment</SelectItem>
                  <SelectItem value="attainment-desc">Highest attainment</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="count">Most KPIs</SelectItem>
                </SelectContent>
              </Select>

              <MultiSelectFilter
                icon={Building2}
                label="Departments"
                placeholder="Search departments…"
                options={mockDepartments.map((d) => ({ value: d.id, label: d.name }))}
                selected={deptIds}
                onChange={setDeptIds}
              />

              <MultiSelectFilter
                icon={Users}
                label="Team members"
                placeholder="Search team members…"
                options={mockStaffMembers.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName}`,
                  hint: s.role,
                }))}
                selected={memberIds}
                onChange={setMemberIds}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-lg h-9 text-xs gap-2 font-normal",
                      !range?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {range?.from
                      ? range.to
                        ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yy")}`
                        : format(range.from, "d MMM yy")
                      : "Date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={2}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  <div className="flex justify-end border-t border-border/60 p-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg h-7 text-xs"
                      onClick={() => setRange(undefined)}
                    >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {activeFilters > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg h-9 text-xs gap-1.5"
                  onClick={clearFilters}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear ({activeFilters})
                </Button>
              )}
            </div>


            <TabsContent value="team" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {members.length} team member{members.length === 1 ? "" : "s"} · {filtered.length} KPI
                  {filtered.length === 1 ? "" : "s"}
                </p>
                {members.length > 0 && (
                  <Button size="sm" variant="ghost" className="rounded-lg h-7 text-xs" onClick={toggleAll}>
                    {allExpanded ? "Collapse all" : "Expand all"}
                  </Button>
                )}
              </div>

              {members.length === 0 && (
                <Card className="border-border/60">
                  <CardContent className="py-12 text-center space-y-3">
                    <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {kpis.length === 0
                        ? "No KPIs yet. Add a team member and set their first target."
                        : "No KPIs match these filters."}
                    </p>
                    {kpis.length === 0 && (
                      <Button className="rounded-lg gap-2" onClick={() => openFor()}>
                        <UserPlus className="w-4 h-4" />
                        Add team member KPI
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {members.map((member) => (
                <Collapsible
                  key={member.id}
                  open={!!expanded[member.id]}
                  onOpenChange={(o) => setExpanded((e) => ({ ...e, [member.id]: o }))}
                >
                  <Card className="border-border/60 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full text-left p-3 flex items-center gap-3">
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <Badge variant="secondary" className="rounded-lg text-[10px]">
                              {member.items.length} KPI{member.items.length === 1 ? "" : "s"}
                            </Badge>
                            {member.atRisk > 0 && (
                              <Badge className="rounded-lg text-[10px] bg-destructive/10 text-destructive hover:bg-destructive/10">
                                {member.atRisk} at risk
                              </Badge>
                            )}
                          </div>
                          <Progress value={member.avg} className="h-1.5 mt-2" />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-semibold rounded-lg px-2 py-1 shrink-0",
                            toneFor(member.avg)
                          )}
                        >
                          {member.avg}%
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                            expanded[member.id] && "rotate-180"
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-3 pt-0">
                        {member.items.map((kpi) => (
                          <KpiRow key={kpi.id} kpi={kpi} />
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg gap-1.5 w-full"
                          onClick={() => openFor(member.id)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add KPI for {member.name.split(" ")[0]}
                        </Button>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </TabsContent>

            <TabsContent value="mine" className="mt-4 space-y-3">
              <Card className="border-border/60">
                <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    {meName || "My"} KPIs
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg gap-1.5"
                    onClick={() => openFor(meId)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add KPI
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myKpis.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      You have no KPIs matching these filters.
                    </p>
                  )}
                  {myKpis.map((kpi) => (
                    <KpiRow key={kpi.id} kpi={kpi} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add KPI</DialogTitle>
            <DialogDescription>
              Assign a measurable target to a team member. Keep adding as many KPIs as needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Team member</Label>
              <Select
                value={draft.memberId}
                onValueChange={(v) => setDraft((d) => ({ ...d, memberId: v }))}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {mockStaffMembers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} — {s.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">KPI name</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Patient calls returned"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <div className="flex flex-wrap gap-1.5">
                {KPI_PERIODS.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    size="sm"
                    variant={draft.period === p.value ? "default" : "outline"}
                    className="h-8 rounded-lg text-xs"
                    onClick={() => setDraft((d) => ({ ...d, period: p.value }))}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Target</Label>
                <Input
                  type="number"
                  value={draft.target}
                  onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={draft.unit}
                  onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
                  placeholder="calls, %, audits"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Current</Label>
                <Input
                  type="number"
                  value={draft.current}
                  onChange={(e) => setDraft((d) => ({ ...d, current: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Auto-generate task</p>
                <p className="text-xs text-muted-foreground">
                  Creates a task "Achieve {draft.title || "<KPI>"}" for this member.
                </p>
              </div>
              <Switch
                checked={draft.autoTask}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, autoTask: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-lg" onClick={() => handleSave(true)}>
              Save & add another
            </Button>
            <Button className="rounded-lg" onClick={() => handleSave(false)}>
              Save KPI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

function MultiSelectFilter({
  icon: Icon,
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  icon: typeof Users;
  label: string;
  placeholder: string;
  options: { value: string; label: string; hint?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (value: string) =>
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  const summary =
    selected.length === 0
      ? label
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? label
      : `${label} (${selected.length})`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "rounded-lg h-9 text-xs gap-2 font-normal max-w-[190px]",
            selected.length === 0 && "text-muted-foreground"
          )}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{summary}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-popover z-50" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="text-xs" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.hint ?? ""}`}
                  onSelect={() => toggle(o.value)}
                  className="gap-2 text-xs"
                >
                  <Checkbox checked={selected.includes(o.value)} className="rounded" />
                  <span className="truncate">{o.label}</span>
                  {o.hint && (
                    <span className="ml-auto text-[10px] text-muted-foreground truncate">
                      {o.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 && (
          <div className="flex justify-end border-t border-border/60 p-2">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg h-7 text-xs"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function KpiRow({ kpi }: { kpi: Kpi }) {

  const pct = kpiProgress(kpi);
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{kpi.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {kpi.period} · target {kpi.target}
            {kpi.unit ? ` ${kpi.unit}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className={cn("rounded-lg", toneFor(pct))}>
            {pct}%
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={() => {
              deleteKpi(kpi.id);
              toast.success("KPI removed");
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <Progress value={pct} className="h-1.5 mt-2.5" />
      <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-[11px] text-muted-foreground">Current</Label>
          <Input
            type="number"
            value={kpi.current}
            onChange={(e) => updateKpi(kpi.id, { current: Number(e.target.value) || 0 })}
            className="h-7 w-24 rounded-lg text-xs"
          />
        </div>
        {kpi.autoTask && (
          <span className="flex items-center gap-1 text-[11px] text-primary">
            <ListChecks className="w-3 h-3" />
            {kpiTaskTitle(kpi)}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/10"
      : tone === "warning"
      ? "text-warning bg-warning/10"
      : "text-primary bg-primary/10";
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className={cn("p-1.5 rounded-lg w-fit", toneClass)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-2">{label}</p>
        <p className="text-xl font-bold tracking-tight mt-0.5">{value}</p>
      </CardContent>
    </Card>
  );
}

export default KpiPage;
