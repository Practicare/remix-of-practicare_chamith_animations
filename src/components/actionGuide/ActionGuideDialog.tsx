import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bold,
  Italic,
  List as ListIcon,
  ListOrdered,
  ImagePlus,
  X,
} from "lucide-react";
import { ActionGuide } from "@/types/actionGuide";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide?: ActionGuide | null;
  onSave: (guide: ActionGuide) => void;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function ActionGuideDialog({ open, onOpenChange, guide, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(guide?.title ?? "");
      setTagsInput((guide?.tags ?? []).join(", "));
      setImages(guide?.images ?? []);
      // Defer setting innerHTML until after render
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = guide?.content ?? "";
        }
      }, 0);
    }
  }, [open, guide]);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    try {
      const urls = await Promise.all(arr.map(fileToDataUrl));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Could not read one or more images");
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please add a title for the issue");
      return;
    }
    const content = editorRef.current?.innerHTML ?? "";
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    const saved: ActionGuide = {
      id: guide?.id ?? `ag-${Date.now()}`,
      title: title.trim(),
      content,
      images,
      tags,
      createdAt: guide?.createdAt ?? now,
      updatedAt: now,
      createdBy: guide?.createdBy ?? "Admin",
    };
    onSave(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guide ? "Edit Action Guide" : "New Action Guide"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ag-title">Issue / Situation</Label>
            <Input
              id="ag-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Patient faints in waiting room"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ag-tags">Tags (comma separated)</Label>
            <Input
              id="ag-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Emergency, Reception, IT"
            />
          </div>

          <div className="space-y-2">
            <Label>Action Guide</Label>
            <div className="border border-input rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 border-b border-border bg-muted/40 p-1">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("bold")}>
                  <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("italic")}>
                  <Italic className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("insertUnorderedList")}>
                  <ListIcon className="w-3.5 h-3.5" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("insertOrderedList")}>
                  <ListOrdered className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[180px] max-h-[320px] overflow-y-auto p-3 text-sm focus:outline-none prose prose-sm max-w-none [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_li]:my-0.5"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Write clear step-by-step instructions any team member can follow.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pictures</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Add image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`attachment ${idx + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-md p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No pictures attached.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{guide ? "Save changes" : "Create guide"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
