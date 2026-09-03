import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Plus as PlusIcon, X, Send } from "lucide-react";
import { Task, TaskChecklistItem } from "@/types/tasks";

interface CreateTodoListDialogProps {
  onCreateTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
}

export const CreateTodoListDialog = ({ onCreateTask }: CreateTodoListDialogProps) => {
  const [items, setItems] = useState<TaskChecklistItem[]>([]);
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [...prev, { id: `tci-${Date.now()}`, text, completed: false }]);
    setDraft("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const resetForm = () => {
    setItems([]);
    setDraft("");
  };

  const canSubmit = items.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreateTask({
      title: "To-do list",
      assignee: "Me",
      dueDate: new Date(),
      frequency: "once",
      checklist: items,
    });
    resetForm();
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" />
          Create To-do List
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Line items */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            Line items *
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              placeholder="Type an item and press Enter or Add"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={!draft.trim()}
              className="gap-1.5 shrink-0"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
          {items.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30"
                >
                  <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                  <span className="flex-1 text-sm">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={resetForm}>
            Clear
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Create To-do List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
