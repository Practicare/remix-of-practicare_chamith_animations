import { useState, useMemo, ComponentType, ReactNode } from "react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Send, Mail, MessageSquare, Pencil, Trash2, Link as LinkIcon } from "lucide-react";
import { MeetingInviteManagerDialog } from "@/components/meetingSchedule/MeetingInviteManagerDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Meeting, MeetingType, MEETING_TYPE_LABELS, MEETING_TYPE_COLORS, MEETING_TYPE_DOT } from "@/types/meetingSchedule";
import { mockMeetings } from "@/data/mockMeetings";

const emptyForm = (date?: Date): Omit<Meeting, "id" | "createdAt" | "attendees"> => ({
  title: "",
  type: "staff_meeting",
  date: date ?? new Date(),
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  presenter: "",
  details: "",
});

const MeetingSchedule = ({ Layout = AdminLayout }: { Layout?: ComponentType<{ children: ReactNode }> }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm(new Date()));
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [createAsMemo, setCreateAsMemo] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MeetingType | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const filteredMeetings = useMemo(
    () => (typeFilter === "all" ? meetings : meetings.filter((m) => m.type === typeFilter)),
    [meetings, typeFilter]
  );

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    const arr: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    filteredMeetings.forEach((m) => {
      const key = format(m.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [filteredMeetings]);

  const selectedMeetings = meetingsByDay.get(format(selectedDate, "yyyy-MM-dd")) ?? [];

  const openCreate = (date?: Date) => {
    setEditingId(null);
    setForm(emptyForm(date ?? selectedDate));
    setSendEmail(true);
    setSendSms(false);
    setCreateAsMemo(true);
    setDialogOpen(true);
  };

  const openEdit = (m: Meeting) => {
    setEditingId(m.id);
    setForm({
      title: m.title,
      type: m.type,
      date: m.date,
      startTime: m.startTime,
      endTime: m.endTime,
      location: m.location ?? "",
      presenter: m.presenter ?? "",
      details: m.details ?? "",
    });
    setSendEmail(m.notifications?.email ?? false);
    setSendSms(m.notifications?.sms ?? false);
    setCreateAsMemo(m.sentAsMemo ?? false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    if (editingId) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...form, sentAsMemo: createAsMemo, notifications: { email: sendEmail, sms: sendSms, sentAt: (sendEmail || sendSms) ? new Date() : m.notifications?.sentAt } }
            : m
        )
      );
      toast.success("Meeting updated");
    } else {
      const newMeeting: Meeting = {
        ...form,
        id: `mtg-${Date.now()}`,
        attendees: [],
        createdAt: new Date(),
        sentAsMemo: createAsMemo,
        notifications: (sendEmail || sendSms) ? { email: sendEmail, sms: sendSms, sentAt: new Date() } : undefined,
      };
      setMeetings((prev) => [...prev, newMeeting]);
      const parts: string[] = ["Meeting created"];
      if (createAsMemo) parts.push("memo posted");
      if (sendEmail) parts.push("email sent");
      if (sendSms) parts.push("SMS sent");
      toast.success(parts.join(" · "));
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast.success("Meeting deleted");
  };

  const handleNotify = (m: Meeting, channel: "email" | "sms" | "memo") => {
    setMeetings((prev) =>
      prev.map((x) => {
        if (x.id !== m.id) return x;
        if (channel === "memo") return { ...x, sentAsMemo: true };
        return {
          ...x,
          notifications: {
            ...(x.notifications ?? {}),
            [channel]: true,
            sentAt: new Date(),
          },
        };
      })
    );
    const labels = { email: "Email sent to staff", sms: "SMS sent to staff", memo: "Posted as memo" };
    toast.success(labels[channel]);
  };

  return (
    <Layout>
      <MobileHeader title="Meeting Schedule" subtitle="Calendar of practice meetings" />

      <PageHeader
        title="Meeting Schedule"
        subtitle="Plan staff meetings, medical rep visits, clinical presentations and more"
        icon={CalendarDays}
        actions={
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)} className="gap-1.5">
              <LinkIcon className="w-4 h-4" /> Invite Link
            </Button>
            <Button size="sm" onClick={() => openCreate()} className="gap-1.5">
              <Plus className="w-4 h-4" /> New Meeting
            </Button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-4">
        <PageIntro
          highlight="One calendar for every practice meeting."
          description="Plan, invite and track staff meetings, huddles and reviews so the right people show up prepared — with agendas, notes and outcomes in one place."
        />
        {/* Type filter */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
                Filter
              </span>
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5",
                  typeFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/40"
                )}
              >
                All
                <span className="text-[10px] opacity-70">({meetings.length})</span>
              </button>
              {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((t) => {
                const count = meetings.filter((m) => m.type === t).length;
                const active = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(active ? "all" : t)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5",
                      active
                        ? "ring-2 ring-primary/40 border-primary"
                        : "border-border hover:border-primary/40",
                      MEETING_TYPE_COLORS[t]
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", MEETING_TYPE_DOT[t])} />
                    {MEETING_TYPE_LABELS[t]}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCursor(subMonths(cursor, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-base font-semibold min-w-[160px] text-center">
                  {format(cursor, "MMMM yyyy")}
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setCursor(new Date()); setSelectedDate(new Date()); }}>
                Today
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayMeetings = meetingsByDay.get(key) ?? [];
                const inMonth = isSameMonth(day, cursor);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDay = isSameDay(day, new Date());
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => openCreate(day)}
                    className={cn(
                      "min-h-[64px] rounded-lg border p-1.5 text-left transition-colors flex flex-col gap-1",
                      inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground",
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-medium", isTodayDay && "text-primary font-bold")}>
                        {format(day, "d")}
                      </span>
                      {dayMeetings.length > 0 && (
                        <span className="text-[9px] font-semibold text-muted-foreground">{dayMeetings.length}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayMeetings.slice(0, 2).map((m) => (
                        <div key={m.id} className="flex items-center gap-1 truncate">
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", MEETING_TYPE_DOT[m.type])} />
                          <span className="text-[10px] truncate">{m.title}</span>
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <span className="text-[9px] text-muted-foreground">+{dayMeetings.length - 2} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {format(selectedDate, "EEEE, d MMMM yyyy")}
            </h3>
            <Button size="sm" variant="outline" onClick={() => openCreate(selectedDate)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add meeting
            </Button>
          </div>

          {selectedMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No meetings scheduled</p>
                <p className="text-xs mt-1">Click "Add meeting" to schedule one for this day</p>
              </CardContent>
            </Card>
          ) : (
            selectedMeetings.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px]", MEETING_TYPE_COLORS[m.type])}>
                          {MEETING_TYPE_LABELS[m.type]}
                        </Badge>
                        {m.sentAsMemo && <Badge variant="secondary" className="text-[10px]">Memo</Badge>}
                        {m.notifications?.email && <Badge variant="secondary" className="text-[10px] gap-1"><Mail className="w-2.5 h-2.5" />Emailed</Badge>}
                        {m.notifications?.sms && <Badge variant="secondary" className="text-[10px] gap-1"><MessageSquare className="w-2.5 h-2.5" />SMS</Badge>}
                      </div>
                      <h4 className="font-semibold text-sm truncate">{m.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.startTime} – {m.endTime}</span>
                        {m.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>}
                        {m.presenter && <span className="flex items-center gap-1"><User className="w-3 h-3" />{m.presenter}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {m.details && (
                    <p className="text-sm text-foreground/85 leading-relaxed">{m.details}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                    {!m.sentAsMemo && (
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handleNotify(m, "memo")}>
                        <Send className="w-3.5 h-3.5" /> Create memo
                      </Button>
                    )}
                    {!m.notifications?.email && (
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handleNotify(m, "email")}>
                        <Mail className="w-3.5 h-3.5" /> Email staff
                      </Button>
                    )}
                    {!m.notifications?.sms && (
                      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => handleNotify(m, "sms")}>
                        <MessageSquare className="w-3.5 h-3.5" /> SMS staff
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <MeetingInviteManagerDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onApproveRequest={(m) => setMeetings((prev) => [...prev, m])}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Meeting" : "New Meeting"}</DialogTitle>
            <DialogDescription>
              Schedule a meeting, label its type, and optionally notify staff.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Weekly staff meeting"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MeetingType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((t) => (
                      <SelectItem key={t} value={t}>{MEETING_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={format(form.date, "yyyy-MM-dd")}
                  onChange={(e) => setForm({ ...form, date: new Date(e.target.value + "T00:00:00") })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Conference room" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Presenter</Label>
                <Input value={form.presenter} onChange={(e) => setForm({ ...form, presenter: e.target.value })} placeholder="e.g. Dr. Smith" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Details</Label>
              <Textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Agenda, topics, notes for attendees..."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notify staff</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={createAsMemo} onCheckedChange={(v) => setCreateAsMemo(!!v)} />
                <Send className="w-3.5 h-3.5 text-muted-foreground" />
                Post as memo to all staff
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} />
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Send email notification
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sendSms} onCheckedChange={(v) => setSendSms(!!v)} />
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                Send SMS notification
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? "Save changes" : "Create meeting"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MeetingSchedule;
