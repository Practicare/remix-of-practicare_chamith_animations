import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar, User, Building2, ShieldCheck, Pencil, Trash2, RefreshCw, ClipboardList } from "lucide-react";
import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { format, differenceInDays } from "date-fns";
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

interface ComplianceBoardProps {
  items: ComplianceItem[];
  categories: ComplianceCategoryExtended[];
  onUpdateItem?: (itemId: string, updates: Partial<ComplianceItem>) => void;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (item: ComplianceItem) => void;
  onRenewItem?: (item: ComplianceItem) => void;
  onCreateTask?: (item: ComplianceItem) => void;
}

export function ComplianceBoard({
  items,
  categories,
  onUpdateItem,
  onDeleteItem,
  onEditItem,
  onRenewItem,
  onCreateTask,
}: ComplianceBoardProps) {
  // Group items by status
  const validItems = items.filter(i => i.status === 'valid');
  const expiringItems = items.filter(i => i.status === 'expiring');
  const expiredItems = items.filter(i => i.status === 'expired');

  const columns = [
    { id: "valid", title: "Valid", items: validItems, color: "bg-success" },
    { id: "expiring", title: "Expiring Soon", items: expiringItems, color: "bg-warning" },
    { id: "expired", title: "Expired", items: expiredItems, color: "bg-destructive" },
  ];

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "";
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No compliance items found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="w-[320px] shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {column.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {column.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No items
                  </div>
                ) : (
                  column.items.map((item) => {
                    const daysUntilExpiry = differenceInDays(item.expiryDate, new Date());
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{item.title}</p>
                            <TooltipProvider>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => onEditItem?.(item)}
                                    >
                                      <Pencil className="w-3 h-3 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => onRenewItem?.(item)}
                                    >
                                      <RefreshCw className="w-3 h-3 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Renew</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => onCreateTask?.(item)}
                                    >
                                      <ClipboardList className="w-3 h-3 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Create Task</TooltipContent>
                                </Tooltip>
                                <AlertDialog>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                        >
                                          <Trash2 className="w-3 h-3 text-destructive" />
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
                          
                          {getCategoryName(item.categoryId) && (
                            <Badge variant="outline" className="text-[10px]">
                              {getCategoryName(item.categoryId)}
                            </Badge>
                          )}
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {item.level === 'practice' ? (
                                <>
                                  <Building2 className="w-3 h-3" />
                                  <span>Practice-level</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3" />
                                  <span>{item.assignee || 'Unassigned'}</span>
                                </>
                              )}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs ${
                              item.status === 'expired' ? 'text-destructive' : 
                              item.status === 'expiring' ? 'text-warning' : 'text-muted-foreground'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              <span>{format(item.expiryDate, "MMM d, yyyy")}</span>
                              {item.status === 'expired' && (
                                <span className="font-medium">({Math.abs(daysUntilExpiry)}d overdue)</span>
                              )}
                              {item.status === 'expiring' && (
                                <span className="font-medium">({daysUntilExpiry}d left)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
