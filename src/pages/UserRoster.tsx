import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SegmentedControl } from "@/components/ui/segmented-control";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Coffee,
  User,
  LogOut,
  Bell,
  Building2,
  Settings,
  Menu,
  ChevronDown,
  Home,
  CheckSquare,
  LayoutGrid,
  Palmtree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { getDepartmentById, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { Shift, SwapRequest, StaffHoliday, HolidayStatus } from "@/types/roster";
import {
  mockRosters,
  mockSwapRequests,
  mockTeamMembersForRoster,
  mockDepartments,
  mockStaffHolidays,
} from "@/data/mockRosters";
import { RequestSwapDialog } from "@/components/roster/RequestSwapDialog";
import { RosterCalendarGrid } from "@/components/roster/RosterCalendarGrid";
import { DayTimeline } from "@/components/roster/DayTimeline";
import { HolidayManager } from "@/components/roster/HolidayManager";
import { UserMobileLayout } from "@/components/layout/UserMobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const UserRoster = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "timeline" | "swaps" | "holidays">("calendar");
  const isMobile = useIsMobile();

  // Roster state
  const [selectedRosterId, setSelectedRosterId] = useState<string>(
    mockRosters.find((r) => r.published)?.id || mockRosters[0]?.id || ""
  );
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(mockSwapRequests);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<Shift | null>(null);
  const [rosterPageIndex, setRosterPageIndex] = useState(0);
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<StaffHoliday[]>(mockStaffHolidays);
  const rostersPerPage = 3;

  // Filters for Calendar/Timeline views
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

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
    { id: "checklists", label: "Checklists", icon: CheckSquare, route: "/user/checklists" },
    { id: "roster", label: "Roster", icon: LayoutGrid },
    { id: "profile", label: "My Profile", icon: User, route: "/user" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route) {
      navigate(item.route);
    }
    setMobileMenuOpen(false);
  };

  // Only show published rosters to users
  const publishedRosters = mockRosters.filter((r) => r.published);
  const selectedRoster = publishedRosters.find((r) => r.id === selectedRosterId);

  // Get department members for filtering
  const departmentMembers = useMemo(() => {
    return mockTeamMembersForRoster.filter(
      (member) => member.departmentId === currentUser.departmentId
    );
  }, [currentUser.departmentId]);

  // Get current user's team member ID (for demo)
  const currentUserTeamMemberId = departmentMembers[0]?.id;

  // Get department member IDs for filtering shifts
  const departmentMemberIds = useMemo(() => {
    return new Set(departmentMembers.map(m => m.id));
  }, [departmentMembers]);

  // Filter roster to only show department shifts
  const departmentFilteredRoster = useMemo(() => {
    if (!selectedRoster) return null;
    return {
      ...selectedRoster,
      shifts: selectedRoster.shifts.filter(shift => departmentMemberIds.has(shift.teamMemberId)),
    };
  }, [selectedRoster, departmentMemberIds]);

  // Get current user's shifts
  const userShifts = useMemo(() => {
    if (!currentUser || !selectedRoster) return [];
    return selectedRoster.shifts.filter((shift) => shift.teamMemberId === currentUserTeamMemberId);
  }, [currentUser, selectedRoster, currentUserTeamMemberId]);

  // Get user's swap requests
  const userSwapRequests = swapRequests.filter(
    (req) => req.requesterId === currentUserTeamMemberId
  );
  const pendingSwaps = userSwapRequests.filter((r) => r.status === "pending").length;

  // Get user's pending holidays
  const userHolidays = holidays.filter(
    (h) => h.teamMemberId === currentUserTeamMemberId
  );
  const pendingHolidays = userHolidays.filter((h) => h.status === "pending").length;

  const handleRequestSwap = (shift: Shift) => {
    setSelectedShiftForSwap(shift);
    setSwapDialogOpen(true);
  };

  const handleSubmitSwapRequest = (
    request: Omit<SwapRequest, "id" | "createdAt" | "status">
  ) => {
    const newRequest: SwapRequest = {
      ...request,
      id: `swap-${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
    };
    setSwapRequests((prev) => [...prev, newRequest]);
    toast.success("Swap request submitted", {
      description: "Your manager will review your request.",
    });
  };

  // Holiday handlers (user can only add their own holidays as requests)
  const handleAddHoliday = (holiday: Omit<StaffHoliday, "id" | "createdAt">) => {
    const newHoliday: StaffHoliday = {
      ...holiday,
      id: `holiday-${Date.now()}`,
      createdAt: new Date(),
      status: "pending", // Always pending for user requests
    };
    setHolidays((prev) => [...prev, newHoliday]);
    toast.success("Holiday request submitted", {
      description: "Your manager will review your request.",
    });
  };

  const handleEditHoliday = (holidayId: string, updates: Partial<Omit<StaffHoliday, "id" | "createdAt">>) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === holidayId ? { ...h, ...updates } : h))
    );
    toast.success("Holiday request updated");
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    toast.success("Holiday request cancelled");
  };

  const getShiftStatusBadge = (shift: Shift) => {
    switch (shift.status) {
      case "swap-requested":
        return (
          <Badge variant="outline" className="text-warning border-warning text-[10px]">
            Swap Pending
          </Badge>
        );
      case "swapped":
        return (
          <Badge variant="outline" className="text-success border-success text-[10px]">
            Swapped
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="text-primary border-primary text-[10px]">
            Confirmed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: SwapRequest["status"]) => {
    switch (status) {
      case "approved":
        return { label: "Approved", className: "text-success border-success" };
      case "rejected":
        return { label: "Rejected", className: "text-destructive border-destructive" };
      default:
        return { label: "Pending", className: "text-warning border-warning" };
    }
  };

  // Render My Shifts list - Desktop version
  const renderMyShifts = () => (
    <div className="space-y-3">
      {userShifts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No shifts assigned for this roster</p>
        </div>
      ) : (
        userShifts
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((shift) => (
            <Card
              key={shift.id}
              className={cn(
                "transition-colors",
                isToday(new Date(shift.date))
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-2xl font-bold">
                        {format(new Date(shift.date), "d")}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(new Date(shift.date), "EEE")}
                      </p>
                      {isToday(new Date(shift.date)) && (
                        <Badge className="text-[9px] mt-1">Today</Badge>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {shift.startTime} - {shift.endTime}
                        </p>
                        {getShiftStatusBadge(shift)}
                        {shift.isOvertime && (
                          <Badge variant="destructive" className="text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overtime
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shift.location}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {shift.role}
                        </Badge>
                      </div>
                      {shift.breaks.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          Break: {shift.breaks[0].startTime} - {shift.breaks[0].endTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground hover:text-primary"
                        onClick={() => handleRequestSwap(shift)}
                        disabled={shift.status === "swap-requested"}
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Swap</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Request a shift swap</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))
      )}
    </div>
  );

  // Render My Shifts list - Mobile compact version
  const renderMobileShifts = () => (
    <div className="space-y-2">
      {userShifts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No shifts assigned</p>
        </div>
      ) : (
        userShifts
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((shift) => (
            <div
              key={shift.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                isToday(new Date(shift.date))
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border"
              )}
            >
              {/* Date Column */}
              <div className="text-center shrink-0 w-12">
                <p className="text-lg font-bold leading-none">
                  {format(new Date(shift.date), "d")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                  {format(new Date(shift.date), "EEE")}
                </p>
              </div>

              {/* Shift Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm">
                    {shift.startTime} - {shift.endTime}
                  </span>
                  {isToday(new Date(shift.date)) && (
                    <Badge className="text-[9px] h-4 px-1.5">Today</Badge>
                  )}
                  {shift.isOvertime && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1.5 gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      OT
                    </Badge>
                  )}
                  {getShiftStatusBadge(shift)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[80px]">{shift.location}</span>
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                    {shift.role}
                  </Badge>
                </div>
              </div>

              {/* Swap Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                onClick={() => handleRequestSwap(shift)}
                disabled={shift.status === "swap-requested"}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>
          ))
      )}
    </div>
  );

  // Render swap requests tab
  const renderSwapsTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            My Swap Requests
            {pendingSwaps > 0 && (
              <Badge variant="destructive" className="ml-auto text-[10px]">
                {pendingSwaps} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userSwapRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowRightLeft className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No swap requests yet</p>
              <p className="text-xs mt-1">Request a swap from your shift list</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userSwapRequests.map((request) => {
                const shift = selectedRoster?.shifts.find((s) => s.id === request.shiftId);
                const status = getStatusText(request.status);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {shift
                            ? format(new Date(shift.date), "EEE, MMM d")
                            : "Unknown"}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px]", status.className)}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shift?.startTime} - {shift?.endTime}
                      </p>
                      {request.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {request.reason}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.createdAt), "MMM d")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render holidays tab (user-specific)
  const renderHolidaysTab = () => (
    <div className="space-y-4">
      {/* Info banner explaining the approval workflow */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Palmtree className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Holiday Request Workflow</p>
              <p className="text-xs text-muted-foreground mt-1">
                Submit your holiday request below. Your manager will review and approve it before it's considered for roster planning.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-xs text-muted-foreground">Pending review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-muted-foreground">Approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-xs text-muted-foreground">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <HolidayManager
        holidays={userHolidays}
        teamMembers={[{ id: currentUserTeamMemberId, name: `${currentUser.firstName} ${currentUser.lastName}` }]}
        onAddHoliday={handleAddHoliday}
        onUpdateHolidayStatus={() => {}} // Users can't approve/reject
        onEditHoliday={handleEditHoliday}
        onDeleteHoliday={handleDeleteHoliday}
        isUserView // Hide approve/reject buttons for users
      />
    </div>
  );

  // Mobile content renderer
  const renderMobileContent = () => (
    <div className="space-y-3">
      {/* Roster Selector - Compact */}
      {publishedRosters.length > 0 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              const currentIndex = publishedRosters.findIndex(r => r.id === selectedRosterId);
              if (currentIndex > 0) {
                const prevRoster = publishedRosters[currentIndex - 1];
                setSelectedRosterId(prevRoster.id);
                setSelectedTimelineDate(new Date(prevRoster.startDate));
              }
            }}
            disabled={publishedRosters.findIndex(r => r.id === selectedRosterId) === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs px-4 min-w-[150px] font-medium rounded-full"
          >
            {publishedRosters.find(r => r.id === selectedRosterId)?.name || "Select Roster"}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              const currentIndex = publishedRosters.findIndex(r => r.id === selectedRosterId);
              if (currentIndex < publishedRosters.length - 1) {
                const nextRoster = publishedRosters[currentIndex + 1];
                setSelectedRosterId(nextRoster.id);
                setSelectedTimelineDate(new Date(nextRoster.startDate));
              }
            }}
            disabled={publishedRosters.findIndex(r => r.id === selectedRosterId) === publishedRosters.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* View Tabs - Compact with short labels */}
      <div className="flex items-center justify-center gap-1 bg-muted/50 rounded-full p-1">
        {[
          { id: "calendar", label: "Shifts", icon: Calendar },
          { id: "timeline", label: "Timeline", icon: Clock },
          { id: "swaps", label: "Swaps", icon: ArrowRightLeft, badge: pendingSwaps },
          { id: "holidays", label: "Leave", icon: Palmtree, badge: pendingHolidays },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98]",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={cn(
                "min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center",
                activeTab === tab.id 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-destructive text-destructive-foreground"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === "calendar" && departmentFilteredRoster && (
        <div className="space-y-3">
          {renderMobileShifts()}
          
          {/* Department Schedule - Collapsible on mobile */}
          <details className="group">
            <summary className="flex items-center justify-between p-3 bg-muted/30 rounded-xl cursor-pointer list-none">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Department Schedule
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-2 overflow-x-auto">
              <RosterCalendarGrid
                roster={departmentFilteredRoster}
                onShiftClick={() => {}}
                onAddShiftForDate={() => {}}
              />
            </div>
          </details>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && departmentFilteredRoster && (
        <DayTimeline
          roster={departmentFilteredRoster}
          teamMembers={departmentMembers}
          departments={mockDepartments}
          selectedDate={selectedTimelineDate}
          onDateChange={setSelectedTimelineDate}
          onShiftClick={() => {}}
          onUpdateShiftTime={() => {}}
          onDeleteShift={() => {}}
          selectedDepartment="all"
          onDepartmentChange={() => {}}
          selectedTeamMembers={selectedTeamMembers}
          onTeamMembersChange={setSelectedTeamMembers}
          readOnly
        />
      )}

      {/* Swaps Tab */}
      {activeTab === "swaps" && renderSwapsTab()}

      {/* Holidays Tab */}
      {activeTab === "holidays" && renderHolidaysTab()}
    </div>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        <UserMobileLayout title="Roster">
          <div className="p-4">
            {renderMobileContent()}
          </div>
        </UserMobileLayout>

        {/* Swap Request Dialog */}
        <RequestSwapDialog
          open={swapDialogOpen}
          onOpenChange={setSwapDialogOpen}
          shift={selectedShiftForSwap}
          teamMembers={departmentMembers}
          onSubmitRequest={handleSubmitSwapRequest}
        />
      </>
    );
  }

  // Desktop Layout
  return (
    <div className="bg-background flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
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

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                item.id === "roster"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

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
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            {/* Desktop Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                  My Roster
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View your schedule and manage swap requests
                </p>
              </div>
              <Badge variant="secondary" className="gap-1.5">
                <Calendar className="w-3 h-3" />
                {format(new Date(), "EEEE, MMM d")}
              </Badge>
            </div>

            {/* Roster Selector */}
            {publishedRosters.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setRosterPageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={rosterPageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 flex-1">
                  {publishedRosters
                    .slice(rosterPageIndex * rostersPerPage, (rosterPageIndex + 1) * rostersPerPage)
                    .map((roster) => (
                      <Button
                        key={roster.id}
                        variant={selectedRosterId === roster.id ? "default" : "outline"}
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => {
                          setSelectedRosterId(roster.id);
                          setSelectedTimelineDate(new Date(roster.startDate));
                        }}
                      >
                        {roster.name}
                      </Button>
                    ))}
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setRosterPageIndex((prev) => prev + 1)}
                  disabled={(rosterPageIndex + 1) * rostersPerPage >= publishedRosters.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* View Tabs */}
            <div className="sticky top-0 z-10 bg-background pb-3">
              <SegmentedControl
                options={[
                  { id: "calendar", label: "Calendar", icon: Calendar },
                  { id: "timeline", label: "Timeline", icon: Clock },
                  { 
                    id: "swaps", 
                    label: "Swaps", 
                    icon: ArrowRightLeft,
                    badge: pendingSwaps > 0 ? pendingSwaps : undefined,
                  },
                  { 
                    id: "holidays", 
                    label: "Holidays", 
                    icon: Palmtree,
                    badge: pendingHolidays > 0 ? pendingHolidays : undefined,
                  },
                ]}
                value={activeTab}
                onChange={(v) => setActiveTab(v as typeof activeTab)}
              />
            </div>

            {/* Calendar Tab */}
            {activeTab === "calendar" && departmentFilteredRoster && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      My Shifts This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderMyShifts()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Department Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RosterCalendarGrid
                      roster={departmentFilteredRoster}
                      onShiftClick={() => {}}
                      onAddShiftForDate={() => {}}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && departmentFilteredRoster && (
              <DayTimeline
                roster={departmentFilteredRoster}
                teamMembers={departmentMembers}
                departments={mockDepartments}
                selectedDate={selectedTimelineDate}
                onDateChange={setSelectedTimelineDate}
                onShiftClick={() => {}}
                onUpdateShiftTime={() => {}}
                onDeleteShift={() => {}}
                selectedDepartment="all"
                onDepartmentChange={() => {}}
                selectedTeamMembers={selectedTeamMembers}
                onTeamMembersChange={setSelectedTeamMembers}
                readOnly
              />
            )}

            {/* Swaps Tab */}
            {activeTab === "swaps" && renderSwapsTab()}

            {/* Holidays Tab */}
            {activeTab === "holidays" && renderHolidaysTab()}
          </div>
        </div>
      </main>

      {/* Swap Request Dialog */}
      <RequestSwapDialog
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
        shift={selectedShiftForSwap}
        teamMembers={departmentMembers}
        onSubmitRequest={handleSubmitSwapRequest}
      />
    </div>
  );
};

export default UserRoster;