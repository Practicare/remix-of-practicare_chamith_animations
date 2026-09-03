import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CheckSquare,
  Check,
  User,
  Clock,
  AlertTriangle,
  Hash,
  Calendar,
  CheckCircle2,
  Circle,
  FileCheck,
  History,
  ArrowLeft,
  LogOut,
  Bell,
  Building2,
  Settings,
  Menu,
  ChevronDown,
  Home,
  ListChecks,
  ChevronsUpDown,
  X,
  TrendingUp,
  Eye,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { mockChecklists } from "@/data/mockChecklists";
import { mockChecklistSubmissions } from "@/data/mockChecklistSubmissions";
import { Checklist } from "@/types/checklists";
import { ChecklistSubmission } from "@/types/checklistSubmissions";
import { format, isToday, isYesterday, startOfDay, endOfDay, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { TaskViewSelector, ViewMode } from "@/components/tasks/TaskViewSelector";
import { UserMobileLayout } from "@/components/layout/UserMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const UserChecklists = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"active" | "submissions">("active");
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ChecklistSubmission | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Submissions tab state
  const [submissionChecklistId, setSubmissionChecklistId] = useState<string | null>(null);
  const [checklistSelectorOpen, setChecklistSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("custom");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: subMonths(new Date(), 1),
    end: new Date(),
  });

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const department = getDepartmentById(DEFAULT_DEPARTMENTS, currentUser.departmentId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out");
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/user" },
    { id: "checklists", label: "Checklists", icon: CheckSquare },
    { id: "roster", label: "Roster", icon: LayoutGrid, route: "/user/roster" },
    { id: "profile", label: "My Profile", icon: User, route: "/user" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route) {
      navigate(item.route);
    }
    setMobileMenuOpen(false);
  };

  // Filter checklists for current user
  const userChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      if (checklist.assignment?.type === "all") return true;
      if (checklist.assignment?.type === "department") {
        return checklist.assignment.departmentIds?.includes(currentUser.departmentId);
      }
      if (checklist.assignment?.type === "users") {
        return checklist.assignment.userIds?.includes(currentUser.id);
      }
      return checklist.categoryId === currentUser.departmentId;
    });
  }, [checklists, currentUser]);

  // Get the currently selected checklist from state
  const selectedChecklist = selectedChecklistId 
    ? checklists.find(c => c.id === selectedChecklistId) 
    : null;

  // Get user's checklists with submissions count (for the selector)
  const userChecklistsWithSubmissions = useMemo(() => {
    return userChecklists.map(checklist => {
      const submissionCount = mockChecklistSubmissions.filter(
        s => s.checklistId === checklist.id && 
             s.submittedBy.toLowerCase().includes(currentUser.firstName.toLowerCase())
      ).length;
      return {
        ...checklist,
        submissionCount,
      };
    }).filter(c => c.submissionCount > 0);
  }, [userChecklists, currentUser]);

  // Get selected checklist info for submissions view
  const selectedSubmissionChecklistInfo = useMemo(() => {
    if (!submissionChecklistId) return null;
    const checklist = userChecklists.find(c => c.id === submissionChecklistId);
    if (checklist) {
      const category = getDepartmentById(DEFAULT_DEPARTMENTS, checklist.categoryId);
      return { 
        id: checklist.id, 
        title: checklist.title, 
        categoryId: checklist.categoryId,
        categoryName: category?.name || "Unknown"
      };
    }
    return null;
  }, [submissionChecklistId, userChecklists]);

  // Filter submissions for submissions tab
  const filteredSubmissions = useMemo(() => {
    // Filter to only this user's submissions first
    let filtered = mockChecklistSubmissions.filter(
      s => s.submittedBy.toLowerCase().includes(currentUser.firstName.toLowerCase())
    );

    // If viewing a specific checklist, filter to that checklist
    if (submissionChecklistId) {
      filtered = filtered.filter(s => s.checklistId === submissionChecklistId);
      
      // Apply date filter
      if (viewMode === "day") {
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);
        filtered = filtered.filter(s => s.submittedAt >= dayStart && s.submittedAt <= dayEnd);
      } else if (viewMode === "week") {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        filtered = filtered.filter(s => s.submittedAt >= weekStart && s.submittedAt <= weekEnd);
      } else if (viewMode === "custom") {
        const rangeStart = startOfDay(customDateRange.start);
        const rangeEnd = endOfDay(customDateRange.end);
        filtered = filtered.filter(s => s.submittedAt >= rangeStart && s.submittedAt <= rangeEnd);
      }
    }

    // Sort by date descending
    return filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }, [submissionChecklistId, viewMode, selectedDate, customDateRange, currentUser]);

  // Group submissions by date
  const groupedSubmissions = useMemo(() => {
    const groups: Record<string, ChecklistSubmission[]> = {};
    
    filteredSubmissions.forEach(submission => {
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
  }, [filteredSubmissions]);

  // Stats for submissions view
  const submissionStats = useMemo(() => {
    const total = filteredSubmissions.length;
    const complete = filteredSubmissions.filter(s => s.completionPercentage === 100).length;
    const avgCompletion = total > 0 
      ? Math.round(filteredSubmissions.reduce((acc, s) => acc + s.completionPercentage, 0) / total)
      : 0;
    
    return { total, complete, avgCompletion };
  }, [filteredSubmissions]);

  // Checklist handlers
  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId && item.type === "tick"
                  ? {
                      ...item,
                      completed: !item.completed,
                      completedAt: !item.completed ? new Date() : undefined,
                      completedBy: !item.completed ? currentUser.firstName : undefined,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const handleYesNoChange = (checklistId: string, itemId: string, value: "yes" | "no") => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      yesNoValue: item.yesNoValue === value ? null : value,
                      completed: item.yesNoValue === value ? false : true,
                      completedAt: item.yesNoValue === value ? undefined : new Date(),
                      completedBy: item.yesNoValue === value ? undefined : currentUser.firstName,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const handleNumberChange = (checklistId: string, itemId: string, value: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      numberValue: value,
                      completed: value.trim() !== "",
                      completedAt: value.trim() !== "" ? new Date() : undefined,
                      completedBy: value.trim() !== "" ? currentUser.firstName : undefined,
                    }
                  : item
              ),
            }
          : checklist
      )
    );
  };

  const getChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter((item) => item.completed).length;
    return { completed, total: checklist.items.length, percentage: (completed / checklist.items.length) * 100 };
  };

  const hasCriticalIncomplete = (checklist: Checklist) => {
    return checklist.items.some(item => item.critical && !item.completed);
  };

  const handleSubmitChecklist = () => {
    if (selectedChecklist) {
      toast.success("Checklist submitted successfully!");
      setSelectedChecklistId(null);
    }
  };

  const handleSelectSubmissionChecklist = (checklistId: string) => {
    setSubmissionChecklistId(checklistId);
    setChecklistSelectorOpen(false);
  };

  const handleClearSubmissionChecklist = () => {
    setSubmissionChecklistId(null);
  };

  const getRecurringBadge = (recurring?: string) => {
    if (!recurring) return null;
    const colors: Record<string, string> = {
      daily: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      weekly: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      monthly: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
    return (
      <Badge variant="secondary" className={cn("text-[10px] capitalize", colors[recurring])}>
        {recurring}
      </Badge>
    );
  };

  const getCompletionBg = (percentage: number) => {
    if (percentage === 100) return "bg-success/10 text-success border-success/20";
    if (percentage >= 80) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  // Render mobile checklist detail view
  const renderMobileChecklistDetail = () => {
    if (!selectedChecklist) return null;
    
    const prog = getChecklistProgress(selectedChecklist);
    const hasCritical = hasCriticalIncomplete(selectedChecklist);

    return (
      <div className="flex flex-col h-full -m-4">
        {/* Compact Header */}
        <div className="p-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSelectedChecklistId(null)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold text-sm truncate flex-1">{selectedChecklist.title}</h2>
            <span className="text-xs font-medium text-primary shrink-0">
              {prog.completed}/{prog.total}
            </span>
          </div>
          
          <Progress value={prog.percentage} className="h-2" />
          
          {hasCritical && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-[11px] text-destructive font-medium">Critical items need attention</span>
            </div>
          )}
        </div>

        {/* Compact Items List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {selectedChecklist.items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-2.5 rounded-xl border transition-all",
                  item.completed
                    ? "bg-success/5 border-success/30"
                    : item.critical
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-card border-border"
                )}
              >
                <div className="flex items-start gap-2">
                  {/* Number & Critical indicator */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono w-4 text-center">{index + 1}</span>
                    {item.critical && !item.completed && (
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    )}
                  </div>

                  {/* Item text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs leading-relaxed",
                      item.completed && "line-through text-muted-foreground"
                    )}>
                      {item.text}
                    </p>
                    {item.completed && item.completedBy && (
                      <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <User className="w-2 h-2" />
                        {item.completedBy}
                      </p>
                    )}
                  </div>

                  {/* Input Controls */}
                  <div className="shrink-0">
                    {item.type === "tick" && (
                      <button
                        onClick={() => handleToggleChecklistItem(selectedChecklist.id, item.id)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all active:scale-95",
                          item.completed
                            ? "bg-success border-success"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 text-success-foreground" />}
                      </button>
                    )}

                    {item.type === "yesno" && (
                      <div className="flex gap-1">
                        <Button
                          variant={item.yesNoValue === "yes" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-7 px-2 text-[10px]",
                            item.yesNoValue === "yes" && "bg-success hover:bg-success/90"
                          )}
                          onClick={() => handleYesNoChange(selectedChecklist.id, item.id, "yes")}
                        >
                          Y
                        </Button>
                        <Button
                          variant={item.yesNoValue === "no" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-7 px-2 text-[10px]",
                            item.yesNoValue === "no" && "bg-destructive hover:bg-destructive/90"
                          )}
                          onClick={() => handleYesNoChange(selectedChecklist.id, item.id, "no")}
                        >
                          N
                        </Button>
                      </div>
                    )}

                    {item.type === "number" && (
                      <Input
                        type="number"
                        value={item.numberValue || ""}
                        onChange={(e) => handleNumberChange(selectedChecklist.id, item.id, e.target.value)}
                        className="w-16 h-7 text-xs px-2"
                        placeholder="#"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="border-t p-3 flex gap-2 shrink-0 bg-background safe-area-bottom">
          <Button variant="outline" size="sm" className="h-10" onClick={() => setSelectedChecklistId(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          {prog.percentage === 100 && (
            <Button size="sm" className="flex-1 h-10" onClick={handleSubmitChecklist}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Submit
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render the checklist detail view inline (Desktop)
  const renderChecklistDetail = () => {
    if (!selectedChecklist) return null;
    
    const prog = getChecklistProgress(selectedChecklist);
    const hasCritical = hasCriticalIncomplete(selectedChecklist);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSelectedChecklistId(null)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                {selectedChecklist.title}
              </h2>
              {selectedChecklist.description && (
                <p className="text-sm text-muted-foreground truncate">{selectedChecklist.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Progress value={prog.percentage} className="flex-1 h-2.5" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {prog.completed}/{prog.total}
            </span>
          </div>
          
          {hasCritical && (
            <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-xs text-destructive font-medium">Critical items require attention</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {selectedChecklist.items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  item.completed
                    ? "bg-success/5 border-success/30"
                    : item.critical
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-card border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <span className="text-xs text-muted-foreground font-mono w-5 text-center">{index + 1}</span>
                    {item.critical && (
                      <AlertTriangle className={cn(
                        "w-3.5 h-3.5",
                        item.completed ? "text-muted-foreground" : "text-destructive"
                      )} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      item.completed && "line-through text-muted-foreground"
                    )}>
                      {item.text}
                    </p>
                    {item.completed && item.completedBy && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="w-2.5 h-2.5" />
                        {item.completedBy} • {item.completedAt && format(item.completedAt, "h:mm a")}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {item.type === "tick" && (
                      <button
                        onClick={() => handleToggleChecklistItem(selectedChecklist.id, item.id)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                          item.completed
                            ? "bg-success border-success"
                            : "border-muted-foreground/30 hover:border-primary"
                        )}
                      >
                        {item.completed && <Check className="w-4 h-4 text-success-foreground" />}
                      </button>
                    )}

                    {item.type === "yesno" && (
                      <div className="flex gap-1">
                        <Button
                          variant={item.yesNoValue === "yes" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 px-3 text-xs",
                            item.yesNoValue === "yes" && "bg-success hover:bg-success/90"
                          )}
                          onClick={() => handleYesNoChange(selectedChecklist.id, item.id, "yes")}
                        >
                          Yes
                        </Button>
                        <Button
                          variant={item.yesNoValue === "no" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 px-3 text-xs",
                            item.yesNoValue === "no" && "bg-destructive hover:bg-destructive/90"
                          )}
                          onClick={() => handleYesNoChange(selectedChecklist.id, item.id, "no")}
                        >
                          No
                        </Button>
                      </div>
                    )}

                    {item.type === "number" && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          value={item.numberValue || ""}
                          onChange={(e) => handleNumberChange(selectedChecklist.id, item.id, e.target.value)}
                          className="w-24 h-8 text-sm"
                          placeholder="Enter"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex justify-between gap-3 shrink-0 bg-background">
          <Button variant="outline" onClick={() => setSelectedChecklistId(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {prog.percentage === 100 && (
            <Button onClick={handleSubmitChecklist} className="flex-1 max-w-xs">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Checklist
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render the submissions tab content
  const renderSubmissionsTab = () => (
    <div className="space-y-6">
      {/* Checklist Selector and Date Range */}
      <Card className="bg-card">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">View Checklist Submissions</h3>
              <p className="text-sm text-muted-foreground">
                Select a checklist and date range to view your completed submissions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Checklist Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Checklist</label>
                <Popover open={checklistSelectorOpen} onOpenChange={setChecklistSelectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={checklistSelectorOpen}
                      className="w-full justify-between h-auto min-h-10 py-2"
                    >
                      {selectedSubmissionChecklistInfo ? (
                        <div className="flex items-center gap-2 text-left">
                          <ListChecks className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{selectedSubmissionChecklistInfo.title}</p>
                            <p className="text-xs text-muted-foreground">{selectedSubmissionChecklistInfo.categoryName}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Search and select a checklist...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search checklists..." />
                      <CommandList>
                        <CommandEmpty>No checklist found.</CommandEmpty>
                        <CommandGroup heading="Your Checklists">
                          {userChecklistsWithSubmissions.map((checklist) => {
                            const category = getDepartmentById(DEFAULT_DEPARTMENTS, checklist.categoryId);
                            return (
                              <CommandItem
                                key={checklist.id}
                                value={checklist.title}
                                onSelect={() => handleSelectSubmissionChecklist(checklist.id)}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <ListChecks className="w-4 h-4 text-primary flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{checklist.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {category?.name} • {checklist.submissionCount} submissions
                                    </p>
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-2 h-4 w-4 flex-shrink-0",
                                    submissionChecklistId === checklist.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                        <CommandGroup heading="All Assigned Checklists">
                          {userChecklists
                            .filter(c => !userChecklistsWithSubmissions.find(cs => cs.id === c.id))
                            .map((checklist) => {
                              const category = getDepartmentById(DEFAULT_DEPARTMENTS, checklist.categoryId);
                              return (
                                <CommandItem
                                  key={checklist.id}
                                  value={checklist.title}
                                  onSelect={() => handleSelectSubmissionChecklist(checklist.id)}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="truncate">{checklist.title}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {category?.name} • No submissions yet
                                      </p>
                                    </div>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4 flex-shrink-0",
                                      submissionChecklistId === checklist.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              );
                            })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <TaskViewSelector
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  customDateRange={customDateRange}
                  onCustomDateRangeChange={setCustomDateRange}
                />
              </div>
            </div>

            {/* Selected Checklist Badge */}
            {selectedSubmissionChecklistInfo && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Viewing:</span>
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  <ListChecks className="w-3 h-3" />
                  {selectedSubmissionChecklistInfo.title}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={handleClearSubmissionChecklist}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {!submissionChecklistId ? (
        // Empty state - prompt to select a checklist
        <div className="text-center py-16 text-muted-foreground">
          <ListChecks className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg text-foreground mb-2">Select a Checklist</h3>
          <p className="text-sm max-w-md mx-auto">
            Use the search above to find and select a checklist, then choose a date range to view your completed submissions.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{submissionStats.total}</p>
                    <p className="text-xs text-muted-foreground">Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{submissionStats.complete}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{submissionStats.avgCompletion}%</p>
                    <p className="text-xs text-muted-foreground">Avg %</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm">Try adjusting the date range</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(([dateLabel, submissions]) => (
                <div key={dateLabel} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateLabel}
                    <Badge variant="secondary" className="text-[10px]">
                      {submissions.length}
                    </Badge>
                  </h3>
                  
                  <div className="space-y-2">
                    {submissions.map((submission) => (
                      <Card
                        key={submission.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border",
                                getCompletionBg(submission.completionPercentage)
                              )}>
                                {submission.completionPercentage}%
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{submission.checklistTitle}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(submission.submittedAt, "h:mm a")}
                                  <span className="mx-1">•</span>
                                  {submission.completedItems}/{submission.totalItems} items
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render compact mobile checklist cards
  const renderMobileChecklistCards = () => (
    <div className="space-y-2">
      {userChecklists.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No checklists assigned</p>
        </div>
      ) : (
        userChecklists.map((checklist) => {
          const prog = getChecklistProgress(checklist);
          const hasCritical = hasCriticalIncomplete(checklist);
          const isComplete = prog.percentage === 100;
          
          return (
            <div
              key={checklist.id}
              onClick={() => setSelectedChecklistId(checklist.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors active:scale-[0.98]",
                isComplete
                  ? "bg-success/5 border-success/30"
                  : hasCritical
                    ? "bg-card border-destructive/30"
                    : "bg-card border-border"
              )}
            >
              {/* Progress Circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0",
                isComplete 
                  ? "border-success bg-success/10 text-success"
                  : prog.percentage >= 50
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
              )}>
                {Math.round(prog.percentage)}%
              </div>

              {/* Checklist Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm truncate max-w-[140px]">
                    {checklist.title}
                  </span>
                  {isComplete && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{prog.completed}/{prog.total} items</span>
                  {hasCritical && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1.5 gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Critical
                    </Badge>
                  )}
                  {getRecurringBadge(checklist.recurring)}
                </div>
              </div>

              {/* Arrow indicator */}
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 shrink-0" />
            </div>
          );
        })
      )}
    </div>
  );

  // Render mobile submissions list
  const renderMobileSubmissionsList = () => {
    if (!submissionChecklistId) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm text-foreground mb-1">Select a Checklist</p>
          <p className="text-xs">Choose a checklist above to view your submissions</p>
        </div>
      );
    }

    if (filteredSubmissions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No submissions found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Stats Row - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-primary/10 text-center">
            <p className="text-lg font-bold text-primary">{submissionStats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-2.5 rounded-xl bg-success/10 text-center">
            <p className="text-lg font-bold text-success">{submissionStats.complete}</p>
            <p className="text-[10px] text-muted-foreground">Complete</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-center">
            <p className="text-lg font-bold text-amber-600">{submissionStats.avgCompletion}%</p>
            <p className="text-[10px] text-muted-foreground">Avg</p>
          </div>
        </div>

        {/* Submissions List */}
        {Object.entries(groupedSubmissions).map(([dateLabel, submissions]) => (
          <div key={dateLabel} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 px-1">
              <Calendar className="w-3 h-3" />
              {dateLabel}
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-auto">
                {submissions.length}
              </Badge>
            </h3>
            {submissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card active:scale-[0.98] transition-all"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border",
                  getCompletionBg(submission.completionPercentage)
                )}>
                  {submission.completionPercentage}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{submission.checklistTitle}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(submission.submittedAt, "h:mm a")}
                    <span className="mx-0.5">•</span>
                    {submission.completedItems}/{submission.totalItems}
                  </p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Render mobile content
  const renderMobileContent = () => (
    <div className="space-y-3">
      {/* View Tabs - Compact pill-shaped like Roster */}
      <div className="flex items-center justify-center gap-1 bg-muted/50 rounded-full p-1">
        {[
          { id: "active", label: "Active", icon: FileCheck, badge: userChecklists.length },
          { id: "submissions", label: "History", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98]",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className={cn(
                "min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center",
                activeTab === tab.id 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Checklists Tab */}
      {activeTab === "active" && renderMobileChecklistCards()}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <div className="space-y-3">
          {/* Checklist Selector - Compact */}
          <Popover open={checklistSelectorOpen} onOpenChange={setChecklistSelectorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 justify-between text-xs rounded-xl"
              >
                {selectedSubmissionChecklistInfo ? (
                  <span className="flex items-center gap-2 truncate">
                    <ListChecks className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{selectedSubmissionChecklistInfo.title}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select checklist...</span>
                )}
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="center">
              <Command>
                <CommandInput placeholder="Search..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No checklist found.</CommandEmpty>
                  <CommandGroup>
                    {userChecklistsWithSubmissions.map((checklist) => (
                      <CommandItem
                        key={checklist.id}
                        value={checklist.title}
                        onSelect={() => handleSelectSubmissionChecklist(checklist.id)}
                        className="text-sm"
                      >
                        <ListChecks className="w-3.5 h-3.5 text-primary mr-2" />
                        <span className="truncate flex-1">{checklist.title}</span>
                        <Check
                          className={cn(
                            "ml-2 h-3.5 w-3.5",
                            submissionChecklistId === checklist.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Date Filter - Compact */}
          {submissionChecklistId && (
            <TaskViewSelector
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              customDateRange={customDateRange}
              onCustomDateRangeChange={setCustomDateRange}
            />
          )}

          {/* Submissions List */}
          {renderMobileSubmissionsList()}
        </div>
      )}
    </div>
  );

  // Render the main checklist list view (Desktop)
  const renderChecklistList = () => (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="sticky top-0 z-10 bg-background pb-3">
        <SegmentedControl
          options={[
            { id: "active", label: "Active", icon: FileCheck },
            { id: "submissions", label: "Submissions", icon: History },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(v as "active" | "submissions")}
        />
      </div>

      {/* Active Checklists */}
      {activeTab === "active" && (
        <div className="space-y-3">
          {userChecklists.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No checklists assigned to you</p>
              </CardContent>
            </Card>
          ) : (
            userChecklists.map((checklist) => {
              const prog = getChecklistProgress(checklist);
              const hasCritical = hasCriticalIncomplete(checklist);
              return (
                <Card
                  key={checklist.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    prog.percentage === 100 && "border-success/50 bg-success/5",
                    hasCritical && prog.percentage < 100 && "border-l-4 border-l-destructive"
                  )}
                  onClick={() => setSelectedChecklistId(checklist.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {prog.percentage === 100 ? (
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <h3 className="font-medium text-sm truncate">{checklist.title}</h3>
                        </div>
                        {checklist.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 ml-6 mb-2">
                            {checklist.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 ml-6">
                          {getRecurringBadge(checklist.recurring)}
                          {hasCritical && (
                            <Badge variant="destructive" className="text-[10px] gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Critical
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {prog.completed}/{prog.total}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {Math.round(prog.percentage)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={prog.percentage} className="mt-3 h-1.5" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && renderSubmissionsTab()}
    </div>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        <UserMobileLayout title="Checklists">
          <div className="p-4 h-full">
            {selectedChecklist ? renderMobileChecklistDetail() : renderMobileContent()}
          </div>
        </UserMobileLayout>

        {/* Submission Detail Dialog - Mobile optimized */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-y-auto rounded-2xl p-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="truncate">{selectedSubmission?.checklistTitle}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{format(new Date(selectedSubmission.submittedAt), "MMM d 'at' h:mm a")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completion</span>
                  <Badge variant="secondary" className="text-[10px]">{selectedSubmission.completionPercentage}%</Badge>
                </div>
                {selectedSubmission.notes && (
                  <div className="p-2.5 rounded-lg bg-muted">
                    <p className="text-xs">{selectedSubmission.notes}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium">Items</h4>
                  {selectedSubmission.itemsSnapshot.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs",
                        item.completed ? "bg-success/5 border-success/30" : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={cn(item.completed && "line-through text-muted-foreground")}>
                            {item.text}
                          </p>
                          {item.completedBy && (
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {item.completedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop Layout
  return (
    <div className="bg-background flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
        {/* User Profile Section */}
        <div className="h-[72px] px-4 border-b border-border flex items-center">
          <div 
            className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg w-full cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => navigate("/user")}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(currentUser.firstName, currentUser.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-1">
                {currentUser.firstName} {currentUser.lastName}
                <Settings className="w-3 h-3 text-muted-foreground" />
              </p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                item.id === "checklists"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Department Badge */}
        {department && (
          <div className="p-4 border-t border-border">
            <Badge variant="outline" className="w-full justify-center gap-1.5 py-1.5">
              <Building2 className="w-3 h-3" />
              {department.name}
            </Badge>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 h-full">
          <div className="max-w-4xl mx-auto h-full">
            {/* Page Header */}
            {!selectedChecklist && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-semibold flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-primary" />
                    My Checklists
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your assigned checklists and view submission history
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(), "EEEE, MMM d")}
                </Badge>
              </div>
            )}

            {/* Content */}
            {selectedChecklist ? renderChecklistDetail() : renderChecklistList()}
          </div>
        </div>
      </main>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              {selectedSubmission?.checklistTitle}
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span>{format(new Date(selectedSubmission.submittedAt), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <Badge variant="secondary">{selectedSubmission.completionPercentage}%</Badge>
              </div>
              {selectedSubmission.notes && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">{selectedSubmission.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Items</h4>
                {selectedSubmission.itemsSnapshot.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      item.completed ? "bg-success/5 border-success/30" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={cn(item.completed && "line-through text-muted-foreground")}>
                          {item.text}
                        </p>
                        {item.completedBy && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {item.completedBy} • {item.completedAt && format(new Date(item.completedAt), "h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserChecklists;