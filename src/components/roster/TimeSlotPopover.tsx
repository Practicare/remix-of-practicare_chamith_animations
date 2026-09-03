import { useState, useMemo } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
}

interface AddShiftPopoverProps {
  teamMembers: TeamMember[];
  departments: Department[];
  onAddShifts: (memberIds: string[]) => void;
  trigger?: React.ReactNode;
}

export function AddShiftPopover({
  teamMembers,
  departments,
  onAddShifts,
  trigger,
}: AddShiftPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return teamMembers;
    const query = search.toLowerCase();
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
    );
  }, [teamMembers, search]);

  const groupedMembers = useMemo(() => {
    const groups: Record<string, TeamMember[]> = {};
    filteredMembers.forEach((member) => {
      const deptId = member.departmentId || "unassigned";
      if (!groups[deptId]) groups[deptId] = [];
      groups[deptId].push(member);
    });
    return groups;
  }, [filteredMembers]);

  const handleToggleMember = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleToggleDepartment = (deptId: string) => {
    const deptMembers = teamMembers.filter((m) => m.departmentId === deptId);
    const allSelected = deptMembers.every((m) => selectedIds.includes(m.id));
    
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !deptMembers.some((m) => m.id === id)));
    } else {
      const newIds = deptMembers.map((m) => m.id).filter((id) => !selectedIds.includes(id));
      setSelectedIds((prev) => [...prev, ...newIds]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === teamMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(teamMembers.map((m) => m.id));
    }
  };

  const handleAddShifts = () => {
    if (selectedIds.length > 0) {
      onAddShifts(selectedIds);
      setSelectedIds([]);
      setSearch("");
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setSelectedIds([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Team
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserPlus className="h-4 w-4" />
              <span>Add Team</span>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="secondary">{selectedIds.length} selected</Badge>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
              autoFocus
            />
          </div>
        </div>

        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8"
            onClick={handleSelectAll}
          >
            <Users className="h-4 w-4" />
            {selectedIds.length === teamMembers.length ? "Deselect All" : "Select All"}
          </Button>
        </div>

        <ScrollArea className="h-[280px]">
          <div className="p-2 space-y-2">
            {departments.map((dept) => {
              const deptMembers = groupedMembers[dept.id] || [];
              if (deptMembers.length === 0) return null;
              
              const allDeptSelected = deptMembers.every((m) => selectedIds.includes(m.id));
              const someDeptSelected = deptMembers.some((m) => selectedIds.includes(m.id));
              
              return (
                <div key={dept.id} className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                      "hover:bg-accent/50 transition-colors"
                    )}
                    onClick={() => handleToggleDepartment(dept.id)}
                  >
                    <Checkbox
                      checked={allDeptSelected}
                      className={cn(someDeptSelected && !allDeptSelected && "opacity-50")}
                      onCheckedChange={() => handleToggleDepartment(dept.id)}
                    />
                    <span className="text-sm font-medium flex-1">{dept.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {deptMembers.length}
                    </Badge>
                  </div>
                  <div className="ml-6 space-y-0.5">
                    {deptMembers.map((member) => (
                      <div
                        key={member.id}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                          "hover:bg-accent/50 transition-colors"
                        )}
                        onClick={() => handleToggleMember(member.id)}
                      >
                        <Checkbox
                          checked={selectedIds.includes(member.id)}
                          onCheckedChange={() => handleToggleMember(member.id)}
                        />
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Unassigned members */}
            {groupedMembers["unassigned"]?.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Unassigned
                </div>
                <div className="space-y-0.5">
                  {groupedMembers["unassigned"].map((member) => (
                    <div
                      key={member.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                        "hover:bg-accent/50 transition-colors"
                      )}
                      onClick={() => handleToggleMember(member.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No team members found
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={selectedIds.length === 0}
            onClick={handleAddShifts}
          >
            Add {selectedIds.length > 0 ? `${selectedIds.length} Shift${selectedIds.length !== 1 ? "s" : ""}` : "Shift"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
