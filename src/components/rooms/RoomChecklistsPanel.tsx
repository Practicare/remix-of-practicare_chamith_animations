import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ClipboardCheck, Plus, Trash2, UserRound, CheckCircle2 } from "lucide-react";
import { mockChecklists } from "@/data/mockChecklists";
import { mockStaffMembers } from "@/data/mockStaff";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AssignedChecklist {
  id: string;
  checklistId: string;
  assigneeId?: string;
  completedItemIds: string[];
  assignedAt: string;
}

const storageKey = (roomId: string) => `room-checklists-${roomId}`;

const loadAssignments = (roomId: string): AssignedChecklist[] => {
  try {
    const raw = localStorage.getItem(storageKey(roomId));
    return raw ? (JSON.parse(raw) as AssignedChecklist[]) : [];
  } catch {
    return [];
  }
};

interface RoomChecklistsPanelProps {
  roomId: string;
  roomName: string;
  searchQuery?: string;
}

export const RoomChecklistsPanel = ({ roomId, roomName, searchQuery = "" }: RoomChecklistsPanelProps) => {
  const [assignments, setAssignments] = useState<AssignedChecklist[]>(() => loadAssignments(roomId));
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setAssignments(loadAssignments(roomId));
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(storageKey(roomId), JSON.stringify(assignments));
  }, [assignments, roomId]);

  const staff = useMemo(
    () => mockStaffMembers.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })),
    []
  );

  const available = useMemo(
    () => mockChecklists.filter(c => !assignments.some(a => a.checklistId === c.id)),
    [assignments]
  );

  const assign = (checklistId: string) => {
    setAssignments(prev => [
      ...prev,
      {
        id: `rc-${Date.now()}`,
        checklistId,
        completedItemIds: [],
        assignedAt: new Date().toISOString(),
      },
    ]);
    setPickerOpen(false);
    toast.success(`Checklist assigned to ${roomName}`);
  };

  const remove = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast.success("Checklist removed from room");
  };

  const setAssignee = (id: string, assigneeId: string) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, assigneeId } : a)));
  };

  const toggleItem = (id: string, itemId: string) => {
    setAssignments(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const done = a.completedItemIds.includes(itemId);
        return {
          ...a,
          completedItemIds: done
            ? a.completedItemIds.filter(i => i !== itemId)
            : [...a.completedItemIds, itemId],
        };
      })
    );
  };

  const rows = assignments
    .map(a => ({ assignment: a, checklist: mockChecklists.find(c => c.id === a.checklistId) }))
    .filter(r => !!r.checklist)
    .filter(r =>
      !searchQuery ||
      r.checklist!.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-semibold">What needs to be done in this room</h3>
          <p className="text-[13px] text-muted-foreground">
            Assign checklists to {roomName} and track completion of each task.
          </p>
        </div>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Assign checklist
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-2">
            <p className="px-2 py-1.5 text-[12px] font-medium text-muted-foreground">
              Select a checklist
            </p>
            <div className="max-h-72 overflow-y-auto">
              {available.length === 0 ? (
                <p className="px-2 py-3 text-[13px] text-muted-foreground">
                  All checklists are already assigned to this room.
                </p>
              ) : (
                available.map(c => (
                  <button
                    key={c.id}
                    onClick={() => assign(c.id)}
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-[13px] font-medium block">{c.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.items.length} items{c.recurring ? ` · ${c.recurring}` : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12">
          <ClipboardCheck className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-[13px] text-muted-foreground">No checklists assigned to this room yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ assignment, checklist }) => {
            const total = checklist!.items.length;
            const done = checklist!.items.filter(i => assignment.completedItemIds.includes(i.id)).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={assignment.id} className="rounded-xl border bg-card">
                <div className="flex items-start gap-3 p-4 border-b">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold">{checklist!.title}</span>
                      {checklist!.recurring && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {checklist!.recurring}
                        </Badge>
                      )}
                      {pct === 100 && (
                        <Badge variant="outline" className="text-[10px] border-success/20 bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                        </Badge>
                      )}
                    </div>
                    {checklist!.description && (
                      <p className="text-[12px] text-muted-foreground mt-0.5">{checklist!.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={pct} className="h-1.5 flex-1 max-w-[220px]" />
                      <span className="text-[11px] text-muted-foreground">{done}/{total} done</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={assignment.assigneeId ?? ""}
                      onValueChange={(v) => setAssignee(assignment.id, v)}
                    >
                      <SelectTrigger className="h-8 w-[170px] text-[12px]">
                        <UserRound className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <SelectValue placeholder="Assign to" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-[13px]">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="divide-y">
                  {checklist!.items.map(item => {
                    const checked = assignment.completedItemIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleItem(assignment.id, item.id)}
                        />
                        <span className={cn("text-[13px]", checked && "line-through text-muted-foreground")}>
                          {item.text}
                        </span>
                        {item.critical && (
                          <Badge variant="outline" className="ml-auto text-[10px] border-destructive/20 bg-destructive/10 text-destructive">
                            Critical
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
