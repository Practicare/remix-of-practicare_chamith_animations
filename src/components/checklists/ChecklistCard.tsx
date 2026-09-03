import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  RefreshCw, 
  Clock,
  User,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Check,
  X,
  Users,
  Building2,
  Globe,
  Settings,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { Checklist, ChecklistItem } from "@/types/checklists";
import { TeamMember } from "@/types/teamMembers";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChecklistPreviewDialog } from "./ChecklistPreviewDialog";
import { ItemCommentPopover } from "./ItemCommentPopover";

import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChecklistCardProps {
  checklist: Checklist;
  categoryName?: string;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onAddItem: (checklistId: string, text: string) => void;
  onDeleteItem: (checklistId: string, itemId: string) => void;
  onResetChecklist: (checklistId: string) => void;
  onUpdateItemValue: (checklistId: string, itemId: string, value: { yesNoValue?: "yes" | "no"; numberValue?: string }) => void;
  onToggleCritical?: (checklistId: string, itemId: string) => void;
  onAssign?: (checklistId: string) => void;
  onEditSettings?: (checklistId: string) => void;
  onSubmitChecklist?: (checklistId: string) => void;
  teamMembers?: TeamMember[];
  departmentNames?: Record<string, string>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ChecklistCard = ({
  checklist,
  categoryName,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onResetChecklist,
  onUpdateItemValue,
  onToggleCritical,
  onEditSettings,
  onSubmitChecklist,
  teamMembers = [],
  departmentNames = {},
  defaultOpen = false,
  onOpenChange,
}: ChecklistCardProps) => {
  const ITEMS_PER_PAGE = 10;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [newItemText, setNewItemText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(checklist.items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = checklist.items.slice(startIndex, endIndex);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const completedCount = checklist.items.filter((item) => item.completed).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const criticalCount = checklist.items.filter((item) => item.critical).length;
  const criticalIncomplete = checklist.items.filter((item) => item.critical && !item.completed).length;

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(checklist.id, newItemText.trim());
      setNewItemText("");
    }
  };

  const getStatusConfig = () => {
    if (isComplete) {
      return { 
        label: "Complete", 
        className: "bg-success/15 text-success border-success/20",
        icon: CheckCircle2
      };
    }
    if (progress > 0) {
      return { 
        label: "In Progress", 
        className: "bg-primary/15 text-primary border-primary/20",
        icon: Clock
      };
    }
    return { 
      label: "Not Started", 
      className: "bg-muted text-muted-foreground border-transparent",
      icon: Circle
    };
  };

  const getRecurringLabel = () => {
    if (!checklist.recurring) return null;
    return checklist.recurring.charAt(0).toUpperCase() + checklist.recurring.slice(1);
  };

  const getAssignmentDisplay = () => {
    if (!checklist.assignment || checklist.assignment.type === "all") {
      return { icon: Globe, label: "All Staff" };
    }
    if (checklist.assignment.type === "department") {
      const deptCount = checklist.assignment.departmentIds?.length || 0;
      return { icon: Building2, label: `${deptCount} Dept${deptCount > 1 ? 's' : ''}` };
    }
    if (checklist.assignment.type === "users") {
      const userCount = checklist.assignment.userIds?.length || 0;
      return { icon: Users, label: `${userCount} User${userCount > 1 ? 's' : ''}` };
    }
    return { icon: Globe, label: "All Staff" };
  };

  const statusConfig = getStatusConfig();
  const assignmentDisplay = getAssignmentDisplay();

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 border-border/60",
        "hover:border-primary/30 hover:shadow-md",
        isComplete && "bg-success/[0.02]"
      )}>
        <CardContent className="p-0">
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer">
              {/* Mobile Layout */}
              <div className="md:hidden p-3">
                <div className="flex items-start gap-3">
                  {/* Progress Circle */}
                  <div className="relative w-11 h-11 shrink-0">
                    <svg className="w-11 h-11 -rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className="fill-none stroke-muted/40"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        className={cn(
                          "fill-none transition-all duration-500",
                          isComplete ? "stroke-success" : "stroke-primary"
                        )}
                        strokeWidth="3"
                        strokeDasharray={`${progress * 1.13} 113`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center text-[10px] font-bold",
                      isComplete ? "text-success" : "text-foreground"
                    )}>
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn(
                        "text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors",
                        isComplete && "text-muted-foreground"
                      )}>
                        {checklist.title}
                      </h3>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )} />
                    </div>
                    
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
                      {categoryName && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                          {categoryName}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {completedCount}/{totalCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <assignmentDisplay.icon className="w-3 h-3" />
                        {assignmentDisplay.label}
                      </span>
                      {checklist.recurring && (
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" />
                          {getRecurringLabel()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Actions Row */}
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/50">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ChecklistPreviewDialog checklist={checklist} categoryName={categoryName} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSettings?.(checklist.id);
                    }}
                    className="h-7 px-2 text-[11px] gap-1 text-muted-foreground"
                  >
                    <Settings className="w-3 h-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetChecklist(checklist.id);
                    }}
                    className="h-7 px-2 text-[11px] gap-1 text-muted-foreground ml-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block p-4">
                <div className="flex items-center gap-4">
                  {/* Progress Circle */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-14 h-14 -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        className="fill-none stroke-muted/30"
                        strokeWidth="4"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        className={cn(
                          "fill-none transition-all duration-500",
                          isComplete ? "stroke-success" : "stroke-primary"
                        )}
                        strokeWidth="4"
                        strokeDasharray={`${progress * 1.508} 150.8`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center text-xs font-bold",
                      isComplete ? "text-success" : "text-foreground"
                    )}>
                      {Math.round(progress)}%
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-base group-hover:text-primary transition-colors truncate",
                          isComplete && "text-muted-foreground"
                        )}>
                          {checklist.title}
                        </h3>
                        {checklist.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {checklist.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs px-2 py-0.5 border font-medium", statusConfig.className)}
                        >
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <ChevronDown className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180"
                        )} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {criticalIncomplete > 0 && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {criticalIncomplete} Critical
                        </Badge>
                      )}
                      {categoryName && (
                        <Badge variant="secondary" className="text-xs">
                          {categoryName}
                        </Badge>
                      )}
                      {checklist.recurring && (
                        <Badge variant="outline" className="text-xs gap-1 bg-background">
                          <RefreshCw className="w-3 h-3" />
                          {getRecurringLabel()}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <assignmentDisplay.icon className="w-3.5 h-3.5" />
                        {assignmentDisplay.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {completedCount} of {totalCount} items complete
                      </span>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ChecklistPreviewDialog checklist={checklist} categoryName={categoryName} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditSettings?.(checklist.id)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetChecklist(checklist.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Checklist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/60 p-3 md:p-4 space-y-3 bg-muted/20">
              {/* Checklist Items */}
              <div className="space-y-2">
                {paginatedItems.map((item, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;
                  return (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      index={actualIndex}
                      checklistId={checklist.id}
                      onToggleItem={onToggleItem}
                      onUpdateItemValue={onUpdateItemValue}
                      onToggleCritical={onToggleCritical}
                      onDeleteItem={onDeleteItem}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-7 px-2 text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 px-2 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Add New Item - Desktop only */}
              <div className="hidden md:flex items-center gap-2 pt-2 border-t border-border/50">
                <Input
                  placeholder="Add new item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  className="flex-1 h-9 bg-background"
                />
                <Button
                  onClick={handleAddItem}
                  disabled={!newItemText.trim()}
                  size="sm"
                  className="h-9 px-4"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Item
                </Button>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Created by {checklist.createdBy}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <Clock className="w-3 h-3" />
                  <span>{format(checklist.createdAt, "MMM d, yyyy")}</span>
                </div>
              </div>

              {/* Final Submit */}
              {onSubmitChecklist && (
                <div className="pt-3 border-t border-border/50">
                  {criticalIncomplete > 0 && (
                    <div className="flex items-center gap-2 text-xs text-destructive mb-3 px-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{criticalIncomplete} critical item{criticalIncomplete !== 1 ? "s" : ""} incomplete</span>
                    </div>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubmitChecklist(checklist.id);
                    }}
                    disabled={!isComplete}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isComplete ? "Submit Checklist" : `Complete all items to submit (${completedCount}/${totalCount})`}
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

// Extracted item row component for cleaner code
interface ChecklistItemRowProps {
  item: ChecklistItem;
  index: number;
  checklistId: string;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onUpdateItemValue: (checklistId: string, itemId: string, value: { yesNoValue?: "yes" | "no"; numberValue?: string; comment?: string }) => void;
  onToggleCritical?: (checklistId: string, itemId: string) => void;
  onDeleteItem: (checklistId: string, itemId: string) => void;
}

const ChecklistItemRow = ({
  item,
  index,
  checklistId,
  onToggleItem,
  onUpdateItemValue,
  onToggleCritical,
  onDeleteItem,
}: ChecklistItemRowProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all",
        item.completed
          ? "bg-success/[0.06]"
          : "bg-muted/30 hover:bg-muted/50"
      )}
    >
      {/* Number */}
      <span className={cn(
        "w-5 text-xs font-medium tabular-nums shrink-0",
        item.completed ? "text-success" : "text-muted-foreground"
      )}>
        {index + 1}
      </span>

      {/* Item Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm leading-snug",
            item.completed && "line-through text-muted-foreground"
          )}>
            {item.text}
          </p>
          {item.critical && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
              Critical
            </Badge>
          )}
        </div>
        {item.comment && (
          <p className="mt-1 text-[11px] text-muted-foreground italic line-clamp-2">
            “{item.comment}”
          </p>
        )}
      </div>

      {/* Entry column */}
      <div className="flex items-center shrink-0 px-3 border-l border-border/60">
        <div className="flex items-center justify-center w-[104px]">
          {item.type === "tick" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleItem(checklistId, item.id);
              }}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                item.completed
                  ? "bg-success border-success text-success-foreground"
                  : "border-muted-foreground/40 text-muted-foreground hover:border-success hover:text-success"
              )}
            >
              <Check className="w-3 h-3" />
            </button>
          )}

          {item.type === "yesno" && (
            <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateItemValue(checklistId, item.id, {
                    yesNoValue: item.yesNoValue === "yes" ? undefined : "yes"
                  });
                }}
                className={cn(
                  "w-[46px] h-6 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all",
                  item.yesNoValue === "yes"
                    ? "bg-success text-success-foreground shadow-sm"
                    : "text-muted-foreground hover:text-success"
                )}
              >
                <Check className="w-3 h-3" />
                Yes
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateItemValue(checklistId, item.id, {
                    yesNoValue: item.yesNoValue === "no" ? undefined : "no"
                  });
                }}
                className={cn(
                  "w-[46px] h-6 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all",
                  item.yesNoValue === "no"
                    ? "bg-destructive text-destructive-foreground shadow-sm"
                    : "text-muted-foreground hover:text-destructive"
                )}
              >
                <X className="w-3 h-3" />
                No
              </button>
            </div>
          )}

          {item.type === "number" && (
            <Input
              type="text"
              inputMode="numeric"
              className={cn(
                "w-16 h-7 text-center text-xs rounded-lg",
                item.numberValue ? "border-success bg-success/10" : "bg-muted"
              )}
              placeholder="—"
              value={item.numberValue ?? ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateItemValue(checklistId, item.id, { numberValue: e.target.value || undefined })}
            />
          )}
        </div>

      </div>


      {/* Action column */}
      <div className="flex items-center gap-1.5 shrink-0 pl-3 border-l border-border/60">
        {/* Comment */}
        <ItemCommentPopover
          comment={item.comment}
          onSave={(comment) => onUpdateItemValue(checklistId, item.id, { comment })}
        />

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          title="Delete item"
          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(checklistId, item.id);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

