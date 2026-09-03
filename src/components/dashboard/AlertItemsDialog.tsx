import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, ClipboardList, Package, ExternalLink, Calendar, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Import mock data
import { mockComplianceItems } from "@/data/mockCompliance";
import { mockStockItems } from "@/data/mockStock";
import { mockTasks } from "@/data/mockTasks";

export type AlertType = "expired" | "expiring" | "overdue-tasks" | "stock-alerts";

interface AlertItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertType: AlertType | null;
}

interface AlertItem {
  id: string;
  title: string;
  subtitle?: string;
  status: "expired" | "expiring" | "overdue" | "valid";
  date?: Date;
  assignee?: string;
  location?: string;
  module: "compliance" | "stock" | "tasks";
}

const alertConfig = {
  expired: {
    title: "Expired Items",
    description: "Items that have passed their expiry date and require immediate attention",
    icon: AlertCircle,
    severity: "critical",
    badgeClass: "bg-destructive text-destructive-foreground",
  },
  expiring: {
    title: "Expiring Soon",
    description: "Items expiring within the next 30 days",
    icon: Clock,
    severity: "warning",
    badgeClass: "bg-warning text-warning-foreground",
  },
  "overdue-tasks": {
    title: "Overdue Tasks",
    description: "Tasks that are past their due date",
    icon: ClipboardList,
    severity: "warning",
    badgeClass: "bg-warning text-warning-foreground",
  },
  "stock-alerts": {
    title: "Stock Alerts",
    description: "Stock items that are expired or expiring soon",
    icon: Package,
    severity: "info",
    badgeClass: "bg-primary/10 text-primary",
  },
};

function getAlertItems(alertType: AlertType): AlertItem[] {
  const today = new Date();

  switch (alertType) {
    case "expired":
      return mockComplianceItems
        .filter((item) => item.status === "expired")
        .map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.categoryName,
          status: "expired" as const,
          date: item.expiryDate,
          assignee: item.assignee,
          module: "compliance" as const,
        }));

    case "expiring":
      return mockComplianceItems
        .filter((item) => item.status === "expiring")
        .map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.categoryName,
          status: "expiring" as const,
          date: item.expiryDate,
          assignee: item.assignee,
          module: "compliance" as const,
        }));

    case "overdue-tasks":
      return mockTasks
        .filter((task) => !task.completed && task.dueDate < today)
        .map((task) => ({
          id: task.id,
          title: task.title,
          subtitle: task.assignee,
          status: "overdue" as const,
          date: task.dueDate,
          assignee: task.assignee,
          module: "tasks" as const,
        }));

    case "stock-alerts":
      return mockStockItems
        .filter((item) => item.status === "expired" || item.status === "expiring")
        .map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.description,
          status: item.status === "expired" ? ("expired" as const) : ("expiring" as const),
          date: item.expiryDate,
          location: item.location,
          module: "stock" as const,
        }));

    default:
      return [];
  }
}

const statusStyles = {
  expired: "bg-destructive/10 text-destructive border-destructive/30",
  expiring: "bg-warning/10 text-warning border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  valid: "bg-success/10 text-success border-success/30",
};

export function AlertItemsDialog({ open, onOpenChange, alertType }: AlertItemsDialogProps) {
  const navigate = useNavigate();

  if (!alertType) return null;

  const config = alertConfig[alertType];
  const items = getAlertItems(alertType);
  const Icon = config.icon;

  const handleViewItem = (item: AlertItem) => {
    onOpenChange(false);
    switch (item.module) {
      case "compliance":
        navigate("/compliance");
        break;
      case "stock":
        navigate("/stock");
        break;
      case "tasks":
        navigate("/tasks");
        break;
    }
  };

  const handleViewAll = () => {
    onOpenChange(false);
    switch (alertType) {
      case "expired":
      case "expiring":
        navigate("/compliance");
        break;
      case "overdue-tasks":
        navigate("/tasks");
        break;
      case "stock-alerts":
        navigate("/stock");
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl",
                config.severity === "critical" && "bg-destructive/15 text-destructive",
                config.severity === "warning" && "bg-warning/15 text-warning",
                config.severity === "info" && "bg-primary/15 text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">{config.title}</DialogTitle>
              <DialogDescription className="text-sm">{config.description}</DialogDescription>
            </div>
          </div>
          <Badge className={cn("w-fit mt-2", config.badgeClass)}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 py-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No items to display</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="group p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewItem(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] px-1.5 py-0 h-5 shrink-0", statusStyles[item.status])}
                        >
                          {item.status === "overdue" ? "Overdue" : item.status === "expired" ? "Expired" : "Expiring"}
                        </Badge>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate mb-2">{item.subtitle}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(item.date, "dd MMM yyyy")}
                          </span>
                        )}
                        {item.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.assignee}
                          </span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border">
          <Button onClick={handleViewAll} className="w-full">
            View All in{" "}
            {alertType === "expired" || alertType === "expiring"
              ? "Compliance"
              : alertType === "overdue-tasks"
              ? "Tasks"
              : "Stock"}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
