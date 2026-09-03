import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import {
  Calendar,
  Clock,
  ArrowRightLeft,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Shift, SwapRequest } from "@/types/roster";
import { mockRosters, mockSwapRequests, mockTeamMembersForRoster, mockDepartments } from "@/data/mockRosters";
import { RequestSwapDialog } from "@/components/roster/RequestSwapDialog";
import { RosterCalendarGrid } from "@/components/roster/RosterCalendarGrid";
import { DayTimeline } from "@/components/roster/DayTimeline";

interface UserRosterViewProps {
  preview?: boolean;
  limit?: number;
}

export function UserRosterView({ preview = false, limit }: UserRosterViewProps) {
  const { currentUser } = useUser();
  const [selectedRosterId, setSelectedRosterId] = useState<string>(
    mockRosters.find((r) => r.published)?.id || mockRosters[0]?.id || ""
  );
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(mockSwapRequests);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<Shift | null>(null);
  const [rosterPageIndex, setRosterPageIndex] = useState(0);
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<Date>(new Date());
  const rostersPerPage = 3;

  // Timeline filter states
  const [timelineDepartment, setTimelineDepartment] = useState<string>("all");
  const [timelineTeamMembers, setTimelineTeamMembers] = useState<string[]>([]);

  // Only show published rosters to users
  const publishedRosters = mockRosters.filter((r) => r.published);
  const selectedRoster = publishedRosters.find((r) => r.id === selectedRosterId);

  // Get current user's team member ID (for demo)
  const currentUserTeamMemberId = mockTeamMembersForRoster[0]?.id;

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

  // Preview mode - show upcoming shifts
  if (preview) {
    const upcomingShifts = userShifts
      .filter((shift) => new Date(shift.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit || 3);

    if (upcomingShifts.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming shifts</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {upcomingShifts.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-center min-w-[40px]">
                <p className="text-lg font-bold">{format(new Date(shift.date), "d")}</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {format(new Date(shift.date), "EEE")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {shift.startTime} - {shift.endTime}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {shift.location}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {shift.role}
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  // Full roster view with tabs
  return (
    <div className="space-y-3 md:space-y-6">
      {/* Roster Selector - Horizontal scroll on mobile, paginated on desktop */}
      {publishedRosters.length > 0 && (
        <>
          {/* Mobile: Arrow navigation with current roster display */}
          <div className="md:hidden flex items-center justify-center gap-2">
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
              className="h-8 text-xs px-4 min-w-[160px]"
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
          
          {/* Desktop: Paginated */}
          <div className="hidden md:flex items-center gap-2">
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
        </>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="my-shifts" className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          {/* Mobile: Compact icon-only tabs */}
          <TabsList className="md:hidden h-9 p-0.5 w-full grid grid-cols-4">
            <TabsTrigger value="my-shifts" className="h-8 gap-1 text-[11px] px-2">
              <Clock className="h-3.5 w-3.5" />
              <span>My Shifts</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="h-8 gap-1 text-[11px] px-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="h-8 gap-1 text-[11px] px-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="swaps" className="h-8 gap-1 text-[11px] px-2 relative">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Swaps</span>
              {pendingSwaps > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center">
                  {pendingSwaps}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Desktop: Full tabs */}
          <TabsList className="hidden md:flex">
            <TabsTrigger value="my-shifts" className="gap-2">
              <Clock className="h-4 w-4" />
              My Shifts
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="swaps" className="gap-2 relative">
              <ArrowRightLeft className="h-4 w-4" />
              My Swaps
              {pendingSwaps > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {pendingSwaps}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Shifts Tab - User-specific view */}
        <TabsContent value="my-shifts" className="space-y-3 md:space-y-4 mt-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              My Shifts
            </h3>
            {pendingSwaps > 0 && (
              <Badge variant="outline" className="text-warning border-warning gap-1 text-[10px] h-6">
                <ArrowRightLeft className="w-3 h-3" />
                {pendingSwaps} pending swap{pendingSwaps > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          
          {/* Desktop: Card wrapper */}
          <Card className="hidden md:block">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  My Shifts
                </CardTitle>
                {pendingSwaps > 0 && (
                  <Badge variant="outline" className="text-warning border-warning gap-1">
                    <ArrowRightLeft className="w-3 h-3" />
                    {pendingSwaps} pending swap{pendingSwaps > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userShifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No shifts assigned for this roster</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userShifts
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((shift) => (
                      <div
                        key={shift.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors",
                          isToday(new Date(shift.date))
                            ? "bg-primary/5 border-primary/30"
                            : "bg-card hover:bg-muted/50"
                        )}
                      >
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
                              <span className="hidden sm:inline">Request Swap</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {shift.status === "swap-requested"
                              ? "Swap already requested"
                              : "Request to swap this shift"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Mobile: Compact shift cards without Card wrapper */}
          <div className="md:hidden space-y-2">
            {userShifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No shifts assigned for this roster</p>
              </div>
            ) : (
              userShifts
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((shift) => (
                  <div
                    key={shift.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      isToday(new Date(shift.date))
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Date column */}
                      <div className="text-center min-w-[40px] shrink-0">
                        <p className="text-xl font-bold leading-none">
                          {format(new Date(shift.date), "d")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                          {format(new Date(shift.date), "EEE")}
                        </p>
                      </div>
                      
                      {/* Content column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">
                            {shift.startTime} - {shift.endTime}
                          </p>
                          {getShiftStatusBadge(shift)}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {shift.location}
                          </span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {shift.role}
                          </Badge>
                        </div>
                        
                        {shift.breaks.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Coffee className="w-3 h-3" />
                            Break: {shift.breaks[0].startTime} - {shift.breaks[0].endTime}
                          </p>
                        )}
                      </div>
                      
                      {/* Swap button */}
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
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        {/* Calendar Tab - Uses shared RosterCalendarGrid component */}
        <TabsContent value="calendar" className="space-y-4 mt-0">
          {selectedRoster ? (
            <RosterCalendarGrid
              roster={selectedRoster}
              onShiftClick={() => {}}
              onAddShiftForDate={() => {}}
            />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Published Rosters</h3>
              <p className="mb-4">No rosters have been published yet</p>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab - Uses shared DayTimeline component */}
        <TabsContent value="timeline" className="space-y-4 mt-0">
          {selectedRoster ? (
            <DayTimeline
              roster={selectedRoster}
              selectedDate={selectedTimelineDate}
              onDateChange={setSelectedTimelineDate}
              onShiftClick={() => {}}
              onUpdateShiftTime={() => {}}
              onDeleteShift={() => {}}
              onAddShift={() => {}}
              teamMembers={mockTeamMembersForRoster}
              departments={mockDepartments}
              selectedDepartment={timelineDepartment}
              onDepartmentChange={setTimelineDepartment}
              selectedTeamMembers={timelineTeamMembers}
              onTeamMembersChange={setTimelineTeamMembers}
              readOnly
            />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Published Rosters</h3>
              <p className="mb-4">No rosters have been published yet</p>
            </div>
          )}
        </TabsContent>

        {/* My Swaps Tab - User-specific view */}
        <TabsContent value="swaps" className="space-y-3 md:space-y-4 mt-0">
          {/* Desktop: Card wrapper */}
          <Card className="hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                My Swap Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userSwapRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>You haven't submitted any swap requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSwapRequests
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((request) => {
                      const shift = selectedRoster?.shifts.find((s) => s.id === request.shiftId);
                      const statusInfo = getStatusText(request.status);
                      return (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div>
                            <p className="font-medium">
                              {shift ? format(new Date(shift.date), "EEE, MMM d") : "Unknown Shift"}
                            </p>
                            {shift && (
                              <p className="text-sm text-muted-foreground">
                                {shift.startTime} - {shift.endTime} at {shift.location}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {request.reason}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {format(new Date(request.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant="outline" className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Mobile: Compact without Card wrapper */}
          <div className="md:hidden">
            <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              My Swap Requests
            </h3>
            {userSwapRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No swap requests submitted</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userSwapRequests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((request) => {
                    const shift = selectedRoster?.shifts.find((s) => s.id === request.shiftId);
                    const statusInfo = getStatusText(request.status);
                    return (
                      <div
                        key={request.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">
                              {shift ? format(new Date(shift.date), "EEE, MMM d") : "Unknown"}
                            </p>
                            {shift && (
                              <p className="text-xs text-muted-foreground truncate">
                                {shift.startTime} - {shift.endTime} • {shift.location}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                              {request.reason}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn(statusInfo.className, "text-[10px] shrink-0")}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <RequestSwapDialog
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
        shift={selectedShiftForSwap}
        teamMembers={mockTeamMembersForRoster}
        onSubmitRequest={handleSubmitSwapRequest}
      />
    </div>
  );
}
