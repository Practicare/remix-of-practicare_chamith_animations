import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  RefreshCw,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import { Checklist, ChecklistItem } from "@/types/checklists";
import { cn } from "@/lib/utils";

interface ChecklistContentProps {
  checklist: Checklist;
  categoryName?: string;
  deviceView?: "mobile" | "tablet" | "desktop";
  onSubmit?: () => void;
  onReset?: () => void;
  showSubmitButton?: boolean;
  currentUserName?: string;
}

export const ChecklistContent = ({
  checklist,
  categoryName,
  deviceView = "desktop",
  onSubmit,
  onReset,
  showSubmitButton = true,
  currentUserName,
}: ChecklistContentProps) => {
  const ITEMS_PER_PAGE = 10;
  const [previewItems, setPreviewItems] = useState<ChecklistItem[]>(checklist.items);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(previewItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = previewItems.slice(startIndex, endIndex);

  useEffect(() => {
    setPreviewItems(checklist.items);
    setIsLoading(true);
    setLoadedItems(new Set());
    setCurrentPage(1);
    
    const timer = setTimeout(() => setIsLoading(false), 200);
    
    checklist.items.forEach((item, index) => {
      setTimeout(() => {
        setLoadedItems(prev => new Set([...prev, item.id]));
      }, 50 + index * 40);
    });
    
    return () => clearTimeout(timer);
  }, [checklist.id]);

  const handleToggleItem = (itemId: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
              completedBy: !item.completed ? currentUserName : undefined,
              completedAt: !item.completed ? new Date() : undefined,
            }
          : item
      )
    );
  };

  const handleYesNo = (itemId: string, value: "yes" | "no") => {
    setPreviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        
        if (item.yesNoValue === value) {
          return {
            ...item,
            yesNoValue: undefined,
            completed: false,
            completedBy: undefined,
            completedAt: undefined,
          };
        }
        
        return {
          ...item,
          yesNoValue: value,
          completed: true,
          completedBy: currentUserName,
          completedAt: new Date(),
        };
      })
    );
  };

  const handleNumberChange = (itemId: string, value: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              numberValue: value,
              completed: value.trim() !== "",
              completedBy: value.trim() !== "" ? currentUserName : undefined,
              completedAt: value.trim() !== "" ? new Date() : undefined,
            }
          : item
      )
    );
  };

  const handleReset = () => {
    setPreviewItems(
      checklist.items.map((item) => ({
        ...item,
        completed: false,
        yesNoValue: undefined,
        numberValue: undefined,
        completedBy: undefined,
        completedAt: undefined,
      }))
    );
    onReset?.();
  };

  const completedCount = previewItems.filter((item) => item.completed).length;
  const totalCount = previewItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
      {/* Branded Header */}
      <div className="relative bg-gradient-to-r from-primary via-[hsl(190_65%_40%)] to-primary text-primary-foreground p-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/5" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold pr-8">{checklist.title}</h2>
                {categoryName && (
                  <p className="text-xs text-white/70 mt-0.5">{categoryName}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {checklist.description ? (
              <p className="text-xs text-white/70 leading-relaxed flex-1">{checklist.description}</p>
            ) : (
              <div className="flex-1" />
            )}
            {checklist.recurring && (
              <div className="flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full ml-3">
                <RefreshCw className="w-3 h-3" />
                <span>{checklist.recurring}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
          <span className={cn(
            "text-xs font-semibold",
            isComplete ? "text-primary" : "text-muted-foreground"
          )}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isComplete ? "bg-primary" : "bg-primary/70"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Clean Items List */}
      <div className="border-t border-border">
        {paginatedItems.map((item, pageIndex) => {
          const isItemLoaded = loadedItems.has(item.id);
          
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === "tick") {
                  handleToggleItem(item.id);
                }
              }}
              className={cn(
                "px-4 py-3.5 border-b border-border/50 last:border-b-0 transition-all duration-200",
                !isItemLoaded && "opacity-0 translate-y-2",
                isItemLoaded && "opacity-100 translate-y-0",
                item.type === "tick" && "cursor-pointer active:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Left: Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-medium leading-snug",
                      item.completed && "text-muted-foreground line-through"
                    )}>
                      {item.text}
                    </p>
                    {/* Critical icon only */}
                    {item.critical && (
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                  </div>
                  {/* Subtle completion info */}
                  {item.completedBy && item.completedAt && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      {item.completedBy} • {new Date(item.completedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>

                {/* Right: Action controls */}
                <div className="shrink-0">
                  {item.type === "tick" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleItem(item.id);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        item.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-transparent"
                      )}
                      aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {item.type === "yesno" && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleYesNo(item.id, "yes");
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          item.yesNoValue === "yes"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-primary/10"
                        )}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleYesNo(item.id, "no");
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          item.yesNoValue === "no"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground hover:bg-destructive/10"
                        )}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {item.type === "number" && (
                    <Input
                      type="text"
                      placeholder="—"
                      value={item.numberValue || ""}
                      onChange={(e) => handleNumberChange(item.id, e.target.value)}
                      className={cn(
                        "w-16 h-8 text-center text-sm font-medium rounded-lg border-muted-foreground/20",
                        item.completed && "border-primary/50 bg-primary/5"
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {startIndex + 1}-{Math.min(endIndex, previewItems.length)} of {previewItems.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {showSubmitButton && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset} 
            className="text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
          
          <Button 
            size="sm" 
            onClick={onSubmit}
            disabled={!isComplete}
            className="px-6"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};
