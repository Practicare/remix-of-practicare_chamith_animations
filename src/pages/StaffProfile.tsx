import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, Clock, Mail, MapPin,
  Phone, Send, ShieldCheck, Edit, Trash2, MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  StaffMember, Department,
  STAFF_ROLE_LEVEL_LABELS, MODULE_PERMISSIONS,
  getDefaultPermissionsForRole,
} from "@/types/staff";
import { mockStaffMembers } from "@/data/mockStaff";
import { mockDepartments } from "@/data/mockDepartments";
import { mockTasks } from "@/data/mockTasks";
import { memberColor, memberInitials } from "@/lib/memberColors";
import { EditStaffDialog } from "@/components/staff/EditStaffDialog";
import { DeleteStaffDialog } from "@/components/staff/DeleteStaffDialog";
import { StaffProfileActivity } from "@/components/staff/StaffProfileActivity";
import { toast } from "@/hooks/use-toast";

export default function StaffProfile() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers);
  const [departments] = useState<Department[]>(mockDepartments);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const staff = staffMembers.find((s) => s.id === staffId);
  const department = staff ? departments.find((d) => d.id === staff.departmentId) : undefined;

  const handleEditStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    toast({ title: "Profile Updated", description: "Staff profile has been updated." });
  };

  const handleDeleteStaff = () => {
    if (!staff) return;
    setStaffMembers((prev) => prev.filter((s) => s.id !== staff.id));
    toast({ title: "Staff Deleted", description: `${staff.firstName} ${staff.lastName} has been removed.` });
    setDeleteDialogOpen(false);
    navigate("/staff");
  };

  const handleResendInvite = () => {
    if (!staff) return;
    toast({ title: "Invitation Sent", description: `Invitation email resent to ${staff.email}.` });
  };

  if (!staff) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
          <Building2 className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">This person is no longer in the workspace.</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate("/staff")}>
            <ArrowLeft className="w-4 h-4" /> Back to team
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const fullName = `${staff.firstName} ${staff.lastName}`;
  const isPending = staff.invitationStatus === "pending";
  const color = memberColor(staff.id);
  const permissions =
    staff.modulePermissions && staff.modulePermissions.length > 0
      ? staff.modulePermissions
      : getDefaultPermissionsForRole(staff.roleLevel ?? "staff");
  const enabledPerms = permissions.filter((p) => p.canView || p.canEdit || p.canCreate);
  const assignedTasks = mockTasks
    .filter((t) => t.assignee === fullName || t.assignee === staff.firstName)
    .slice(0, 5);

  return (
    <AdminLayout>
      <MobileHeader
        title={fullName}
        subtitle={staff.role}
        actions={
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        }
      />

      <div className="px-4 md:px-8 pt-6 md:pt-8 pb-8 max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/staff")}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Team
        </button>

        {/* Hero card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-start gap-5">
            <span
              className="flex w-16 h-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-primary-foreground"
              style={{ backgroundColor: color.bg }}
            >
              {memberInitials(fullName)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
                {fullName}
                {isPending && (
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Pending invite
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {staff.role} · {department?.name ?? "No department"}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {staff.email}
                </span>
                {staff.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {staff.phone}
                  </span>
                )}
                {staff.address && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {staff.address}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Joined {format(staff.createdAt, "MMM yyyy")}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPending && (
                <Button variant="outline" size="sm" className="gap-2" onClick={handleResendInvite}>
                  <Send className="w-4 h-4" /> Resend invite
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => toast({ title: "Message", description: "Opening messaging…" })}
              >
                <MessageSquare className="w-4 h-4" /> Message
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditDialogOpen(true)}>
                <Edit className="w-4 h-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={ShieldCheck}
              label="Role level"
              value={staff.roleLevel ? STAFF_ROLE_LEVEL_LABELS[staff.roleLevel] : "Staff"}
              hint="Access category"
            />
            <Stat
              icon={Building2}
              label="Department"
              value={department?.name ?? "—"}
              hint="Assignment group"
            />
            <Stat
              icon={CheckCircle2}
              label="Permissions"
              value={`${enabledPerms.length} modules`}
              hint="Managed in Settings"
            />
            <Stat
              icon={Clock}
              label="Last updated"
              value={format(staff.updatedAt, "MMM d, yyyy")}
              hint="Profile activity"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Assigned tasks" description="What this person is responsible for.">
              {assignedTasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {assignedTasks.map((t) => {
                    const overdue = !t.completed && new Date(t.dueDate) < new Date();
                    const stateLabel = t.completed ? "Done" : overdue ? "Overdue" : "Pending";
                    return (
                      <div key={t.id} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.dueDate ? `Due ${format(new Date(t.dueDate), "MMM d")}` : "No due date"}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium",
                            t.completed
                              ? "bg-green-500/10 text-green-700 dark:text-green-300"
                              : overdue
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary",
                          )}
                        >
                          {stateLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="pt-1 text-xs text-muted-foreground italic">No tasks assigned yet.</p>
              )}
            </Panel>

            <Panel title="Access summary" description="Effective module access for this team member.">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {enabledPerms.length > 0 ? (
                  enabledPerms.map((p) => {
                    const meta = MODULE_PERMISSIONS.find((m) => m.value === p.module);
                    return (
                      <span
                        key={p.module}
                        className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {meta?.label ?? p.module}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">No module access granted.</p>
                )}
              </div>
            </Panel>

            <Panel title="Contact & personal" description="Details shared with the practice.">
              <div className="space-y-2.5 pt-1 text-sm">
                <InfoLine icon={Mail} label="Email" value={staff.email} />
                <InfoLine icon={Phone} label="Phone" value={staff.phone} />
                <InfoLine icon={MapPin} label="Address" value={staff.address} />
                <InfoLine
                  icon={CalendarDays}
                  label="Birthday"
                  value={staff.birthday ? format(staff.birthday, "MMMM d") : undefined}
                />
              </div>
            </Panel>

            <Panel title="Emergency contact" description="Who to call if something happens.">
              {staff.emergencyContact ? (
                <div className="space-y-2 pt-1 text-sm">
                  <p className="font-medium">{staff.emergencyContact.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.emergencyContact.relationship}</p>
                  <InfoLine icon={Phone} label="Phone" value={staff.emergencyContact.phone} />
                  {staff.emergencyContact.email && (
                    <InfoLine icon={Mail} label="Email" value={staff.emergencyContact.email} />
                  )}
                </div>
              ) : (
                <p className="pt-1 text-xs text-muted-foreground italic">No emergency contact provided.</p>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <Panel
              title="Module permissions"
              description="View, edit and create access per module. Managed centrally in Settings → Permissions."
            >
              <div className="divide-y divide-border pt-2">
                {permissions.map((p) => {
                  const meta = MODULE_PERMISSIONS.find((m) => m.value === p.module);
                  return (
                    <div key={p.module} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{meta?.label ?? p.module}</p>
                        <p className="text-xs text-muted-foreground">{meta?.description}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <PermChip label="View" active={p.canView} />
                        <PermChip label="Edit" active={p.canEdit} />
                        <PermChip label="Create" active={p.canCreate} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Panel title="Recent activity" description="Latest work completed by this person.">
              <div className="pt-1">
                <StaffProfileActivity staff={staff} />
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>

      <EditStaffDialog
        staff={staff}
        departments={departments}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditStaff}
      />
      <DeleteStaffDialog
        staff={staff}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteStaff}
      />
    </AdminLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className={cn("font-medium truncate", !value && "italic text-muted-foreground font-normal")}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function PermChip({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn("text-[11px]", !active && "text-muted-foreground")}
    >
      {label}
    </Badge>
  );
}
