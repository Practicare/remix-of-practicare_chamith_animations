import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Clock,
  Layers,
  DoorOpen,
  UsersRound,
  User,
  X,
  Sun,
  Calendar,
  CalendarDays,
  CalendarRange,
  Repeat,
  CircleDot,
  CheckCircle2,
  Circle,
  PlayCircle,
  Building2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FrequencyFilter = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
export type TypeFilter = "general" | "room-setup";
export type AssignmentFilter = "group" | "individual";
export type StatusFilter = "all" | "notStarted" | "inProgress" | "completed";

export interface ChecklistFilters {
  frequencies: FrequencyFilter[];
  types: TypeFilter[];
  assignments: AssignmentFilter[];
  departments: string[];
  status: StatusFilter;
}

interface ChecklistLibraryFiltersProps {
  filters: ChecklistFilters;
  onFiltersChange: (filters: ChecklistFilters) => void;
  resultCount?: number;
  departmentOptions?: { id: string; name: string }[];
}

const STATUS_OPTIONS: { id: StatusFilter; label: string; icon: any }[] = [
  { id: "all", label: "All", icon: CircleDot },
  { id: "notStarted", label: "Not Started", icon: Circle },
  { id: "inProgress", label: "In Progress", icon: PlayCircle },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

const FREQUENCY_OPTIONS: { id: FrequencyFilter; label: string; icon: any }[] = [
  { id: "daily", label: "Daily", icon: Sun },
  { id: "weekly", label: "Weekly", icon: Calendar },
  { id: "monthly", label: "Monthly", icon: CalendarDays },
  { id: "quarterly", label: "Quarterly", icon: CalendarRange },
  { id: "yearly", label: "Yearly", icon: CalendarRange },
  { id: "custom", label: "Custom", icon: Repeat },
];

const TYPE_OPTIONS: { id: TypeFilter; label: string; icon: any }[] = [
  { id: "general", label: "General", icon: Layers },
  { id: "room-setup", label: "Room Setup", icon: DoorOpen },
];

const ASSIGNMENT_OPTIONS: { id: AssignmentFilter; label: string; icon: any }[] = [
  { id: "group", label: "Group", icon: UsersRound },
  { id: "individual", label: "Individual", icon: User },
];

function FilterPill({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border whitespace-nowrap",
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export const ChecklistLibraryFilters = ({
  filters,
  onFiltersChange,
  resultCount,
  departmentOptions = [],
}: ChecklistLibraryFiltersProps) => {
  const toggleArrayFilter = <T extends string>(
    arr: T[],
    value: T,
    key: keyof ChecklistFilters
  ) => {
    const newArr = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    onFiltersChange({ ...filters, [key]: newArr });
  };

  const activeFilterCount =
    filters.frequencies.length +
    filters.types.length +
    filters.assignments.length +
    filters.departments.length;

  const clearAll = () => {
    onFiltersChange({
      frequencies: [],
      types: [],
      assignments: [],
      departments: [],
      status: "all",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Filter Checklists</span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Department Popover */}
      {departmentOptions.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Department</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full sm:w-[280px] justify-between rounded-lg border-border bg-card hover:bg-muted/50 hover:text-foreground font-normal"
              >
                <span className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                  {filters.departments.length === 0 ? (
                    <span className="text-muted-foreground">All departments</span>
                  ) : filters.departments.length === 1 ? (
                    <span className="text-foreground">
                      {departmentOptions.find((d) => d.id === filters.departments[0])?.name}
                    </span>
                  ) : (
                    <span className="text-foreground">
                      {filters.departments.length} departments
                    </span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[280px] p-0 rounded-lg" align="start">
              <Command>
                <CommandInput placeholder="Search departments..." />
                <CommandList>
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => onFiltersChange({ ...filters, departments: [] })}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Checkbox checked={filters.departments.length === 0} />
                        <span className="flex-1">All departments</span>
                        {filters.departments.length === 0 && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                    {departmentOptions.map((dept) => {
                      const selected = filters.departments.includes(dept.id);
                      return (
                        <CommandItem
                          key={dept.id}
                          onSelect={() => toggleArrayFilter(filters.departments, dept.id, "departments")}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Checkbox checked={selected} />
                            <span className="flex-1 truncate">{dept.name}</span>
                            {selected && <Check className="w-4 h-4 text-primary" />}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.departments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {filters.departments.map((id) => {
                const dept = departmentOptions.find((d) => d.id === id);
                if (!dept) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-normal"
                  >
                    {dept.name}
                    <button
                      type="button"
                      onClick={() =>
                        toggleArrayFilter(filters.departments, id, "departments")
                      }
                      className="ml-0.5 rounded-sm hover:bg-muted"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Frequency Row */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Frequency</span>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.id}
              icon={opt.icon}
              label={opt.label}
              isActive={filters.frequencies.includes(opt.id)}
              onClick={() => toggleArrayFilter(filters.frequencies, opt.id, "frequencies")}
            />
          ))}
        </div>
      </div>

      {/* Type + Assignment Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Type</span>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                isActive={filters.types.includes(opt.id)}
                onClick={() => toggleArrayFilter(filters.types, opt.id, "types")}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Assignment</span>
          <div className="flex flex-wrap gap-2">
            {ASSIGNMENT_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.id}
                icon={opt.icon}
                label={opt.label}
                isActive={filters.assignments.includes(opt.id)}
                onClick={() => toggleArrayFilter(filters.assignments, opt.id, "assignments")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      {resultCount !== undefined && activeFilterCount > 0 && (
        <div className="pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{resultCount}</span> checklist{resultCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};
