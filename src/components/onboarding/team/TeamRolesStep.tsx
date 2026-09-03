import { useState } from "react";
import { UserPlus, Shield, Plus, Trash2, Lock, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { defaultsFor } from "@/data/onboardingDefaults";
import type { TeamOnboardingState, TeamRole, TeamStaffMember } from "@/types/onboardingTeam";

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function TeamRolesStep({ state, update }: Props) {
  const defaults = defaultsFor(state.industry);
  const [customRoleName, setCustomRoleName] = useState("");
  const [draft, setDraft] = useState({ name: "", email: "", roleId: "" });

  const roles = state.roles.length > 0 ? state.roles : defaults.roles;

  const roleById = (id: string | null) => roles.find((r) => r.id === id);

  const addCustomRole = () => {
    if (!customRoleName.trim()) {
      toast.error("Give the role a name.");
      return;
    }
    const role: TeamRole = {
      id: crypto.randomUUID(),
      name: customRoleName.trim(),
      description: "Custom role — configure permissions in Settings.",
      modules: ["Tasks"],
    };
    update({ roles: [...roles, role] });
    setCustomRoleName("");
  };

  const removeRole = (id: string) => {
    if (roles.find((r) => r.id === id)?.system) return;
    update({
      roles: roles.filter((r) => r.id !== id),
      staff: state.staff.map((s) => (s.roleId === id ? { ...s, roleId: null } : s)),
    });
  };

  const addStaff = () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error("Staff name and email are required.");
      return;
    }
    const member: TeamStaffMember = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      email: draft.email.trim(),
      roleId: draft.roleId || roles[0]?.id || null,
    };
    update({ staff: [...state.staff, member] });
    setDraft({ name: "", email: "", roleId: "" });
  };

  const updateStaffRole = (id: string, roleId: string) =>
    update({ staff: state.staff.map((s) => (s.id === id ? { ...s, roleId } : s)) });

  const removeStaff = (id: string) => update({ staff: state.staff.filter((s) => s.id !== id) });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Team & roles</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Roles define what each person can see and do. Every invitee gets a role from day one.
          </p>
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Roles
          </span>
          <span className="text-xs text-muted-foreground">
            View / Edit / Create permissions per module
          </span>
        </div>
        <div className="p-3 space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="rounded-lg border bg-background px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-sm font-semibold">{role.name}</span>
                  {role.system && (
                    <Badge variant="secondary" className="rounded-lg h-5 text-[10px] gap-1">
                      <Lock className="w-3 h-3" /> Default
                    </Badge>
                  )}
                </div>
                {!role.system && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    onClick={() => removeRole(role.id)}
                    aria-label={`Delete ${role.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {role.modules.map((m) => (
                  <Badge
                    key={m}
                    variant="outline"
                    className="rounded-lg h-5 text-[10px] gap-1 font-normal"
                  >
                    <CheckSquare className="w-2.5 h-2.5" /> {m}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Custom role name (e.g. Radiographer)"
              value={customRoleName}
              onChange={(e) => setCustomRoleName(e.target.value)}
              className="h-9 flex-1"
              onKeyDown={(e) => e.key === "Enter" && addCustomRole()}
            />
            <Button type="button" size="sm" className="h-9 shrink-0" onClick={addCustomRole}>
              <Plus className="w-4 h-4 mr-1" /> Add role
            </Button>
          </div>
        </div>
      </div>

      {/* Staff invites */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-medium">Invite your team</span>
          <span className="text-xs text-muted-foreground">
            {state.staff.length} invited
          </span>
        </div>
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-12 gap-2">
            <Input
              placeholder="Full name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="col-span-12 sm:col-span-4 h-9"
            />
            <Input
              type="email"
              placeholder="name@practice.com"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="col-span-12 sm:col-span-5 h-9"
            />
            <Select value={draft.roleId} onValueChange={(v) => setDraft({ ...draft, roleId: v })}>
              <SelectTrigger className="col-span-8 sm:col-span-2 h-9">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" className="col-span-4 sm:col-span-1 h-9" onClick={addStaff}>
              <Plus className="w-4 h-4 mr-1 sm:mr-0" />
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {state.staff.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.email}</div>
              </div>
              <Select value={s.roleId ?? ""} onValueChange={(v) => updateStaffRole(s.id, v)}>
                <SelectTrigger className="w-36 h-8 text-xs shrink-0">
                  <SelectValue placeholder="Assign role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                onClick={() => removeStaff(s.id)}
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {state.staff.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              You can invite more staff later — invite yourself first if you'd like to test the
              team view.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <Label className="text-xs text-primary mb-1 block">Good to know</Label>
        <p className="text-xs text-muted-foreground">
          Invites are sent as email links. Fine-grained View / Edit / Create permissions can be
          tuned in Settings → Permissions after setup.
        </p>
      </div>
    </div>
  );
}
