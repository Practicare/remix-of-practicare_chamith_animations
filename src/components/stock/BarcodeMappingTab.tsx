import { useMemo, useState } from "react";
import {
  ScanBarcode,
  Search,
  Check,
  X,
  Save,
  Crosshair,
  Radio,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStock } from "@/contexts/StockContext";
import { useBarcodeMap, useBarcodeScanner, normaliseBarcode, BarcodeMap } from "@/lib/barcodes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BarcodeMappingTab() {
  const { items } = useStock();
  const { map, persist } = useBarcodeMap();

  // Draft: itemId -> barcode (working copy, saved as a whole)
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [armedItemId, setArmedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyUnmatched, setOnlyUnmatched] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const savedByItem = useMemo(() => {
    const out: Record<string, string> = {};
    Object.entries(map).forEach(([code, itemId]) => {
      out[itemId] = code;
    });
    return out;
  }, [map]);

  const barcodeFor = (itemId: string) =>
    draft[itemId] !== undefined ? draft[itemId] : savedByItem[itemId] ?? "";

  const dirtyCount = useMemo(
    () =>
      Object.keys(draft).filter(
        (id) => normaliseBarcode(draft[id] ?? "") !== (savedByItem[id] ?? ""),
      ).length,
    [draft, savedByItem],
  );

  const assign = (itemId: string, rawCode: string) => {
    const code = normaliseBarcode(rawCode);
    const clash = items.find((i) => i.id !== itemId && barcodeFor(i.id) === code && code);
    if (clash) {
      toast.error(`That barcode is already matched to "${clash.name}"`);
      return;
    }
    setDraft((prev) => ({ ...prev, [itemId]: code }));
  };

  const handleScan = (code: string) => {
    if (armedItemId) {
      const item = items.find((i) => i.id === armedItemId);
      assign(armedItemId, code);
      setArmedItemId(null);
      if (item) toast.success(`Matched ${code} → ${item.name}`);
      return;
    }
    // Not armed: if the code is already known, highlight it; otherwise prompt.
    const knownId = map[code] ?? items.find((i) => barcodeFor(i.id) === code)?.id;
    if (knownId) {
      const item = items.find((i) => i.id === knownId);
      toast.info(`${code} is already matched to "${item?.name ?? "an item"}"`);
      setSearch(item?.name ?? "");
    } else {
      setManualCode(code);
      toast.message(`Scanned ${code}`, {
        description: "Pick the item row you want to match it to.",
      });
    }
  };

  const { scanning, lastScan } = useBarcodeScanner({ onScan: handleScan });

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...items]
      .filter((i) => (q ? i.name.toLowerCase().includes(q) : true))
      .filter((i) => (onlyUnmatched ? !barcodeFor(i.id) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, onlyUnmatched, draft, savedByItem]);

  const matchedCount = items.filter((i) => barcodeFor(i.id)).length;

  const saveAll = () => {
    if (dirtyCount === 0) {
      toast.info("Nothing new to save");
      return;
    }
    const next: BarcodeMap = {};
    items.forEach((i) => {
      const code = normaliseBarcode(barcodeFor(i.id));
      if (code) next[code] = i.id;
    });
    persist(next);
    setDraft({});
    toast.success(`Saved ${dirtyCount} barcode match${dirtyCount === 1 ? "" : "es"}`);
  };

  const armRow = (itemId: string) => {
    if (manualCode) {
      assign(itemId, manualCode);
      setManualCode("");
      toast.success("Barcode matched — remember to save");
      return;
    }
    setArmedItemId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div className="space-y-6">
      {/* Scanner status */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ScanBarcode className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Barcode matching</h3>
              <p className="text-xs text-muted-foreground">
                Point your scanner at this page — no driver setup needed. Match codes to items one
                by one, then save them all together.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Button className="h-9 gap-1.5" onClick={saveAll} disabled={dirtyCount === 0}>
              <Save className="w-4 h-4" /> Save {dirtyCount > 0 ? `(${dirtyCount})` : "all"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 space-y-1.5">
            <Label className="text-xs">Last signal captured</Label>
            <div className="h-10 rounded-lg border border-border bg-muted/30 flex items-center px-3 text-sm font-mono">
              {lastScan ?? "—"}
            </div>
          </div>
          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs">Or enter a code manually</Label>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. 9312345678907"
              className="h-10 font-mono"
              maxLength={64}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-xs">Progress</Label>
            <div className="h-10 rounded-lg border border-border bg-muted/30 flex items-center px-3 text-sm">
              <span className="font-semibold text-foreground">{matchedCount}</span>
              <span className="text-muted-foreground">&nbsp;of {items.length} items matched</span>
            </div>
          </div>
        </div>

        {(armedItemId || manualCode) && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-foreground flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-primary" />
            {armedItemId
              ? "Row armed — scan the product now to capture its barcode."
              : "Code held — click “Match” on the item row you want to attach it to."}
            <button
              className="ml-auto text-muted-foreground hover:text-foreground"
              onClick={() => {
                setArmedItemId(null);
                setManualCode("");
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Item list */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory items..."
              className="h-9 pl-9"
            />
          </div>
          <Button
            variant={onlyUnmatched ? "default" : "outline"}
            className="h-9 text-xs"
            onClick={() => setOnlyUnmatched((v) => !v)}
          >
            Unmatched only
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Item</TableHead>
              <TableHead className="text-xs font-semibold">Barcode</TableHead>
              <TableHead className="text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                  No items to show.
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item) => {
                const code = barcodeFor(item.id);
                const isDirty = normaliseBarcode(code) !== (savedByItem[item.id] ?? "");
                const armed = armedItemId === item.id;
                return (
                  <TableRow key={item.id} className={cn(armed && "bg-primary/5")}>
                    <TableCell className="text-sm font-medium">
                      {item.name}
                      <span className="block text-xs text-muted-foreground font-normal">
                        {item.quantity} on hand
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={code}
                        onChange={(e) => assign(item.id, e.target.value)}
                        placeholder="Scan or type"
                        className="h-9 font-mono text-xs max-w-[220px]"
                        maxLength={64}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {isDirty ? (
                        <Badge variant="outline" className="text-[10px] font-normal border-primary text-primary">
                          Unsaved
                        </Badge>
                      ) : code ? (
                        <Badge variant="outline" className="text-[10px] font-normal gap-1">
                          <Check className="w-3 h-3" /> Matched
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                          Not matched
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={armed ? "default" : "outline"}
                          className="h-8 text-xs gap-1.5"
                          onClick={() => armRow(item.id)}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          {armed ? "Scan now" : "Match"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={!code}
                          onClick={() => assign(item.id, "")}
                          aria-label="Clear barcode"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
