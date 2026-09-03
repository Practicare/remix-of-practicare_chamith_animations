import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Plus, X, Trash2, CheckSquare, ToggleLeft, Hash, Monitor, AlertTriangle } from "lucide-react";
import { ChecklistCategory, Checklist, ChecklistItem, ChecklistItemType } from "@/types/checklists";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ItemEntry {
  text: string;
  type: ChecklistItemType;
  critical: boolean;
}

interface CreateChecklistDialogProps {
  categories: ChecklistCategory[];
  onCreateChecklist: (checklist: Omit<Checklist, "id" | "createdAt">) => string;
  defaultCategoryId?: string;
}

export const CreateChecklistDialog = ({
  categories,
  onCreateChecklist,
  defaultCategoryId,
}: CreateChecklistDialogProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const [recurring, setRecurring] = useState<"daily" | "weekly" | "monthly" | "">("");
  const [items, setItems] = useState<ItemEntry[]>([{ text: "", type: "tick", critical: false }]);

  const selectableCategories = categories.filter((c) => c.id !== "all");
  const isFixedCategory = !!defaultCategoryId;
  const fixedCategory = categories.find((c) => c.id === defaultCategoryId);

  useEffect(() => {
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId);
    }
  }, [defaultCategoryId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategoryId(defaultCategoryId || "");
    setRecurring("");
    setItems([{ text: "", type: "tick", critical: false }]);
  };

  const handleSubmit = () => {
    if (!title.trim() || !categoryId) return;

    const checklistItems: ChecklistItem[] = items
      .filter((item) => item.text.trim())
      .map((item, index) => ({
        id: `temp-${index}`,
        text: item.text.trim(),
        type: item.type,
        completed: false,
        critical: item.critical,
        yesNoValue: item.type === "yesno" ? null : undefined,
        numberValue: item.type === "number" ? null : undefined,
      }));

    onCreateChecklist({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId,
      items: checklistItems,
      createdBy: "Current User",
      recurring: recurring || null,
    });

    resetForm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const addItemField = () => {
    setItems([...items, { text: "", type: "tick", critical: false }]);
  };

  const toggleItemCritical = (index: number) => {
    const newItems = [...items];
    newItems[index].critical = !newItems[index].critical;
    setItems(newItems);
  };

  const updateItemText = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].text = value;
    setItems(newItems);
  };

  const updateItemType = (index: number, type: ChecklistItemType) => {
    const newItems = [...items];
    newItems[index].type = type;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const getTypeIcon = (type: ChecklistItemType) => {
    switch (type) {
      case "tick":
        return <CheckSquare className="w-4 h-4" />;
      case "yesno":
        return <ToggleLeft className="w-4 h-4" />;
      case "number":
        return <Hash className="w-4 h-4" />;
    }
  };

  // Mobile view - show message to use desktop
  if (isMobile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
        <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Use desktop to create checklists</span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant={isOpen ? "outline" : "hero"} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {isOpen ? "Creating New Checklist..." : "Add Checklist"}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-4 p-4 border border-border rounded-lg bg-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Department {!isFixedCategory && "*"}</Label>
              {isFixedCategory && fixedCategory ? (
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted text-sm flex items-center">
                  {fixedCategory.name}
                </div>
              ) : (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Checklist title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Recurring */}
            <div className="space-y-2">
              <Label>Recurring</Label>
              <Select value={recurring} onValueChange={(v) => setRecurring(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="One-time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            <Label>Checklist Items</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {/* Type Selector */}
                  <Select
                    value={item.type}
                    onValueChange={(v) => updateItemType(index, v as ChecklistItemType)}
                  >
                    <SelectTrigger className="w-32">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tick">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4" />
                          Tick
                        </div>
                      </SelectItem>
                      <SelectItem value="yesno">
                        <div className="flex items-center gap-2">
                          <ToggleLeft className="w-4 h-4" />
                          Yes/No
                        </div>
                      </SelectItem>
                      <SelectItem value="number">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Number
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Item Text */}
                  <Input
                    className={cn(
                      "flex-1",
                      item.critical && "border-destructive/50 bg-destructive/5"
                    )}
                    placeholder={`Item ${index + 1}`}
                    value={item.text}
                    onChange={(e) => updateItemText(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItemField();
                      }
                    }}
                  />
                  
                  {/* Critical Toggle */}
                  <Button
                    type="button"
                    variant={item.critical ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => toggleItemCritical(index)}
                    title={item.critical ? "Remove critical flag" : "Mark as critical"}
                  >
                    <AlertTriangle className={cn(
                      "w-4 h-4",
                      item.critical ? "text-destructive-foreground" : "text-muted-foreground"
                    )} />
                  </Button>
                  
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItemField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !categoryId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Checklist
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
