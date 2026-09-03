import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Send } from "lucide-react";
import { StaffMember, Department, INVITATION_STATUS_LABELS } from "@/types/staff";

interface StaffCardProps {
  staff: StaffMember;
  department?: Department;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onResendInvite: (staff: StaffMember) => void;
}

export function StaffCard({
  staff,
  department,
  onView,
  onEdit,
  onDelete,
  onResendInvite,
}: StaffCardProps) {
  const fullName = `${staff.firstName} ${staff.lastName}`;
  const initials = `${staff.firstName[0]}${staff.lastName[0]}`;
  const isPending = staff.invitationStatus === "pending";

  return (
    <div
      className="group p-4 rounded-xl border border-border/60 bg-card hover:border-border transition-colors cursor-pointer"
      onClick={() => onView(staff)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium truncate">{fullName}</h3>
              <p className="text-[12px] text-muted-foreground">{staff.role}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(staff); }}>
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(staff); }}>
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                {isPending && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onResendInvite(staff); }}>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Resend Invite
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(staff); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            {department && (
              <span className="text-[11px] text-muted-foreground">{department.name}</span>
            )}
            {department && <span className="text-border">·</span>}
            <span className={`text-[11px] ${isPending ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {INVITATION_STATUS_LABELS[staff.invitationStatus]}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">{staff.email}</p>
        </div>
      </div>
    </div>
  );
}
