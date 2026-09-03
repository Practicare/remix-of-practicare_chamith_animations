import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Calendar, User, Building2, Bell, Pencil, Trash2, RefreshCw, ClipboardList } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComplianceCardProps {
  item: ComplianceItem;
  onToggleRenew?: (itemId: string) => void;
  onUpdateItem?: (itemId: string, updates: Partial<ComplianceItem>) => void;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (item: ComplianceItem) => void;
  onRenewItem?: (item: ComplianceItem) => void;
  onCreateTask?: (item: ComplianceItem) => void;
  categoryName?: string;
  categories?: ComplianceCategoryExtended[];
}

const STATUS_COLORS = {
  valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function ComplianceCard({ 
  item, 
  onToggleRenew, 
  onUpdateItem, 
  onDeleteItem, 
  onEditItem,
  onRenewItem,
  onCreateTask,
  categoryName, 
  categories 
}: ComplianceCardProps) {
  const daysUntilExpiry = differenceInDays(item.expiryDate, new Date());

  const getExpiryText = () => {
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    }
    if (daysUntilExpiry === 0) {
      return "Expires today";
    }
    if (daysUntilExpiry === 1) {
      return "Expires tomorrow";
    }
    return `Expires in ${daysUntilExpiry} days`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-2">
        {/* Header: Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">{item.title}</h4>
          <Badge className={`${STATUS_COLORS[item.status]} text-[10px] px-1.5 py-0 shrink-0`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>

        {/* Details */}
        <p className="text-xs text-muted-foreground line-clamp-1">{item.details}</p>

        {/* Key Info Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {item.level === 'practice' ? (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 shrink-0" />
              <span>Practice</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.assignee || 'Unassigned'}</span>
            </span>
          )}
          {categoryName && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              {categoryName}
            </Badge>
          )}
          {item.reminder?.enabled && (
            <span className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              <span>{item.reminder.daysBefore}d</span>
            </span>
          )}
        </div>

        {/* Expiry + Actions Row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="text-xs">
            <span className="text-muted-foreground">{format(item.expiryDate, "dd MMM yy")} · </span>
            <span className={`font-medium ${
              item.status === 'expired' ? 'text-destructive' : 
              item.status === 'expiring' ? 'text-amber-600' : 
              'text-muted-foreground'
            }`}>
              {getExpiryText()}
            </span>
          </div>
          
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditItem?.(item)}
                    className="h-7 w-7"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRenewItem?.(item)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Renew</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onCreateTask?.(item)}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create Task</TooltipContent>
              </Tooltip>
              
              <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Compliance Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteItem?.(item.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
              <Badge className={STATUS_COLORS[item.status]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
              {categoryName && (
                <Badge variant="outline" className="text-xs">
                  {categoryName}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{item.details}</p>
            
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {item.level === 'practice' ? (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>Practice-level</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{item.assignee || 'Unassigned'}</span>
                </div>
              )}
              {item.reminder?.enabled && (
                <div className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  <span>Reminder {item.reminder.daysBefore} days before</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{format(item.expiryDate, "dd MMM yyyy")}</p>
              <p className={`text-xs ${
                item.status === 'expired' ? 'text-destructive' : 
                item.status === 'expiring' ? 'text-amber-600' : 
                'text-muted-foreground'
              }`}>
                {getExpiryText()}
              </p>
            </div>
            
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditItem?.(item)}
                      className="gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit compliance item</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => onRenewItem?.(item)}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Renew
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Renew compliance item</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onCreateTask?.(item)}
                    >
                      <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create Task</TooltipContent>
                </Tooltip>
                
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Compliance Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteItem?.(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
