import { useState } from "react";
import { Plus, X, Users, Pencil, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TimelineGroup } from "@/types/roster";

interface AddTimelineGroupDialogProps {
  onAddGroup: (group: Omit<TimelineGroup, "id">) => void;
}

export function AddTimelineGroupDialog({
  onAddGroup,
}: AddTimelineGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGroup({
      name: name.trim(),
      teamMemberIds: [],
      members: [],
    });

    setOpen(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Add Timeline Group</DialogTitle>
          <DialogDescription>
            Create a group to organize shifts on the timeline. You can add team members to groups for better organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Reception, Nursing, Doctors"
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface TimelineGroupHeaderProps {
  group: TimelineGroup;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  shiftsCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function TimelineGroupHeader({
  group,
  onRename,
  onRemove,
  shiftsCount,
  isCollapsed,
  onToggleCollapse,
}: TimelineGroupHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
      <div className="flex items-center gap-2">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        )}
        <Users className="h-4 w-4 text-muted-foreground" />
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 w-40 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <span className="font-medium text-sm">{group.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-50 hover:opacity-100"
              onClick={() => {
                setEditName(group.name);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs font-normal">
          {shiftsCount} shift{shiftsCount !== 1 ? "s" : ""}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-50 hover:opacity-100 hover:text-destructive"
          onClick={() => onRemove(group.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
