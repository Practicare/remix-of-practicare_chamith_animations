import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StaffMember, ModulePermission, MODULE_PERMISSIONS, StaffModulePermissions, getDefaultPermissionsForRole } from "@/types/staff";
import {
  Shield,
  Home,
  Users,
  ShieldCheck,
  Package,
  ClipboardList,
  CheckSquare,
  Newspaper,
  Calendar,
  Settings,
  Eye,
  Pencil,
  Plus,
  MessageSquare,
  DoorOpen,
} from "lucide-react";

type PermissionState = "view" | "edit" | "create";

const moduleIcons: Record<ModulePermission, React.ReactNode> = {
  dashboard: <Home className="w-4 h-4" />,
  staff: <Users className="w-4 h-4" />,
  compliance: <ShieldCheck className="w-4 h-4" />,
  stock: <Package className="w-4 h-4" />,
  tasks: <ClipboardList className="w-4 h-4" />,
  checklists: <CheckSquare className="w-4 h-4" />,
  memos_news: <Newspaper className="w-4 h-4" />,
  communication_book: <MessageSquare className="w-4 h-4" />,
  room_setup: <DoorOpen className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

const permissionColumns: { key: PermissionState; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "view", label: "View", icon: <Eye className="w-3.5 h-3.5" />, color: "text-blue-600 dark:text-blue-400" },
  { key: "edit", label: "Edit", icon: <Pencil className="w-3.5 h-3.5" />, color: "text-amber-600 dark:text-amber-400" },
  { key: "create", label: "Create", icon: <Plus className="w-3.5 h-3.5" />, color: "text-emerald-600 dark:text-emerald-400" },
];

interface StaffPermissionsDialogProps {
  staff: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (staffId: string, permissions: string[]) => void;
}

export function StaffPermissionsDialog({
  staff,
  open,
  onOpenChange,
  onSave,
}: StaffPermissionsDialogProps) {
  const [modulePerms, setModulePerms] = useState<StaffModulePermissions[]>([]);

  useEffect(() => {
    if (staff) {
      const existing = staff.modulePermissions;
      if (existing && existing.length > 0) {
        // Merge existing with all modules (fill missing ones with defaults)
        const merged = MODULE_PERMISSIONS.map(mod => {
          const found = existing.find(e => e.module === mod.value);
          return found ? { ...found, canCreate: (found as any).canCreate ?? false } : { module: mod.value, canView: false, canEdit: false, canCreate: false };
        });
        setModulePerms(merged);
      } else {
        setModulePerms(getDefaultPermissionsForRole(staff.roleLevel || "staff"));
      }
    }
  }, [staff]);

  if (!staff) return null;

  const togglePerm = (module: ModulePermission, state: PermissionState) => {
    setModulePerms(prev => prev.map(p => {
      if (p.module !== module) return p;
      if (state === "view") {
        const newView = !p.canView;
        // Turning off view turns off everything
        return newView ? { ...p, canView: true } : { ...p, canView: false, canEdit: false, canCreate: false };
      }
      if (state === "edit") {
        const newEdit = !p.canEdit;
        // Turning on edit requires view
        return newEdit ? { ...p, canView: true, canEdit: true } : { ...p, canEdit: false, canCreate: false };
      }
      if (state === "create") {
        const newCreate = !p.canCreate;
        // Turning on create requires view + edit
        return newCreate ? { ...p, canView: true, canEdit: true, canCreate: true } : { ...p, canCreate: false };
      }
      return p;
    }));
  };

  const selectAll = () => {
    setModulePerms(prev => prev.map(p => ({ ...p, canView: true, canEdit: true, canCreate: true })));
  };

  const viewOnly = () => {
    setModulePerms(prev => prev.map(p => ({ ...p, canView: true, canEdit: false, canCreate: false })));
  };

  const handleSave = () => {
    // Convert to flat string[] for backward compat
    const flat: string[] = [];
    modulePerms.forEach(p => {
      if (p.canView) flat.push(`${p.module}.view`);
      if (p.canEdit) flat.push(`${p.module}.edit`);
      if (p.canCreate) flat.push(`${p.module}.create`);
    });
    onSave(staff.id, flat);
    onOpenChange(false);
  };

  const activeCount = modulePerms.reduce((acc, p) => acc + (p.canView ? 1 : 0) + (p.canEdit ? 1 : 0) + (p.canCreate ? 1 : 0), 0);
  const totalCount = modulePerms.length * 3;
  const fullName = `${staff.firstName} ${staff.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] !flex !flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl animate-scale-in [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 bg-gradient-to-r from-primary via-[hsl(190_65%_40%)] to-primary border-b-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
          >
            <span className="text-white text-lg leading-none">×</span>
          </button>
          <DialogTitle className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <span className="text-lg font-semibold">Module Permissions</span>
              <p className="text-sm font-normal text-white/80 flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                  {fullName}
                </span>
                <span className="text-white/50">•</span>
                <span>{staff.role}</span>
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="px-6 py-3 border-b bg-gradient-to-r from-primary/5 to-[hsl(190_65%_40%)]/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">{activeCount} active</span>
            </div>
            <div className="text-xs text-muted-foreground">
              of {totalCount} total permissions
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-8 hover:bg-primary/10 hover:text-primary">
              Full Access
            </Button>
            <Button variant="ghost" size="sm" onClick={viewOnly} className="text-xs h-8 hover:bg-blue-500/10 hover:text-blue-600">
              View Only
            </Button>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-background to-muted/20">
          {/* Column Headers */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-2.5">
            <div className="flex items-center">
              <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module</div>
              <div className="flex items-center gap-6">
                {permissionColumns.map(col => (
                  <div key={col.key} className={`w-16 flex flex-col items-center gap-0.5 ${col.color}`}>
                    {col.icon}
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module Rows */}
          <div className="px-6 py-2 space-y-1">
            {modulePerms.map((perm, index) => {
              const modInfo = MODULE_PERMISSIONS.find(m => m.value === perm.module);
              if (!modInfo) return null;

              const hasAny = perm.canView || perm.canEdit || perm.canCreate;

              return (
                <div
                  key={perm.module}
                  className={`flex items-center rounded-xl px-4 py-3 transition-all duration-200 ${
                    hasAny ? 'bg-primary/5 hover:bg-primary/8' : 'hover:bg-muted/50'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      hasAny
                        ? 'bg-gradient-to-r from-primary to-[hsl(190_65%_40%)] text-white shadow-sm'
                        : 'bg-muted/70 text-muted-foreground'
                    }`}>
                      {moduleIcons[perm.module]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{modInfo.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{modInfo.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {permissionColumns.map(col => {
                      const checked = col.key === "view" ? perm.canView : col.key === "edit" ? perm.canEdit : perm.canCreate;
                      return (
                        <div key={col.key} className="w-16 flex justify-center">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => togglePerm(perm.module, col.key)}
                            className={`h-5 w-5 rounded-md transition-all duration-200 ${
                              checked
                                ? col.key === "view"
                                  ? 'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                                  : col.key === "edit"
                                  ? 'data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600'
                                  : 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                                : ''
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-card gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-[hsl(190_65%_40%)] hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            <Shield className="w-4 h-4 mr-2" />
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
