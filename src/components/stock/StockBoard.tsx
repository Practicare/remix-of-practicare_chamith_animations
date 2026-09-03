import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Package, Pencil, Trash2, RefreshCw, ClipboardList } from "lucide-react";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { usePagination } from "@/hooks/usePagination";
import { StockItem, StockCategory, STATUS_COLORS, VACCINE_FUNDING_LABELS } from "@/types/stock";
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

interface StockBoardProps {
  items: StockItem[];
  categories: StockCategory[];
  onDelete: (id: string) => void;
  onCreateTask: (item: StockItem) => void;
  onEditItem?: (item: StockItem) => void;
  onRenewItem?: (item: StockItem) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

export function StockBoard({
  items,
  categories,
  onDelete,
  onCreateTask,
  onEditItem,
  onRenewItem,
  selectedIds,
  onToggleSelect,
}: StockBoardProps) {
  // Group items by status
  const validItems = items.filter(i => i.status === 'valid');
  const expiringItems = items.filter(i => i.status === 'expiring');
  const expiredItems = items.filter(i => i.status === 'expired');

  const validPag = usePagination(validItems, 15);
  const expiringPag = usePagination(expiringItems, 15);
  const expiredPag = usePagination(expiredItems, 15);

  const columns = [
    { id: "valid", title: "Valid", items: validItems, color: "bg-success", pag: validPag },
    { id: "expiring", title: "Expiring Soon", items: expiringItems, color: "bg-warning", pag: expiringPag },
    { id: "expired", title: "Expired", items: expiredItems, color: "bg-destructive", pag: expiredPag },
  ];

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "";
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No stock items found</p>
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
                  column.pag.paginated.map((item) => {
                    const daysUntilExpiry = item.expiryDate 
                      ? differenceInDays(item.expiryDate, new Date()) 
                      : null;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${selectedIds?.has(item.id) ? "border-primary ring-1 ring-primary" : ""}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              {onToggleSelect && (
                                <Checkbox
                                  checked={!!selectedIds?.has(item.id)}
                                  onCheckedChange={() => onToggleSelect(item.id)}
                                  aria-label={`Select ${item.name}`}
                                  className="mt-0.5"
                                />
                              )}
                              <p className="font-medium text-sm">{item.name}</p>
                            </div>
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
                                      onClick={() => onCreateTask(item)}
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
                                      <AlertDialogTitle>Delete Stock Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => onDelete(item.id)}
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
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {getCategoryName(item.categoryId) && (
                              <Badge variant="outline" className="text-[10px]">
                                {getCategoryName(item.categoryId)}
                              </Badge>
                            )}
                            {item.vaccineFundingType && (
                              <Badge variant="secondary" className="text-[10px]">
                                {VACCINE_FUNDING_LABELS[item.vaccineFundingType]}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="font-medium">Qty: {item.quantity}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{item.location || "No room"}</span>
                            </div>
                            {item.expiryDate && (
                              <div className={`flex items-center gap-1.5 text-xs ${
                                item.status === 'expired' ? 'text-destructive' : 
                                item.status === 'expiring' ? 'text-warning' : 'text-muted-foreground'
                              }`}>
                                <Calendar className="w-3 h-3" />
                                <span>{format(item.expiryDate, "MMM d, yyyy")}</span>
                                {item.status === 'expired' && daysUntilExpiry !== null && (
                                  <span className="font-medium">({Math.abs(daysUntilExpiry)}d overdue)</span>
                                )}
                                {item.status === 'expiring' && daysUntilExpiry !== null && (
                                  <span className="font-medium">({daysUntilExpiry}d left)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <PaginationBar
                  page={column.pag.page}
                  totalPages={column.pag.totalPages}
                  total={column.pag.total}
                  pageSize={column.pag.pageSize}
                  onPageChange={column.pag.setPage}
                />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
