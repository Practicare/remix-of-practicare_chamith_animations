import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CheckCircle, AlertTriangle, XCircle, Timer, Stethoscope, Zap, CalendarCheck, Sparkles } from "lucide-react";
import {
  Bell,
  Package,
  List,
  LayoutGrid,
  Kanban,
  ChevronDown,
  Plus,
} from "lucide-react";
import { CATEGORY_FIELD_CONFIG, DEFAULT_FIELD_CONFIG, DEFAULT_CALIBRATION_CATEGORIES } from "@/types/stock";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComponentType, ReactNode , Fragment } from "react";
import { StockItem, StockCategory } from "@/types/stock";
import { mockStockCategories } from "@/data/mockStock";
import { useStock } from "@/contexts/StockContext";
import { useRooms } from "@/contexts/RoomsContext";

import { StockFilters } from "@/components/stock/StockFilters";
import { StockCard } from "@/components/stock/StockCard";
import { StockTable } from "@/components/stock/StockTable";
import { StockBoard } from "@/components/stock/StockBoard";
import { StockCategoryCard } from "@/components/stock/StockCategoryCard";
import { AddStockCategoryDialog } from "@/components/stock/AddStockCategoryDialog";
import { EditStockCategoryDialog } from "@/components/stock/EditStockCategoryDialog";
import { DeleteStockCategoryDialog } from "@/components/stock/DeleteStockCategoryDialog";
import { CreateTaskFromStockDialog } from "@/components/stock/CreateTaskFromStockDialog";
import { EditStockDialog } from "@/components/stock/EditStockDialog";
import { StockActionPanel } from "@/components/stock/StockActionPanel";
import { AIStockTaskGeneratorDialog } from "@/components/stock/AIStockTaskGeneratorDialog";
import { PageIntro } from "@/components/layout/PageIntro";
import { STOCK_PRACTICE_TIPS } from "@/components/stock/stockPracticeTips";


import { DynamicIcon } from "@/components/DynamicIcon";
import { differenceInDays, format } from "date-fns";
import { Task } from "@/types/tasks";
import { toast } from "@/hooks/use-toast";
import { StockLocation } from "@/components/stock/LocationManager";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { PaginationBar } from "@/components/ui/PaginationBar";
import { usePagination } from "@/hooks/usePagination";
import { downloadCSV, openPrintPDF, wrapPDFPage, exportTimestamp, exportSubtitleDate } from "@/utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function calculateStatus(expiryDate: Date): 'valid' | 'expiring' | 'expired' {
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

export default function Stock({ Layout = AdminLayout, embedded = false }: { Layout?: ComponentType<{ children: ReactNode }>; embedded?: boolean }) {
  const Wrapper = embedded ? Fragment : Layout;
  const navigate = useNavigate();
  const [stockMode, setStockMode] = useState<"expiring" | "calibrating" | "electrical">("expiring");
  const { items, setItems } = useStock();
  const { rooms } = useRooms();
  const [categories, setCategories] = useState<StockCategory[]>(mockStockCategories);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "cards" | "board">("list");
  const locations: StockLocation[] = useMemo(
    () => rooms.map((r) => ({ id: r.id, name: r.roomName })),
    [rooms]
  );
  const setLocations = (_: StockLocation[] | ((prev: StockLocation[]) => StockLocation[])) => {};

  const [selectedLocation, setSelectedLocation] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");
  const [calibrationFilter, setCalibrationFilter] = useState<"all" | "due" | "overdue" | "upcoming">("all");
  const [electricalFilter, setElectricalFilter] = useState<"all" | "due" | "overdue" | "upcoming">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "annual-overdue" | "annual-due" | "six-overdue" | "six-due">("all");
  
  // Category edit/delete state
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | null>(null);
  
  // Stock item edit/renew state
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isRenewMode, setIsRenewMode] = useState(false);
  const [aiTaskDialogOpen, setAiTaskDialogOpen] = useState(false);


  // Items that have calibration data (for calibrating mode)
  const calibratingItems = useMemo(() => {
    return items.filter(item => {
      const config = CATEGORY_FIELD_CONFIG[item.categoryId] || DEFAULT_FIELD_CONFIG;
      return config.showCalibration && (item.calibrationDate || item.nextCalibrationDate);
    });
  }, [items]);

  // Items that have electrical test/tag data
  const electricalItems = useMemo(() => {
    return items.filter(item => item.electricalTestDate || item.nextElectricalTestDate || item.electricalTagNumber);
  }, [items]);

  // Items for current mode
  const modeItems = stockMode === "calibrating" ? calibratingItems : stockMode === "electrical" ? electricalItems : items;

  const filteredItems = useMemo(() => {
    return modeItems.filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.categoryId !== activeCategory) {
        return false;
      }

      // Location filter
      if (selectedLocation !== "all" && item.location !== selectedLocation) {
        return false;
      }

      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [modeItems, activeCategory, searchQuery, selectedLocation]);

  // Calibration status helpers
  const getCalibrationStatus = (item: StockItem) => {
    if (!item.nextCalibrationDate) return "unknown";
    const days = differenceInDays(item.nextCalibrationDate, new Date());
    if (days < 0) return "overdue";
    if (days <= 30) return "due";
    return "upcoming";
  };

  const calibrationByStatus = useMemo(() => {
    const filtered = filteredItems;
    return {
      all: filtered,
      due: filtered.filter(i => getCalibrationStatus(i) === "due"),
      overdue: filtered.filter(i => getCalibrationStatus(i) === "overdue"),
      upcoming: filtered.filter(i => getCalibrationStatus(i) === "upcoming"),
    };
  }, [filteredItems]);

  // Electrical test status helpers
  const getElectricalStatus = (item: StockItem) => {
    if (!item.nextElectricalTestDate) return "unknown";
    const days = differenceInDays(item.nextElectricalTestDate, new Date());
    if (days < 0) return "overdue";
    if (days <= 30) return "due";
    return "upcoming";
  };

  const electricalByStatus = useMemo(() => {
    const filtered = filteredItems;
    return {
      all: filtered,
      due: filtered.filter(i => getElectricalStatus(i) === "due"),
      overdue: filtered.filter(i => getElectricalStatus(i) === "overdue"),
      upcoming: filtered.filter(i => getElectricalStatus(i) === "upcoming"),
    };
  }, [filteredItems]);

  // Review date status helpers
  const getReviewStatus = (date?: Date) => {
    if (!date) return "unknown";
    const days = differenceInDays(date, new Date());
    if (days < 0) return "overdue";
    if (days <= 30) return "due";
    return "ok";
  };

  const reviewCounts = useMemo(() => {
    const items = filteredItems;
    return {
      annualOverdue: items.filter(i => getReviewStatus(i.annualReviewDate) === "overdue").length,
      annualDue: items.filter(i => getReviewStatus(i.annualReviewDate) === "due").length,
      sixOverdue: items.filter(i => getReviewStatus(i.sixMonthReviewDate) === "overdue").length,
      sixDue: items.filter(i => getReviewStatus(i.sixMonthReviewDate) === "due").length,
    };
  }, [filteredItems]);

  const reviewFilteredItems = useMemo(() => {
    if (reviewFilter === "all") return filteredItems;
    return filteredItems.filter(item => {
      if (reviewFilter === "annual-overdue") return getReviewStatus(item.annualReviewDate) === "overdue";
      if (reviewFilter === "annual-due") return getReviewStatus(item.annualReviewDate) === "due";
      if (reviewFilter === "six-overdue") return getReviewStatus(item.sixMonthReviewDate) === "overdue";
      if (reviewFilter === "six-due") return getReviewStatus(item.sixMonthReviewDate) === "due";
      return true;
    });
  }, [filteredItems, reviewFilter]);

  const handleCreateItem = (newItem: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const item: StockItem = {
      ...newItem,
      id: Date.now().toString(),
      status: calculateStatus(newItem.expiryDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems([item, ...items]);
    toast({
      title: "Stock Item Added",
      description: `${item.name} has been added to inventory.`,
    });
  };


  const handleAddCategory = (newCategory: Omit<StockCategory, 'id' | 'isDefault'>) => {
    const category: StockCategory = {
      ...newCategory,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };
    setCategories([...categories, category]);
    toast({
      title: "Category Added",
      description: `${category.name} has been created.`,
    });
  };

  const handleEditCategory = (id: string, updates: { name: string; description: string }) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    toast({
      title: "Category Updated",
      description: `Category has been renamed to ${updates.name}.`,
    });
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    setCategories(categories.filter(cat => cat.id !== id));
    if (activeCategory === id) {
      setActiveCategory("all");
    }
    toast({
      title: "Category Deleted",
      description: `${category?.name} has been removed.`,
    });
  };

  const getCategoryItemCount = (categoryId: string) => {
    return items.filter(item => item.categoryId === categoryId).length;
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Stock Item Deleted",
      description: "The item has been removed from inventory.",
    });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<StockItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          // Recalculate status if expiry date changed
          if (updates.expiryDate) {
            updated.status = calculateStatus(updates.expiryDate);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setIsRenewMode(false);
  };

  const handleRenewItem = (item: StockItem) => {
    setEditingItem(item);
    setIsRenewMode(true);
  };

  const handleCloseEditDialog = () => {
    setEditingItem(null);
    setIsRenewMode(false);
  };

  const handleAddLocation = (name: string) => {
    const newLocation: StockLocation = {
      id: `loc-${Date.now()}`,
      name,
    };
    setLocations([...locations, newLocation]);
    toast({
      title: "Location Added",
      description: `${name} has been added to locations.`,
    });
  };

  const handleEditLocation = (id: string, name: string) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, name } : loc));
    toast({
      title: "Location Updated",
      description: `Location has been renamed to ${name}.`,
    });
  };

  const handleDeleteLocation = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    setLocations(locations.filter(loc => loc.id !== id));
    toast({
      title: "Location Deleted",
      description: `${location?.name} has been removed from locations.`,
    });
  };

  const handleCreateTask = (item: StockItem) => {
    setSelectedStockItem(item);
    setTaskDialogOpen(true);
  };

  const handleTaskCreated = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    console.log("Task created:", task);
  };

  const handleAIItemsDetected = (detectedItems: { name: string; quantity: number; category: string; expiryDate?: string; batchNumber?: string }[]) => {
    const newItems: StockItem[] = detectedItems.map((detected, index) => ({
      id: `ai-${Date.now()}-${index}`,
      categoryId: detected.category || categories[0]?.id || "drug-cupboard",
      name: detected.name,
      description: `AI-detected item`,
      quantity: detected.quantity,
      expiryDate: detected.expiryDate ? new Date(detected.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: calculateStatus(detected.expiryDate ? new Date(detected.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      batchNumber: detected.batchNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    setItems([...newItems, ...items]);
    toast({
      title: "Items Added",
      description: `${newItems.length} items detected and added to inventory.`,
    });
  };

  // Export helpers
  const getExportItems = () => {
    if (stockMode === "electrical") return electricalByStatus[electricalFilter];
    return itemsByStatus[statusFilter].length > 0 ? itemsByStatus[statusFilter] : filteredItems;
  };

  const getCategoryName = () => {
    if (stockMode === "electrical") return "Test & Tagging";
    const cat = categories.find(c => c.id === activeCategory);
    return cat?.name || "Stock";
  };

  const handleExportCSV = () => {
    const exportItems = getExportItems();
    const catName = getCategoryName();
    const isCalibrating = stockMode === "calibrating";
    const isElectrical = stockMode === "electrical";

    const headers = isElectrical
      ? ["Item", "Serial #", "Last Test", "Next Test", "Annual Review", "6 Month Review", "Location"]
      : isCalibrating
      ? ["Item", "Serial #", "Last Calibration", "Next Calibration", "Annual Review", "6 Month Review", "Company", "Location"]
      : ["Item", "Qty", "Batch #", "Expiry Date", "Status", "Location"];

    const rows = exportItems.map(item => {
      if (isElectrical) {
        return [
          item.name,
          item.electricalTagNumber || "",
          item.electricalTestDate ? format(item.electricalTestDate, "dd MMM yyyy") : "",
          item.nextElectricalTestDate ? format(item.nextElectricalTestDate, "dd MMM yyyy") : "",
          "", // annual review - not on StockItem type yet
          "", // 6 month review
          item.location || "",
        ];
      }
      if (isCalibrating) {
        return [
          item.name,
          item.electricalTagNumber || "",
          item.calibrationDate ? format(item.calibrationDate, "dd MMM yyyy") : "",
          item.nextCalibrationDate ? format(item.nextCalibrationDate, "dd MMM yyyy") : "",
          "", "",
          item.leadName || "",
          item.location || "",
        ];
      }
      return [
        item.name,
        String(item.quantity),
        item.batchNumber || "",
        item.expiryDate ? format(item.expiryDate, "dd MMM yyyy") : "",
        item.status,
        item.location || "",
      ];
    });

    downloadCSV(headers, rows, `${catName.replace(/\s+/g, "-").toLowerCase()}-${exportTimestamp()}`);
    toast({ title: "CSV Exported", description: `${exportItems.length} items exported.` });
  };

  const handleExportPDF = () => {
    const exportItems = getExportItems();
    const catName = getCategoryName();
    const isCalibrating = stockMode === "calibrating";
    const isElectrical = stockMode === "electrical";

    const headers = isElectrical
      ? ["Item", "Serial #", "Last Test", "Next Test", "Annual Review", "6 Month Review", "Location"]
      : isCalibrating
      ? ["Item", "Serial #", "Last Cal.", "Next Cal.", "Annual Review", "6 Month Review", "Company", "Location"]
      : ["Item", "Qty", "Batch #", "Expiry Date", "Status", "Location"];

    const tableRows = exportItems.map(item => {
      if (isElectrical) {
        return `<tr><td>${item.name}</td><td>${item.electricalTagNumber || "—"}</td><td>${item.electricalTestDate ? format(item.electricalTestDate, "dd MMM yyyy") : "—"}</td><td>${item.nextElectricalTestDate ? format(item.nextElectricalTestDate, "dd MMM yyyy") : "—"}</td><td>—</td><td>—</td><td>${item.location || "—"}</td></tr>`;
      }
      if (isCalibrating) {
        return `<tr><td>${item.name}</td><td>${item.electricalTagNumber || "—"}</td><td>${item.calibrationDate ? format(item.calibrationDate, "dd MMM yyyy") : "—"}</td><td>${item.nextCalibrationDate ? format(item.nextCalibrationDate, "dd MMM yyyy") : "—"}</td><td>—</td><td>—</td><td>${item.leadName || "—"}</td><td>${item.location || "—"}</td></tr>`;
      }
      return `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.batchNumber || "—"}</td><td>${item.expiryDate ? format(item.expiryDate, "dd MMM yyyy") : "—"}</td><td>${item.status}</td><td>${item.location || "—"}</td></tr>`;
    }).join("");

    const bodyHtml = `
      <div class="stats"><div class="stat"><strong>${exportItems.length}</strong>Items</div></div>
      <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
    `;

    openPrintPDF(wrapPDFPage({
      title: `${catName} — Stock Report`,
      subtitle: `Generated on ${exportSubtitleDate()}`,
      bodyHtml,
    }));
  };

  // Count items per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return modeItems.length;
    return modeItems.filter((item) => item.categoryId === categoryId).length;
  };

  // Group items by status
  const itemsByStatus = {
    all: filteredItems,
    valid: filteredItems.filter((item) => item.status === 'valid'),
    expiring: filteredItems.filter((item) => item.status === 'expiring'),
    expired: filteredItems.filter((item) => item.status === 'expired'),
  };

  // Pagination (15 per page) for each list container on this page
  const expiringPag = usePagination(itemsByStatus[statusFilter], 15);
  const calibratingPag = usePagination(calibrationByStatus[calibrationFilter], 15);
  const electricalPag = usePagination(electricalByStatus[electricalFilter], 15);

  const expiredCount = items.filter((item) => item.status === 'expired').length;
  const calibrationDueCount = calibratingItems.filter(i => {
    if (!i.nextCalibrationDate) return false;
    return differenceInDays(i.nextCalibrationDate, new Date()) <= 30;
  }).length;
  const electricalDueCount = electricalItems.filter(i => {
    if (!i.nextElectricalTestDate) return false;
    return differenceInDays(i.nextElectricalTestDate, new Date()) <= 30;
  }).length;

  return (
    <Wrapper>
      {/* Mobile Header */}
      {!embedded && <MobileHeader
        title="Stock"
        subtitle="Inventory management"
        actions={
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-10 w-10 shrink-0 border-primary/30 bg-primary/5 hover:bg-primary/10"
          >
            <Bell className="w-5 h-5 text-primary" />
            {expiredCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                {expiredCount}
              </span>
            )}
          </Button>
        }
      />}

      {/* Mobile: Search and filters below header */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card">
        {/* Mode tabs */}
        <div className="px-4 pt-3 pb-2">
          <SegmentedControl
              options={[
              { id: "expiring" as const, label: "Medical Supplies", icon: AlertTriangle },
              { id: "calibrating" as const, label: "Calibrating", icon: Stethoscope },
              { id: "electrical" as const, label: "Test & Tagging", icon: Zap },
            ]}
            value={stockMode}
            onChange={(val) => {
              setStockMode(val);
              setActiveCategory("all");
              setSearchQuery("");
              setStatusFilter("all");
              setCalibrationFilter("all");
              setElectricalFilter("all");
              setReviewFilter("all");
            }}
            size="sm"
            fullWidth
          />
        </div>
        {/* Search row */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <StockFilters 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery}
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
              />
            </div>
            <StockActionPanel
              categories={categories}
              locations={locations}
              onCreateItem={handleCreateItem}
              onItemsDetected={handleAIItemsDetected}
              onAddLocation={handleAddLocation}
              onEditLocation={handleEditLocation}
              onDeleteLocation={handleDeleteLocation}
              defaultCategoryId={activeCategory !== "all" ? activeCategory : undefined}
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-4 pb-3">
          {stockMode === "expiring" ? (
            <SegmentedControl
              options={[
                { id: "all" as const, label: "All", badge: itemsByStatus.all.length },
                { id: "valid" as const, label: "Valid", icon: CheckCircle, badge: itemsByStatus.valid.length },
                { id: "expiring" as const, label: "Soon", icon: AlertTriangle, badge: itemsByStatus.expiring.length },
                { id: "expired" as const, label: "Exp", icon: XCircle, badge: itemsByStatus.expired.length },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              size="sm"
              fullWidth
            />
          ) : stockMode === "calibrating" ? (
            <SegmentedControl
              options={[
                { id: "all" as const, label: "All", badge: calibrationByStatus.all.length },
                { id: "overdue" as const, label: "Overdue", icon: XCircle, badge: calibrationByStatus.overdue.length },
                { id: "due" as const, label: "Due", icon: AlertTriangle, badge: calibrationByStatus.due.length },
                { id: "upcoming" as const, label: "OK", icon: Timer, badge: calibrationByStatus.upcoming.length },
              ]}
              value={calibrationFilter}
              onChange={(val) => setCalibrationFilter(val)}
              size="sm"
              fullWidth
            />
          ) : (
            <SegmentedControl
              options={[
                { id: "all" as const, label: "All", badge: electricalByStatus.all.length },
                { id: "overdue" as const, label: "Overdue", icon: XCircle, badge: electricalByStatus.overdue.length },
                { id: "due" as const, label: "Due", icon: AlertTriangle, badge: electricalByStatus.due.length },
                { id: "upcoming" as const, label: "OK", icon: Timer, badge: electricalByStatus.upcoming.length },
              ]}
              value={electricalFilter}
              onChange={(val) => setElectricalFilter(val)}
              size="sm"
              fullWidth
            />
          )}
        </div>

        {/* Category filter row — only in expiring mode */}
        {stockMode === "expiring" && (
          <div className="flex items-center px-4 pb-3 border-b border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-foreground">
                    {activeCategory === "all" ? "All Categories" : categories.find(c => c.id === activeCategory)?.name || "Category"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50 min-w-[200px]">
                <DropdownMenuItem 
                  onClick={() => setActiveCategory("all")}
                  className="cursor-pointer py-3"
                >
                  All Categories ({getCategoryCount("all")})
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="cursor-pointer py-3"
                  >
                    <DynamicIcon name={category.icon} className="w-4 h-4 mr-2" />
                    {category.name} ({getCategoryCount(category.id)})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {stockMode === "calibrating" && (
          <div className="border-b border-border" />
        )}
      </div>

      {/* Mobile: Stock list content */}
      <div className="md:hidden p-3 space-y-2">
        {stockMode === "expiring" ? (
          itemsByStatus[statusFilter].length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No stock items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expiringPag.paginated.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                  onDelete={handleDeleteItem}
                  onCreateTask={handleCreateTask}
                  onEditItem={handleEditItem}
                  onRenewItem={handleRenewItem}
                />
              ))}
              <PaginationBar
                page={expiringPag.page}
                totalPages={expiringPag.totalPages}
                total={expiringPag.total}
                pageSize={expiringPag.pageSize}
                onPageChange={expiringPag.setPage}
              />
            </div>
          )
        ) : stockMode === "calibrating" ? (
          calibrationByStatus[calibrationFilter].length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No instruments found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calibratingPag.paginated.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                  onDelete={handleDeleteItem}
                  onCreateTask={handleCreateTask}
                  onEditItem={handleEditItem}
                  onRenewItem={handleRenewItem}
                />
              ))}
              <PaginationBar
                page={calibratingPag.page}
                totalPages={calibratingPag.totalPages}
                total={calibratingPag.total}
                pageSize={calibratingPag.pageSize}
                onPageChange={calibratingPag.setPage}
              />
            </div>
          )
        ) : (
          electricalByStatus[electricalFilter].length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No electrical items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {electricalPag.paginated.map((item) => (
                <StockCard
                  key={item.id}
                  item={item}
                  categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                  onDelete={handleDeleteItem}
                  onCreateTask={handleCreateTask}
                  onEditItem={handleEditItem}
                  onRenewItem={handleRenewItem}
                />
              ))}
              <PaginationBar
                page={electricalPag.page}
                totalPages={electricalPag.totalPages}
                total={electricalPag.total}
                pageSize={electricalPag.pageSize}
                onPageChange={electricalPag.setPage}
              />
            </div>
          )
        )}
      </div>

      {/* Desktop Header */}
      {!embedded && <PageHeader
        title="Stock"
        subtitle="Manage inventory, expiry dates and stock levels"
        icon={Package}
        actions={
          <Button onClick={() => setAiTaskDialogOpen(true)} className="gap-2" size="sm">
            <Sparkles className="w-4 h-4" />
            AI Task Creation
          </Button>
        }
      />}
      <div className={embedded ? "hidden md:block" : "hidden md:block px-8 pt-4 max-w-4xl mx-auto"}>
        <SegmentedControl
          options={[
            { id: "expiring" as const, label: "Medical Supplies", icon: AlertTriangle, badge: expiredCount + items.filter(i => i.status === 'expiring').length },
            { id: "calibrating" as const, label: "Calibrating Stocks", icon: Stethoscope, badge: calibrationDueCount > 0 ? calibrationDueCount : undefined },
            { id: "electrical" as const, label: "Test & Tagging", icon: Zap, badge: electricalDueCount > 0 ? electricalDueCount : undefined },
          ]}
          value={stockMode}
          onChange={(val) => {
            setStockMode(val);
            setActiveCategory("all");
            setSearchQuery("");
            setStatusFilter("all");
            setCalibrationFilter("all");
            setElectricalFilter("all");
            setReviewFilter("all");
          }}
        />
      </div>

      {/* Desktop Content */}
      <div className={embedded ? "hidden md:block py-4 space-y-6" : "hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6"}>
        <>

        {!embedded && <PageIntro
          highlight="Every item accounted for, every expiry in sight."
          description="Track expiring stock, calibrations and electrical testing from one place. Search, filter and drill into any category to keep your practice safe and audit-ready."
        />}


        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={stockMode === "expiring" ? "Search categories..." : stockMode === "calibrating" ? "Search instruments..." : "Search equipment..."}
          className="max-w-sm"
        />

        {stockMode === "expiring" ? (
          <>
            {/* Section label */}
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
              <span className="text-[12px] text-muted-foreground">{categories.length} categories · {modeItems.length} total items</span>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {categories
                .filter(cat =>
                  searchQuery === "" ||
                  cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cat.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((category) => {
                  const catItems = modeItems.filter(i => i.categoryId === category.id);
                  return (
                    <StockCategoryCard
                      key={category.id}
                      category={category}
                      items={catItems}
                      onClick={() => navigate(`/stock/category/${category.id}?mode=expiring`)}
                    />
                  );
                })}
            </div>

            {/* Add Category button */}
            <div className="flex items-center gap-2 mt-2">
              <AddStockCategoryDialog onAddCategory={handleAddCategory} />
            </div>
          </>
        ) : stockMode === "calibrating" ? (
          <>
            {/* Section label */}
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
              <span className="text-[12px] text-muted-foreground">
                {DEFAULT_CALIBRATION_CATEGORIES.length} categories · {calibratingItems.length} instruments tracked
              </span>
            </div>


            {/* Category Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_CALIBRATION_CATEGORIES
                .filter(cat =>
                  searchQuery === "" ||
                  cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cat.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((category) => {
                  const catItems = calibratingItems.filter(i => i.categoryId === category.id);
                  return (
                    <StockCategoryCard
                      key={category.id}
                      category={category}
                      items={catItems}
                      onClick={() => navigate(`/stock/category/${category.id}?mode=calibrating`)}
                    />
                  );
                })}
            </div>
          </>
        ) : (
          <>
            {/* Electrical & Tagging — flat list */}
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Test & Tagging Equipment</h3>
              <span className="text-[12px] text-muted-foreground">{electricalItems.length} items tracked</span>
            </div>

            {/* Electrical filters */}
            <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search equipment..."
                  className="w-[220px]"
                />
                <div className="ml-auto flex items-center gap-2">
                  <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
                  <SegmentedControl
                    options={[
                      { id: "list", label: "List", icon: List },
                      { id: "cards", label: "Cards", icon: LayoutGrid },
                    ]}
                    value={viewMode}
                    onChange={(mode) => setViewMode(mode as "list" | "cards" | "board")}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Electrical list/cards */}
            {viewMode === "list" ? (
              <StockTable
                showAddRow
                activeCategoryId="electrical-tagging"
                onCreateItem={handleCreateItem}
              />
            ) : (
              electricalByStatus[electricalFilter].length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No electrical items found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {electricalPag.paginated.map((item) => (
                      <StockCard
                        key={item.id}
                        item={item}
                        categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                        onDelete={handleDeleteItem}
                        onCreateTask={handleCreateTask}
                        onEditItem={handleEditItem}
                        onRenewItem={handleRenewItem}
                      />
                    ))}
                  </div>
                  <PaginationBar
                    page={electricalPag.page}
                    totalPages={electricalPag.totalPages}
                    total={electricalPag.total}
                    pageSize={electricalPag.pageSize}
                    onPageChange={electricalPag.setPage}
                  />
                </div>
              )
            )}
          </>
        )}
        </>
      </div>


      {/* Task Creation Dialog */}
      <CreateTaskFromStockDialog
        stockItem={selectedStockItem}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onCreateTask={handleTaskCreated}
      />

      {/* Edit Category Dialog */}
      <EditStockCategoryDialog
        category={selectedCategory}
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
        onSave={handleEditCategory}
      />

      {/* Delete Category Dialog */}
      <DeleteStockCategoryDialog
        category={selectedCategory}
        itemCount={selectedCategory ? getCategoryItemCount(selectedCategory.id) : 0}
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={handleDeleteCategory}
      />

      {/* Edit/Renew Stock Item Dialog */}
      <EditStockDialog
        item={editingItem}
        categories={categories}
        onUpdateItem={handleUpdateItem}
        onClose={handleCloseEditDialog}
        isRenewMode={isRenewMode}
      />

      {/* AI Stock Task Generator */}
      <AIStockTaskGeneratorDialog
        open={aiTaskDialogOpen}
        onOpenChange={setAiTaskDialogOpen}
        items={items}
        categories={categories}
        stockMode={stockMode}
        onConfirmTasks={(newTasks) => {
          const created = newTasks.map((t, i) => ({
            ...t,
            id: `ai-${Date.now()}-${i}`,
            createdAt: new Date(),
          }));
          console.log("AI tasks created:", created);
        }}
      />
    </Wrapper>
  );
}
