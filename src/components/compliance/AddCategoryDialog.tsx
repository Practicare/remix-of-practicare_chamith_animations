import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus } from "lucide-react";
import { ComplianceCategoryExtended } from "@/types/compliance";
import { toast } from "sonner";

interface AddCategoryDialogProps {
  onAddCategory: (category: Omit<ComplianceCategoryExtended, 'id' | 'isDefault' | 'type'>) => void;
}

export function AddCategoryDialog({ onAddCategory }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setDisplayName("");
    setName("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a full name");
      return;
    }

    if (displayName.trim().length > 12) {
      toast.error("Display name must be 12 characters or less");
      return;
    }

    onAddCategory({
      displayName: displayName.trim(),
      name: name.trim(),
      description: description.trim(),
      icon: "Folder",
    });

    toast.success("Category added successfully");
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Compliance Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize compliance items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Fire Safety"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">
              Short name shown under the icon (max 12 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryName">Full Name *</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fire Safety Training Certificate"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Full name shown in tooltip on hover
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this compliance category"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
