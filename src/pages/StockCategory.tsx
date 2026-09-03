import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { StockItem, StockCategory as StockCategoryType, CATEGORY_FIELD_CONFIG, DEFAULT_FIELD_CONFIG, DEFAULT_CALIBRATION_CATEGORIES, DEFAULT_STOCK_CATEGORIES } from "@/types/stock";
import { mockStockCategories } from "@/data/mockStock";
import { useStock } from "@/contexts/StockContext";

import { StockTable } from "@/components/stock/StockTable";

import { StockCard } from "@/components/stock/StockCard";
import { StockBoard } from "@/components/stock/StockBoard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { usePagination } from "@/hooks/usePagination";
import { CreateTaskFromStockDialog } from "@/components/stock/CreateTaskFromStockDialog";
import { EditStockDialog } from "@/components/stock/EditStockDialog";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, List, LayoutGrid, Kanban, Package, Trash2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Task } from "@/types/tasks";
import { toast } from "@/hooks/use-toast";

import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp, exportSubtitleDate } from "@/utils/exportUtils";

function calculateStatus(expiryDate: Date): 'valid' | 'expiring' | 'expired' {
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

export default function StockCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stockMode = (searchParams.get("mode") || "expiring") as "expiring" | "calibrating";

  const allCategories = [...mockStockCategories, ...DEFAULT_CALIBRATION_CATEGORIES];
  const category = allCategories.find(c => c.id === categoryId);

  const { items, setItems, createItem: ctxCreateItem } = useStock();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards" | "board">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "annual-overdue" | "annual-due" | "six-overdue" | "six-due">("all");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isRenewMode, setIsRenewMode] = useState(false);


  const categoryItems = useMemo(() => {
    if (!categoryId) return [];
    const inCategory = (item: typeof items[number]) =>
      item.categoryId === categoryId ||
      (item.allocatedCategoryIds || []).includes(categoryId);
    return items.filter(item => {
      if (stockMode === "calibrating") {
        const config = CATEGORY_FIELD_CONFIG[item.categoryId] || DEFAULT_FIELD_CONFIG;
        return config.showCalibration && (item.calibrationDate || item.nextCalibrationDate) && inCategory(item);
      }
      return inCategory(item);
    });
  }, [items, categoryId, stockMode]);

  const filteredItems = useMemo(() => {
    return categoryItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [categoryItems, searchQuery]);

  const itemsByStatus = {
    all: filteredItems,
    valid: filteredItems.filter(item => item.status === 'valid'),
    expiring: filteredItems.filter(item => item.status === 'expiring'),
    expired: filteredItems.filter(item => item.status === 'expired'),
  };

  const getReviewStatus = (date?: Date) => {
    if (!date) return "unknown";
    const days = differenceInDays(date, new Date());
    if (days < 0) return "overdue";
    if (days <= 30) return "due";
    return "ok";
  };

  const reviewCounts = useMemo(() => ({
    annualOverdue: filteredItems.filter(i => getReviewStatus(i.annualReviewDate) === "overdue").length,
    annualDue: filteredItems.filter(i => getReviewStatus(i.annualReviewDate) === "due").length,
    sixOverdue: filteredItems.filter(i => getReviewStatus(i.sixMonthReviewDate) === "overdue").length,
    sixDue: filteredItems.filter(i => getReviewStatus(i.sixMonthReviewDate) === "due").length,
  }), [filteredItems]);

  const handleCreateItem = (newItem: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const item: StockItem = {
      ...newItem,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: newItem.expiryDate ? calculateStatus(newItem.expiryDate) : 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [item, ...prev]);
    toast({ title: "Stock Item Added", description: `${item.name} has been added.` });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({ title: "Stock Item Deleted", description: "The item has been removed." });
  };

  // ---- Page-level selection (works across List/Cards/Board and all tabs) ----
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggleSelect = (id: string) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleUpdateItem = (itemId: string, updates: Partial<StockItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.expiryDate) updated.status = calculateStatus(updates.expiryDate);
        return updated;
      }
      return item;
    }));
  };

  const handleCreateTask = (item: StockItem) => {
    setSelectedStockItem(item);
    setTaskDialogOpen(true);
  };

  const handleEditItem = (item: StockItem) => { setEditingItem(item); setIsRenewMode(false); };
  const handleRenewItem = (item: StockItem) => { setEditingItem(item); setIsRenewMode(true); };
  const handleCloseEditDialog = () => { setEditingItem(null); setIsRenewMode(false); };
  const handleTaskCreated = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => { console.log("Task created:", task); };

  const displayItems = stockMode === "expiring" ? itemsByStatus[statusFilter] : filteredItems;
  const displayPag = usePagination(displayItems, 15);

  const allDisplaySelected = displayItems.length > 0 && displayItems.every(i => selectedIds.has(i.id));
  const someDisplaySelected = displayItems.some(i => selectedIds.has(i.id));
  const toggleSelectAllDisplay = () => setSelectedIds(prev => {
    const n = new Set(prev);
    if (allDisplaySelected) displayItems.forEach(i => n.delete(i.id));
    else displayItems.forEach(i => n.add(i.id));
    return n;
  });
  const bulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setItems(prev => prev.filter(it => !selectedIds.has(it.id)));
    setSelectedIds(new Set());
    toast({ title: "Items Deleted", description: `${ids.length} item(s) removed.` });
  };

  if (!category) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Category not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title={category.name}
        subtitle={`${categoryItems.length} items`}
        actions={
          <Button variant="ghost" size="icon" onClick={() => navigate("/stock")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      {/* Mobile content */}
      <div className="md:hidden p-3 space-y-2">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <>
            {displayPag.paginated.map(item => (
              <StockCard
                key={item.id}
                item={item}
                categoryName={category.name}
                onDelete={handleDeleteItem}
                onCreateTask={handleCreateTask}
                onEditItem={handleEditItem}
                onRenewItem={handleRenewItem}
                selected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
            <PaginationBar
              page={displayPag.page}
              totalPages={displayPag.totalPages}
              total={displayPag.total}
              pageSize={displayPag.pageSize}
              onPageChange={displayPag.setPage}
            />
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/stock")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={category.icon} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{category.name}</h2>
            {category.description && (
              <p className="text-[13px] text-muted-foreground">{category.description}</p>
            )}
          </div>
          <span className="ml-3 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground">
            {stockMode === "calibrating" ? "Calibrating" : "Medical Supplies"}
          </span>
        </div>

        {/* Status filter tabs */}
        {stockMode === "expiring" && (
          <div className="flex items-center gap-1 mb-5">
            {([
              { key: "all" as const, label: "All", count: itemsByStatus.all.length },
              { key: "valid" as const, label: "Valid", count: itemsByStatus.valid.length },
              { key: "expiring" as const, label: "Expiring", count: itemsByStatus.expiring.length },
              { key: "expired" as const, label: "Expired", count: itemsByStatus.expired.length },
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  statusFilter === key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
                <span className="ml-1.5 text-[11px] opacity-70">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search + View toggle */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={stockMode === "calibrating" ? "Search instruments..." : "Search stock..."}
            className="flex-1 max-w-sm"
          />
          <SegmentedControl
            options={[
              { id: "list", label: "List", icon: List },
              { id: "cards", label: "Cards", icon: LayoutGrid },
              { id: "board", label: "Board", icon: Kanban },
            ]}
            value={viewMode}
            onChange={(mode) => setViewMode(mode as "list" | "cards" | "board")}
            size="sm"
          />
        </div>

        {/* Bulk selection toolbar — works across all views & tabs */}
        {displayItems.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-3 px-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                checked={allDisplaySelected ? true : someDisplaySelected ? "indeterminate" : false}
                onCheckedChange={toggleSelectAllDisplay}
                aria-label="Select all visible"
              />
              <span>
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
              </span>
            </label>
            {selectedIds.size > 0 && (
              <Button size="sm" variant="destructive" className="h-8 gap-1.5" onClick={bulkDelete}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selectedIds.size}
              </Button>
            )}
          </div>
        )}

        {/* Board View */}
        {viewMode === "board" && (
          <StockBoard
            items={displayItems}
            categories={allCategories}
            onDelete={handleDeleteItem}
            onCreateTask={handleCreateTask}
            onEditItem={handleEditItem}
            onRenewItem={handleRenewItem}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        )}

        {/* List View */}
        {viewMode === "list" && (
          <StockTable
            showAddRow
            activeCategoryId={categoryId}
            
            onCreateItem={handleCreateItem}
            savedItems={displayItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onRenewItem={handleRenewItem}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAllDisplay}
          />
        )}

        {/* Cards View */}
        {viewMode === "cards" && (
          displayItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stock items found</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {displayPag.paginated.map(item => (
                  <StockCard
                    key={item.id}
                    item={item}
                    categoryName={category.name}
                    onDelete={handleDeleteItem}
                    onCreateTask={handleCreateTask}
                    onEditItem={handleEditItem}
                    onRenewItem={handleRenewItem}
                    selected={selectedIds.has(item.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
              <PaginationBar
                page={displayPag.page}
                totalPages={displayPag.totalPages}
                total={displayPag.total}
                pageSize={displayPag.pageSize}
                onPageChange={displayPag.setPage}
              />
            </div>
          )
        )}
      </div>

      <CreateTaskFromStockDialog
        stockItem={selectedStockItem}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onCreateTask={handleTaskCreated}
      />

      <EditStockDialog
        item={editingItem}
        categories={allCategories}
        onUpdateItem={handleUpdateItem}
        onClose={handleCloseEditDialog}
        isRenewMode={isRenewMode}
      />
    </AdminLayout>
  );
}
