import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Upload, FileText, CheckCircle2, X, Trash2, AlertTriangle } from "lucide-react";
import { ChecklistCategory, Checklist, ChecklistItem } from "@/types/checklists";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AIChecklistDialogProps {
  categories: ChecklistCategory[];
  onCreateChecklist: (checklist: Omit<Checklist, "id" | "createdAt">) => void;
  defaultCategoryId?: string;
}

type FlowStep = "upload" | "processing" | "review";

export const AIChecklistDialog = ({
  categories,
  onCreateChecklist,
  defaultCategoryId,
}: AIChecklistDialogProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedItems, setGeneratedItems] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFlowStep("upload");
    setUploadedFile(null);
    setIsDragging(false);
    setGeneratedTitle("");
    setGeneratedItems([]);
    setCategoryId(defaultCategoryId || "");
  };

  const handleFile = useCallback((file: File) => {
    const validTypes = [
      "application/pdf",
      "image/png", "image/jpeg", "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv", "text/plain",
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|webp|docx|xlsx|csv|txt)$/i)) {
      return;
    }
    
    setUploadedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleExtract = async () => {
    if (!uploadedFile) return;
    
    setFlowStep("processing");
    
    // Simulate AI extraction with loading animation
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    // Mock extracted data based on file name
    const baseName = uploadedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const mockTitle = `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Checklist`;
    const mockItems = [
      "Verify all equipment is properly calibrated",
      "Check supply levels and restock if necessary",
      "Review patient schedule and prepare materials",
      "Confirm staff assignments and coverage",
      "Inspect workspace cleanliness and organization",
      "Update logs and documentation",
      "Complete safety compliance verification",
      "Notify team of any outstanding issues",
    ];
    
    setGeneratedTitle(mockTitle);
    setGeneratedItems(mockItems);
    setFlowStep("review");
  };

  const handleSubmit = () => {
    if (!generatedTitle.trim() || generatedItems.length === 0) return;

    const checklistItems: ChecklistItem[] = generatedItems
      .filter(text => text.trim())
      .map((text, index) => ({
        id: `temp-${index}`,
        text: text.trim(),
        type: "tick" as const,
        completed: false,
      }));

    onCreateChecklist({
      title: generatedTitle.trim(),
      description: `Extracted from: ${uploadedFile?.name || "uploaded document"}`,
      categoryId: categoryId || categories.find(c => c.id !== "all")?.id || "",
      items: checklistItems,
      createdBy: "AI Assistant",
      recurring: null,
    });

    resetForm();
    setIsOpen(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...generatedItems];
    newItems[index] = value;
    setGeneratedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setGeneratedItems(generatedItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setGeneratedItems([...generatedItems, ""]);
  };

  if (isMobile) return null;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    if (file.name.endsWith(".docx")) return "📝";
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) return "📊";
    return "📎";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10">
          <Sparkles className="w-3.5 h-3.5" />
          AI Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Checklist Extractor
          </DialogTitle>
          <DialogDescription>
            Upload an existing checklist document and let AI extract the items automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* ===== STEP: UPLOAD ===== */}
          {flowStep === "upload" && (
            <div className="space-y-4 animate-fade-in">
              {/* Instructions */}
              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">Supported formats:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["PDF", "Image", "Word", "Excel", "CSV", "Text"].map((fmt) => (
                    <span key={fmt} className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground font-medium">
                      {fmt}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Upload a photo, scan, or document of your existing checklist. AI will extract items, labels, and structure automatically.
                </p>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : uploadedFile
                    ? "border-primary/40 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt"
                  onChange={handleFileInput}
                />

                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getFileIcon(uploadedFile)}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5 justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-primary font-medium">Ready to extract</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop your checklist here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Extract Button */}
              <Button
                onClick={handleExtract}
                disabled={!uploadedFile}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Extract Checklist Items
              </Button>
            </div>
          )}

          {/* ===== STEP: PROCESSING ===== */}
          {flowStep === "processing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 space-y-8"
            >
              {/* Orbital animation */}
              <div className="relative w-24 h-24">
                {/* Outer rotating ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                {/* Middle pulsing ring */}
                <motion.div
                  className="absolute inset-2 rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Inner glow */}
                <motion.div
                  className="absolute inset-4 rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Centre icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>
                </div>
                {/* Orbiting particles */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/50"
                    style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
                    animate={{
                      x: [0, Math.cos((i * Math.PI) / 2) * 40, 0],
                      y: [0, Math.sin((i * Math.PI) / 2) * 40, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Status text */}
              <div className="text-center space-y-2">
                <motion.p
                  className="text-sm font-semibold text-foreground"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Extracting checklist items…
                </motion.p>
                <p className="text-xs text-muted-foreground">
                  Analyzing <span className="font-medium text-foreground">{uploadedFile?.name}</span>
                </p>
              </div>

              {/* Animated progress bar */}
              <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: "50%" }}
                />
              </div>
            </motion.div>
          )}

          {/* ===== STEP: REVIEW ===== */}
          {flowStep === "review" && (
            <div className="space-y-4 animate-fade-in">
              {/* Success banner */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-primary">
                  {generatedItems.length} items extracted successfully
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Checklist Title</Label>
                <Input
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Extracted Items</Label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {generatedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0 font-medium">
                        {index + 1}.
                      </span>
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs text-muted-foreground gap-1.5 mt-1"
                >
                  + Add Item
                </Button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFlowStep("upload");
                    setUploadedFile(null);
                    setGeneratedItems([]);
                    setGeneratedTitle("");
                  }}
                  className="text-xs"
                >
                  ← Upload Different File
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!generatedTitle.trim() || generatedItems.filter(i => i.trim()).length === 0}
                  className="gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Checklist
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
