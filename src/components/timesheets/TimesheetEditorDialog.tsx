import { Fragment, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Check, X, Send, MessageCircle, Clock } from "lucide-react";
import {
  Timesheet,
  TimesheetEntry,
  TimesheetSlot,
  TimesheetComment,
  STATUS_LABEL,
  calcEntryHours,
  calcTimesheetTotals,
} from "@/types/timesheets";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timesheet: Timesheet | null;
  mode: "admin" | "staff";
  onSave: (ts: Timesheet) => void;
  onApprove?: (ts: Timesheet) => void;
  onReject?: (ts: Timesheet) => void;
  onSubmit?: (ts: Timesheet) => void;
}

export function TimesheetEditorDialog({
  open,
  onOpenChange,
  timesheet,
  mode,
  onSave,
  onApprove,
  onReject,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<Timesheet | null>(timesheet);

  useEffect(() => {
    setDraft(timesheet);
  }, [timesheet]);

  if (!draft) return null;

  const totals = calcTimesheetTotals(draft);
  const readOnly = draft.status === "approved";

  const updateEntry = (id: string, patch: Partial<TimesheetEntry>) => {
    setDraft({
      ...draft,
      entries: draft.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  };

  const removeEntry = (id: string) => {
    setDraft({ ...draft, entries: draft.entries.filter((e) => e.id !== id) });
  };

  const addEntry = () => {
    const newEntry: TimesheetEntry = {
      id: `tse-new-${Date.now()}`,
      date: new Date(),
      scheduledStart: "",
      scheduledEnd: "",
      actualStart: "09:00",
      actualEnd: "17:00",
      breaks: [{ startTime: "12:00", endTime: "12:30", isPaid: false }],
      isOvertime: false,
    };
    setDraft({ ...draft, entries: [...draft.entries, newEntry] });
  };

  const handleClockToggle = (entry: TimesheetEntry) => {
    const now = format(new Date(), "HH:mm");
    if (!entry.clockedIn) {
      updateEntry(entry.id, { clockedIn: true, actualStart: now, clockedInAt: new Date() });
    } else {
      updateEntry(entry.id, { clockedIn: false, actualEnd: now });
    }
  };

  const addSlot = (entry: TimesheetEntry) => {
    const slot: TimesheetSlot = {
      id: `slot-${Date.now()}`,
      start: "13:00",
      end: "15:00",
      addedByUser: mode === "staff",
    };
    updateEntry(entry.id, { slots: [...(entry.slots || []), slot] });
  };

  const updateSlot = (entry: TimesheetEntry, slotId: string, patch: Partial<TimesheetSlot>) => {
    updateEntry(entry.id, {
      slots: (entry.slots || []).map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
    });
  };

  const removeSlot = (entry: TimesheetEntry, slotId: string) => {
    updateEntry(entry.id, {
      slots: (entry.slots || []).filter((s) => s.id !== slotId),
    });
  };

  const [newComment, setNewComment] = useState("");
  const addComment = () => {
    if (!newComment.trim()) return;
    const c: TimesheetComment = {
      id: `cm-${Date.now()}`,
      authorId: mode === "admin" ? "admin" : draft.teamMemberId,
      authorName: mode === "admin" ? "Admin" : draft.teamMemberName,
      authorRole: mode,
      message: newComment.trim(),
      createdAt: new Date(),
    };
    setDraft({ ...draft, comments: [...(draft.comments || []), c] });
    setNewComment("");
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {draft.teamMemberName}
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABEL[draft.status]}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(draft.periodStart, "dd MMM")} – {format(draft.periodEnd, "dd MMM yyyy")}
          </p>
        </DialogHeader>

        {/* Totals */}
        <div className="grid grid-cols-4 gap-2 py-2">
          {[
            { l: "Sched", v: totals.scheduled },
            { l: "Actual", v: totals.actual },
            { l: "OT", v: totals.overtime },
            { l: "Var", v: totals.variance },
          ].map((s) => (
            <div key={s.l} className="rounded-lg bg-muted/40 p-2 text-center">
              <p className="text-[10px] text-muted-foreground">{s.l}</p>
              <p className="text-lg font-bold tabular-nums">{s.v.toFixed(1)}h</p>
            </div>
          ))}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sched</TableHead>
                <TableHead>Actual In</TableHead>
                <TableHead>Actual Out</TableHead>
                <TableHead>Break</TableHead>
                <TableHead className="text-center">OT</TableHead>
                <TableHead className="text-right">Hrs</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    No entries yet. Add one below.
                  </TableCell>
                </TableRow>
              )}
              {draft.entries.map((e) => {
                const brk = e.breaks[0];
                const hrs = calcEntryHours(e, "actual");
                const extraSlots = e.slots || [];
                return (
                  <Fragment key={e.id}>
                  <TableRow>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(e.date, "EEE dd/MM")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {e.scheduledStart || "—"}–{e.scheduledEnd || "—"}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={e.actualStart}
                        onChange={(ev) => updateEntry(e.id, { actualStart: ev.target.value })}
                        disabled={readOnly}
                        className="h-8 w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={e.actualEnd}
                        onChange={(ev) => updateEntry(e.id, { actualEnd: ev.target.value })}
                        disabled={readOnly}
                        className="h-8 w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      {brk ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="time"
                            value={brk.startTime}
                            onChange={(ev) => {
                              const breaks = [...e.breaks];
                              breaks[0] = { ...breaks[0], startTime: ev.target.value };
                              updateEntry(e.id, { breaks });
                            }}
                            disabled={readOnly}
                            className="h-8 w-[88px]"
                          />
                          <span className="text-xs">–</span>
                          <Input
                            type="time"
                            value={brk.endTime}
                            onChange={(ev) => {
                              const breaks = [...e.breaks];
                              breaks[0] = { ...breaks[0], endTime: ev.target.value };
                              updateEntry(e.id, { breaks });
                            }}
                            disabled={readOnly}
                            className="h-8 w-[88px]"
                          />
                          <Checkbox
                            checked={brk.isPaid}
                            disabled={readOnly}
                            onCheckedChange={(c) => {
                              const breaks = [...e.breaks];
                              breaks[0] = { ...breaks[0], isPaid: !!c };
                              updateEntry(e.id, { breaks });
                            }}
                            title="Paid break"
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={readOnly}
                          onClick={() =>
                            updateEntry(e.id, {
                              breaks: [{ startTime: "12:00", endTime: "12:30", isPaid: false }],
                            })
                          }
                        >
                          + break
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={e.isOvertime}
                        disabled={readOnly}
                        onCheckedChange={(c) => updateEntry(e.id, { isOvertime: !!c })}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {hrs.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {mode === "staff" && !readOnly && (
                          <Button
                            variant={e.clockedIn ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleClockToggle(e)}
                            className="h-7 text-[11px]"
                          >
                            {e.clockedIn ? "Clock out" : "Clock in"}
                          </Button>
                        )}
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeEntry(e.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {extraSlots.map((s) => (
                    <TableRow key={s.id} className="bg-muted/30">
                      <TableCell className="text-[11px] text-muted-foreground pl-6">
                        ↳ slot
                      </TableCell>
                      <TableCell colSpan={2}>
                        <Input
                          placeholder="Label (optional)"
                          value={s.label || ""}
                          disabled={readOnly}
                          onChange={(ev) => updateSlot(e, s.id, { label: ev.target.value })}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={s.start}
                          disabled={readOnly}
                          onChange={(ev) => updateSlot(e, s.id, { start: ev.target.value })}
                          className="h-7 w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={s.end}
                          disabled={readOnly}
                          onChange={(ev) => updateSlot(e, s.id, { end: ev.target.value })}
                          className="h-7 w-[100px]"
                        />
                      </TableCell>
                      <TableCell colSpan={2} className="text-right text-[11px] text-muted-foreground">
                        {s.addedByUser ? "added by staff" : ""}
                      </TableCell>
                      <TableCell>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSlot(e, s.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={8} className="py-1">
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px]"
                            onClick={() => addSlot(e)}
                          >
                            <Clock className="w-3 h-3" /> Add timeslot
                          </Button>
                        )}
                        <Input
                          value={e.notes || ""}
                          disabled={readOnly}
                          placeholder="Add a note for this day..."
                          onChange={(ev) => updateEntry(e.id, { notes: ev.target.value })}
                          className="h-7 text-xs flex-1"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {!readOnly && (
          <Button variant="outline" size="sm" onClick={addEntry} className="self-start">
            <Plus className="w-4 h-4" /> Add entry
          </Button>
        )}

        {/* Comments thread */}
        <div className="space-y-2 pt-2 border-t">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Comments
          </label>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {(draft.comments || []).length === 0 && (
              <p className="text-xs text-muted-foreground italic">No comments yet.</p>
            )}
            {(draft.comments || []).map((c) => (
              <div key={c.id} className="rounded-lg bg-muted/40 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {c.authorName}
                    <Badge variant="outline" className="ml-2 text-[9px]">
                      {c.authorRole}
                    </Badge>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(c.createdAt, "dd MMM HH:mm")}
                  </span>
                </div>
                <p className="text-xs mt-1">{c.message}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(ev) => setNewComment(ev.target.value)}
              placeholder="Add a comment..."
              rows={1}
              className="min-h-[36px] text-sm"
            />
            <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
              Post
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!readOnly && (
            <Button onClick={() => onSave(draft)}>Save changes</Button>
          )}
          {mode === "staff" && draft.status !== "submitted" && draft.status !== "approved" && onSubmit && (
            <Button
              onClick={() => {
                onSubmit({ ...draft, status: "submitted", submittedAt: new Date() });
              }}
            >
              <Send className="w-4 h-4" /> Submit for approval
            </Button>
          )}
          {mode === "admin" && draft.status === "submitted" && (
            <>
              <Button variant="destructive" onClick={() => onReject?.(draft)}>
                <X className="w-4 h-4" /> Reject
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onApprove?.(draft)}
              >
                <Check className="w-4 h-4" /> Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
