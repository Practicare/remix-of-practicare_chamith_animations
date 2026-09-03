import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ArrowLeft, ShieldCheck, List, LayoutGrid, Kanban } from "lucide-react";
import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { mockComplianceItems, mockComplianceCategories } from "@/data/mockCompliance";
import { ComplianceCard } from "@/components/compliance/ComplianceCard";
import { ComplianceTable } from "@/components/compliance/ComplianceTable";
import { ComplianceBoard } from "@/components/compliance/ComplianceBoard";

import { EditComplianceDialog } from "@/components/compliance/EditComplianceDialog";
import { CreateTaskFromComplianceDialog } from "@/components/compliance/CreateTaskFromComplianceDialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { differenceInDays } from "date-fns";
import { Task } from "@/types/tasks";
import { mockTasks } from "@/data/mockTasks";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportComplianceCSV, exportCompliancePDF } from "@/utils/moduleExports";

function calculateStatus(expiryDate: Date): 'valid' | 'expiring' | 'expired' {
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

export default function ComplianceCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = mockComplianceCategories.find(c => c.id === categoryId);

  const [items, setItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "cards" | "board">("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [isRenewMode, setIsRenewMode] = useState(false);
  const [taskDialogItem, setTaskDialogItem] = useState<ComplianceItem | null>(null);

  const categoryItems = useMemo(() => {
    if (!categoryId) return [];
    return items.filter(item => item.categoryId === categoryId);
  }, [items, categoryId]);

  const filteredItems = useMemo(() => {
    return categoryItems.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [categoryItems, searchQuery]);

  const itemsByStatus = {
    all: filteredItems,
    valid: filteredItems.filter(item => item.status === 'valid'),
    expiring: filteredItems.filter(item => item.status === 'expiring'),
    expired: filteredItems.filter(item => item.status === 'expired'),
  };

  const displayItems = itemsByStatus[statusFilter];

  const handleCreateItem = (newItem: Omit<ComplianceItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const item: ComplianceItem = {
      ...newItem,
      id: Date.now().toString(),
      status: calculateStatus(newItem.expiryDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems([item, ...items]);
    toast.success("Compliance item created");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Compliance item deleted");
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ComplianceItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        if (updates.expiryDate) updated.status = calculateStatus(updates.expiryDate);
        return updated;
      }
      return item;
    }));
  };

  const handleEditItem = (item: ComplianceItem) => { setEditingItem(item); setIsRenewMode(false); };
  const handleRenewItem = (item: ComplianceItem) => { setEditingItem(item); setIsRenewMode(true); };
  const handleCloseEditDialog = () => { setEditingItem(null); setIsRenewMode(false); };

  const handleCreateTask = (taskData: { title: string; assignee: string; dueDate: Date; important?: boolean; reminder?: { email: boolean; sms: boolean } }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      completed: false,
      createdAt: new Date(),
      important: taskData.important,
      reminder: taskData.reminder,
    };
    setTasks([newTask, ...tasks]);
  };

  if (!category) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Category not found</p>
          <Button variant="outline" onClick={() => navigate("/compliance")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Compliance
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title={category.displayName || category.name}
        subtitle={`${categoryItems.length} items`}
        actions={
          <Button variant="ghost" size="icon" onClick={() => navigate("/compliance")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      {/* Mobile content */}
      <div className="md:hidden p-3 space-y-2">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          displayItems.map(item => (
            <ComplianceCard
              key={item.id}
              item={item}
              categoryName={category.name}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleEditItem}
              onRenewItem={handleRenewItem}
              onCreateTask={() => setTaskDialogItem(item)}
              categories={mockComplianceCategories}
            />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/compliance")}>
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
          <span className={`ml-3 text-[11px] font-medium px-2.5 py-0.5 rounded-lg ${
            category.type === "user"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}>
            {category.type === "user" ? "User" : "Practice"}
          </span>
        </div>

        {/* Status filter tabs */}
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

        {/* Search + Add */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search items..." className="flex-1 max-w-sm" />
          <div className="flex items-center gap-3">
            <ExportDropdown
              onExportCSV={() => { exportComplianceCSV(displayItems, category.name); toast.success("CSV exported"); }}
              onExportPDF={() => exportCompliancePDF(displayItems, category.name)}
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
        </div>

        {/* Content */}
        {viewMode === "board" && (
          <ComplianceBoard
            items={displayItems}
            categories={mockComplianceCategories}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onRenewItem={handleRenewItem}
            onCreateTask={(item) => setTaskDialogItem(item)}
          />
        )}

        {viewMode === "list" && (
          <ComplianceTable
            items={displayItems}
            categories={mockComplianceCategories}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onRenewItem={handleRenewItem}
            showAddRow
            activeCategoryId={categoryId}
            onCreateItem={handleCreateItem}
          />
        )}

        {viewMode === "cards" && (
          displayItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No compliance items found</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card px-1 py-1">
              {displayItems.map(item => (
                <ComplianceCard
                  key={item.id}
                  item={item}
                  categoryName={category.name}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onEditItem={handleEditItem}
                  onRenewItem={handleRenewItem}
                  onCreateTask={() => setTaskDialogItem(item)}
                  categories={mockComplianceCategories}
                />
              ))}
            </div>
          )
        )}
      </div>

      <EditComplianceDialog
        item={editingItem}
        categories={mockComplianceCategories}
        onUpdateItem={(itemId, updates) => {
          handleUpdateItem(itemId, updates);
          handleCloseEditDialog();
          toast.success(isRenewMode ? "Item renewed" : "Item updated");
        }}
        onClose={handleCloseEditDialog}
        isRenewMode={isRenewMode}
      />

      <CreateTaskFromComplianceDialog
        complianceItem={taskDialogItem}
        open={!!taskDialogItem}
        onOpenChange={(open) => !open && setTaskDialogItem(null)}
        onCreateTask={handleCreateTask}
      />
    </AdminLayout>
  );
}
