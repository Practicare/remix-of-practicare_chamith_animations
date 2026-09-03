import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Home, Users, ShieldCheck, Package, ClipboardList, CheckSquare,
  Newspaper, Calendar, Settings, Eye, Pencil, Plus, MessageSquare, DoorOpen, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  StaffRoleLevel, STAFF_ROLE_LEVELS, ModulePermission, MODULE_PERMISSIONS,
  StaffModulePermissions,
} from "@/types/staff";

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

// Default permission config per admin category
function getInitialConfig(): Record<StaffRoleLevel, StaffModulePermissions[]> {
  const allModules = MODULE_PERMISSIONS.map(m => m.value);

  const fullAccess = (): StaffModulePermissions[] =>
    allModules.map(mod => ({ module: mod, canView: true, canEdit: true, canCreate: true }));

  const viewOnly = (): StaffModulePermissions[] =>
    allModules.map(mod => ({ module: mod, canView: true, canEdit: false, canCreate: false }));

  const custom = (editModules: ModulePermission[], createModules: ModulePermission[] = []): StaffModulePermissions[] =>
    allModules.map(mod => ({
      module: mod,
      canView: true,
      canEdit: editModules.includes(mod) || createModules.includes(mod),
      canCreate: createModules.includes(mod),
    }));

  return {
    admin: fullAccess(),
    "2ic": custom(
      ["dashboard", "staff", "tasks", "checklists", "stock", "compliance", "memos_news", "communication_book", "room_setup"],
      ["tasks", "checklists", "stock", "memos_news", "communication_book"]
    ),
    lead_nurse: custom(
      ["tasks", "checklists", "stock", "communication_book"],
      ["tasks", "checklists", "communication_book"]
    ),
    lead_clinician: custom(
      ["tasks", "checklists", "compliance", "communication_book"],
      ["tasks", "compliance", "communication_book"]
    ),
    clinician: custom(
      ["tasks", "checklists", "compliance", "communication_book"],
      ["tasks", "communication_book"]
    ),
    practice_nurse: custom(
      ["tasks", "checklists", "communication_book"],
      ["tasks", "communication_book"]
    ),
    staff: viewOnly(),
  };
}

export function PermissionsTab() {
  const [selectedRole, setSelectedRole] = useState<StaffRoleLevel>("staff");
  const [config, setConfig] = useState(getInitialConfig);

  const currentPerms = config[selectedRole];

  const togglePerm = (module: ModulePermission, state: PermissionState) => {
    setConfig(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map(p => {
        if (p.module !== module) return p;
        if (state === "view") {
          const newView = !p.canView;
          return newView ? { ...p, canView: true } : { ...p, canView: false, canEdit: false, canCreate: false };
        }
        if (state === "edit") {
          const newEdit = !p.canEdit;
          return newEdit ? { ...p, canView: true, canEdit: true } : { ...p, canEdit: false, canCreate: false };
        }
        if (state === "create") {
          const newCreate = !p.canCreate;
          return newCreate ? { ...p, canView: true, canEdit: true, canCreate: true } : { ...p, canCreate: false };
        }
        return p;
      }),
    }));
  };

  const selectAll = () => {
    setConfig(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map(p => ({ ...p, canView: true, canEdit: true, canCreate: true })),
    }));
  };

  const viewOnlyAll = () => {
    setConfig(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map(p => ({ ...p, canView: true, canEdit: false, canCreate: false })),
    }));
  };

  const handleSave = () => {
    toast.success("Permissions saved for all admin categories");
  };

  const activeCount = currentPerms.reduce((acc, p) => acc + (p.canView ? 1 : 0) + (p.canEdit ? 1 : 0) + (p.canCreate ? 1 : 0), 0);
  const totalCount = currentPerms.length * 3;

  return (
    <div className="space-y-6">
      {/* Guidance */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Module Permissions by Admin Category</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure which modules each admin category can access. All staff in a category inherit these permissions automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Admin Category</CardTitle>
          <CardDescription>Select a category to configure its module access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STAFF_ROLE_LEVELS.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all border ${
                  selectedRole === role.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                {STAFF_ROLE_LEVELS.find(r => r.value === selectedRole)?.label} Permissions
              </CardTitle>
              <CardDescription>
                {activeCount} of {totalCount} permissions enabled
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-8 hover:bg-primary/10 hover:text-primary">
                Full Access
              </Button>
              <Button variant="ghost" size="sm" onClick={viewOnlyAll} className="text-xs h-8 hover:bg-blue-500/10 hover:text-blue-600">
                View Only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Column Headers */}
          <div className="border-y bg-muted/30 px-6 py-2.5">
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
          <div className="px-4 py-2 space-y-1">
            {currentPerms.map((perm) => {
              const modInfo = MODULE_PERMISSIONS.find(m => m.value === perm.module);
              if (!modInfo) return null;
              const hasAny = perm.canView || perm.canEdit || perm.canCreate;

              return (
                <div
                  key={perm.module}
                  className={`flex items-center rounded-xl px-4 py-3 transition-all ${
                    hasAny ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      hasAny
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
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
                            className={`h-5 w-5 rounded-md transition-all ${
                              checked
                                ? col.key === "view"
                                  ? "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  : col.key === "edit"
                                  ? "data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                  : "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                : ""
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
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="shadow-sm">
          <Shield className="w-4 h-4 mr-2" />
          Save All Permissions
        </Button>
      </div>
    </div>
  );
}