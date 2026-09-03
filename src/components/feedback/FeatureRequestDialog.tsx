import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: "new-feature", label: "New Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "bug-fix", label: "Bug Fix" },
  { value: "integration", label: "Integration" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low - Nice to have" },
  { value: "medium", label: "Medium - Would help workflow" },
  { value: "high", label: "High - Critical for operations" },
];

export function FeatureRequestDialog({ open, onOpenChange }: FeatureRequestDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for your request.",
        variant: "destructive",
      });
      return;
    }

    const categoryLabel = categories.find(c => c.value === category)?.label || "Not specified";
    const priorityLabel = priorities.find(p => p.value === priority)?.label || "Not specified";

    const subject = encodeURIComponent(`Feature Request: ${title}`);
    const body = encodeURIComponent(
      `FEATURE REQUEST\n` +
      `================\n\n` +
      `Title: ${title}\n` +
      `Category: ${categoryLabel}\n` +
      `Priority: ${priorityLabel}\n\n` +
      `Description:\n${description}\n\n` +
      `---\n` +
      `Submitted from: ${window.location.origin}\n` +
      `Date: ${new Date().toLocaleString()}`
    );

    // Open mailto link
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;

    toast({
      title: "Email Client Opened",
      description: "Your feature request has been prepared. Please send the email to submit.",
    });

    // Reset form
    setTitle("");
    setCategory("");
    setPriority("");
    setDescription("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setPriority("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Submit Feature Request
          </DialogTitle>
          <DialogDescription>
            Have an idea to improve the platform? Let us know!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your request"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((pri) => (
                    <SelectItem key={pri.value} value={pri.value}>
                      {pri.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="w-4 h-4" />
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
