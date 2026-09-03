import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
  X,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StockItem, StockCategory, VaccineFundingType, CATEGORY_FIELD_CONFIG, DEFAULT_FIELD_CONFIG } from "@/types/stock";
import { DynamicIcon } from "@/components/DynamicIcon";
import { LocationManager, StockLocation } from "@/components/stock/LocationManager";
import { AIPromptInput } from "@/components/ui/AIPromptInput";

interface DetectedItem {
  name: string;
  quantity: number;
  category: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface StockActionPanelProps {
  categories: StockCategory[];
  locations: StockLocation[];
  onCreateItem: (item: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "status">) => void;
  onItemsDetected: (items: DetectedItem[]) => void;
  onAddLocation: (name: string) => void;
  onEditLocation: (id: string, name: string) => void;
  onDeleteLocation: (id: string) => void;
  defaultCategoryId?: string;
}

export function StockActionPanel({
  categories,
  locations,
  onCreateItem,
  onItemsDetected,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  defaultCategoryId,
}: StockActionPanelProps) {
  const [activePanel, setActivePanel] = useState<"none" | "add" | "scan">("none");

  // Add Stock Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [calibrationDate, setCalibrationDate] = useState<Date>();
  const [nextCalibrationDate, setNextCalibrationDate] = useState<Date>();
  const [vaccineFundingType, setVaccineFundingType] = useState<VaccineFundingType | "">("");

  // Get field configuration for selected category
  const fieldConfig = categoryId ? (CATEGORY_FIELD_CONFIG[categoryId] || DEFAULT_FIELD_CONFIG) : DEFAULT_FIELD_CONFIG;

  // AI Scan State
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAddForm = () => {
    setName("");
    setDescription("");
    setCategoryId(defaultCategoryId || "");
    setQuantity(1);
    setExpiryDate(undefined);
    setLocation("");
    setBatchNumber("");
    setCalibrationDate(undefined);
    setNextCalibrationDate(undefined);
    setVaccineFundingType("");
  };

  const resetScanState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setDragActive(false);
  };

  const handleSubmit = () => {
    if (!name.trim() || !categoryId) return;
    if (fieldConfig.expiryRequired && !expiryDate) return;

    onCreateItem({
      categoryId,
      name: name.trim(),
      description: description.trim(),
      quantity,
      expiryDate: fieldConfig.showExpiry ? expiryDate : undefined,
      location: location.trim() || undefined,
      batchNumber: fieldConfig.showBatchNumber ? (batchNumber.trim() || undefined) : undefined,
      calibrationDate: fieldConfig.showCalibration ? calibrationDate : undefined,
      nextCalibrationDate: fieldConfig.showCalibration ? nextCalibrationDate : undefined,
      vaccineFundingType: fieldConfig.showVaccineFunding ? (vaccineFundingType || undefined) : undefined,
    });

    // Reset form but keep panel open for adding more items
    resetAddForm();
  };

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
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAIPromptSubmit = async (prompt: string, files?: File[]) => {
    setIsAnalyzing(true);

    // Simulate AI analysis - connect backend here
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const mockDetectedItems: DetectedItem[] = [
      { name: "Paracetamol 500mg", quantity: 50, category: "drug-cupboard", expiryDate: "2025-06-15", batchNumber: "PAR2024001" },
      { name: "Bandages (Sterile)", quantity: 20, category: "consumables", expiryDate: "2026-01-20" },
    ];

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    onItemsDetected(mockDetectedItems);

    setTimeout(() => {
      setActivePanel("none");
      resetScanState();
    }, 1500);
  };

  const togglePanel = (panel: "add" | "scan") => {
    if (activePanel === panel) {
      setActivePanel("none");
      if (panel === "add") resetAddForm();
      if (panel === "scan") resetScanState();
    } else {
      setActivePanel(panel);
      if (panel === "add") resetScanState();
      if (panel === "scan") resetAddForm();
    }
  };

  const isFormValid = () => {
    if (!name.trim() || !categoryId) return false;
    if (fieldConfig.expiryRequired && !expiryDate) return false;
    return true;
  };

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Mobile: Icon-only button */}
        <Button
          onClick={() => togglePanel("add")}
          className={cn("gap-2", activePanel === "add" && "bg-primary/90")}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Stock Item</span>
          <span className="md:hidden">Add</span>
          {activePanel === "add" ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </Button>

        {/* AI Scan - hidden on mobile */}
        <Button
          variant="outline"
          onClick={() => togglePanel("scan")}
          size="sm"
          className={cn(
            "hidden md:flex gap-2 border-dashed border-2",
            activePanel === "scan"
              ? "border-primary bg-primary/5"
              : "hover:border-primary hover:bg-primary/5"
          )}
        >
          <div className="relative">
            <Camera className="w-4 h-4" />
            <Sparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 text-primary" />
          </div>
          AI Scan
          {activePanel === "scan" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Add Stock Panel */}
      {activePanel === "add" && (
        <div className="bg-card border border-border rounded-xl p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Add New Stock Item</h3>
            <Button variant="ghost" size="icon" onClick={() => { setActivePanel("none"); resetAddForm(); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Category - First so fields update */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={category.icon} className="w-4 h-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Expiry Date - shown based on config */}
            {fieldConfig.showExpiry && (
              <div className="space-y-2">
                <Label>Expiry Date {fieldConfig.expiryRequired && '*'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label>Location</Label>
              <LocationManager
                locations={locations}
                selectedLocation={location}
                onSelectLocation={setLocation}
                onAddLocation={onAddLocation}
                onEditLocation={onEditLocation}
                onDeleteLocation={onDeleteLocation}
              />
            </div>

            {/* Batch Number - shown based on config */}
            {fieldConfig.showBatchNumber && (
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  placeholder="e.g., BAT-2024-001"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>
            )}

            {/* Calibration fields - shown based on config */}
            {fieldConfig.showCalibration && (
              <>
                <div className="space-y-2">
                  <Label>Last Calibration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !calibrationDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {calibrationDate ? format(calibrationDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={calibrationDate} onSelect={setCalibrationDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Next Calibration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !nextCalibrationDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextCalibrationDate ? format(nextCalibrationDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={nextCalibrationDate} onSelect={setNextCalibrationDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Vaccine Funding Type - shown based on config */}
            {fieldConfig.showVaccineFunding && (
              <div className="space-y-2">
                <Label>Funding Type</Label>
                <Select value={vaccineFundingType} onValueChange={(v) => setVaccineFundingType(v as VaccineFundingType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government Funded</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter item description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { setActivePanel("none"); resetAddForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid()}>
              Add Item
            </Button>
          </div>
        </div>
      )}

      {/* AI Scan Panel */}
      {activePanel === "scan" && (
        <div className="bg-card border border-border rounded-xl p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Stock Scanner</h3>
                <p className="text-sm text-muted-foreground">Describe items or upload a photo to add stock</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setActivePanel("none"); resetScanState(); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* AI Prompt Input */}
            <AIPromptInput
              placeholder="Describe the stock items you want to add... e.g., '50 boxes of Paracetamol 500mg, expires June 2025'"
              onSubmit={handleAIPromptSubmit}
              isProcessing={isAnalyzing}
              showAttachments={true}
              acceptedFileTypes="image/*"
              maxFiles={3}
            />

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <p className="text-sm font-medium text-foreground">Analyzing your request...</p>
              </div>
            )}

            {analysisComplete && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="text-sm font-medium text-foreground">Items detected and added to inventory!</p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-medium text-foreground mb-2 text-sm">Tips for best results:</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Be specific with quantities, item names, and expiry dates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Attach photos of shelf labels for automatic detection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Include batch numbers when available
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
