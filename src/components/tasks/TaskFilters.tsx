import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Users } from "lucide-react";
import { mockStaffMembers } from "@/data/mockStaff";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (assignee: string) => void;
  onClearFilters: () => void;
}

export const TaskFilters = ({
  searchQuery,
  onSearchChange,
  assigneeFilter,
  onAssigneeFilterChange,
  onClearFilters,
}: TaskFiltersProps) => {
  const hasFilters = searchQuery || assigneeFilter;

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 min-w-[160px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={assigneeFilter || "all"} onValueChange={(v) => onAssigneeFilterChange(v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <SelectValue placeholder="All Users" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover z-50">
          <SelectItem value="all">All Users</SelectItem>
          {mockStaffMembers.map((member) => (
            <SelectItem key={member.id} value={`${member.firstName} ${member.lastName}`}>
              {member.firstName} {member.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1.5">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
};
