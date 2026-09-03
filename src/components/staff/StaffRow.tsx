import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Send } from "lucide-react";
import { StaffMember, INVITATION_STATUS_LABELS } from "@/types/staff";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StaffRowProps {
  staff: StaffMember;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onResendInvite: (staff: StaffMember) => void;
}

export function StaffRow({ staff, onView, onEdit, onDelete, onResendInvite }: StaffRowProps) {
  const navigate = useNavigate();
  const fullName = `${staff.firstName} ${staff.lastName}`;
  const initials = `${staff.firstName[0]}${staff.lastName[0]}`;
  const isPending = staff.invitationStatus === "pending";

  const goToProfile = () => navigate(`/staff/profile/${staff.id}`);

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div
        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0 cursor-pointer"
        onClick={goToProfile}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-4 cursor-pointer" onClick={goToProfile}>
        <div className="min-w-0 flex-1">
          <span className="text-[13px] font-medium">{fullName}</span>
          <span className="text-[12px] text-muted-foreground ml-2">{staff.role}</span>
        </div>

        <span className="text-[11px] text-muted-foreground/70 hidden lg:block truncate max-w-[180px]">
          {staff.email}
        </span>

        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
          isPending 
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        }`}>
          {INVITATION_STATUS_LABELS[staff.invitationStatus]}
        </span>
      </div>

      {/* Always-visible action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={goToProfile}
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>View Profile</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(staff)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Edit</p></TooltipContent>
        </Tooltip>

        {isPending && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                onClick={() => onResendInvite(staff)}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Resend Invite</p></TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(staff)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Delete</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
