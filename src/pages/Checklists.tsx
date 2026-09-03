import { useState, useMemo } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Bell,
  ChevronDown,
  CheckSquare,
  Plus,
  ListChecks,
  History,
  PlayCircle,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { mockChecklists } from "@/data/mockChecklists";
import { Checklist, ChecklistCategory, DEFAULT_CHECKLIST_CATEGORIES, CategoryType, ChecklistAssignment } from "@/types/checklists";
import { ChecklistLibraryFilters, ChecklistFilters as ChecklistFilterState } from "@/components/checklists/ChecklistLibraryFilters";

import { ChecklistSummaryCard } from "@/components/checklists/ChecklistSummaryCard";
import { ChecklistFilters } from "@/components/checklists/ChecklistFilters";
import { CreateChecklistDialog } from "@/components/checklists/CreateChecklistDialog";
import { ChecklistCreator } from "@/components/checklists/ChecklistCreator";
import { AddChecklistCategoryDialog } from "@/components/checklists/AddChecklistCategoryDialog";
import { AIChecklistDialog } from "@/components/checklists/AIChecklistDialog";
import { AssignChecklistDialog } from "@/components/checklists/AssignChecklistDialog";
import { EditChecklistSettingsDialog } from "@/components/checklists/EditChecklistSettingsDialog";
import { PageIntro } from "@/components/layout/PageIntro";
import { CHECKLISTS_PRACTICE_TIPS } from "@/components/checklists/checklistsPracticeTips";
import { mockTeamMembers } from "@/data/mockTeamMembers";

import { ChecklistSubmissionsTab } from "@/components/checklists/ChecklistSubmissionsTab";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/ExportDropdown";
import { exportChecklistsCSV, exportChecklistsPDF } from "@/utils/moduleExports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AllFilter = "all" | "internal" | "external";

const Checklists = () => {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [categories, setCategories] = useState<ChecklistCategory[]>(DEFAULT_CHECKLIST_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [allFilter, setAllFilter] = useState<AllFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "inProgress" | "notStarted" | "completed">("all");
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedChecklistForAssign, setSelectedChecklistForAssign] = useState<string | null>(null);
  const [selectedChecklistForSettings, setSelectedChecklistForSettings] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"creation" | "library" | "submissions">("library");
  
  const [desktopTab, setDesktopTab] = useState<"creation" | "library" | "submissions">("library");
  
  // Library filters
  const [libraryFilters, setLibraryFilters] = useState<ChecklistFilterState>({
    frequencies: [],
    types: [],
    assignments: [],
    departments: [],
    status: "all",
  });

  // Create department names map
  const departmentNames = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      // Category filter
      if (activeCategory === "all") {
        if (allFilter !== "all") {
          const checklistCategory = categories.find((c) => c.id === checklist.categoryId);
          if (checklistCategory && checklistCategory.type !== allFilter) {
            return false;
          }
        }
      } else if (checklist.categoryId !== activeCategory) {
        return false;
      }
      
      // Search filter
      if (
        searchQuery &&
        !checklist.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !checklist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Department filter
      if (libraryFilters.departments.length > 0) {
        if (!checklist.categoryId || !libraryFilters.departments.includes(checklist.categoryId)) {
          return false;
        }
      }

      // Frequency filter
      if (libraryFilters.frequencies.length > 0) {
        const freq = checklist.frequency?.type || checklist.recurring || null;
        if (!freq || !libraryFilters.frequencies.includes(freq as any)) {
          return false;
        }
      }

      // Type filter (general vs room-setup)
      if (libraryFilters.types.length > 0) {
        const isRoomSetup = checklist.frequency && (checklist as any).selectedRooms?.length > 0;
        const type = isRoomSetup ? "room-setup" : "general";
        if (!libraryFilters.types.includes(type as any)) {
          return false;
        }
      }

      // Assignment filter (group vs individual)
      if (libraryFilters.assignments.length > 0) {
        const isIndividual = checklist.assignment?.type === "users" && 
          checklist.assignment.userIds?.length === 1 && 
          !checklist.assignment.departmentIds?.length;
        const assignType = isIndividual ? "individual" : "group";
        if (!libraryFilters.assignments.includes(assignType as any)) {
          return false;
        }
      }

      // Status filter
      if (libraryFilters.status !== "all") {
        const completedCount = checklist.items.filter((i) => i.completed).length;
        const total = checklist.items.length;
        if (libraryFilters.status === "completed" && completedCount !== total) return false;
        if (libraryFilters.status === "notStarted" && completedCount !== 0) return false;
        if (libraryFilters.status === "inProgress" && (completedCount === 0 || completedCount === total)) return false;
      }

      return true;
    });
  }, [checklists, activeCategory, allFilter, searchQuery, categories, libraryFilters]);

  const handleToggleItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed ? new Date() : undefined,
                  completedBy: !item.completed ? "Current User" : undefined,
                }
              : item
          ),
        };
      })
    );
  };

  const handleAddItem = (checklistId: string, text: string) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: [
            ...checklist.items,
            {
              id: `item-${Date.now()}`,
              text,
              type: "tick",
              completed: false,
            },
          ],
        };
      })
    );
    toast.success("Item added");
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: checklist.items.filter((item) => item.id !== itemId),
        };
      })
    );
    toast.success("Item removed");
  };

  const handleResetChecklist = (checklistId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: checklist.items.map((item) => ({
            ...item,
            completed: false,
            completedAt: undefined,
            completedBy: undefined,
          })),
          lastReset: new Date(),
        };
      })
    );
    toast.success("Checklist reset");
  };

  const handleUpdateItemValue = (
    checklistId: string,
    itemId: string,
    value: { yesNoValue?: "yes" | "no"; numberValue?: string; comment?: string }
  ) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: checklist.items.map((item) => {
            if (item.id !== itemId) return item;
            const isCommentOnly =
              value.yesNoValue === undefined && value.numberValue === undefined;
            if (isCommentOnly && "comment" in value) {
              return { ...item, comment: value.comment };
            }
            const isCompleted = value.yesNoValue !== undefined || value.numberValue !== undefined;
            return {
              ...item,
              ...value,
              completed: isCompleted,
              completedAt: isCompleted ? new Date() : undefined,
              completedBy: isCompleted ? "Current User" : undefined,
            };
          }),
        };
      })
    );
  };


  const handleToggleCritical = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) => {
        if (checklist.id !== checklistId) return checklist;
        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === itemId
              ? { ...item, critical: !item.critical }
              : item
          ),
        };
      })
    );
    toast.success("Item updated");
  };

  const handleCreateChecklist = (newChecklist: Omit<Checklist, "id" | "createdAt">): string => {
    const newId = `checklist-${Date.now()}`;
    const checklist: Checklist = {
      ...newChecklist,
      id: newId,
      createdAt: new Date(),
    };
    setChecklists((prev) => [checklist, ...prev]);
    setNewlyCreatedId(newId);
    toast.success("Checklist created");
    return newId;
  };

  const handleAddCategory = (category: ChecklistCategory) => {
    setCategories((prev) => [...prev, category]);
    toast.success("Department added");
  };

  const handleOpenAssignDialog = (checklistId: string) => {
    setSelectedChecklistForAssign(checklistId);
    setAssignDialogOpen(true);
  };

  const handleSaveAssignment = (assignment: ChecklistAssignment) => {
    if (!selectedChecklistForAssign) return;
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === selectedChecklistForAssign
          ? { ...checklist, assignment }
          : checklist
      )
    );
    toast.success("Assignment updated");
  };

  const handleOpenSettingsDialog = (checklistId: string) => {
    setSelectedChecklistForSettings(checklistId);
    setSettingsDialogOpen(true);
  };

  const handleSaveSettings = (settings: { recurring: "daily" | "weekly" | "monthly" | null; assignment: ChecklistAssignment }) => {
    if (!selectedChecklistForSettings) return;
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === selectedChecklistForSettings
          ? { ...checklist, recurring: settings.recurring, assignment: settings.assignment }
          : checklist
      )
    );
    toast.success("Settings updated");
  };

  const selectedChecklist = checklists.find((c) => c.id === selectedChecklistForAssign);
  const selectedChecklistSettings = checklists.find((c) => c.id === selectedChecklistForSettings);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return checklists.length;
    return checklists.filter((c) => c.categoryId === categoryId).length;
  };

  const isChecklistAssigned = (c: Checklist) => {
    const a = c.assignment;
    if (!a) return false;
    if (a.type === "all") return true;
    return (a.userIds?.length || 0) > 0 || (a.departmentIds?.length || 0) > 0;
  };

  const assignedChecklists = filteredChecklists.filter(isChecklistAssigned);
  const unassignedChecklists = filteredChecklists.filter((c) => !isChecklistAssigned(c));

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title="Checklists"
        subtitle="Create, manage and track checklists"
        actions={
          <Button variant="outline" size="icon" className="relative h-9 w-9 border-primary/30 bg-primary/5 hover:bg-primary/10">
            <Bell className="w-4 h-4 text-primary" />
          </Button>
        }
      />

      {/* Mobile: Navigation tabs below header */}
      <div className="md:hidden sticky top-[56px] z-20 bg-card">
        <div className="px-4 pt-4 pb-3">
          <SegmentedControl
            options={[
              { id: "creation" as const, label: "Create", icon: Plus },
              { id: "library" as const, label: "Library", icon: ListChecks },
              { id: "submissions" as const, label: "History", icon: History },
            ]}
            value={mobileTab}
            onChange={(val) => setMobileTab(val)}
            size="sm"
            fullWidth
          />
        </div>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex min-h-[64px] bg-background/80 backdrop-blur-sm border-b border-border/50 px-10 items-center justify-between sticky top-0 z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight tracking-tight">Checklists</h2>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5">Create, manage and track checklists</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Content */}
      <div className="md:hidden p-4 space-y-4">
        {/* Library Tab Content */}
        {/* Creation Tab Content */}
        {mobileTab === "creation" && (
          <ChecklistCreator
            categories={categories}
            onCreateChecklist={(checklist) => {
              const id = handleCreateChecklist(checklist);
              setMobileTab("library");
              return id;
            }}
            defaultCategoryId={activeCategory !== "all" ? activeCategory : undefined}
          />
        )}

        {mobileTab === "library" && (
          <>
            {/* Search + Filters */}
            <ChecklistFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <ChecklistLibraryFilters filters={libraryFilters} onFiltersChange={setLibraryFilters} resultCount={filteredChecklists.length} departmentOptions={categories.map((c) => ({ id: c.id, name: c.name }))} />

            {filteredChecklists.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No checklists found</p>
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  { key: "assigned", label: "Assigned", list: assignedChecklists },
                  { key: "unassigned", label: "Unassigned", list: unassignedChecklists },
                ].filter((g) => g.list.length > 0).map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.label}
                      </span>
                      <span className="text-xs text-muted-foreground">({group.list.length})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {group.list.map((checklist) => (
                        <ChecklistSummaryCard
                          key={checklist.id}
                          checklist={checklist}
                          isAssigned={group.key === "assigned"}
                          categoryName={categories.find((c) => c.id === checklist.categoryId)?.name}
                          onOpen={(id) => navigate(`/checklists/${id}`)}
                          onEditSettings={handleOpenSettingsDialog}
                          onResetChecklist={handleResetChecklist}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Submissions Tab Content */}
        {mobileTab === "submissions" && (
          <ChecklistSubmissionsTab categories={categories} />
        )}
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block p-4 md:px-8 md:py-8 max-w-4xl mx-auto space-y-6">
        <PageIntro
          highlight="Consistent care starts with reliable checklists."
          description="Build reusable checklists, run them across your team, and review every submission — so opening, closing and clinical routines happen the same way every time."
        />
        {/* Top Navigation Tabs - using SegmentedControl */}
        <SegmentedControl
          options={[
            { id: "creation" as const, label: "Create", icon: Plus },
            { id: "library" as const, label: "Library", icon: ListChecks },
            { id: "submissions" as const, label: "Submissions", icon: History },
          ]}
          value={desktopTab}
          onChange={(val) => setDesktopTab(val)}
        />

        {/* ========== LIBRARY TAB ========== */}
        {/* ========== CREATION TAB ========== */}
        {desktopTab === "creation" && (
          <div className="space-y-6">
            <ChecklistCreator
              categories={categories}
              onCreateChecklist={(checklist) => {
                const id = handleCreateChecklist(checklist);
                setDesktopTab("library");
                return id;
              }}
              defaultCategoryId={activeCategory !== "all" ? activeCategory : undefined}
            />
          </div>
        )}

        {/* ========== LIBRARY TAB ========== */}
        {desktopTab === "library" && (
          <div className="space-y-6">
            {/* Search + Filters + Export */}
            <div className="flex items-center justify-between gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search checklists..."
                className="max-w-sm"
              />
              <ExportDropdown
                onExportCSV={() => { exportChecklistsCSV(filteredChecklists); toast.success("CSV exported"); }}
                onExportPDF={() => exportChecklistsPDF(filteredChecklists)}
              />
            </div>
            <ChecklistLibraryFilters filters={libraryFilters} onFiltersChange={setLibraryFilters} resultCount={filteredChecklists.length} departmentOptions={categories.map((c) => ({ id: c.id, name: c.name }))} />

            {filteredChecklists.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No checklists found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {[
                  { key: "assigned", label: "Assigned", list: assignedChecklists },
                  { key: "unassigned", label: "Unassigned", list: unassignedChecklists },
                ].filter((g) => g.list.length > 0).map((group) => (
                  <div key={group.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.label}
                      </span>
                      <span className="text-xs text-muted-foreground">({group.list.length})</span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.list.map((checklist) => (
                        <ChecklistSummaryCard
                          key={checklist.id}
                          checklist={checklist}
                          isAssigned={group.key === "assigned"}
                          categoryName={categories.find((c) => c.id === checklist.categoryId)?.name}
                          onOpen={(id) => navigate(`/checklists/${id}`)}
                          onEditSettings={handleOpenSettingsDialog}
                          onResetChecklist={handleResetChecklist}
                          onDelete={(id) => setChecklists((prev) => prev.filter((c) => c.id !== id))}
                          onAssign={handleOpenAssignDialog}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== SUBMISSIONS TAB ========== */}
        {desktopTab === "submissions" && (
          <div className="space-y-6">
            <ChecklistSubmissionsTab categories={categories} />
          </div>
        )}
      </div>



      <AssignChecklistDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        currentAssignment={selectedChecklist?.assignment}
        onSave={handleSaveAssignment}
        teamMembers={mockTeamMembers}
        checklistTitle={selectedChecklist?.title || ""}
      />

      {/* Settings Dialog */}
      {selectedChecklistSettings && (
        <EditChecklistSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          checklist={selectedChecklistSettings}
          onSave={handleSaveSettings}
          teamMembers={mockTeamMembers}
          departmentNames={departmentNames}
          onOpenAssignDialog={() => {
            setSelectedChecklistForAssign(selectedChecklistForSettings);
            setAssignDialogOpen(true);
          }}
        />
      )}
  </AdminLayout>
  );
};

export default Checklists;
