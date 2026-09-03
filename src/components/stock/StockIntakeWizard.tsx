import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  FileUp,
  Gauge,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  LucideIcon,
  Plus,
  Radio,
  ScanBarcode,
  Sparkles,
  Trash2,
  Type,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraCapture } from "@/components/stock/CameraCapture";
import { useStock } from "@/contexts/StockContext";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode } from "@/lib/barcodes";

export interface IntakeDraftItem {
  name: string;
  quantity: number;
  expiryDate?: string;
  batchNumber?: string;
  barcode?: string;
}

export interface IntakeGroup {
  id: string;
  label: string;
  /** Stock category id used when creating items from this group. */
  categoryId: string;
  icon: LucideIcon;
}

/** Same groups as the Inventory page tabs. */
export const INTAKE_GROUPS: IntakeGroup[] = [
  { id: "expiring", label: "Medical Supplies", categoryId: "consumables", icon: Clock },
  { id: "calibrating", label: "Calibrating", categoryId: "vital-signs", icon: Gauge },
  { id: "electrical", label: "Test & Tagging", categoryId: "electrical-tagging", icon: Zap },
  { id: "stationery", label: "Stationery", categoryId: "stationery", icon: FileText },
  { id: "other", label: "Other", categoryId: "other", icon: HelpCircle },
];

type Method = "photos" | "documents" | "text" | "barcode";
type Step = "method" | "capture" | "review";

/** Simulated AI extraction results per group — replace with the AI backend call. */
const MOCK_EXTRACTIONS: Record<string, IntakeDraftItem[]> = {
  expiring: [
    { name: "Nitrile Gloves (Medium)", quantity: 200, batchNumber: "NG-5521", expiryDate: "2028-02-14" },
    { name: "Alcohol Swabs", quantity: 100, batchNumber: "AS-9082", expiryDate: "2028-03-10" },
    { name: "Sterile Gauze Swabs 7.5cm", quantity: 50, batchNumber: "GZ7710", expiryDate: "2027-09-01" },
    { name: "Adrenaline 1mg/1ml Ampoules", quantity: 10, batchNumber: "ADR-220", expiryDate: "2027-01-31" },
    { name: "Salbutamol Inhaler 100mcg", quantity: 6, batchNumber: "SAL-884", expiryDate: "2027-06-15" },
    { name: "Wound Dressing Packs", quantity: 40, batchNumber: "WD-3110", expiryDate: "2028-05-20" },
  ],
  calibrating: [
    { name: "Pulse Oximeter", quantity: 2, batchNumber: "POX-118" },
    { name: "Digital Thermometer", quantity: 4, batchNumber: "TH-2201" },
    { name: "Blood Pressure Monitor (Auto)", quantity: 2, batchNumber: "BP-7745" },
    { name: "Spirometer", quantity: 1, batchNumber: "SP-0092" },
  ],
  electrical: [
    { name: "Examination Lamp", quantity: 1, batchNumber: "EL-3310" },
    { name: "Vaccine Fridge", quantity: 1, batchNumber: "VF-0021" },
    { name: "ECG Machine", quantity: 1, batchNumber: "ECG-5512" },
  ],
  stationery: [
    { name: "A4 Copy Paper (500 sheets)", quantity: 10 },
    { name: "Ballpoint Pens (Box of 50)", quantity: 4 },
    { name: "Manila Folders (Pack of 100)", quantity: 2 },
    { name: "Sticky Notes (Pack of 12)", quantity: 3 },
  ],
  other: [
    { name: "Sterile Bandages", quantity: 24, batchNumber: "BD-5510", expiryDate: "2028-01-20" },
    { name: "Disposable Syringes 5ml", quantity: 50, batchNumber: "SYR330", expiryDate: "2028-08-01" },
    { name: "Antiseptic Solution 500ml", quantity: 6, batchNumber: "ANT-114", expiryDate: "2027-07-12" },
    { name: "Ice Packs (Instant)", quantity: 12, batchNumber: "ICE-8840" },
  ],
};

const METHODS: { id: Method; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: "photos",
    title: "Take photos",
    description: "Snap photos of items, labels or invoices — one after another.",
    icon: Camera,
  },
  {
    id: "documents",
    title: "Upload documents",
    description: "PDF, Word docs, PNG or JPEG — invoices, receipts, packing slips.",
    icon: FileUp,
  },
  {
    id: "text",
    title: "Paste text",
    description: "Copy and paste an invoice or stock list from anywhere.",
    icon: Type,
  },
  {
    id: "barcode",
    title: "Scan barcodes",
    description: "Point your scanner and keep scanning — each beep adds to the list.",
    icon: ScanBarcode,
  },
];

interface Props {
  onComplete: (group: IntakeGroup, items: IntakeDraftItem[]) => void;
}

export function StockIntakeWizard({ onComplete }: Props) {
  const [groupId, setGroupId] = useState<string>("");
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("photos");

  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [drafts, setDrafts] = useState<IntakeDraftItem[]>([]);
  const [scans, setScans] = useState<{ code: string; count: number }[]>([]);
  const [scanningActive, setScanningActive] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const { items } = useStock();
  const { map: barcodeMap } = useBarcodeMap();

  const handleScan = (raw: string) => {
    const code = normaliseBarcode(raw);
    if (!code) return;
    setScans((prev) => {
      const idx = prev.findIndex((s) => s.code === code);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + 1 };
        return next;
      }
      return [...prev, { code, count: 1 }];
    });
  };

  const { scanning } = useBarcodeScanner({
    onScan: handleScan,
    enabled: step === "capture" && method === "barcode" && scanningActive,
  });

  const group = INTAKE_GROUPS.find((g) => g.id === groupId);

  const selectGroup = (id: string) => {
    if (id === groupId) return;
    setGroupId(id);
    setStep("method");
    setMethod("photos");
    setPhotos([]);
    setDocs([]);
    setText("");
    setCameraOpen(false);
    setAnalyzing(false);
    setDrafts([]);
    setScans([]);
    setScanningActive(false);
  };

  const addPhotoFile = (file: File) =>
    setPhotos((prev) => [...prev, { url: URL.createObjectURL(file), name: file.name }]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach(addPhotoFile);
  };

  const addDocs = (files: FileList | null) => {
    if (!files) return;
    setDocs((prev) => [...prev, ...Array.from(files)]);
  };

  // Barcode needs real scans; AI sources can run straight on the mock extractor.
  const canAnalyze = method === "barcode" ? scans.length > 0 : true;

  const analyze = async () => {
    if (method === "barcode") {
      // No AI needed — scans map straight to items. Known barcodes prefill the
      // item name and expiry; unknown ones are named in the review step.
      setDrafts(
        scans.map((s) => {
          const itemId = barcodeMap[s.code];
          const item = itemId ? items.find((i) => i.id === itemId) : undefined;
          return {
            name: item?.name ?? "",
            quantity: s.count,
            barcode: s.code,
            expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : undefined,
          };
        }),
      );
      setStep("review");
      return;
    }
    setAnalyzing(true);
    // Simulated AI analysis — connect the AI backend here.
    await new Promise((r) => setTimeout(r, 2200));
    const extracted = MOCK_EXTRACTIONS[groupId] ?? MOCK_EXTRACTIONS.other;
    setDrafts(extracted.map((d) => ({ ...d })));
    setAnalyzing(false);
    setStep("review");
  };

  const updateDraft = (idx: number, patch: Partial<IntakeDraftItem>) =>
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const removeDraft = (idx: number) => setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const addDraft = () => setDrafts((prev) => [...prev, { name: "", quantity: 1 }]);

  const validDrafts = drafts.filter((d) => d.name.trim().length > 0);

  const methodMeta = METHODS.find((m) => m.id === method);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header + inline category selection */}
      <div className="border-b border-border p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Start a new stock intake</h3>
            <p className="text-xs text-muted-foreground">
              Pick a category, then snap photos, upload documents or paste a list — AI builds the item list for you
              to review before it touches your inventory.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <SegmentedControl
            value={groupId}
            onChange={selectGroup}
            options={INTAKE_GROUPS.map((g) => ({ id: g.id, label: g.label, icon: g.icon }))}
          />
        </div>
      </div>

      {/* Body */}
      {!group ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Select a category above to continue.
        </div>
      ) : (
        <div className="p-4 md:p-5 space-y-4">
          {/* STEP 1 — Source options appear inline below the categories */}
          {step === "method" && (
            <div className="space-y-3">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setStep("capture");
                    }}
                    className="rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <m.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-sm font-semibold">{m.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{m.description}</div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onComplete(group, [])}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1 transition-colors"
              >
                Skip — start with an empty list and scan barcodes
              </button>
            </div>
          )}

          {/* STEP 2 — Capture */}
          {step === "capture" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{group.label}</span>
                  <span>→</span>
                  <span>{methodMeta?.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  onClick={() => {
                    setStep("method");
                    setScanningActive(false);
                  }}
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Change source
                </Button>
              </div>

              {method === "photos" && (
                <div className="space-y-4">
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={libraryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addPhotos(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {cameraOpen ? (
                    <CameraCapture
                      count={photos.length}
                      onCapture={addPhotoFile}
                      onDone={() => setCameraOpen(false)}
                      onFallback={() => {
                        // Live camera unavailable (no device / permission denied) — use the native picker.
                        setCameraOpen(false);
                        cameraRef.current?.click();
                      }}
                    />
                  ) : (
                    <div className="flex gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11 rounded-lg gap-2"
                        onClick={() => setCameraOpen(true)}
                      >
                        <Camera className="w-4 h-4" /> Take photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11 rounded-lg gap-2"
                        onClick={() => libraryRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4" /> Choose photos
                      </Button>
                    </div>
                  )}

                  {photos.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center text-sm text-muted-foreground">
                      No photos yet — take as many as you need, AI reads them all together.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {photos.map((p, i) => (
                        <div
                          key={i}
                          className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos((prev) => prev.filter((_, x) => x !== i))}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-background/90 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCameraOpen(true)}
                        className="rounded-lg border-2 border-dashed border-muted-foreground/25 aspect-square flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-medium">Add more</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {method === "documents" && (
                <div className="space-y-4">
                  <input
                    ref={docRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addDocs(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => docRef.current?.click()}
                    className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <FileUp className="w-7 h-7 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">Drop files here or click to upload</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, PNG or JPEG — multiple files supported
                    </div>
                  </button>

                  {docs.length > 0 && (
                    <div className="rounded-lg border border-border divide-y">
                      {docs.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-3.5 py-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{f.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {(f.size / 1024).toFixed(0)} KB
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                            onClick={() => setDocs((prev) => prev.filter((_, x) => x !== i))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {method === "text" && (
                <div className="space-y-2">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      "Paste an invoice, order confirmation or stock list here…\n\ne.g.\nParacetamol 500mg x100 exp 06/2027 batch PAR2604\nNitrile gloves medium x200"
                    }
                    className="min-h-[200px] rounded-lg text-sm"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">
                    AI extracts item names, quantities, expiry dates and batch numbers from the text.
                  </p>
                </div>
              )}

              {method === "barcode" && (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center space-y-4">
                    {!scanningActive ? (
                      <>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                          <ScanBarcode className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Ready to scan</p>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Click the button below to start receiving scanner signals.
                            Each beep adds to the list — scanning the same barcode again increases its quantity.
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="rounded-lg gap-2"
                          onClick={() => setScanningActive(true)}
                        >
                          <ScanBarcode className="w-4 h-4" /> Start scanning
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1.5 font-normal",
                              scanning && "border-primary text-primary bg-primary/5",
                            )}
                          >
                            <Radio className={cn("w-3 h-3", scanning && "animate-pulse")} />
                            {scanning ? "Receiving signal…" : "Scanner ready"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Keep scanning one item after another. Or type a barcode manually and press Enter.
                        </p>
                        <Input
                          placeholder="Or type a barcode and press Enter"
                          className="h-10 max-w-xs mx-auto font-mono text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              e.preventDefault();
                              handleScan(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg gap-2"
                          onClick={() => setScanningActive(false)}
                        >
                          <ScanBarcode className="w-4 h-4" /> Stop scanning
                        </Button>
                      </>
                    )}
                  </div>

                  {scans.length === 0 ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                      No scans yet — point your scanner at a barcode to begin.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border divide-y">
                      {scans.map((s, i) => {
                        const matchedId = barcodeMap[s.code];
                        const matched = matchedId ? items.find((x) => x.id === matchedId) : undefined;
                        return (
                          <div key={s.code} className="flex items-center gap-3 px-3.5 py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <ScanBarcode className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {matched?.name ?? "New item — name it in the review"}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">{s.code}</div>
                            </div>
                            <Badge variant="outline" className="rounded-lg text-xs font-normal shrink-0">
                              × {s.count}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => setScans((prev) => prev.filter((_, x) => x !== i))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  className="rounded-lg gap-2"
                  disabled={!canAnalyze || analyzing}
                  onClick={analyze}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
                    </>
                  ) : method === "barcode" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Review {scans.length} item{scans.length === 1 ? "" : "s"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Extract items
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === "review" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Check the extracted items — edit, delete or add rows before confirming. All items will be added to{" "}
                  <span className="font-medium text-foreground">{group.label}</span>.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-xs shrink-0"
                  onClick={() => setStep("capture")}
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                </Button>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_70px_130px_100px_40px] gap-2 px-3.5 py-2.5 bg-muted/40 text-[11px] font-medium text-muted-foreground">
                  <span>Item</span>
                  <span>Barcode</span>
                  <span>Qty</span>
                  <span>Expiry</span>
                  <span>Batch</span>
                  <span />
                </div>
                <div className="divide-y divide-border">
                  {drafts.map((d, i) => (
                    <div key={i} className="grid grid-cols-[1fr_120px_70px_130px_100px_40px] gap-2 px-3.5 py-2 items-center">
                      <Input
                        value={d.name}
                        onChange={(e) => updateDraft(i, { name: e.target.value })}
                        placeholder="Item name"
                        className="h-8 rounded-lg text-sm"
                      />
                      <Input
                        value={d.barcode ?? ""}
                        onChange={(e) => updateDraft(i, { barcode: e.target.value || undefined })}
                        placeholder="—"
                        className="h-8 rounded-lg text-xs font-mono"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={d.quantity}
                        onChange={(e) => updateDraft(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                        className="h-8 rounded-lg text-sm"
                      />
                      <DatePickerInput
                        value={d.expiryDate}
                        onChange={(v) => updateDraft(i, { expiryDate: v })}
                      />
                      <Input
                        value={d.batchNumber ?? ""}
                        onChange={(e) => updateDraft(i, { batchNumber: e.target.value || undefined })}
                        placeholder="Optional"
                        className="h-8 rounded-lg text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                        onClick={() => removeDraft(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addDraft}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another item
                </button>
              </div>

              <div className="flex justify-end">
                <Button
                  className="rounded-lg gap-2"
                  disabled={validDrafts.length === 0}
                  onClick={() => onComplete(group, validDrafts)}
                >
                  <CheckCircle2 className="w-4 h-4" /> Add {validDrafts.length} to intake
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
