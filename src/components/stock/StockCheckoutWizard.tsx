import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Camera,
  FileText,
  FileUp,
  Image as ImageIcon,
  Loader2,
  LucideIcon,
  Plus,
  Radio,
  ScanBarcode,
  Sparkles,
  Trash2,
  TriangleAlert,
  Type,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraCapture } from "@/components/stock/CameraCapture";
import { INTAKE_GROUPS } from "@/components/stock/StockIntakeWizard";
import { useStock } from "@/contexts/StockContext";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode } from "@/lib/barcodes";

export interface CheckoutLine {
  itemId: string;
  itemName: string;
  quantity: number;
  batchNumber?: string;
  /** ISO date string. */
  expiryDate?: string;
}

interface DraftLine {
  /** Name as extracted by AI. */
  name: string;
  /** Matched inventory item id ("" when unmatched). */
  itemId: string;
  quantity: number;
  batchNumber?: string;
  /** ISO date string. */
  expiryDate?: string;
}

type Method = "photos" | "documents" | "text" | "barcode";
type Step = "method" | "capture" | "review";

const METHODS: { id: Method; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: "photos",
    title: "Take photos",
    description: "Snap photos of used items, empty boxes or a usage sheet — one after another.",
    icon: Camera,
  },
  {
    id: "documents",
    title: "Upload documents",
    description: "PDF, Word docs, PNG or JPEG — usage lists, procedure notes, count sheets.",
    icon: FileUp,
  },
  {
    id: "text",
    title: "Paste text",
    description: "Copy and paste a usage list from anywhere.",
    icon: Type,
  },
  {
    id: "barcode",
    title: "Scan barcodes",
    description: "Scan items as you use them — each beep adds to the list.",
    icon: ScanBarcode,
  },
];

/** Simulated AI extraction results per group — replace with the AI backend call. */
const MOCK_CHECKOUT_EXTRACTIONS: Record<string, { name: string; quantity: number }[]> = {
  expiring: [
    { name: "Nitrile Gloves (Medium)", quantity: 20 },
    { name: "Alcohol Swabs", quantity: 15 },
    { name: "Sterile Gauze Swabs 7.5cm", quantity: 8 },
    { name: "Wound Dressing Packs", quantity: 4 },
  ],
  calibrating: [
    { name: "Pulse Oximeter", quantity: 1 },
    { name: "Digital Thermometer", quantity: 1 },
  ],
  electrical: [
    { name: "Examination Lamp", quantity: 1 },
  ],
  stationery: [
    { name: "A4 Copy Paper (500 sheets)", quantity: 2 },
    { name: "Ballpoint Pens (Box of 50)", quantity: 1 },
  ],
  other: [
    { name: "Sterile Bandages", quantity: 6 },
    { name: "Disposable Syringes 5ml", quantity: 10 },
    { name: "Antiseptic Solution 500ml", quantity: 1 },
  ],
};

interface Props {
  /** Called with the confirmed lines and the selected group — parent starts the checkout session. */
  onComplete: (lines: CheckoutLine[], group: { id: string; label: string; categoryId?: string }) => void;
}

export function StockCheckoutWizard({ onComplete }: Props) {
  const { items } = useStock();

  const [groupId, setGroupId] = useState<string>("");
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("photos");

  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [docs, setDocs] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [drafts, setDrafts] = useState<DraftLine[]>([]);
  const [scans, setScans] = useState<{ code: string; count: number }[]>([]);
  const [scanningActive, setScanningActive] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

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

  /** Match an extracted name to an inventory item. */
  const matchItem = (name: string) => {
    const q = name.trim().toLowerCase();
    if (!q) return "";
    const exact = items.find((i) => i.name.toLowerCase() === q);
    if (exact) return exact.id;
    const partial = items.find(
      (i) => i.name.toLowerCase().includes(q) || q.includes(i.name.toLowerCase()),
    );
    return partial?.id ?? "";
  };

  const analyze = async () => {
    if (method === "barcode") {
      // No AI needed — known barcodes match straight to inventory items;
      // unknown ones are assigned in the review step.
      setDrafts(
        scans.map((s) => {
          const itemId = barcodeMap[s.code] ?? "";
          const item = itemId ? items.find((i) => i.id === itemId) : undefined;
          return {
            name: item?.name ?? s.code,
            itemId: item ? itemId : "",
            quantity: s.count,
            batchNumber: item?.batchNumber,
            expiryDate: item?.expiryDate
              ? new Date(item.expiryDate).toISOString().slice(0, 10)
              : undefined,
          };
        }),
      );
      setStep("review");
      return;
    }
    setAnalyzing(true);
    // Simulated AI analysis — connect the AI backend here. The mock picks a few
    // real inventory items from the selected category so matching always works.
    await new Promise((r) => setTimeout(r, 2200));
    const names = MOCK_CHECKOUT_EXTRACTIONS[group?.id ?? "other"] ?? MOCK_CHECKOUT_EXTRACTIONS.other;
    setDrafts(
      names.map((n) => {
        const itemId = matchItem(n.name);
        const item = itemId ? items.find((i) => i.id === itemId) : undefined;
        return {
          name: n.name,
          itemId,
          quantity: n.quantity,
          batchNumber: item?.batchNumber,
          expiryDate: item?.expiryDate
            ? new Date(item.expiryDate).toISOString().slice(0, 10)
            : undefined,
        };
      }),
    );
    setAnalyzing(false);
    setStep("review");
  };

  const updateDraft = (idx: number, patch: Partial<DraftLine>) =>
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  /** Matching an item pulls its batch and expiry through automatically. */
  const matchDraftItem = (idx: number, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    updateDraft(idx, {
      itemId,
      batchNumber: item?.batchNumber,
      expiryDate: item?.expiryDate
        ? new Date(item.expiryDate).toISOString().slice(0, 10)
        : undefined,
    });
  };

  const removeDraft = (idx: number) => setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const addDraft = () => setDrafts((prev) => [...prev, { name: "", itemId: "", quantity: 1 }]);

  const onHand = (itemId: string) => items.find((i) => i.id === itemId)?.quantity ?? 0;

  const validDrafts = drafts.filter((d) => d.itemId && d.quantity > 0);

  const confirm = () => {
    if (!group) return;
    const lines: CheckoutLine[] = validDrafts.map((d) => ({
      itemId: d.itemId,
      itemName: items.find((i) => i.id === d.itemId)?.name ?? d.name,
      quantity: d.quantity,
      batchNumber: d.batchNumber,
      expiryDate: d.expiryDate,
    }));
    onComplete(lines, group);
    // Reset back to a clean state for the next checkout
    selectGroup("");
    setGroupId("");
  };

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
            <h3 className="text-sm font-semibold">AI-assisted checkout</h3>
            <p className="text-xs text-muted-foreground">
              Pick a category, then snap photos, upload a usage list or paste text — AI builds the
              checkout list for you to review before stock is deducted.
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
          {/* STEP 1 — Source options */}
          {step === "method" && (
            <div>
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
                onClick={() => onComplete([], group)}
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
                      "Paste a usage list here…\n\ne.g.\nNitrile gloves medium x20\nSterile gauze swabs x5\nSaline 500ml x1"
                    }
                    className="min-h-[200px] rounded-lg text-sm"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground">
                    AI extracts item names and quantities, then matches them to your inventory.
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
                                {matched?.name ?? "No match — assign in the review"}
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
                      <ScanBarcode className="w-4 h-4" /> Review {scans.length} item{scans.length === 1 ? "" : "s"}
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
                  Check the extracted items — match each to inventory, adjust quantities, delete or
                  add rows. Confirming adds them to the{" "}
                  <span className="font-medium text-foreground">checkout basket</span>.
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
                <div className="grid grid-cols-[1.2fr_1.2fr_110px_130px_80px_40px] gap-2 px-3.5 py-2.5 bg-muted/40 text-[11px] font-medium text-muted-foreground">
                  <span>Extracted item</span>
                  <span>Inventory match</span>
                  <span>Batch</span>
                  <span>Expiry</span>
                  <span>Qty</span>
                  <span />
                </div>
                <div className="divide-y divide-border">
                  {drafts.map((d, idx) => {
                    const over = d.itemId && d.quantity > onHand(d.itemId);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[1.2fr_1.2fr_110px_130px_80px_40px] gap-2 px-3.5 py-2 items-center"
                      >
                        <Input
                          value={d.name}
                          onChange={(e) => updateDraft(idx, { name: e.target.value })}
                          placeholder="Item name"
                          className="h-9 text-sm"
                        />
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Select
                            value={d.itemId}
                            onValueChange={(v) => matchDraftItem(idx, v)}
                          >
                            <SelectTrigger
                              className={cn("h-9 text-sm", !d.itemId && "text-muted-foreground")}
                            >
                              <SelectValue placeholder="Match item" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {items.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  {i.name} · {i.quantity} on hand
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {over && (
                            <TriangleAlert
                              className="w-4 h-4 text-destructive shrink-0"
                              aria-label="Quantity exceeds stock on hand"
                            />
                          )}
                        </div>
                        <Input
                          value={d.batchNumber ?? ""}
                          onChange={(e) => updateDraft(idx, { batchNumber: e.target.value })}
                          placeholder="Batch"
                          className="h-9 text-sm"
                        />
                        <DatePickerInput
                          value={d.expiryDate}
                          onChange={(v) => updateDraft(idx, { expiryDate: v })}
                          className="h-9 text-sm"
                        />
                        <Input
                          type="number"
                          min={1}
                          value={d.quantity}
                          onChange={(e) =>
                            updateDraft(idx, { quantity: Math.max(0, Number(e.target.value)) })
                          }
                          className="h-9 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => removeDraft(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={addDraft}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border"
                >
                  <Plus className="w-3.5 h-3.5" /> Add row
                </button>
              </div>

              <div className="flex justify-end">
                <Button
                  className="rounded-lg gap-2"
                  disabled={validDrafts.length === 0}
                  onClick={confirm}
                >
                  Add {validDrafts.length > 0 ? validDrafts.length : ""} item
                  {validDrafts.length === 1 ? "" : "s"} to basket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
