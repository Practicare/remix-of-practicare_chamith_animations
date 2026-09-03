import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Memo, MemoType, MemoPriority, MemoCategory, MEMO_TYPE_LABELS } from "@/types/memos";
import { DEFAULT_DEPARTMENTS } from "@/types/departments";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateMemoDialogProps {
  categories: MemoCategory[];
  onCreateMemo: (memo: Omit<Memo, "id" | "createdAt" | "readBy">) => void;
  children?: React.ReactNode;
}

export const CreateMemoDialog = ({ categories, onCreateMemo, children }: CreateMemoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<MemoType>("memo");
  const [priority, setPriority] = useState<MemoPriority>("normal");
  const [categoryId, setCategoryId] = useState("general");
  const [mandatoryRead, setMandatoryRead] = useState(false);
  const [targetDepartments, setTargetDepartments] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [notifyBySms, setNotifyBySms] = useState(false);

  const departments = DEFAULT_DEPARTMENTS;

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }

    let expiresAt: Date | undefined;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }

    onCreateMemo({
      title: title.trim(),
      content: content.trim(),
      type,
      priority,
      categoryId,
      mandatoryRead,
      author: "Current User",
      targetDepartments,
      expiresAt,
    });

    // Reset form
    setTitle("");
    setContent("");
    setType("memo");
    setPriority("normal");
    setCategoryId("general");
    setMandatoryRead(false);
    setTargetDepartments([]);
    setExpiresIn("");
    setNotifyByEmail(false);
    setNotifyBySms(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Memo / News
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Memo or Practice News</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MemoType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMO_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as MemoPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your memo content here..."
              rows={6}
            />
          </div>

          {/* Mandatory Read */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="mandatory" className="text-base font-medium">
                Mandatory Read
              </Label>
              <p className="text-sm text-muted-foreground">
                Staff must acknowledge they've read this
              </p>
            </div>
            <Switch
              id="mandatory"
              checked={mandatoryRead}
              onCheckedChange={setMandatoryRead}
            />
          </div>

          {/* Target Departments */}
          <div className="space-y-2">
            <Label>Target Department</Label>
            <Select 
              value={targetDepartments.length === 0 ? "all" : targetDepartments[0]} 
              onValueChange={(value) => {
                if (value === "all") {
                  setTargetDepartments([]);
                } else {
                  setTargetDepartments([value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Options */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label>Notification</Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-email"
                  checked={notifyByEmail}
                  onCheckedChange={(checked) => setNotifyByEmail(checked === true)}
                />
                <Label htmlFor="notify-email" className="text-sm font-normal cursor-pointer">
                  Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notify-sms"
                  checked={notifyBySms}
                  onCheckedChange={(checked) => setNotifyBySms(checked === true)}
                />
                <Label htmlFor="notify-sms" className="text-sm font-normal cursor-pointer">
                  SMS
                </Label>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <Label htmlFor="expires">Expires In (days, optional)</Label>
            <Input
              id="expires"
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
