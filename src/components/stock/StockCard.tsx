import { StockItem, StockCategory, STATUS_COLORS, VACCINE_FUNDING_LABELS } from "@/types/stock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, differenceInDays } from "date-fns";
import { Package, MapPin, Hash, Trash2, ClipboardList, Wrench, Pencil, RefreshCw } from "lucide-react";
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

interface StockCardProps {
  item: StockItem;
  categoryName?: string;
  onDelete: (id: string) => void;
  onCreateTask: (item: StockItem) => void;
  onEditItem?: (item: StockItem) => void;
  onRenewItem?: (item: StockItem) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function StockCard({ item, categoryName, onDelete, onCreateTask, onEditItem, onRenewItem, selected, onToggleSelect }: StockCardProps) {
  const daysUntilExpiry = item.expiryDate ? differenceInDays(item.expiryDate, new Date()) : null;

  const getExpiryText = () => {
    if (daysUntilExpiry === null) return null;
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
    <div className={`relative bg-card border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow ${selected ? "border-primary ring-1 ring-primary" : "border-border"}`}>
      {onToggleSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={!!selected}
            onCheckedChange={() => onToggleSelect(item.id)}
            aria-label={`Select ${item.name}`}
            className="bg-background"
          />
        </div>
      )}
      {/* Mobile Layout */}
      <div className="md:hidden space-y-2">
        {/* Header: Name + Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">{item.name}</h4>
          <Badge className={`${STATUS_COLORS[item.status]} text-[10px] px-1.5 py-0 shrink-0`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>

        {/* Key Info Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">Qty: {item.quantity}</span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.location || "No room"}</span>
          </span>
          {item.vaccineFundingType && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              {VACCINE_FUNDING_LABELS[item.vaccineFundingType]}
            </Badge>
          )}
        </div>

        {/* Expiry + Actions Row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          {item.expiryDate ? (
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
          ) : (
            <span className="text-xs text-muted-foreground">No expiry</span>
          )}
          
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
                    onClick={() => onRenewItem?.(item)}
                    className="h-7 w-7"
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
                    size="sm"
                    onClick={() => onCreateTask(item)}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    <ClipboardList className="w-3 h-3" />
                    Task
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
      </div>

      {/* Desktop Card Layout - for grid view */}
      <div className="hidden md:block">
        {/* Header: Status + Expiry */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge className={`${STATUS_COLORS[item.status]} text-xs`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
          {item.expiryDate && (
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
          )}
        </div>
        
        {/* Title + Description */}
        <h4 className="font-semibold text-foreground mb-1 line-clamp-1">{item.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
          {categoryName && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{categoryName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Qty:</span>
            <span>{item.quantity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{item.location || "No room"}</span>
          </div>
          {item.batchNumber && (
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.batchNumber}</span>
            </div>
          )}
          {item.vaccineFundingType && (
            <div className="col-span-2">
              <Badge variant="outline" className="text-xs">
                {VACCINE_FUNDING_LABELS[item.vaccineFundingType]}
              </Badge>
            </div>
          )}
          {item.calibrationDate && (
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>Cal: {format(item.calibrationDate, "dd MMM yy")}</span>
            </div>
          )}
          {item.nextCalibrationDate && (
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className={differenceInDays(item.nextCalibrationDate, new Date()) < 30 ? "text-amber-600" : ""}>
                Next: {format(item.nextCalibrationDate, "dd MMM yy")}
              </span>
            </div>
          )}
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditItem?.(item)}
                    className="h-8 px-2.5 gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit stock item</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRenewItem?.(item)}
                    className="h-8 px-2.5 gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Renew stock item</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateTask(item)}
                    className="h-8 px-2.5 gap-1"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Task
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create task for this item</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          
          <AlertDialog>
            <TooltipProvider>
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
            </TooltipProvider>
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
      </div>
    </div>
  );
}
