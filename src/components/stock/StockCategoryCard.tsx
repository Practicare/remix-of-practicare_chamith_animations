import { StockCategory, StockItem } from "@/types/stock";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ChevronRight, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface StockCategoryCardProps {
  category: StockCategory;
  items: StockItem[];
  onClick: () => void;
}

export function StockCategoryCard({ category, items, onClick }: StockCategoryCardProps) {
  const validCount = items.filter(i => i.status === "valid").length;
  const expiringCount = items.filter(i => i.status === "expiring").length;
  const expiredCount = items.filter(i => i.status === "expired").length;

  return (
    <div
      onClick={onClick}
      className="group rounded-xl border border-border/50 bg-card p-4 hover:border-border hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={category.icon} className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold leading-tight">{category.name}</h3>
            {category.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{category.description}</p>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          category.isDefault
            ? "bg-muted text-muted-foreground"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        }`}>
          {category.isDefault ? "Default" : "Custom"}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[12px] font-medium">
          <span>{items.length}</span>
          <span className="text-muted-foreground ml-1">items</span>
        </div>
        {expiringCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            <span>{expiringCount} expiring</span>
          </div>
        )}
        {expiredCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-destructive">
            <XCircle className="w-3 h-3" />
            <span>{expiredCount} expired</span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {items.length > 0 ? (
            <div className="flex gap-1 items-center">
              {validCount > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{validCount} valid</span>
                </div>
              )}
              {items.length === 0 && (
                <span className="text-[11px] text-muted-foreground">No items yet</span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">No items yet</span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          View
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
