import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  Settings,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Checklist } from "@/types/checklists";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChecklistSummaryCardProps {
  checklist: Checklist;
  categoryName?: string;
  onOpen: (checklistId: string) => void;
  onEditSettings?: (checklistId: string) => void;
  onResetChecklist: (checklistId: string) => void;
  onDelete?: (checklistId: string) => void;
  onAssign?: (checklistId: string) => void;
  isAssigned?: boolean;
}

export const ChecklistSummaryCard = ({
  checklist,
  categoryName,
  onOpen,
  onEditSettings,
  onResetChecklist,
  onDelete,
  onAssign,
  isAssigned = false,
}: ChecklistSummaryCardProps) => {
  const completedCount = checklist.items.filter((item) => item.completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const criticalIncomplete = checklist.items.filter(
    (item) => item.critical && !item.completed
  ).length;

  const getStatusConfig = () => {
    if (isComplete) {
      return {
        label: "Complete",
        className: "bg-success/15 text-success border-success/20",
        icon: CheckCircle2,
        barColor: "bg-success",
      };
    }
    if (progress > 0) {
      return {
        label: "In Progress",
        className: "bg-primary/15 text-primary border-primary/20",
        icon: Clock,
        barColor: "bg-primary",
      };
    }
    return {
      label: "Not Started",
      className: "bg-muted text-muted-foreground border-transparent",
      icon: Circle,
      barColor: "bg-muted-foreground/30",
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 border-border/60",
        "hover:border-primary/30 hover:shadow-md",
        isAssigned ? "bg-primary/[0.06] border-primary/20" : "bg-card"
      )}
      onClick={() => onOpen(checklist.id)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top row: icon + title + menu */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
              isComplete
                ? "bg-success/10 text-success"
                : progress > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ClipboardList className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {checklist.title}
            </h3>
            {checklist.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {checklist.description}
              </p>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditSettings?.(checklist.id)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign?.(checklist.id)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetChecklist(checklist.id)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(checklist.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount}/{totalCount} items
            </span>
            <span
              className={cn(
                "font-medium",
                isComplete ? "text-success" : progress > 0 ? "text-primary" : "text-muted-foreground"
              )}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", statusConfig.barColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 h-5 border", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
          {criticalIncomplete > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              {criticalIncomplete}
            </Badge>
          )}
          {checklist.recurring && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5 bg-background">
              <RefreshCw className="w-2.5 h-2.5" />
              {checklist.recurring.charAt(0).toUpperCase() + checklist.recurring.slice(1)}
            </Badge>
          )}
          {categoryName && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {categoryName}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
