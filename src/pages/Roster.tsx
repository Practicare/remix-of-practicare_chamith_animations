import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, ChevronLeft, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { CreateRosterDialog } from "@/components/roster/CreateRosterDialog";
import { EditShiftDialog } from "@/components/roster/EditShiftDialog";
import { RosterCard } from "@/components/roster/RosterCard";

import {
  mockRosters,
  mockTeamMembersForRoster,
  mockDepartments,
  mockStaffHolidays,
} from "@/data/mockRosters";
import { Roster, Shift, StaffHoliday, HolidayStatus } from "@/types/roster";

export default function RosterPage() {
  const [rosters, setRosters] = useState<Roster[]>(mockRosters);
  const [holidays, setHolidays] = useState<StaffHoliday[]>(mockStaffHolidays);

  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [dirtyRosters, setDirtyRosters] = useState<string[]>([]);

  const markDirty = (rosterId: string) =>
    setDirtyRosters((prev) => (prev.includes(rosterId) ? prev : [...prev, rosterId]));
  const clearDirty = (rosterId: string) =>
    setDirtyRosters((prev) => prev.filter((id) => id !== rosterId));
  const rosterIdForShift = (shiftId: string) =>
    rosters.find((r) => r.shifts.some((s) => s.id === shiftId))?.id;

  const handleSaveRoster = (rosterId: string) => {
    clearDirty(rosterId);
    toast({ title: "Changes saved", description: "Your schedule has been saved as a draft." });
  };

  // --- Handlers ---
  const handleCreateRoster = (newRoster: Omit<Roster, "id" | "createdAt" | "shifts">) => {
    const roster: Roster = { ...newRoster, id: `roster-${Date.now()}`, createdAt: new Date(), shifts: [] };
    setRosters((prev) => [...prev, roster]);
    toast({ title: "Schedule created", description: `${roster.name} is ready to schedule.` });
  };

  const handleAddShift = (shift: Omit<Shift, "id">) => {
    const newShift: Shift = { ...shift, id: `shift-${Date.now()}-${Math.random()}` };
    setRosters((prev) =>
      prev.map((r) => (r.id === shift.rosterId ? { ...r, shifts: [...r.shifts, newShift] } : r))
    );
    markDirty(shift.rosterId);
    toast({ title: "Shift added", description: `${shift.teamMemberName} · ${shift.startTime}–${shift.endTime}` });
  };

  const handleEditShift = (shiftId: string, updates: Partial<Shift>) => {
    const rosterId = rosterIdForShift(shiftId);
    setRosters((prev) =>
      prev.map((r) => ({ ...r, shifts: r.shifts.map((s) => (s.id === shiftId ? { ...s, ...updates } : s)) }))
    );
    if (rosterId) markDirty(rosterId);
    toast({ title: "Shift updated" });
  };

  const handleDeleteShift = (shiftId: string) => {
    const rosterId = rosterIdForShift(shiftId);
    setRosters((prev) => prev.map((r) => ({ ...r, shifts: r.shifts.filter((s) => s.id !== shiftId) })));
    if (rosterId) markDirty(rosterId);
    toast({ title: "Shift removed" });
  };

  const handleShiftClick = (shift: Shift) => {
    setEditingShift(shift);
    setEditShiftOpen(true);
  };

  const handlePublishRoster = (rosterId: string) => {
    setRosters((prev) => prev.map((r) => (r.id === rosterId ? { ...r, published: true } : r)));
    clearDirty(rosterId);
    toast({ title: "Saved & published", description: "Now visible to all team members." });
  };

  const handleRenameRoster = (rosterId: string, name: string) => {
    if (!name) return;
    setRosters((prev) => prev.map((r) => (r.id === rosterId ? { ...r, name } : r)));
    markDirty(rosterId);
    toast({ title: "Schedule renamed", description: name });
  };

  const handleDeleteRoster = (rosterId: string) => {
    setRosters((prev) => prev.filter((r) => r.id !== rosterId));
    clearDirty(rosterId);
    toast({ title: "Roster deleted" });
  };

  const handleAddHoliday = (holiday: Omit<StaffHoliday, "id" | "createdAt">) => {
    setHolidays((prev) => [...prev, { ...holiday, id: `holiday-${Date.now()}`, createdAt: new Date() }]);
    toast({ title: "Holiday added" });
  };
  const handleUpdateHolidayStatus = (id: string, status: HolidayStatus) => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, status } : h)));
    toast({ title: `Holiday ${status === "approved" ? "approved" : "rejected"}` });
  };
  const handleEditHoliday = (id: string, updates: Partial<Omit<StaffHoliday, "id" | "createdAt">>) => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    toast({ title: "Holiday updated" });
  };
  const handleDeleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    toast({ title: "Holiday deleted" });
  };

  return (
    <AdminLayout>
      <MobileHeader title="Roster" subtitle="Manage schedules" />

      <header className="hidden md:block border-b bg-card">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Roster
              </h1>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Plan coverage by day, week or month — with overlapping shifts made obvious.
              </p>
            </div>
          </div>
          <CreateRosterDialog onCreateRoster={handleCreateRoster} existingRosters={rosters} departments={mockDepartments} />
        </div>
      </header>

      <main className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-4">
        {rosters.length === 0 ? (
          <div className="rounded-lg border bg-card text-center py-16 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-medium mb-2">No schedules yet</h3>
            <p className="text-sm mb-4">Create your first schedule to start rostering shifts.</p>
            <CreateRosterDialog onCreateRoster={handleCreateRoster} existingRosters={rosters} departments={mockDepartments} />
          </div>
        ) : (
          rosters.map((roster) => (
            <RosterCard
              key={roster.id}
              roster={roster}
              holidays={holidays}
              onAddShift={handleAddShift}
              onShiftClick={handleShiftClick}
              onPublish={handlePublishRoster}
              isDirty={dirtyRosters.includes(roster.id)}
              onSave={handleSaveRoster}
              onRename={handleRenameRoster}
              onDelete={handleDeleteRoster}
              onAddHoliday={handleAddHoliday}
              onUpdateHolidayStatus={handleUpdateHolidayStatus}
              onEditHoliday={handleEditHoliday}
              onDeleteHoliday={handleDeleteHoliday}
            />
          ))
        )}
      </main>

      <EditShiftDialog
        shift={editingShift}
        open={editShiftOpen}
        onOpenChange={setEditShiftOpen}
        teamMembers={mockTeamMembersForRoster}
        onSave={handleEditShift}
        onDelete={handleDeleteShift}
      />
    </AdminLayout>
  );
}
