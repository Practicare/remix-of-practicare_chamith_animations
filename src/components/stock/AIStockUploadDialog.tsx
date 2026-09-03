import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Sparkles, X, Image as ImageIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIStockReviewDialog } from "./AIStockReviewDialog";
import { AIDocumentScanDialog } from "./AIDocumentScanDialog";
import { mockStockCategories } from "@/data/mockStock";
import { StockCategory } from "@/types/stock";

interface DetectedItem {
  name: string;
  quantity: number;
  category: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface AIStockUploadDialogProps {
  onItemsDetected: (items: DetectedItem[]) => void;
  categories?: StockCategory[];
  children?: React.ReactNode;
}

export function AIStockUploadDialog({ onItemsDetected, categories, children }: AIStockUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedCategories = categories && categories.length > 0 ? categories : mockStockCategories;
  const isPdf = selectedFile?.type === "application/pdf";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const accepted =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      /\.(pdf|csv|xlsx?|docx?)$/i.test(file.name);
    if (!accepted) return;

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
    }
  };

  // Mock extraction result — replace with the real AI response when the backend is wired up.
  const MOCK_DETECTED_ITEMS: DetectedItem[] = [
    { name: "Paracetamol 500mg", quantity: 50, category: "drug-cupboard", expiryDate: "2025-06-15", batchNumber: "PAR2024001" },
    { name: "Ibuprofen 200mg", quantity: 30, category: "drug-cupboard", expiryDate: "2025-11-02", batchNumber: "IBU2024005" },
    { name: "Bandages (Sterile)", quantity: 20, category: "consumables", expiryDate: "2026-01-20" },
    { name: "Alcohol Swabs", quantity: 100, category: "consumables", expiryDate: "2027-03-10" },
    { name: "Influenza Vaccine", quantity: 15, category: "vaccines", expiryDate: "2025-09-30", batchNumber: "FLU2024Q3" },
    { name: "Nitrile Gloves (Medium)", quantity: 200, category: "consumables" },
    { name: "Sterile Saline 0.9%", quantity: 40, category: "consumables", expiryDate: "2026-08-14", batchNumber: "SAL2024118" },
  ];

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setDetectedItems(MOCK_DETECTED_ITEMS);
    setOpen(false);
    setScanOpen(true);
  };

  const resetState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setDragActive(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5">
            <div className="relative">
              <Camera className="w-4 h-4" />
              <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-primary" />
            </div>
            AI Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            AI Stock Scanner
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your stock items and AI will automatically detect and add them to your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!selectedFile ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200",
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.csv,.xls,.xlsx,.doc,.docx"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-lg bg-muted mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  Drop your document here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Invoices, delivery dockets or shelf photos — PDF, JPG, PNG, CSV up to 20MB
                </p>

                <div className="flex items-center gap-4 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Choose File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-border">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Selected stock"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted/40 flex flex-col items-center justify-center gap-2 px-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium truncate max-w-full">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                      {isPdf ? " · PDF document" : ""}
                    </div>
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 rounded-lg"
                  onClick={resetState}
                  aria-label="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={resetState}>
                  Choose Different File
                </Button>
                <Button className="flex-1 gap-2" onClick={handleAnalyze}>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">Tips for best results:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Upload the supplier invoice or delivery docket where possible</li>
              <li>• Make sure expiry dates and batch numbers are visible</li>
              <li>• For photos, capture one shelf or category at a time</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AIDocumentScanDialog
      open={scanOpen}
      fileName={selectedFile?.name ?? "Document"}
      items={detectedItems}
      onCancel={() => {
        setScanOpen(false);
        resetState();
      }}
      onComplete={(items) => {
        setDetectedItems(items);
        setScanOpen(false);
        setReviewOpen(true);
      }}
    />

    <AIStockReviewDialog
      open={reviewOpen}
      onOpenChange={(v) => {
        setReviewOpen(v);
        if (!v) resetState();
      }}
      initialItems={detectedItems}
      categories={resolvedCategories}
      onConfirm={(items) => {
        onItemsDetected(items);
      }}
    />
    </>
  );
}
