import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { UserLayout } from "@/components/layout/UserLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlayCircle,
  StopCircle,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { timesheetStore } from "@/data/timesheetStore";
import {
  Timesheet,
  STATUS_LABEL,
  TimesheetStatus,
  calcTimesheetTotals,
  calcEntryHours,
} from "@/types/timesheets";
import { TimesheetEditorDialog } from "@/components/timesheets/TimesheetEditorDialog";
import { toast } from "@/hooks/use-toast";

const statusVariant: Record<TimesheetStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  rejected: "bg-destructive/15 text-destructive",
};

export default function UserTimesheets() {
  const { currentUser } = useUser();
  const [timesheets, setTimesheets] = useState<Timesheet[]>(timesheetStore.getAll());

  useEffect(() => {
    const unsub = timesheetStore.subscribe(() => setTimesheets([...timesheetStore.getAll()]));
    return () => {
      unsub();
    };
  }, []);
  const [periodStart, setPeriodStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Timesheet | null>(null);

  // For demo: pick first member if currentUser doesn't match (mock data uses tm-N ids)
  const myId = currentUser?.id || "tm-1";
  const myName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Sarah Johnson";

  const my = useMemo(() => {
    return timesheets.find(
      (t) =>
        (t.teamMemberId === myId || t.teamMemberName === myName) &&
        t.periodStart.getTime() === periodStart.getTime()
    ) ||
      // fallback to any timesheet for that period (demo)
      timesheets.find((t) => t.periodStart.getTime() === periodStart.getTime()) ||
      null;
  }, [timesheets, myId, myName, periodStart]);

  const periodEnd = addDays(periodStart, 13);
  const totals = my ? calcTimesheetTotals(my) : null;
  const today = new Date();
  const todayEntry = my?.entries.find(
    (e) => format(e.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );

  const handleClock = () => {
    if (!my || !todayEntry) {
      toast({ title: "No shift today", description: "You don't have a scheduled shift today." });
      return;
    }
    const now = format(new Date(), "HH:mm");
    const updatedEntry = todayEntry.clockedIn
      ? { ...todayEntry, clockedIn: false, actualEnd: now }
      : { ...todayEntry, clockedIn: true, actualStart: now, clockedInAt: new Date() };
    const updated: Timesheet = {
      ...my,
      entries: my.entries.map((e) => (e.id === todayEntry.id ? updatedEntry : e)),
    };
    timesheetStore.setAll(timesheets.map((t) => (t.id === my.id ? updated : t)));
    toast({
      title: todayEntry.clockedIn ? "Clocked out" : "Clocked in",
      description: `${now}`,
    });
  };

  const handleSave = (updated: Timesheet) => {
    timesheetStore.setAll(timesheets.map((t) => (t.id === updated.id ? updated : t)));
    setEditorOpen(false);
    toast({ title: "Saved" });
  };

  const handleSubmit = (updated: Timesheet) => {
    timesheetStore.setAll(timesheets.map((t) => (t.id === updated.id ? updated : t)));
    setEditorOpen(false);
    toast({ title: "Submitted", description: "Awaiting admin approval." });
  };

  return (
    <UserLayout>
      <MobileHeader title="My Timesheet" subtitle="Track your hours" />
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Timesheet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit your hours and submit for approval each fortnight.
          </p>
        </div>

        {/* Period nav */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setPeriodStart(subWeeks(periodStart, 2))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-semibold">
                {format(periodStart, "dd MMM")} – {format(periodEnd, "dd MMM yyyy")}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPeriodStart(addWeeks(periodStart, 2))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Clock in/out card */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Today, {format(today, "EEE dd MMM")}</p>
              <p className="text-lg font-bold mt-0.5">
                {todayEntry
                  ? `Scheduled ${todayEntry.scheduledStart || "—"}–${todayEntry.scheduledEnd || "—"}`
                  : "No scheduled shift"}
              </p>
              {todayEntry?.clockedIn && (
                <Badge className="mt-2 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <Clock className="w-3 h-3 mr-1" /> Clocked in since {todayEntry.actualStart}
                </Badge>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleClock}
              variant={todayEntry?.clockedIn ? "destructive" : "default"}
              disabled={!todayEntry}
            >
              {todayEntry?.clockedIn ? (
                <>
                  <StopCircle className="w-5 h-5" /> Clock Out
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" /> Clock In
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        {my && totals && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 mt-1 rounded-md text-xs font-medium ${statusVariant[my.status]}`}>
                    {STATUS_LABEL[my.status]}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(my);
                      setEditorOpen(true);
                    }}
                  >
                    Edit & Submit
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "Sched", v: totals.scheduled },
                  { l: "Actual", v: totals.actual },
                  { l: "OT", v: totals.overtime },
                  { l: "Var", v: totals.variance },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{s.l}</p>
                    <p className="text-xl font-bold tabular-nums">{s.v.toFixed(1)}h</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily list */}
        {my && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {my.entries.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No entries yet for this period.
                  </p>
                )}
                {my.entries.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{format(e.date, "EEE dd MMM")}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Sched {e.scheduledStart || "—"}–{e.scheduledEnd || "—"} · Actual{" "}
                        {e.actualStart}–{e.actualEnd}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums">{calcEntryHours(e, "actual").toFixed(2)}h</p>
                      {e.isOvertime && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          OT
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!my && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No timesheet for this period.
            </CardContent>
          </Card>
        )}
      </div>

      <TimesheetEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        timesheet={editing}
        mode="staff"
        onSave={handleSave}
        onSubmit={handleSubmit}
      />
    </UserLayout>
  );
}
