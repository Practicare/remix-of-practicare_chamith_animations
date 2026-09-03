import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Memo, MEMO_TYPE_LABELS, MEMO_PRIORITY_COLORS, DEFAULT_MEMO_CATEGORIES } from "@/types/memos";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Clock,
  Eye,
  EyeOff,
  FileText,
  Newspaper,
  Megaphone,
  ScrollText,
  ChevronRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  BarChart3,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemoCardProps {
  memo: Memo;
  currentUserId: string;
  onMarkAsRead: (memoId: string) => void;
  onEdit?: (memo: Memo) => void;
  onDelete?: (memo: Memo) => void;
  onViewReadReport?: (memo: Memo) => void;
}

const typeIcons = {
  memo: FileText,
  news: Newspaper,
  announcement: Megaphone,
  policy: ScrollText,
};

export const MemoCard = ({ memo, currentUserId, onMarkAsRead, onEdit, onDelete, onViewReadReport }: MemoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasRead = memo.readBy.some((r) => r.userId === currentUserId);
  const TypeIcon = typeIcons[memo.type];
  const category = DEFAULT_MEMO_CATEGORIES.find((c) => c.id === memo.categoryId);
  const isExpired = memo.expiresAt && new Date(memo.expiresAt) < new Date();

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      memo.mandatoryRead && !hasRead && "border-destructive/50 bg-destructive/5",
      isExpired && "opacity-60"
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Mobile Layout */}
        <div className="md:hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="p-3 cursor-pointer">
              <div className="flex items-start gap-2.5">
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0",
                  memo.priority === "urgent" ? "bg-destructive/10" : "bg-primary/10"
                )}>
                  <TypeIcon className={cn(
                    "w-3.5 h-3.5",
                    memo.priority === "urgent" ? "text-destructive" : "text-primary"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-2 leading-tight mb-1.5">{memo.title}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {memo.mandatoryRead && !hasRead && (
                      <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Required
                      </Badge>
                    )}
                    {hasRead && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 gap-0.5 bg-success/10 text-success">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Read
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {memo.readBy.length}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{memo.content}</p>
              
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-3">
                <div className="flex flex-col gap-0.5">
                  <span>By: <span className="font-medium text-foreground">{memo.author}</span></span>
                  <span>{format(new Date(memo.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  {!hasRead && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(memo.id);
                      }}
                      className="h-7 text-xs gap-1 px-2"
                    >
                      <Eye className="w-3 h-3" />
                      Mark Read
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewReadReport && (
                        <DropdownMenuItem onClick={() => onViewReadReport(memo)}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Read Report
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(memo)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(memo)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {memo.targetDepartments.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memo.targetDepartments.map((dept) => (
                    <Badge key={dept} variant="outline" className="text-[9px] px-1 py-0 capitalize">
                      {dept}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </div>

        {/* Desktop Layout - Standardized */}
        <div className="hidden md:block">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  memo.priority === "urgent" ? "bg-destructive/10" : "bg-primary/10"
                )}>
                  <TypeIcon className={cn(
                    "w-5 h-5",
                    memo.priority === "urgent" ? "text-destructive" : "text-primary"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground line-clamp-1">{memo.title}</h3>
                    {memo.mandatoryRead && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Mandatory
                      </Badge>
                    )}
                    {hasRead && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Read
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {MEMO_TYPE_LABELS[memo.type]}
                    </Badge>
                    <Badge className={cn("text-xs", MEMO_PRIORITY_COLORS[memo.priority])}>
                      {memo.priority.charAt(0).toUpperCase() + memo.priority.slice(1)}
                    </Badge>
                    {category && (
                      <Badge variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {onViewReadReport && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => onViewReadReport(memo)}
                        >
                          <BarChart3 className="w-4 h-4" />
                          <Users className="w-4 h-4" />
                          {memo.readBy.length}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View read report ({memo.readBy.length} read)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {onEdit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(memo);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit memo</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {onDelete && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(memo);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete memo</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{memo.content}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-4">
                  <span>By: <span className="font-medium text-foreground">{memo.author}</span></span>
                  <span>Posted: {format(new Date(memo.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  {memo.expiresAt && (
                    <span className={cn(isExpired && "text-destructive")}>
                      {isExpired ? "Expired" : "Expires"}: {format(new Date(memo.expiresAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                {!hasRead && (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsRead(memo.id)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Mark as Read
                  </Button>
                )}
              </div>

              {memo.targetDepartments.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Target Departments:</h4>
                  <div className="flex flex-wrap gap-1">
                    {memo.targetDepartments.map((dept) => (
                      <Badge key={dept} variant="outline" className="text-xs capitalize">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
};
