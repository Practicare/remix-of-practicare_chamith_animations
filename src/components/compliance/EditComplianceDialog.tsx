import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, User, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ComplianceItem, ComplianceCategory, ComplianceLevel } from "@/types/compliance";
import { Department, DEFAULT_DEPARTMENTS } from "@/types/departments";
import { mockStaffMembers } from "@/data/mockStaff";
import { toast } from "sonner";

type AssignmentMode = "individual" | "department";

interface EditComplianceDialogProps {
  item: ComplianceItem | null;
  categories: ComplianceCategory[];
  onUpdateItem: (itemId: string, updates: Partial<ComplianceItem>) => void;
  onClose: () => void;
  departments?: Department[];
  isRenewMode?: boolean;
}

export function EditComplianceDialog({
  item,
  categories,
  onUpdateItem,
  onClose,
  departments = DEFAULT_DEPARTMENTS,
  isRenewMode = false,
}: EditComplianceDialogProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [level, setLevel] = useState<ComplianceLevel>("user");
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("individual");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [reminderEmail, setReminderEmail] = useState(true);
  const [reminderSms, setReminderSms] = useState(false);

  // Filter out "All" from selectable categories
  const selectableCategories = categories.filter((c) => c.id !== "all");

  // Get staff members
  const staffMembers = mockStaffMembers;

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDetails(item.details || "");
      setCategoryId(item.categoryId);
      setLevel(item.level);
      setExpiryDate(item.expiryDate);
      setReminderEmail(item.reminder?.type === "email" || item.reminder?.enabled);
      setReminderSms(item.reminder?.type === "sms");
      
      // Find staff member by name for assignment
      if (item.assignee) {
        const staff = staffMembers.find(
          s => `${s.firstName} ${s.lastName}` === item.assignee
        );
        if (staff) {
          setSelectedUserId(staff.id);
          setAssignmentMode("individual");
        }
      }
    }
  }, [item, staffMembers]);

  const handleSubmit = () => {
    if (!item || !title.trim() || !expiryDate || !categoryId) return;

    const category = categories.find(c => c.id === categoryId);
    let assigneeName = item.assignee;

    if (level === "user" && assignmentMode === "individual" && selectedUserId) {
      const selectedUser = staffMembers.find(s => s.id === selectedUserId);
      if (selectedUser) {
        assigneeName = `${selectedUser.firstName} ${selectedUser.lastName}`;
      }
    }

    onUpdateItem(item.id, {
      categoryId,
      categoryName: category?.name || "",
      title: title.trim(),
      details: details.trim(),
      level,
      assignee: level === "user" ? assigneeName : undefined,
      expiryDate,
      reminder: {
        enabled: reminderEmail || reminderSms,
        type: reminderEmail ? "email" : "sms",
        daysBefore: item.reminder?.daysBefore || 30,
      },
      updatedAt: new Date(),
    });

    toast.success(isRenewMode ? "Compliance item renewed successfully" : "Compliance item updated successfully");
    onClose();
  };

  const isValid = useMemo(() => {
    if (!title.trim() || !expiryDate || !categoryId) return false;
    if (level === "practice") return true;
    return !!selectedUserId || !!item?.assignee;
  }, [title, expiryDate, categoryId, level, selectedUserId, item?.assignee]);

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRenewMode ? "Renew Compliance Item" : "Edit Compliance Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {selectableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CPR Certification"
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>Level *</Label>
              <Select
                value={level}
                onValueChange={(v) => {
                  setLevel(v as ComplianceLevel);
                  if (v === "practice") {
                    setSelectedUserId("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User-specific</SelectItem>
                  <SelectItem value="practice">Practice-level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignment Section - only show for user level */}
            {level === "user" && (
              <div className="space-y-2">
                <Label>Assign to *</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Expiry Date - highlighted for renew mode */}
            <div className={cn(
              "space-y-2",
              isRenewMode && "ring-2 ring-primary ring-offset-2 rounded-lg p-2 -m-2"
            )}>
              <Label className={isRenewMode ? "text-primary font-semibold" : ""}>
                {isRenewMode ? "New Expiry Date *" : "Expiry Date *"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground",
                      isRenewMode && "border-primary"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Details */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-details">Details</Label>
              <Textarea
                id="edit-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details"
                rows={2}
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label>Reminder</Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-reminder-email"
                  checked={reminderEmail}
                  onCheckedChange={(checked) => setReminderEmail(checked === true)}
                />
                <Label htmlFor="edit-reminder-email" className="text-sm font-normal cursor-pointer">
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-reminder-sms"
                  checked={reminderSms}
                  onCheckedChange={(checked) => setReminderSms(checked === true)}
                />
                <Label htmlFor="edit-reminder-sms" className="text-sm font-normal cursor-pointer">
                  SMS
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isRenewMode ? "Renew Item" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
