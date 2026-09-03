import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { StockCategory } from "@/types/stock";
import { toast } from "@/hooks/use-toast";

interface AddStockCategoryDialogProps {
  onAddCategory: (category: Omit<StockCategory, 'id' | 'isDefault'>) => void;
}

export function AddStockCategoryDialog({ onAddCategory }: AddStockCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setDisplayName("");
    setName("");
    setDescription("");
  };

  const handleSubmit = () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a full name",
        variant: "destructive",
      });
      return;
    }

    if (displayName.trim().length > 12) {
      toast({
        title: "Error",
        description: "Display name must be 12 characters or less",
        variant: "destructive",
      });
      return;
    }

    onAddCategory({
      displayName: displayName.trim(),
      name: name.trim(),
      description: description.trim(),
      icon: "Package",
    });

    toast({
      title: "Category Added",
      description: `${name} has been created.`,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Stock Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your stock items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              placeholder="e.g., First Aid"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
              placeholder="e.g., First Aid Supplies"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Enter category description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={200}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!displayName.trim() || !name.trim()}>
            Add Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
