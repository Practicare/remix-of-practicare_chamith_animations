import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  HeartOff,
  AlertCircle,
  Users,
  Briefcase,
  MessageSquare,
  Cake,
  Star,
  Shield,
  Eye,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { 
  StaffMember, 
  Department, 
  INVITATION_STATUS_COLORS, 
  INVITATION_STATUS_LABELS,
  STAFF_ROLE_LEVEL_LABELS,
} from "@/types/staff";
import { DynamicIcon } from "@/components/DynamicIcon";

interface StaffProfileDialogProps {
  staff: StaffMember | null;
  department: Department | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onResendInvite: () => void;
}

export function StaffProfileDialog({
  staff,
  department,
  open,
  onOpenChange,
  onEdit,
  onResendInvite,
}: StaffProfileDialogProps) {
  if (!staff) return null;

  const fullName = `${staff.firstName} ${staff.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Staff Profile</DialogTitle>
        </DialogHeader>
        
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${department?.color || "bg-primary"}`}>
            {staff.firstName[0]}{staff.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <Badge variant="outline" className={INVITATION_STATUS_COLORS[staff.invitationStatus]}>
                {INVITATION_STATUS_LABELS[staff.invitationStatus]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{staff.role}</p>
            {department && (
              <div className="flex items-center gap-2 mt-1">
                <DynamicIcon name={department.icon} className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{department.name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {staff.invitationStatus === "pending" && (
              <Button variant="outline" size="sm" onClick={onResendInvite}>
                Resend Invite
              </Button>
            )}
            <Button size="sm" onClick={onEdit}>
              Edit Profile
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Role Level */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role & Category
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Admin Category:</span>
            <Badge variant={staff.roleLevel === "admin" ? "default" : "secondary"}>
              {staff.roleLevel ? STAFF_ROLE_LEVEL_LABELS[staff.roleLevel] : "Staff"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">Module permissions are managed in Settings → Permissions</p>
        </div>

        <Separator className="my-4" />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contact Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{staff.email}</span>
            </div>
            {staff.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{staff.phone}</span>
              </div>
            )}
            {staff.address && (
              <div className="flex items-center gap-2 text-sm col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{staff.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Birthday */}
        {staff.birthday && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Birthday: {format(staff.birthday, "MMMM d, yyyy")}</span>
            </div>
          </>
        )}

        {/* Emergency Contact */}
        {staff.emergencyContact && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Emergency Contact
              </h3>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{staff.emergencyContact.name}</p>
                <p className="text-sm text-muted-foreground">{staff.emergencyContact.relationship}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {staff.emergencyContact.phone}
                  </span>
                  {staff.emergencyContact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {staff.emergencyContact.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Next of Kin */}
        {staff.nextOfKin && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Next of Kin
              </h3>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{staff.nextOfKin.name}</p>
                <p className="text-sm text-muted-foreground">{staff.nextOfKin.relationship}</p>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {staff.nextOfKin.phone}
                  </span>
                  {staff.nextOfKin.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {staff.nextOfKin.email}
                    </span>
                  )}
                  {staff.nextOfKin.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {staff.nextOfKin.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preferences */}
        {staff.preferences && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Preferences
              </h3>
              <div className="space-y-2 text-sm">
                {staff.preferences.dietaryRestrictions && staff.preferences.dietaryRestrictions.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Dietary: </span>
                    {staff.preferences.dietaryRestrictions.map((d, i) => (
                      <Badge key={i} variant="secondary" className="mr-1">{d}</Badge>
                    ))}
                  </div>
                )}
                {staff.preferences.communicationPreference && (
                  <div>
                    <span className="text-muted-foreground">Prefers: </span>
                    <span className="capitalize">{staff.preferences.communicationPreference}</span>
                  </div>
                )}
                {staff.preferences.workPreferences && (
                  <div>
                    <span className="text-muted-foreground">Work: </span>
                    {staff.preferences.workPreferences}
                  </div>
                )}
                {staff.preferences.notes && (
                  <div>
                    <span className="text-muted-foreground">Notes: </span>
                    {staff.preferences.notes}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Cultural Celebrations */}
        {staff.culturalCelebrations && staff.culturalCelebrations.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="w-4 h-4" />
                Cultural Celebrations
              </h3>
              <div className="flex flex-wrap gap-2">
                {staff.culturalCelebrations.map((celebration) => (
                  <Badge key={celebration.id} variant="outline" className="py-1.5">
                    <Calendar className="w-3 h-3 mr-1" />
                    {celebration.name} - {format(celebration.date, "MMM d")}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Likes & Dislikes */}
        {(staff.likes?.length || staff.dislikes?.length) && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              {staff.likes && staff.likes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    Likes
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {staff.likes.map((like, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{like}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {staff.dislikes && staff.dislikes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <HeartOff className="w-4 h-4 text-red-500" />
                    Dislikes
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {staff.dislikes.map((dislike, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{dislike}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Invitation Info */}
        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground">
          {staff.invitedAt && <p>Invited: {format(staff.invitedAt, "PPP")}</p>}
          {staff.acceptedAt && <p>Accepted: {format(staff.acceptedAt, "PPP")}</p>}
          <p>Last updated: {format(staff.updatedAt, "PPP")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
