import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  ShieldCheck,
  Bell,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  List,
  LayoutGrid,
  Kanban,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DynamicIcon } from "@/components/DynamicIcon";
import { ComplianceItem, ComplianceCategoryExtended } from "@/types/compliance";
import { mockComplianceItems, mockComplianceCategories } from "@/data/mockCompliance";

import { ComplianceCard } from "@/components/compliance/ComplianceCard";
import { ComplianceTable } from "@/components/compliance/ComplianceTable";
import { ComplianceBoard } from "@/components/compliance/ComplianceBoard";
import { CreateComplianceDialog } from "@/components/compliance/CreateComplianceDialog";
import { EditComplianceDialog } from "@/components/compliance/EditComplianceDialog";
import { AddCategoryDialog } from "@/components/compliance/AddCategoryDialog";
import { CreateTaskFromComplianceDialog } from "@/components/compliance/CreateTaskFromComplianceDialog";
import { ComplianceCategoryCard } from "@/components/compliance/ComplianceCategoryCard";
import { AITaskGeneratorDialog } from "@/components/compliance/AITaskGeneratorDialog";
import { PageIntro } from "@/components/layout/PageIntro";
import { COMPLIANCE_PRACTICE_TIP } from "@/components/compliance/compliancePracticeTip";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/tasks";
import { mockTasks } from "@/data/mockTasks";
import { toast } from "sonner";

type AllFilter = "all" | "user" | "practice";

function calculateStatus(expiryDate: Date): 'valid' | 'expiring' | 'expired' {
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

export default function Compliance() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [categories, setCategories] = useState<ComplianceCategoryExtended[]>(mockComplianceCategories);
  const [activeCategory, setActiveCategory] = useState("all");
  const [allFilter, setAllFilter] = useState<AllFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expiring" | "expired">("all");
  const [displayMode, setDisplayMode] = useState<"list" | "cards" | "board">("cards");
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [isRenewMode, setIsRenewMode] = useState(false);
  const [taskDialogItem, setTaskDialogItem] = useState<ComplianceItem | null>(null);
  const [aiTaskDialogOpen, setAiTaskDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory === "all") {
        // When "All" is selected, filter by user/practice if specified
        if (allFilter !== "all") {
          if (item.level !== allFilter) {
            return false;
          }
        }
      } else if (item.categoryId !== activeCategory) {
        return false;
      }

      // Search filter
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [items, activeCategory, allFilter, searchQuery]);

  const handleCreateItem = (newItem: Omit<ComplianceItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const item: ComplianceItem = {
      ...newItem,
      id: Date.now().toString(),
      status: calculateStatus(newItem.expiryDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems([item, ...items]);
    toast.success("Compliance item created successfully");
  };

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

  const handleAddCategory = (newCategory: Omit<ComplianceCategoryExtended, 'id' | 'isDefault' | 'type'>) => {
    const category: ComplianceCategoryExtended = {
      ...newCategory,
      id: `custom-${Date.now()}`,
      isDefault: false,
      type: 'practice',
    };
    setCategories([...categories, category]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Compliance item deleted");
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ComplianceItem>) => {
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

  const handleEditItem = (item: ComplianceItem) => {
    setEditingItem(item);
    setIsRenewMode(false);
  };

  const handleRenewItem = (item: ComplianceItem) => {
    setEditingItem(item);
    setIsRenewMode(true);
  };

  const handleCloseEditDialog = () => {
    setEditingItem(null);
    setIsRenewMode(false);
  };

  const handleOpenTaskDialog = (item: ComplianceItem) => {
    setTaskDialogItem(item);
  };

  // Count items per category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return items.length;
    return items.filter((item) => item.categoryId === categoryId).length;
  };

  // Group items by status
  const itemsByStatus = {
    all: filteredItems,
    valid: filteredItems.filter((item) => item.status === 'valid'),
    expiring: filteredItems.filter((item) => item.status === 'expiring'),
    expired: filteredItems.filter((item) => item.status === 'expired'),
  };

  const expiredCount = items.filter(item => item.status === 'expired').length;

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title="Compliance"
        subtitle="Track certifications & safety"
        actions={
          <Button 
            variant="outline" 
            size="icon" 
            className="relative h-9 w-9 border-primary/30 bg-primary/5 hover:bg-primary/10"
          >
            <Bell className="w-4 h-4 text-primary" />
            {expiredCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {expiredCount}
              </span>
            )}
          </Button>
        }
      />

      {/* Mobile Sticky Controls */}
      <div className="md:hidden sticky top-[56px] z-10 bg-background border-b border-border">
        {/* Search Row */}
        <div className="px-4 pt-3 pb-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search compliance..."
            className="h-9 text-sm"
          />
        </div>

        {/* Status Tabs */}
        <div className="px-4 pb-2">
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
        </div>

        {/* Category Filter Row */}
        <div className="px-4 py-2">
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
                onClick={() => { setActiveCategory("all"); setAllFilter("all"); }}
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
                  {category.name} ({getCategoryCount(category.id)})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-4 space-y-3">
        <PageIntro
          highlight="Stay audit-ready, all year round."
          description="Track certifications, registrations and safety requirements in one dashboard so nothing lapses when it matters."
        />

        {itemsByStatus[statusFilter].length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No compliance items found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {itemsByStatus[statusFilter].map((item) => (
              <ComplianceCard 
                key={item.id} 
                item={item} 
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onEditItem={handleEditItem}
                onRenewItem={handleRenewItem}
                onCreateTask={handleOpenTaskDialog}
                categoryName={categories.find((c) => c.id === item.categoryId)?.name}
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <PageHeader
        title="Compliance"
        subtitle="Track certifications, registrations, and safety requirements"
        icon={ShieldCheck}
        actions={
          <Button onClick={() => setAiTaskDialogOpen(true)} className="gap-2" size="sm">
            <Sparkles className="w-4 h-4" />
            AI Task Creation
          </Button>
        }
      />

      <div className="hidden md:block px-8 py-4 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Stay audit-ready, all year round."
          description="Track certifications, registrations and safety requirements in one dashboard so nothing lapses when it matters."
        />


        {/* Section label */}
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
          <span className="text-[12px] text-muted-foreground">{categories.length} categories · {items.length} total items</span>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <ComplianceCategoryCard
              key={category.id}
              category={category}
              items={items.filter(item => item.categoryId === category.id)}
              onClick={() => navigate(`/compliance/category/${category.id}`)}
            />
          ))}
        </div>

        {/* Add Category button */}
        <div className="flex items-center gap-2 mt-2">
          <AddCategoryDialog onAddCategory={handleAddCategory} />
        </div>
      </div>

      {/* Edit/Renew Dialog */}
      <EditComplianceDialog
        item={editingItem}
        categories={categories}
        onUpdateItem={handleUpdateItem}
        onClose={handleCloseEditDialog}
        isRenewMode={isRenewMode}
      />

      {/* Create Task Dialog */}
      <CreateTaskFromComplianceDialog
        complianceItem={taskDialogItem}
        open={!!taskDialogItem}
        onOpenChange={(open) => !open && setTaskDialogItem(null)}
        onCreateTask={handleCreateTask}
      />

      {/* AI Task Generator Dialog */}
      <AITaskGeneratorDialog
        open={aiTaskDialogOpen}
        onOpenChange={setAiTaskDialogOpen}
        items={items}
        categories={categories}
        onConfirmTasks={(newTasks) => {
          const created = newTasks.map((t, i) => ({
            ...t,
            id: `ai-${Date.now()}-${i}`,
            createdAt: new Date(),
          }));
          setTasks((prev) => [...created, ...prev]);
        }}
      />
    </AdminLayout>
  );
}

export { Compliance };
