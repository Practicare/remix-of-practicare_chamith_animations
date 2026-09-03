import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Newspaper,
  FileText,
  Bell,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { mockMemos } from "@/data/mockMemos";
import { Memo } from "@/types/memos";
import { format, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { TaskViewSelector, ViewMode } from "@/components/tasks/TaskViewSelector";

interface UserMemoListProps {
  preview?: boolean;
  limit?: number;
}

export function UserMemoList({ preview = false, limit }: UserMemoListProps) {
  const { currentUser } = useUser();
  const [memos, setMemos] = useState<Memo[]>(mockMemos);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  
  // Date filter state
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (!currentUser) return null;

  // Helper to check if memo falls within date range
  const isMemoInDateRange = (memo: Memo): boolean => {
    const memoDate = new Date(memo.createdAt);
    if (viewMode === "day") {
      return isWithinInterval(memoDate, {
        start: startOfDay(selectedDate),
        end: endOfDay(selectedDate),
      });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return isWithinInterval(memoDate, { start: weekStart, end: weekEnd });
    } else if (viewMode === "custom" && customDateRange) {
      return isWithinInterval(memoDate, {
        start: startOfDay(customDateRange.start),
        end: endOfDay(customDateRange.end),
      });
    }
    return true;
  };

  // Filter memos targeted to user's department or all
  const userMemos = memos.filter((memo) => {
    if (memo.targetDepartments.length === 0) return true;
    return memo.targetDepartments.includes(currentUser.departmentId);
  });

  // Filter by date range
  const dateFilteredMemos = userMemos.filter(isMemoInDateRange);

  // Sort by: unread first, then by date
  const sortedMemos = [...dateFilteredMemos].sort((a, b) => {
    const aRead = a.readBy.some((r) => r.userId === currentUser.id);
    const bRead = b.readBy.some((r) => r.userId === currentUser.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayMemos = limit ? sortedMemos.slice(0, limit) : sortedMemos;

  const isRead = (memo: Memo) => memo.readBy.some((r) => r.userId === currentUser.id);

  const getTypeIcon = (type: Memo["type"]) => {
    switch (type) {
      case "policy":
        return <FileText className="w-4 h-4" />;
      case "news":
        return <Newspaper className="w-4 h-4" />;
      case "announcement":
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Memo["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-destructive";
      case "high":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  const handleMarkAsRead = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) =>
        memo.id === memoId
          ? {
              ...memo,
              readBy: [
                ...memo.readBy,
                {
                  userId: currentUser.id,
                  userName: `${currentUser.firstName} ${currentUser.lastName}`,
                  readAt: new Date(),
                },
              ],
            }
          : memo
      )
    );
    toast.success("Marked as read");
  };

  const handleOpenMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    // Auto-mark as read when opened
    if (!isRead(memo)) {
      handleMarkAsRead(memo.id);
    }
  };

  if (displayMemos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Newspaper className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No memos or news for you</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Date Filter - Only show in full view */}
        {!preview && (
          <TaskViewSelector
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
          />
        )}
        
        <div className={cn("space-y-2", preview && "")}>
          {displayMemos.map((memo) => {
          const read = isRead(memo);

          return (
            <div
              key={memo.id}
              className={cn(
                "p-3 md:p-4 rounded-xl border transition-all cursor-pointer",
                read
                  ? "bg-card border-border"
                  : "bg-primary/5 border-primary/30 hover:border-primary/50"
              )}
              onClick={() => handleOpenMemo(memo)}
            >
              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      read ? "bg-muted" : memo.mandatoryRead ? "bg-destructive/10" : "bg-primary/10"
                    )}
                  >
                    {getTypeIcon(memo.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={cn(
                          "text-sm font-medium line-clamp-1 flex-1",
                          !read && "font-semibold"
                        )}
                      >
                        {memo.title}
                      </h4>
                      {!read && (
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          memo.mandatoryRead ? "bg-destructive" : "bg-primary"
                        )} />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {memo.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(memo.createdAt, { addSuffix: true })}
                      </span>
                      <span className="truncate">
                        {memo.author}
                      </span>
                    </div>
                    
                    {/* Action row - prominent for mandatory */}
                    <div className="mt-2">
                      {!read ? (
                        memo.mandatoryRead ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full h-8 text-xs gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(memo.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            I have read this memo
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] gap-1 px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(memo.id);
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as Read
                          </Button>
                        )
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-6 gap-1 bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-start gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg shrink-0",
                    read ? "bg-muted" : memo.mandatoryRead ? "bg-destructive/10" : "bg-primary/10"
                  )}
                >
                  {getTypeIcon(memo.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "text-sm font-medium truncate",
                          !read && "font-semibold"
                        )}
                      >
                        {memo.title}
                      </h4>
                      {!read && (
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          memo.mandatoryRead ? "bg-destructive" : "bg-primary"
                        )} />
                      )}
                      {memo.mandatoryRead && !read && (
                        <Badge variant="destructive" className="text-[10px]">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!read ? (
                        memo.mandatoryRead ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(memo.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            I have read this memo
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(memo.id);
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as Read
                          </Button>
                        )
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1 bg-success/10 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {memo.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(memo.createdAt, { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {memo.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Memo Detail Dialog */}
      <Dialog open={!!selectedMemo} onOpenChange={(open) => !open && setSelectedMemo(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                {selectedMemo && getTypeIcon(selectedMemo.type)}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg">{selectedMemo?.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {selectedMemo?.type}
                  </Badge>
                  {selectedMemo?.mandatoryRead && (
                    <Badge variant="destructive" className="text-[10px]">
                      Mandatory
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", getPriorityColor(selectedMemo?.priority || "normal"))}
                  >
                    {selectedMemo?.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {selectedMemo?.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selectedMemo && format(selectedMemo.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMemo?.content}
                </p>
              </div>

              {/* Read Status */}
              {selectedMemo && isRead(selectedMemo) && (
                <div className="flex items-center gap-2 text-xs text-success p-3 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have read this memo</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setSelectedMemo(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
