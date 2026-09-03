import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  Briefcase,
  Shield,
  Crown,
  Lock,
  Check,
  ChevronsUpDown,
  Package,
} from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Department, DepartmentType, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { STAFF_ROLE_LEVELS, StaffRoleLevel } from "@/types/staff";
import { StockCategory, DEFAULT_STOCK_CATEGORIES } from "@/types/stock";
import { PRACTICE_TYPE_OPTIONS, PRACTICE_TYPE_DEPARTMENTS, PRACTICE_TYPE_ROLES, PRACTICE_TYPE_ADMIN_CATEGORIES, PRACTICE_TYPE_STOCK_CATEGORIES, PRACTICE_TYPE_GROUPED, PracticeType } from "@/data/practiceTypeDepartments";
import { toast } from "sonner";

const ICON_OPTIONS = [
  { value: "Users", label: "Users" },
  { value: "Heart", label: "Heart" },
  { value: "Stethoscope", label: "Stethoscope" },
  { value: "FileText", label: "FileText" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Monitor", label: "Monitor" },
  { value: "Building2", label: "Building" },
  { value: "Phone", label: "Phone" },
  { value: "Shield", label: "Shield" },
  { value: "Wrench", label: "Wrench" },
  { value: "Truck", label: "Truck" },
  { value: "Package", label: "Package" },
  { value: "Crown", label: "Crown" },
  { value: "Calculator", label: "Calculator" },
  { value: "SprayCan", label: "SprayCan" },
];

const COLOR_OPTIONS = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-emerald-500", label: "Emerald" },
  { value: "bg-slate-500", label: "Slate" },
  { value: "bg-gray-500", label: "Gray" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-indigo-500", label: "Indigo" },
];

interface UserRole {
  id: string;
  name: string;
  isDefault: boolean;
}

interface AdminCategory {
  value: StaffRoleLevel;
  label: string;
  isDefault: boolean;
}

export function DepartmentsTab() {
  // Departments state
  const [departments, setDepartments] = useState<Department[]>([...DEFAULT_DEPARTMENTS]);
  const [practiceType, setPracticeType] = useState<PracticeType | "">("");
  const [pendingPracticeType, setPendingPracticeType] = useState<PracticeType | null>(null);
  const [practiceTypeOpen, setPracticeTypeOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showAddDeptDialog, setShowAddDeptDialog] = useState(false);
  const [newDept, setNewDept] = useState({
    name: "",
    description: "",
    icon: "Users",
    color: "bg-blue-500",
    type: "internal" as DepartmentType,
  });

  const applyPracticeType = (value: PracticeType) => {
    setPendingPracticeType(value);
  };

  const confirmPracticeTypeChange = () => {
    if (!pendingPracticeType) return;
    const preset = PRACTICE_TYPE_DEPARTMENTS[pendingPracticeType];
    setDepartments(preset.map(d => ({ ...d, isDefault: true })));

    // Update user roles based on practice type
    const roleNames = PRACTICE_TYPE_ROLES[pendingPracticeType];
    setUserRoles(roleNames.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, "_"),
      name,
      isDefault: true,
    })));

    // Update admin categories based on practice type
    const cats = PRACTICE_TYPE_ADMIN_CATEGORIES[pendingPracticeType];
    setAdminCategories(cats.map(c => ({
      value: c.value as StaffRoleLevel,
      label: c.label,
      isDefault: true,
    })));

    // Update stock categories based on practice type
    const stocks = PRACTICE_TYPE_STOCK_CATEGORIES[pendingPracticeType];
    setStockCategories(stocks.map(s => ({ ...s, isDefault: true })));

    setPracticeType(pendingPracticeType);
    setSelectedDeptIds(new Set());
    setSelectedRoleIds(new Set());
    setSelectedCategoryIds(new Set());
    setSelectedStockCatIds(new Set());
    const label = PRACTICE_TYPE_OPTIONS.find(o => o.value === pendingPracticeType)?.label;
    toast.success(`Departments, roles, admin categories & stock categories updated for ${label}`);
    setPendingPracticeType(null);
  };

  // Bulk selection state
  const [selectedDeptIds, setSelectedDeptIds] = useState<Set<string>>(new Set());

  const toggleDeptSelected = (id: string) => {
    setSelectedDeptIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDeptIds.size === departments.length) {
      setSelectedDeptIds(new Set());
    } else {
      setSelectedDeptIds(new Set(departments.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedDeptIds.size;
    setDepartments(departments.filter(d => !selectedDeptIds.has(d.id)));
    setSelectedDeptIds(new Set());
    toast.success(`${count} department${count === 1 ? "" : "s"} removed`);
  };

  // Role bulk selection
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const toggleRoleSelected = (id: string) => {
    setSelectedRoleIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Admin category bulk selection
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const toggleCategorySelected = (id: string) => {
    setSelectedCategoryIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // User Roles state
  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { id: "receptionist", name: "Receptionist", isDefault: true },
    { id: "nurse", name: "Nurse", isDefault: true },
    { id: "doctor", name: "Doctor", isDefault: true },
    { id: "practice_manager", name: "Practice Manager", isDefault: true },
    { id: "admin_assistant", name: "Admin Assistant", isDefault: true },
    { id: "cleaner", name: "Cleaner", isDefault: true },
  ]);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  // Admin Categories state
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>(
    STAFF_ROLE_LEVELS.map(role => ({
      value: role.value,
      label: role.label,
      isDefault: true,
    }))
  );
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Stock Categories state
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([...DEFAULT_STOCK_CATEGORIES]);
  const [selectedStockCatIds, setSelectedStockCatIds] = useState<Set<string>>(new Set());
  const [showAddStockCatDialog, setShowAddStockCatDialog] = useState(false);
  const [newStockCatName, setNewStockCatName] = useState("");
  const [newStockCatDesc, setNewStockCatDesc] = useState("");
  const toggleStockCatSelected = (id: string) => {
    setSelectedStockCatIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const handleAddStockCategory = () => {
    if (!newStockCatName.trim()) {
      toast.error("Please enter a stock category name");
      return;
    }
    const id = newStockCatName.toLowerCase().replace(/\s+/g, "-");
    setStockCategories([...stockCategories, {
      id,
      name: newStockCatName.trim(),
      displayName: newStockCatName.trim(),
      description: newStockCatDesc.trim(),
      icon: "Package",
      isDefault: false,
    }]);
    setNewStockCatName("");
    setNewStockCatDesc("");
    setShowAddStockCatDialog(false);
    toast.success(`Stock category "${newStockCatName.trim()}" added`);
  };
  const handleDeleteStockCategory = (cat: StockCategory) => {
    setStockCategories(stockCategories.filter(c => c.id !== cat.id));
    toast.success(`Stock category "${cat.name}" deleted`);
  };

  // Department handlers
  const handleAddDepartment = () => {
    if (!newDept.name.trim()) {
      toast.error("Please enter a department name");
      return;
    }

    const id = newDept.name.toLowerCase().replace(/\s+/g, "_");
    const department: Department = {
      id,
      name: newDept.name.trim(),
      description: newDept.description.trim() || undefined,
      icon: newDept.icon,
      color: newDept.color,
      type: newDept.type,
      isDefault: false,
    };

    setDepartments([...departments, department]);
    setNewDept({ name: "", description: "", icon: "Users", color: "bg-blue-500", type: "internal" });
    setShowAddDeptDialog(false);
    toast.success(`Department "${department.name}" added`);
  };

  const handleUpdateDepartment = () => {
    if (!editingDept) return;

    setDepartments(departments.map(d => 
      d.id === editingDept.id ? editingDept : d
    ));
    setEditingDept(null);
    toast.success(`Department "${editingDept.name}" updated`);
  };

  const handleDeleteDepartment = (dept: Department) => {
    setDepartments(departments.filter(d => d.id !== dept.id));
    toast.success(`Department "${dept.name}" deleted`);
  };

  // User Role handlers
  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    const id = newRoleName.toLowerCase().replace(/\s+/g, "_");
    setUserRoles([...userRoles, { id, name: newRoleName.trim(), isDefault: false }]);
    setNewRoleName("");
    setShowAddRoleDialog(false);
    toast.success(`Role "${newRoleName.trim()}" added`);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    setUserRoles(userRoles.map(r => 
      r.id === editingRole.id ? editingRole : r
    ));
    setEditingRole(null);
    toast.success(`Role "${editingRole.name}" updated`);
  };

  const handleDeleteRole = (role: UserRole) => {
    setUserRoles(userRoles.filter(r => r.id !== role.id));
    toast.success(`Role "${role.name}" deleted`);
  };

  // Admin Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const value = newCategoryName.toLowerCase().replace(/\s+/g, "_") as StaffRoleLevel;
    setAdminCategories([...adminCategories, { 
      value, 
      label: newCategoryName.trim(), 
      isDefault: false 
    }]);
    setNewCategoryName("");
    setShowAddCategoryDialog(false);
    toast.success(`Admin category "${newCategoryName.trim()}" added`);
  };

  const handleDeleteCategory = (category: AdminCategory) => {
    setAdminCategories(adminCategories.filter(c => c.value !== category.value));
    toast.success(`Admin category "${category.label}" deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Practice Type Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Practice Type
          </CardTitle>
          <CardDescription>
            Choose your practice type to automatically tailor Departments, User Roles, and Admin Categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[240px] max-w-md">
              <Label className="text-xs text-muted-foreground">Practice type</Label>
              <Popover open={practiceTypeOpen} onOpenChange={setPracticeTypeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={practiceTypeOpen}
                    className="h-10 w-full justify-between font-normal"
                  >
                    {practiceType
                      ? PRACTICE_TYPE_OPTIONS.find(o => o.value === practiceType)?.label
                      : "Select practice type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search practice type..." />
                    <CommandList>
                      <CommandEmpty>No practice type found.</CommandEmpty>
                      {PRACTICE_TYPE_GROUPED.map(grp => (
                        <CommandGroup key={grp.group} heading={grp.label}>
                          {grp.options.map(opt => (
                            <CommandItem
                              key={opt.value}
                              value={`${grp.label} ${opt.label}`}
                              onSelect={() => {
                                applyPracticeType(opt.value);
                                setPracticeTypeOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  practiceType === opt.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {opt.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {practiceType && (
              <Badge variant="secondary" className="h-7">
                Active: {PRACTICE_TYPE_OPTIONS.find(o => o.value === practiceType)?.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Changing this will replace the current Departments, User Roles, and Admin Categories with a preset tailored to the selected practice type.
          </p>
          <AlertDialog open={!!pendingPracticeType} onOpenChange={(o) => !o && setPendingPracticeType(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apply practice type preset?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace your current <strong>Departments</strong>, <strong>User Roles</strong>, and <strong>Admin Categories</strong> with a preset tailored for{" "}
                  <strong>{PRACTICE_TYPE_OPTIONS.find(o => o.value === pendingPracticeType)?.label}</strong>.
                  Custom entries you've added will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmPracticeTypeChange}>Apply preset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Departments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Departments
              </CardTitle>
              <CardDescription>
                Manage departments used across Staff, Tasks, Checklists, and other modules
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={showAddDeptDialog} onOpenChange={setShowAddDeptDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department</DialogTitle>
                  <DialogDescription>
                    Create a new department for organizing staff and content
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="deptName">Name *</Label>
                    <Input
                      id="deptName"
                      value={newDept.name}
                      onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                      placeholder="e.g. Laboratory"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deptDesc">Description</Label>
                    <Textarea
                      id="deptDesc"
                      value={newDept.description}
                      onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                      placeholder="Brief description"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={newDept.type} 
                        onValueChange={(v) => setNewDept({ ...newDept, type: v as DepartmentType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select 
                        value={newDept.icon} 
                        onValueChange={(v) => setNewDept({ ...newDept, icon: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <DynamicIcon name={opt.value} className="w-4 h-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select 
                      value={newDept.color} 
                      onValueChange={(v) => setNewDept({ ...newDept, color: v })}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${newDept.color}`} />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${opt.value}`} />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowAddDeptDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDepartment}>Add Department</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-muted/40 border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedDeptIds.size === departments.length && departments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-muted-foreground">
                  {selectedDeptIds.size > 0
                    ? `${selectedDeptIds.size} selected`
                    : "Select all"}
                </span>
              </label>
              {selectedDeptIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedDeptIds.size} department{selectedDeptIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Staff and content assigned to these departments may need reassignment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${selectedDeptIds.has(dept.id) ? "ring-1 ring-primary/40 bg-muted/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedDeptIds.has(dept.id)}
                    onCheckedChange={() => toggleDeptSelected(dept.id)}
                  />
                  <div className={`p-2 rounded-lg ${dept.color} bg-opacity-20`}>
                    <DynamicIcon name={dept.icon} className={`w-4 h-4 ${dept.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dept.name}</span>
                      <Badge variant="outline" className={dept.type === "internal" ? "bg-muted" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}>
                        {dept.type}
                      </Badge>
                      {dept.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {dept.description && (
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editingDept?.id === dept.id} onOpenChange={(open) => !open && setEditingDept(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingDept(dept)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                          Update department details
                        </DialogDescription>
                      </DialogHeader>
                      {editingDept && (
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={editingDept.name}
                              onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={editingDept.description || ""}
                              onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select 
                                value={editingDept.type} 
                                onValueChange={(v) => setEditingDept({ ...editingDept, type: v as DepartmentType })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="internal">Internal</SelectItem>
                                  <SelectItem value="external">External</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <Select 
                                value={editingDept.icon} 
                                onValueChange={(v) => setEditingDept({ ...editingDept, icon: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ICON_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <div className="flex items-center gap-2">
                                        <DynamicIcon name={opt.value} className="w-4 h-4" />
                                        {opt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select 
                              value={editingDept.color} 
                              onValueChange={(v) => setEditingDept({ ...editingDept, color: v })}
                            >
                              <SelectTrigger>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${editingDept.color}`} />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {COLOR_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full ${opt.value}`} />
                                      {opt.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setEditingDept(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateDepartment}>Save Changes</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {!dept.isDefault && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Department</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{dept.name}"? This may affect staff members assigned to this department.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDepartment(dept)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* User Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Roles
              </CardTitle>
              <CardDescription>
                Manage job titles and roles that can be assigned to staff members
              </CardDescription>
            </div>
            <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add User Role</DialogTitle>
                  <DialogDescription>
                    Create a new job title or role for staff members
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="e.g. Senior Nurse"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRole}>Add Role</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-muted/40 border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedRoleIds.size === userRoles.length && userRoles.length > 0}
                  onCheckedChange={() => {
                    if (selectedRoleIds.size === userRoles.length) setSelectedRoleIds(new Set());
                    else setSelectedRoleIds(new Set(userRoles.map(r => r.id)));
                  }}
                />
                <span className="text-muted-foreground">
                  {selectedRoleIds.size > 0 ? `${selectedRoleIds.size} selected` : "Select all"}
                </span>
              </label>
              {selectedRoleIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedRoleIds.size} role{selectedRoleIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Staff assigned to these roles may need reassignment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const count = selectedRoleIds.size;
                          setUserRoles(userRoles.filter(r => !selectedRoleIds.has(r.id)));
                          setSelectedRoleIds(new Set());
                          toast.success(`${count} role${count === 1 ? "" : "s"} removed`);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          <div className="space-y-2">
            {userRoles.map((role) => (
              <div
                key={role.id}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${selectedRoleIds.has(role.id) ? "ring-1 ring-primary/40 bg-muted/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedRoleIds.has(role.id)}
                    onCheckedChange={() => toggleRoleSelected(role.id)}
                  />
                  <div className="p-2 rounded-lg bg-muted">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.name}</span>
                    {role.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={editingRole?.id === role.id} onOpenChange={(open) => !open && setEditingRole(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditingRole(role)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                      </DialogHeader>
                      {editingRole && (
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input
                              value={editingRole.name}
                              onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                            <Button onClick={handleUpdateRole}>Save Changes</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{role.name}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRole(role)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Admin Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Admin Categories
              </CardTitle>
              <CardDescription>
                Manage administrative hierarchy levels for staff members
              </CardDescription>
            </div>
            <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Admin Category</DialogTitle>
                  <DialogDescription>
                    Create a new administrative tier for staff permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name *</Label>
                    <Input
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Team Lead"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {adminCategories.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-muted/40 border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedCategoryIds.size === adminCategories.length && adminCategories.length > 0}
                  onCheckedChange={() => {
                    if (selectedCategoryIds.size === adminCategories.length) setSelectedCategoryIds(new Set());
                    else setSelectedCategoryIds(new Set(adminCategories.map(c => c.value)));
                  }}
                />
                <span className="text-muted-foreground">
                  {selectedCategoryIds.size > 0 ? `${selectedCategoryIds.size} selected` : "Select all"}
                </span>
              </label>
              {selectedCategoryIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedCategoryIds.size} categor{selectedCategoryIds.size === 1 ? "y" : "ies"}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const count = selectedCategoryIds.size;
                          setAdminCategories(adminCategories.filter(c => !selectedCategoryIds.has(c.value)));
                          setSelectedCategoryIds(new Set());
                          toast.success(`${count} categor${count === 1 ? "y" : "ies"} removed`);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          <div className="space-y-2">
            {adminCategories.map((category) => (
              <div
                key={category.value}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${selectedCategoryIds.has(category.value) ? "ring-1 ring-primary/40 bg-muted/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedCategoryIds.has(category.value)}
                    onCheckedChange={() => toggleCategorySelected(category.value)}
                  />
                  <div className="p-2 rounded-lg bg-muted">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.label}</span>
                    {category.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Admin Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.label}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Stock Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock Categories
              </CardTitle>
              <CardDescription>
                Manage stock and inventory categories tailored to your practice type
              </CardDescription>
            </div>
            <Dialog open={showAddStockCatDialog} onOpenChange={setShowAddStockCatDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stock Category</DialogTitle>
                  <DialogDescription>
                    Create a new inventory category for tracking stock items
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockCatName">Name *</Label>
                    <Input
                      id="stockCatName"
                      value={newStockCatName}
                      onChange={(e) => setNewStockCatName(e.target.value)}
                      placeholder="e.g. Sterile Supplies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockCatDesc">Description</Label>
                    <Textarea
                      id="stockCatDesc"
                      value={newStockCatDesc}
                      onChange={(e) => setNewStockCatDesc(e.target.value)}
                      placeholder="Brief description"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowAddStockCatDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddStockCategory}>Add Category</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {stockCategories.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-muted/40 border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedStockCatIds.size === stockCategories.length && stockCategories.length > 0}
                  onCheckedChange={() => {
                    if (selectedStockCatIds.size === stockCategories.length) setSelectedStockCatIds(new Set());
                    else setSelectedStockCatIds(new Set(stockCategories.map(c => c.id)));
                  }}
                />
                <span className="text-muted-foreground">
                  {selectedStockCatIds.size > 0 ? `${selectedStockCatIds.size} selected` : "Select all"}
                </span>
              </label>
              {selectedStockCatIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedStockCatIds.size} stock categor{selectedStockCatIds.size === 1 ? "y" : "ies"}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Items in these categories may need to be reassigned.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const count = selectedStockCatIds.size;
                          setStockCategories(stockCategories.filter(c => !selectedStockCatIds.has(c.id)));
                          setSelectedStockCatIds(new Set());
                          toast.success(`${count} stock categor${count === 1 ? "y" : "ies"} removed`);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
          <div className="space-y-2">
            {stockCategories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${selectedStockCatIds.has(cat.id) ? "ring-1 ring-primary/40 bg-muted/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedStockCatIds.has(cat.id)}
                    onCheckedChange={() => toggleStockCatSelected(cat.id)}
                  />
                  <div className="p-2 rounded-lg bg-muted">
                    <DynamicIcon name={cat.icon} className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      {cat.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {cat.description && (
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stock Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{cat.name}"? Items in this category may need reassignment.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStockCategory(cat)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
