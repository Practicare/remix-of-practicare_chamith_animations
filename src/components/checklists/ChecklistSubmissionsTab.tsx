import { useState, useMemo } from "react";
import { format, isToday, isYesterday, startOfDay, endOfDay, subDays } from "date-fns";
import { DEFAULT_DEPARTMENTS } from "@/types/departments";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportSubtitleDate } from "@/utils/exportUtils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  ListChecks,
  ChevronsUpDown,
  Check,
  X,
  Download,
  CircleDot,
  Circle,
  Building2,
  Users,
  Sun,
  CalendarDays,
  CalendarRange,
  Repeat,
  Layers,
  DoorOpen,
  UsersRound,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { cn } from "@/lib/utils";
import { mockChecklistSubmissions, getChecklistsWithSubmissions } from "@/data/mockChecklistSubmissions";
import { ChecklistSubmission } from "@/types/checklistSubmissions";
import { SubmissionChecklistView } from "./SubmissionChecklistView";
import { SubmissionVersionHistory } from "./SubmissionVersionHistory";
import { ChecklistCategory } from "@/types/checklists";
import { getDepartmentById } from "@/types/departments";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { mockChecklists } from "@/data/mockChecklists";

type FrequencyFilter = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
type TypeFilter = "general" | "room-setup";
type AssignmentFilter = "group" | "individual";

interface ChecklistSubmissionsTabProps {
  categories: ChecklistCategory[];
}

// Reusable multi-select dropdown component
function MultiSelectDropdown({
  label,
  icon: Icon,
  options,
  selected,
  onToggle,
  placeholder,
}: {
  label: string;
  icon: any;
  options: { id: string; name: string; subtitle?: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedCount = selected.size;

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <span className={cn("truncate", selectedCount === 0 && "text-muted-foreground")}>
              {selectedCount === 0
                ? placeholder
                : selectedCount === 1
                  ? options.find(o => selected.has(o.id))?.name || "1 selected"
                  : `${selectedCount} selected`}
            </span>
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              {selectedCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {selectedCount}
                </Badge>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 z-50 bg-popover" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => onToggle(option.id)}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 rounded border shrink-0",
                      selected.has(option.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border"
                    )}>
                      {selected.has(option.id) && <Check className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{option.name}</p>
                      {option.subtitle && (
                        <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selected).map(id => {
            const opt = options.find(o => o.id === id);
            return opt ? (
              <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs">
                {opt.name}
                <button type="button" onClick={() => onToggle(id)} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// Pill component for consistent styling
function FilterPill({ icon: Icon, label, isActive, onClick }: { icon: any; label: string; isActive: boolean; onClick: () => void }) {
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

export function ChecklistSubmissionsTab({ categories }: ChecklistSubmissionsTabProps) {
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ChecklistSubmission | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [checklistSelectorOpen, setChecklistSelectorOpen] = useState(false);
  
  // Date filter state
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "partial" | "critical">("all");
  const [groupBy, setGroupBy] = useState<"date" | "status">("date");

  
  // Multi-select filters
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  // Checklist property filters
  const [frequencyFilters, setFrequencyFilters] = useState<FrequencyFilter[]>([]);
  const [typeFilters, setTypeFilters] = useState<TypeFilter[]>([]);
  const [assignmentFilters, setAssignmentFilters] = useState<AssignmentFilter[]>([]);

  // Get all checklists for the selector
  const allChecklists = useMemo(() => {
    return mockChecklists.map(c => ({
      id: c.id,
      title: c.title,
      categoryId: c.categoryId,
    }));
  }, []);

  const checklistsWithSubmissions = useMemo(() => getChecklistsWithSubmissions(), []);

  // Get unique departments that have submissions
  const departmentsWithSubmissions = useMemo(() => {
    const deptIds = new Set(mockChecklistSubmissions.map(s => s.categoryId));
    return DEFAULT_DEPARTMENTS.filter(d => deptIds.has(d.id));
  }, []);

  // Get unique users from submissions, filtered by selected departments
  const usersWithSubmissions = useMemo(() => {
    let subs = mockChecklistSubmissions;
    if (selectedDepartments.size > 0) {
      subs = subs.filter(s => selectedDepartments.has(s.categoryId));
    }
    const userMap = new Map<string, string>();
    subs.forEach(s => userMap.set(s.submittedById, s.submittedBy));
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDepartments]);
  
  // Get selected checklist info
  const selectedChecklistInfo = useMemo(() => {
    if (!selectedChecklistId) return null;
    const checklist = mockChecklists.find(c => c.id === selectedChecklistId);
    if (checklist) {
      const category = getDepartmentById(categories, checklist.categoryId);
      return { 
        id: checklist.id, 
        title: checklist.title, 
        categoryId: checklist.categoryId,
        categoryName: category?.name || "Unknown"
      };
    }
    return null;
  }, [selectedChecklistId, categories]);

  // Build a set of checklist IDs that match frequency/type/assignment filters
  const matchingChecklistIds = useMemo(() => {
    if (frequencyFilters.length === 0 && typeFilters.length === 0 && assignmentFilters.length === 0) {
      return null; // no checklist property filters active
    }
    
    return new Set(
      mockChecklists.filter(c => {
        // Frequency filter
        if (frequencyFilters.length > 0) {
          const freq = c.frequency?.type || c.recurring || null;
          if (!freq || !frequencyFilters.includes(freq as FrequencyFilter)) return false;
        }
        // Type filter
        if (typeFilters.length > 0) {
          // No rooms data on mock checklists currently, so all are "general"
          const isRoomSetup = false; // would check c.selectedRooms?.length > 0
          const checklistType: TypeFilter = isRoomSetup ? "room-setup" : "general";
          if (!typeFilters.includes(checklistType)) return false;
        }
        // Assignment filter
        if (assignmentFilters.length > 0) {
          const assignment = c.assignment;
          const isIndividual = assignment?.type === "users" && (assignment.userIds?.length ?? 0) === 1;
          const assignType: AssignmentFilter = isIndividual ? "individual" : "group";
          if (!assignmentFilters.includes(assignType)) return false;
        }
        return true;
      }).map(c => c.id)
    );
  }, [frequencyFilters, typeFilters, assignmentFilters]);

  // Filter submissions based on all active filters
  const filteredSubmissions = useMemo(() => {
    let filtered = [...mockChecklistSubmissions];

    // Department filter (multi)
    if (selectedDepartments.size > 0) {
      filtered = filtered.filter(s => selectedDepartments.has(s.categoryId));
    }

    // User filter (multi)
    if (selectedUsers.size > 0) {
      filtered = filtered.filter(s => selectedUsers.has(s.submittedById));
    }

    // Checklist filter
    if (selectedChecklistId) {
      filtered = filtered.filter(s => s.checklistId === selectedChecklistId);
    }

    // Checklist property filters (frequency/type/assignment)
    if (matchingChecklistIds !== null) {
      filtered = filtered.filter(s => matchingChecklistIds.has(s.checklistId));
    }
      
    // Date range filter
    const rangeStart = startOfDay(dateFrom);
    const rangeEnd = endOfDay(dateTo);
    filtered = filtered.filter(s => s.submittedAt >= rangeStart && s.submittedAt <= rangeEnd);

    // Sort by date descending
    return filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }, [selectedChecklistId, selectedDepartments, selectedUsers, matchingChecklistIds, dateFrom, dateTo]);

  // Apply status filter
  const displayedSubmissions = useMemo(() => {
    let result = filteredSubmissions;

    if (statusFilter === "complete") {
      result = result.filter(s => s.completionPercentage === 100);
    } else if (statusFilter === "partial") {
      result = result.filter(s => s.completionPercentage < 100);
    } else if (statusFilter === "critical") {
      result = result.filter(s => s.itemsSnapshot.some(i => i.critical && !i.completed));
    }

    return result;
  }, [filteredSubmissions, statusFilter]);

  // Group submissions by date or completion status
  const groupedSubmissions = useMemo(() => {
    const groups: Record<string, ChecklistSubmission[]> = {};

    if (groupBy === "status") {
      // Preserve a stable ordering of status buckets
      const order = ["Missed critical items", "Fully completed", "Partially completed"];
      order.forEach(k => { groups[k] = []; });

      displayedSubmissions.forEach(submission => {
        const hasMissedCritical = submission.itemsSnapshot.some(i => i.critical && !i.completed);
        const label = hasMissedCritical
          ? "Missed critical items"
          : submission.completionPercentage === 100
            ? "Fully completed"
            : "Partially completed";
        groups[label].push(submission);
      });

      // Drop empty buckets
      order.forEach(k => { if (groups[k].length === 0) delete groups[k]; });
      return groups;
    }

    displayedSubmissions.forEach(submission => {
      let label: string;
      if (isToday(submission.submittedAt)) {
        label = "Today";
      } else if (isYesterday(submission.submittedAt)) {
        label = "Yesterday";
      } else {
        label = format(submission.submittedAt, "EEEE, MMMM d, yyyy");
      }
      
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(submission);
    });
    
    return groups;
  }, [displayedSubmissions, groupBy]);

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return "text-success";
    if (percentage >= 80) return "text-amber-500";
    return "text-destructive";
  };

  const getCompletionBg = (percentage: number) => {
    if (percentage === 100) return "bg-success/10 text-success border-success/20";
    if (percentage >= 80) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  // Handle selecting a checklist
  const handleSelectChecklist = (checklistId: string) => {
    setSelectedChecklistId(checklistId);
    setChecklistSelectorOpen(false);
  };

  const handleClearChecklist = () => {
    setSelectedChecklistId(null);
  };

  const toggleSet = (set: Set<string>, value: string): Set<string> => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    return newSet;
  };

  const toggleDepartment = (id: string) => {
    setSelectedDepartments(prev => toggleSet(prev, id));
    // Clear users that no longer match
    setSelectedUsers(new Set());
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => toggleSet(prev, id));
  };

  const toggleArrayFilter = <T extends string>(arr: T[], value: T): T[] => {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  // Count active filters
  const activeFilterCount =
    selectedDepartments.size +
    selectedUsers.size +
    (selectedChecklistId ? 1 : 0) +
    frequencyFilters.length +
    typeFilters.length +
    assignmentFilters.length +
    (statusFilter !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedDepartments(new Set());
    setSelectedUsers(new Set());
    handleClearChecklist();
    setFrequencyFilters([]);
    setTypeFilters([]);
    setAssignmentFilters([]);
    setStatusFilter("all");
    setDateFrom(subDays(new Date(), 30));
    setDateTo(new Date());
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const headers = ["Submission ID", "Checklist", "Submitted By", "Submitted Date", "Submitted Time", "Completion %", "Notes", "Item #", "Item Text", "Item Type", "Completed", "Response", "Completed By", "Completed At"];
    const rows: string[][] = [];
    filteredSubmissions.forEach(s => {
      s.itemsSnapshot.forEach((item, idx) => {
        let response = "";
        if (item.type === "yesno" && item.yesNoValue) response = item.yesNoValue;
        else if (item.type === "number" && item.numberValue) response = item.numberValue;
        else if (item.type === "tick") response = item.completed ? "✓" : "";
        rows.push([
          s.id, s.checklistTitle, s.submittedBy,
          format(s.submittedAt, "yyyy-MM-dd"), format(s.submittedAt, "HH:mm"),
          String(s.completionPercentage), s.notes || "",
          String(idx + 1), item.text,
          item.type === "yesno" ? "Yes/No" : item.type,
          item.completed ? "Yes" : "No", response,
          item.completedBy || "",
          item.completedAt ? format(new Date(item.completedAt), "yyyy-MM-dd HH:mm") : "",
        ]);
      });
    });
    downloadCSV(headers, rows, `submissions-${selectedChecklistInfo?.title || "all"}-${format(new Date(), "yyyy-MM-dd")}`);
    toast.success(`Exported ${filteredSubmissions.length} submissions as CSV`);
  };

  const buildItemRowsHtml = (items: ChecklistSubmission["itemsSnapshot"]) => {
    return items.map((item, idx) => {
      let response = "";
      if (item.type === "yesno" && item.yesNoValue) response = item.yesNoValue === "yes" ? "Yes" : "No";
      else if (item.type === "number" && item.numberValue) response = item.numberValue;
      else if (item.type === "tick") response = item.completed ? "✓" : "✗";
      return `<tr style="background:${item.completed ? "#f0fdf4" : "#fafafa"}">
        <td style="padding:5px 8px;border-bottom:1px solid #eee">${idx + 1}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee">${item.text}${item.critical ? ' <span style="color:#dc2626;font-weight:600;font-size:10px">CRITICAL</span>' : ""}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">${response}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee">${item.completedBy || "-"}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee">${item.completedAt ? format(new Date(item.completedAt), "PP p") : "-"}</td>
      </tr>`;
    }).join("");
  };

  const submissionTableHead = `<thead><tr>
    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;width:30px">#</th>
    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333">Item</th>
    <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #333;width:70px">Response</th>
    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;width:120px">Completed By</th>
    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333;width:140px">Completed At</th>
  </tr></thead>`;

  const handleExportPDF = () => {
    if (filteredSubmissions.length === 0) return;
    const title = selectedChecklistInfo?.title || "Submissions";
    const dateRange = `${format(dateFrom, "PP")} – ${format(dateTo, "PP")}`;
    const submissionBlocks = filteredSubmissions.map((s, sIdx) => {
      return `
        <div class="submission" style="${sIdx > 0 ? "page-break-before:always;" : ""}margin-bottom:32px">
          <div style="background:#f5f5f5;padding:12px 16px;border-radius:8px;margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong>${s.submittedBy}</strong>
                <span style="color:#666;margin-left:12px">${format(s.submittedAt, "PPpp")}</span>
              </div>
              <div>
                <span style="font-weight:600;color:${s.completionPercentage === 100 ? "#16a34a" : s.completionPercentage >= 80 ? "#d97706" : "#dc2626"}">${s.completionPercentage}%</span>
                <span style="color:#666;margin-left:4px">(${s.completedItems}/${s.totalItems})</span>
              </div>
            </div>
            ${s.notes ? `<p style="color:#666;font-size:12px;margin:6px 0 0">Notes: ${s.notes}</p>` : ""}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            ${submissionTableHead}
            <tbody>${buildItemRowsHtml(s.itemsSnapshot)}</tbody>
          </table>
        </div>`;
    }).join("");
    const html = wrapPDFPage({
      title,
      subtitle: `${dateRange} • ${filteredSubmissions.length} submissions • Exported ${exportSubtitleDate()}`,
      bodyHtml: submissionBlocks,
      extraStyles: ".submission { page-break-inside: avoid; }",
    });
    openPrintPDF(html);
    toast.success("PDF export opened for printing");
  };

  const handleExportSinglePDF = (s: ChecklistSubmission) => {
    const html = wrapPDFPage({
      title: s.checklistTitle,
      subtitle: `Submitted by <strong>${s.submittedBy}</strong> on ${format(s.submittedAt, "PPpp")}`,
      bodyHtml: `
        <div class="meta">Completion: ${s.completionPercentage}% (${s.completedItems}/${s.totalItems})${s.notes ? ` • Notes: ${s.notes}` : ""}</div>
        <table style="font-size:12px">${submissionTableHead}<tbody>${buildItemRowsHtml(s.itemsSnapshot)}</tbody></table>`,
    });
    openPrintPDF(html);
  };

  // ---- Version (edit) history for the opened submission ----
  const openSubmission = (submission: ChecklistSubmission) => {
    setSelectedSubmission(submission);
    const revs = submission.revisions;
    setSelectedVersion(revs && revs.length > 0 ? revs[revs.length - 1].version : null);
  };

  const viewedRevision = useMemo(() => {
    const revs = selectedSubmission?.revisions;
    if (!revs || revs.length === 0) return null;
    return revs.find(r => r.version === selectedVersion) ?? revs[revs.length - 1];
  }, [selectedSubmission, selectedVersion]);

  // The submission as it looked at the selected version
  const viewedSubmission = useMemo(() => {
    if (!selectedSubmission) return null;
    if (!viewedRevision) return selectedSubmission;
    return {
      ...selectedSubmission,
      completionPercentage: viewedRevision.completionPercentage,
      completedItems: viewedRevision.completedItems,
      totalItems: viewedRevision.totalItems,
      itemsSnapshot: viewedRevision.itemsSnapshot,
      notes: viewedRevision.notes ?? selectedSubmission.notes,
    } as ChecklistSubmission;
  }, [selectedSubmission, viewedRevision]);

  return (
    <div className="space-y-4">
      {/* Simple Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Submissions</h2>
            <p className="text-xs text-muted-foreground">
              {displayedSubmissions.length} submission{displayedSubmissions.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
              >
                Clear filters
              </Button>
            )}
            {displayedSubmissions.length > 0 && (
              <ExportDropdown
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg font-normal">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={selectedDepartments.size === 0 ? "text-muted-foreground" : ""}>
                  {selectedDepartments.size === 0 ? "Department" : `${selectedDepartments.size} selected`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search departments..." />
                <CommandList>
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    {departmentsWithSubmissions.map((dept) => {
                      const selected = selectedDepartments.has(dept.id);
                      return (
                        <CommandItem
                          key={dept.id}
                          value={dept.name}
                          onSelect={() => toggleDepartment(dept.id)}
                          className="flex items-center gap-2"
                        >
                          <div className={cn(
                            "flex items-center justify-center w-4 h-4 rounded border shrink-0",
                            selected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          )}>
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="flex-1 truncate">{dept.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Staff */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg font-normal">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={selectedUsers.size === 0 ? "text-muted-foreground" : ""}>
                  {selectedUsers.size === 0 ? "Staff" : `${selectedUsers.size} selected`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search staff..." />
                <CommandList>
                  <CommandEmpty>No staff found.</CommandEmpty>
                  <CommandGroup>
                    {usersWithSubmissions.map((user) => {
                      const selected = selectedUsers.has(user.id);
                      return (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => toggleUser(user.id)}
                          className="flex items-center gap-2"
                        >
                          <div className={cn(
                            "flex items-center justify-center w-4 h-4 rounded border shrink-0",
                            selected ? "bg-primary border-primary text-primary-foreground" : "border-border"
                          )}>
                            {selected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="flex-1 truncate">{user.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Checklist */}
          <Popover open={checklistSelectorOpen} onOpenChange={setChecklistSelectorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg font-normal max-w-[200px]">
                <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                <span className={cn("truncate", selectedChecklistId ? "" : "text-muted-foreground")}>
                  {selectedChecklistInfo?.title || "Checklist"}
                </span>
                {selectedChecklistId && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleClearChecklist(); }}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0 z-50 bg-popover" align="start">
              <Command>
                <CommandInput placeholder="Search checklists..." />
                <CommandList>
                  <CommandEmpty>No checklist found.</CommandEmpty>
                  <CommandGroup heading="With submissions">
                    {checklistsWithSubmissions.map((checklist) => {
                      const category = getDepartmentById(categories, checklist.categoryId);
                      return (
                        <CommandItem
                          key={checklist.id}
                          value={checklist.title}
                          onSelect={() => handleSelectChecklist(checklist.id)}
                          className="flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm">{checklist.title}</p>
                            <p className="text-xs text-muted-foreground">{category?.name} • {checklist.count} submissions</p>
                          </div>
                          <Check className={cn("ml-2 h-4 w-4 flex-shrink-0", selectedChecklistId === checklist.id ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs font-normal">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="critical">Missed critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg font-normal">
                <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs">
                  {format(dateFrom, "MMM d")} – {format(dateTo, "MMM d")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 space-y-3" align="end">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Today", days: 0 },
                  { label: "7d", days: 7 },
                  { label: "30d", days: 30 },
                  { label: "90d", days: 90 },
                  { label: "6m", days: 180 },
                  { label: "1y", days: 365 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => { setDateFrom(preset.days === 0 ? startOfDay(new Date()) : subDays(new Date(), preset.days)); setDateTo(new Date()); }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                      dateFrom.getTime() === (preset.days === 0 ? startOfDay(new Date()) : subDays(new Date(), preset.days)).getTime()
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-xs flex-1 justify-start gap-2 font-normal">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {format(dateFrom, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={(d) => { if (d) { setDateFrom(d); setDateFromOpen(false); } }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-xs text-muted-foreground">to</span>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-xs flex-1 justify-start gap-2 font-normal">
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {format(dateTo, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={(d) => { if (d) { setDateTo(d); setDateToOpen(false); } }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </PopoverContent>
          </Popover>

          {/* More filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 gap-1.5 rounded-lg font-normal", (frequencyFilters.length + typeFilters.length + assignmentFilters.length) > 0 && "border-primary text-primary")}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                More
                {(frequencyFilters.length + typeFilters.length + assignmentFilters.length) > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {frequencyFilters.length + typeFilters.length + assignmentFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-4 space-y-4" align="end">
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Frequency</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "daily" as FrequencyFilter, label: "Daily" },
                    { id: "weekly" as FrequencyFilter, label: "Weekly" },
                    { id: "monthly" as FrequencyFilter, label: "Monthly" },
                    { id: "quarterly" as FrequencyFilter, label: "Quarterly" },
                    { id: "yearly" as FrequencyFilter, label: "Yearly" },
                    { id: "custom" as FrequencyFilter, label: "Custom" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFrequencyFilters(toggleArrayFilter(frequencyFilters, opt.id))}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                        frequencyFilters.includes(opt.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Type</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "general" as TypeFilter, label: "General" },
                    { id: "room-setup" as TypeFilter, label: "Room Setup" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTypeFilters(toggleArrayFilter(typeFilters, opt.id))}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                        typeFilters.includes(opt.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Assignment</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "group" as AssignmentFilter, label: "Group" },
                    { id: "individual" as AssignmentFilter, label: "Individual" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAssignmentFilters(toggleArrayFilter(assignmentFilters, opt.id))}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                        assignmentFilters.includes(opt.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
            <span className="text-xs text-muted-foreground mr-1">Active:</span>
            {Array.from(selectedDepartments).map(id => (
              <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {DEFAULT_DEPARTMENTS.find(d => d.id === id)?.name}
                <button type="button" onClick={() => toggleDepartment(id)} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {Array.from(selectedUsers).map(id => (
              <Badge key={id} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {usersWithSubmissions.find(u => u.id === id)?.name}
                <button type="button" onClick={() => toggleUser(id)} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {selectedChecklistId && (
              <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {selectedChecklistInfo?.title}
                <button type="button" onClick={() => handleClearChecklist()} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {statusFilter === "complete" ? "Complete" : statusFilter === "partial" ? "Partial" : "Missed Critical"}
                <button type="button" onClick={() => setStatusFilter("all")} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {frequencyFilters.map(f => (
              <Badge key={f} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <button type="button" onClick={() => setFrequencyFilters(toggleArrayFilter(frequencyFilters, f))} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {typeFilters.map(t => (
              <Badge key={t} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {t === "room-setup" ? "Room Setup" : t.charAt(0).toUpperCase() + t.slice(1)}
                <button type="button" onClick={() => setTypeFilters(toggleArrayFilter(typeFilters, t))} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {assignmentFilters.map(a => (
              <Badge key={a} variant="secondary" className="gap-1 pr-1 text-xs font-normal">
                {a.charAt(0).toUpperCase() + a.slice(1)}
                <button type="button" onClick={() => setAssignmentFilters(toggleArrayFilter(assignmentFilters, a))} className="ml-0.5 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <>
        {/* Result toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayedSubmissions.length}</span> submission{displayedSubmissions.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Group by</span>
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {([
                { id: "date" as const, label: "Date", icon: CalendarIcon },
                { id: "status" as const, label: "Status", icon: Layers },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGroupBy(opt.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    groupBy === opt.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Submissions List */}
          {displayedSubmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm">Try adjusting the filters or date range</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(([dateLabel, submissions]) => (
                <div key={dateLabel} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {groupBy === "status" ? (
                      dateLabel === "Fully completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : dateLabel === "Missed critical items" ? (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      ) : (
                        <Circle className="w-4 h-4 text-amber-500" />
                      )
                    ) : (
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold text-sm text-muted-foreground">{dateLabel}</h3>

                    <Badge variant="secondary" className="text-xs">
                      {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {submissions.map(submission => {
                      const missedCritical = submission.itemsSnapshot.filter(i => i.critical && !i.completed);
                      
                      return (
                        <Card key={submission.id} className={cn("bg-card overflow-hidden", missedCritical.length > 0 && "border-destructive/30 bg-destructive/[0.02]")}>
                          <div
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => openSubmission(submission)}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 text-sm flex-wrap">
                                      <span className="flex items-center gap-1.5 font-medium">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        {submission.submittedBy}
                                      </span>
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {submission.checklistTitle}
                                      </span>
                                      <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {format(submission.submittedAt, "h:mm a")}
                                      </span>
                                      {(submission.revisions?.length ?? 0) > 1 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1 font-normal">
                                          <History className="w-3 h-3" />
                                          Edited · v{submission.revisions!.length}
                                        </Badge>
                                      )}
                                    </div>
                                    {submission.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {submission.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-right hidden sm:block">
                                    <div className="flex items-center gap-2 justify-end">
                                      <span className={cn("text-sm font-medium", getCompletionColor(submission.completionPercentage))}>
                                        {submission.completionPercentage}%
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        ({submission.completedItems}/{submission.totalItems})
                                      </span>
                                    </div>
                                    <Progress 
                                      value={submission.completionPercentage} 
                                      className="h-1.5 w-24 mt-1"
                                    />
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("hidden md:flex", getCompletionBg(submission.completionPercentage))}
                                  >
                                    {submission.completionPercentage === 100 ? "Complete" : "Partial"}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExportSinglePDF(submission);
                                    }}
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openSubmission(submission);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {missedCritical.length > 0 && (
                              <div className="px-4 pb-3 -mt-1">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20">
                                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                                  <span className="text-xs font-medium text-destructive">
                                    {missedCritical.length} critical item{missedCritical.length !== 1 ? "s" : ""} missed
                                  </span>
                                  <span className="text-xs text-destructive/70 hidden sm:inline">
                                    — {missedCritical.map(i => i.text).join(", ")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>

      {/* Full Details Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Submission Details
                  {viewedRevision && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      Viewing v{viewedRevision.version}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              {(selectedSubmission.revisions?.length ?? 0) > 1 && (
                <SubmissionVersionHistory
                  revisions={selectedSubmission.revisions!}
                  selectedVersion={viewedRevision?.version ?? 0}
                  onSelectVersion={setSelectedVersion}
                />
              )}

              <SubmissionChecklistView submission={viewedSubmission!} />
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
