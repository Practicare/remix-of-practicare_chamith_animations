import { useRef, useState } from "react";
import { Package, ScanLine, FileSpreadsheet, Keyboard, Plus, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { defaultsFor } from "@/data/onboardingDefaults";
import type { StockMethod, TeamOnboardingState, TeamStockItem } from "@/types/onboardingTeam";

const SAMPLE_ITEMS: Record<string, string[]> = {
  "Medical consumables": ["Gauze pads", "Specimen jars", "Syringes 5ml"],
  Vaccines: ["Influenza vaccine", "COVID-19 vaccine"],
  PPE: ["Nitrile gloves (M)", "Surgical masks", "Isolation gowns"],
  Stationery: ["Appointment cards", "Printer paper"],
  "Dental materials": ["Composite resin", "Etching gel"],
  Instruments: ["Extraction forceps", "Mirror handles"],
  Disinfectants: ["Surface wipes", "Hand sanitiser"],
  "Therapy supplies": ["Resistance bands", "Massage cream"],
  Equipment: ["Ultrasound gel", "Electrode pads"],
  "Cosmetic consumables": ["Cannulas 27G", "Syringes 1ml"],
  "Medical supplies": ["Saline 0.9%", "Wound dressings"],
  "General supplies": ["Paper towel", "Bin liners"],
};

const SCAN_STAGES = ["Reading layout…", "Extracting line items…", "Matching categories…"];

function seedItems(categories: string[]): TeamStockItem[] {
  return categories.flatMap((category) =>
    (SAMPLE_ITEMS[category] ?? [`${category} item`]).map((name) => ({
      id: crypto.randomUUID(),
      name,
      category,
      quantity: 0,
    }))
  );
}

const METHODS: { id: StockMethod; label: string; description: string; icon: typeof ScanLine }[] = [
  {
    id: "ai",
    label: "AI scan",
    description: "Upload invoices, receipts or photos — AI extracts your items.",
    icon: ScanLine,
  },
  {
    id: "csv",
    label: "CSV upload",
    description: "Import from a spreadsheet export of your current inventory.",
    icon: FileSpreadsheet,
  },
  {
    id: "manual",
    label: "Manual add",
    description: "Type items in one at a time — great for a small starter list.",
    icon: Keyboard,
  },
];

interface Props {
  state: TeamOnboardingState;
  update: (patch: Partial<TeamOnboardingState>) => void;
}

export function StockStep({ state, update }: Props) {
  const categories = defaultsFor(state.industry).stockCategories;
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [draft, setDraft] = useState({ name: "", category: categories[0] ?? "", quantity: "", expiry: "" });

  const runImport = async (method: "ai" | "csv") => {
    setScanning(true);
    setScanStage(0);
    for (let i = 0; i < SCAN_STAGES.length; i++) {
      setScanStage(i);
      await new Promise((r) => setTimeout(r, 550));
    }
    update({ stockMethod: method, stockItems: seedItems(categories) });
    setScanning(false);
    toast.success(`Imported ${categories.length * 2}+ items across ${categories.length} categories.`);
  };

  const chooseMethod = (method: StockMethod) => {
    if (method === "manual") {
      update({ stockMethod: "manual" });
      return;
    }
    if (method === "csv") {
      fileRef.current?.click();
      return;
    }
    runImport("ai");
  };

  const handleCsv = (file: File | undefined) => {
    if (!file) return;
    runImport("csv");
  };

  const addItem = () => {
    if (!draft.name.trim() || !draft.category) {
      toast.error("Item name and category are required.");
      return;
    }
    update({
      stockMethod: state.stockMethod ?? "manual",
      stockItems: [
        ...state.stockItems,
        {
          id: crypto.randomUUID(),
          name: draft.name.trim(),
          category: draft.category,
          quantity: parseInt(draft.quantity, 10) || 0,
          expiry: draft.expiry || undefined,
        },
      ],
    });
    setDraft({ name: "", category: categories[0] ?? "", quantity: "", expiry: "" });
  };

  const updateItem = (id: string, patch: Partial<TeamStockItem>) =>
    update({ stockItems: state.stockItems.map((i) => (i.id === id ? { ...i, ...patch } : i)) });

  const removeItem = (id: string) => update({ stockItems: state.stockItems.filter((i) => i.id !== id) });

  const showList = state.stockItems.length > 0 || state.stockMethod === "manual";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Stock & inventory</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get a starting catalogue — you can refine levels and expiry dates any time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = state.stockMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={scanning}
              onClick={() => chooseMethod(m.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all disabled:opacity-60",
                active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-2", active ? "text-primary" : "text-muted-foreground")} />
              <div className="text-sm font-medium">{m.label}</div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
            </button>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleCsv(e.target.files?.[0])}
      />

      {scanning && (
        <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <div className="flex-1">
            <div className="text-sm font-medium">{SCAN_STAGES[scanStage]}</div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((scanStage + 1) / SCAN_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showList && !scanning && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium">Initial stock</span>
            <span className="text-xs text-muted-foreground">
              {state.stockItems.length} item{state.stockItems.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {/* Inline draft row for rapid sequential entry */}
            <div className="grid grid-cols-12 gap-2">
              <Input
                placeholder="Item name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="col-span-12 sm:col-span-5 h-9"
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft({ ...draft, category: v })}
              >
                <SelectTrigger className="col-span-5 sm:col-span-3 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                placeholder="Qty"
                value={draft.quantity}
                onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                className="col-span-3 sm:col-span-1 h-9"
              />
              <Input
                type="date"
                value={draft.expiry}
                onChange={(e) => setDraft({ ...draft, expiry: e.target.value })}
                className="col-span-4 sm:col-span-2 h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                className="col-span-12 sm:col-span-1 h-9"
                onClick={addItem}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-0" />
                <span className="sm:hidden">Add item</span>
              </Button>
            </div>

            {state.stockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.category}</div>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-16 h-8 text-sm"
                  aria-label={`Quantity for ${item.name}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {state.stockItems.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                Add your first item above.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
        <Label className="text-xs text-primary mb-1 block">Tip</Label>
        <p className="text-xs text-muted-foreground">
          Skip this for now if you'd rather import later — Inventory has AI scan and CSV import too.
        </p>
      </div>
    </div>
  );
}
