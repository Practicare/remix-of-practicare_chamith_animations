import { useState } from "react";
import { addYears, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Roster } from "@/types/roster";

interface CreateRosterDialogProps {
  onCreateRoster: (roster: Omit<Roster, "id" | "createdAt" | "shifts">) => void;
  existingRosters: Roster[];
  departments?: { id: string; name: string }[];
}

export function CreateRosterDialog({ onCreateRoster, existingRosters, departments = [] }: CreateRosterDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const dept = departments.find((d) => d.id === departmentId);
    const startDate = startOfDay(new Date());

    onCreateRoster({
      name,
      period: "weekly",
      startDate,
      endDate: addYears(startDate, 1),
      createdBy: "Current User",
      published: false,
      departmentId: departmentId === "all" ? undefined : departmentId,
      departmentName: dept?.name,
    });

    setOpen(false);
    setName("");
    setDepartmentId("all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-10">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Schedule</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Schedule</DialogTitle>
          <DialogDescription>
            Name your schedule and choose the department it covers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Week 3 - January 2026"
              required
            />
          </div>

          {departments.length > 0 && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only team members in this department can be rostered on this schedule.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name}>
              Create Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
