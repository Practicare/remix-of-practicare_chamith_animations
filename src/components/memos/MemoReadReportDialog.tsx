import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Memo, DEFAULT_MEMO_CATEGORIES } from "@/types/memos";
import { DEFAULT_DEPARTMENTS } from "@/types/departments";
import {
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Download,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface MemoReadReportDialogProps {
  memo: Memo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalStaffCount?: number;
}

export const MemoReadReportDialog = ({
  memo,
  open,
  onOpenChange,
  totalStaffCount = 15, // Mock total staff count
}: MemoReadReportDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">("all");

  if (!memo) return null;

  const category = DEFAULT_MEMO_CATEGORIES.find((c) => c.id === memo.categoryId);
  const readCount = memo.readBy.length;
  const readPercentage = totalStaffCount > 0 ? Math.round((readCount / totalStaffCount) * 100) : 0;
  const unreadCount = totalStaffCount - readCount;

  // Mock unread staff list (in real app, this would come from staff data)
  const mockUnreadStaff = [
    { id: "staff-1", name: "Dr. Sarah Johnson" },
    { id: "staff-2", name: "Nurse Emma Wilson" },
    { id: "staff-3", name: "Dr. Michael Chen" },
    { id: "staff-4", name: "Admin Lisa Park" },
    { id: "staff-5", name: "Tech James Brown" },
  ].slice(0, unreadCount);

  const filteredReadBy = memo.readBy.filter((reader) =>
    reader.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnread = mockUnreadStaff.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Read Report
          </DialogTitle>
        </DialogHeader>

        {/* Memo Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold line-clamp-1">{memo.title}</h3>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            {category && <Badge variant="outline">{category.name}</Badge>}
            {memo.mandatoryRead && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Mandatory
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Posted {formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalStaffCount}</div>
            <div className="text-xs text-muted-foreground">Total Staff</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">{readCount}</div>
            <div className="text-xs text-muted-foreground">Have Read</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className={cn(
              "text-2xl font-bold",
              unreadCount > 0 && memo.mandatoryRead ? "text-destructive" : "text-muted-foreground"
            )}>
              {unreadCount}
            </div>
            <div className="text-xs text-muted-foreground">Not Read</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Read Progress</span>
            <span className="font-medium">{readPercentage}%</span>
          </div>
          <Progress value={readPercentage} className="h-2" />
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("read")}
              className="gap-1"
            >
              <Eye className="w-3 h-3" />
              Read
            </Button>
            <Button
              variant={filterStatus === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("unread")}
              className="gap-1"
            >
              <EyeOff className="w-3 h-3" />
              Unread
            </Button>
          </div>
        </div>

        {/* Staff List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-4">
            {/* Read Staff */}
            {(filterStatus === "all" || filterStatus === "read") && filteredReadBy.length > 0 && (
              <div className="space-y-2">
                {filterStatus === "all" && (
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 sticky top-0 bg-background py-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Read ({filteredReadBy.length})
                  </h4>
                )}
                {filteredReadBy.map((reader) => (
                  <div
                    key={reader.userId}
                    className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{reader.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          Read {formatDistanceToNow(new Date(reader.readAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reader.readAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Unread Staff */}
            {(filterStatus === "all" || filterStatus === "unread") && filteredUnread.length > 0 && (
              <div className="space-y-2">
                {filterStatus === "all" && (
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 sticky top-0 bg-background py-1 mt-4">
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                    Not Read ({filteredUnread.length})
                  </h4>
                )}
                {filteredUnread.map((staff) => (
                  <div
                    key={staff.id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg",
                      memo.mandatoryRead ? "bg-destructive/5 border-destructive/20" : "bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        memo.mandatoryRead ? "bg-destructive/20" : "bg-muted"
                      )}>
                        <EyeOff className={cn(
                          "w-4 h-4",
                          memo.mandatoryRead ? "text-destructive" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">Has not read this memo</p>
                      </div>
                    </div>
                    {memo.mandatoryRead && (
                      <Badge variant="destructive" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty States */}
            {filterStatus === "read" && filteredReadBy.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <EyeOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No one has read this memo yet</p>
              </div>
            )}

            {filterStatus === "unread" && filteredUnread.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50 text-success" />
                <p>Everyone has read this memo!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
