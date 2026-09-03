import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare, LayoutGrid, Table as TableIcon } from "lucide-react";
import { mockChecklists } from "@/data/mockChecklists";
import { Checklist, ChecklistCategory, DEFAULT_CHECKLIST_CATEGORIES, ChecklistAssignment } from "@/types/checklists";
import { ChecklistCard } from "@/components/checklists/ChecklistCard";
import { ChecklistTableView } from "@/components/checklists/ChecklistTableView";
import { AssignChecklistDialog } from "@/components/checklists/AssignChecklistDialog";
import { EditChecklistSettingsDialog } from "@/components/checklists/EditChecklistSettingsDialog";
import { mockTeamMembers } from "@/data/mockTeamMembers";
import { toast } from "sonner";

const ChecklistDetail = () => {
  const { checklistId } = useParams<{ checklistId: string }>();
  const navigate = useNavigate();

  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [categories] = useState<ChecklistCategory[]>(DEFAULT_CHECKLIST_CATEGORIES);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"digital" | "table">("digital");

  const checklist = checklists.find(c => c.id === checklistId);

  const departmentNames = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => { map[cat.id] = cat.name; });
    return map;
  }, [categories]);

  const categoryName = checklist ? categories.find(c => c.id === checklist.categoryId)?.name : undefined;

  const handleToggleItem = (cId: string, itemId: string) => {
    setChecklists(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      items: c.items.map(item => item.id === itemId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date() : undefined, completedBy: !item.completed ? "Current User" : undefined }
        : item
      ),
    }));
  };

  const handleAddItem = (cId: string, text: string) => {
    setChecklists(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      items: [...c.items, { id: `item-${Date.now()}`, text, type: "tick", completed: false }],
    }));
    toast.success("Item added");
  };

  const handleDeleteItem = (cId: string, itemId: string) => {
    setChecklists(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      items: c.items.filter(item => item.id !== itemId),
    }));
    toast.success("Item removed");
  };

  const handleResetChecklist = (cId: string) => {
    setChecklists(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      items: c.items.map(item => ({ ...item, completed: false, completedAt: undefined, completedBy: undefined })),
      lastReset: new Date(),
    }));
    toast.success("Checklist reset");
  };

  const handleUpdateItemValue = (cId: string, itemId: string, value: { yesNoValue?: "yes" | "no"; numberValue?: string; comment?: string }) => {
    setChecklists(prev => prev.map(c => {
      if (c.id !== cId) return c;
      return {
        ...c,
        items: c.items.map(item => {
          if (item.id !== itemId) return item;
          const isCommentOnly = value.yesNoValue === undefined && value.numberValue === undefined;
          if (isCommentOnly && "comment" in value) {
            return { ...item, comment: value.comment };
          }
          const isCompleted = value.yesNoValue !== undefined || value.numberValue !== undefined;
          return { ...item, ...value, completed: isCompleted, completedAt: isCompleted ? new Date() : undefined, completedBy: isCompleted ? "Current User" : undefined };
        }),
      };
    }));
  };


  const handleToggleCritical = (cId: string, itemId: string) => {
    setChecklists(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      items: c.items.map(item => item.id === itemId ? { ...item, critical: !item.critical } : item),
    }));
    toast.success("Item updated");
  };

  const handleSaveAssignment = (assignment: ChecklistAssignment) => {
    if (!checklistId) return;
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, assignment } : c));
    toast.success("Assignment updated");
  };

  const handleSaveSettings = (settings: { recurring: "daily" | "weekly" | "monthly" | null; assignment: ChecklistAssignment }) => {
    if (!checklistId) return;
    setChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, recurring: settings.recurring, assignment: settings.assignment } : c));
    toast.success("Settings updated");
  };

  if (!checklist) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <CheckSquare className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Checklist not found</p>
          <Button variant="outline" onClick={() => navigate("/checklists")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Checklists
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Mobile Header */}
      <MobileHeader
        title={checklist.title}
        subtitle={categoryName || "Checklist"}
        actions={
          <Button variant="ghost" size="icon" onClick={() => navigate("/checklists")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
      />

      {/* Mobile Content */}
      <div className="md:hidden p-4 space-y-3">
        <ViewToggle value={viewMode} onChange={setViewMode} />
        {viewMode === "digital" ? (
          <ChecklistCard
            checklist={checklist}
            categoryName={categoryName}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onResetChecklist={handleResetChecklist}
            onUpdateItemValue={handleUpdateItemValue}
            onToggleCritical={handleToggleCritical}
            onAssign={() => setAssignDialogOpen(true)}
            onEditSettings={() => setSettingsDialogOpen(true)}
            onSubmitChecklist={(id) => {
              toast.success("Checklist submitted successfully!");
              navigate("/checklists");
            }}
            teamMembers={mockTeamMembers}
            departmentNames={departmentNames}
            defaultOpen={true}
          />
        ) : (
          <ChecklistTableView
            checklist={checklist}
            categoryName={categoryName}
            onToggleItem={handleToggleItem}
            onUpdateItemValue={handleUpdateItemValue}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block px-8 pt-8 pb-2 max-w-4xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/checklists")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{checklist.title}</h2>
            {categoryName && (
              <p className="text-[13px] text-muted-foreground">{categoryName}</p>
            )}
          </div>
          {checklist.recurring && (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground capitalize">
              {checklist.recurring}
            </span>
          )}
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "digital" ? (
          <ChecklistCard
            checklist={checklist}
            categoryName={categoryName}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onResetChecklist={handleResetChecklist}
            onUpdateItemValue={handleUpdateItemValue}
            onToggleCritical={handleToggleCritical}
            onAssign={() => setAssignDialogOpen(true)}
            onEditSettings={() => setSettingsDialogOpen(true)}
            onSubmitChecklist={(id) => {
              toast.success("Checklist submitted successfully!");
              navigate("/checklists");
            }}
            teamMembers={mockTeamMembers}
            departmentNames={departmentNames}
            defaultOpen={true}
          />
        ) : (
          <ChecklistTableView
            checklist={checklist}
            categoryName={categoryName}
            onToggleItem={handleToggleItem}
            onUpdateItemValue={handleUpdateItemValue}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </div>

      <AssignChecklistDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        currentAssignment={checklist.assignment}
        onSave={handleSaveAssignment}
        teamMembers={mockTeamMembers}
        checklistTitle={checklist.title}
      />

      <EditChecklistSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        checklist={checklist}
        onSave={handleSaveSettings}
        teamMembers={mockTeamMembers}
        departmentNames={departmentNames}
        onOpenAssignDialog={() => setAssignDialogOpen(true)}
      />
    </AdminLayout>
  );
};

function ViewToggle({
  value,
  onChange,
}: {
  value: "digital" | "table";
  onChange: (v: "digital" | "table") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange("digital")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
          value === "digital" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Digital
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
          value === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <TableIcon className="w-3.5 h-3.5" />
        Table
      </button>
    </div>
  );
}

export default ChecklistDetail;

