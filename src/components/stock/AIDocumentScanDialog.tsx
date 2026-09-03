import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Check, FileText, Loader2, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScannedItem {
  name: string;
  quantity: number;
  category: string;
  expiryDate?: string;
  batchNumber?: string;
}

interface Stage {
  id: string;
  label: string;
  /** Percentage this stage runs up to. */
  to: number;
}

const STAGES: Stage[] = [
  { id: "upload", label: "Uploading document", to: 12 },
  { id: "read", label: "Reading pages & layout", to: 28 },
  { id: "extract", label: "Extracting line items", to: 82 },
  { id: "match", label: "Matching to your categories", to: 94 },
  { id: "done", label: "Finalising results", to: 100 },
];

interface Props {
  open: boolean;
  fileName: string;
  /** Items the scan will "discover", revealed progressively. */
  items: ScannedItem[];
  onComplete: (items: ScannedItem[]) => void;
  onCancel: () => void;
}

export function AIDocumentScanDialog({ open, fileName, items, onComplete, onCancel }: Props) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [revealed, setRevealed] = useState<ScannedItem[]>([]);
  const [finished, setFinished] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  // Keep the newest extracted line in view.
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed.length]);

  useEffect(() => {
    if (!open) return;

    cancelledRef.current = false;
    setProgress(0);
    setStageIndex(0);
    setRevealed([]);
    setFinished(false);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      for (let s = 0; s < STAGES.length; s++) {
        if (cancelledRef.current) return;
        setStageIndex(s);

        const from = s === 0 ? 0 : STAGES[s - 1].to;
        const stage = STAGES[s];
        const span = stage.to - from;
        const ticks = Math.max(4, Math.round(span / 3));

        for (let t = 1; t <= ticks; t++) {
          if (cancelledRef.current) return;
          await sleep(stage.id === "extract" ? 130 : 90);
          setProgress(Math.round(from + (span * t) / ticks));

          // During extraction, stream partial results as they're "read".
          if (stage.id === "extract" && items.length > 0) {
            const shouldHave = Math.min(items.length, Math.floor((t / ticks) * items.length));
            setRevealed((prev) => (shouldHave > prev.length ? items.slice(0, shouldHave) : prev));
          }
        }
      }

      if (cancelledRef.current) return;
      setRevealed(items);
      setFinished(true);
      await sleep(700);
      if (!cancelledRef.current) onComplete(items);
    };

    run();
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stage = STAGES[stageIndex];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          cancelledRef.current = true;
          onCancel();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-lg rounded-lg"
        onInteractOutside={(e) => !finished && e.preventDefault()}
        onEscapeKeyDown={(e) => !finished && e.preventDefault()}
      >
        {/* Header with dual-ring AI spinner */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            {!finished ? (
              <>
                <span className="absolute inset-0 rounded-lg border-2 border-primary/25" />
                <span className="absolute inset-0 rounded-lg border-2 border-transparent border-t-primary animate-spin" />
                <span
                  className="absolute inset-1.5 rounded-lg border-2 border-transparent border-b-primary/60 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
                />
                <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-primary" />
              </>
            ) : (
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <PackageCheck className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight">
              {finished ? "Document read successfully" : "Reading your document"}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">{fileName}</span>
            </p>
          </div>
        </div>

        {/* Percentage bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={cn("font-medium", finished ? "text-primary" : "text-foreground")}>
              {finished ? "Complete" : stage.label}
            </span>
            <span className="tabular-nums font-semibold text-primary">{progress}%</span>
          </div>
          <div
            className="h-2 w-full rounded-lg bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Document scan progress"
          >
            <div
              className="h-full rounded-lg bg-primary transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {!finished && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent animate-[shimmer_1.4s_linear_infinite]" />
              )}
            </div>
          </div>

          {/* Stage dots */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <span
                  className={cn(
                    "w-4 h-4 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    i < stageIndex || finished
                      ? "bg-primary text-primary-foreground"
                      : i === stageIndex
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < stageIndex || finished ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <span className="w-1 h-1 rounded-lg bg-current" />
                  )}
                </span>
                {i < STAGES.length - 1 && (
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-lg transition-colors",
                      i < stageIndex || finished ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Partial updates feed */}
        <div className="rounded-lg border bg-muted/30 overflow-hidden">
          <div className="px-3 py-2 border-b bg-background/60 flex items-center justify-between">
            <span className="text-xs font-medium">Items found so far</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {revealed.length} item{revealed.length === 1 ? "" : "s"}
            </span>
          </div>
          <div ref={feedRef} className="max-h-52 overflow-y-auto p-2 space-y-1.5">
            {revealed.length === 0 && (
              <div className="flex items-center gap-2 px-2 py-6 justify-center text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scanning for stock items…
              </div>
            )}

            {revealed.map((item, i) => (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 animate-fade-in"
              >
                <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Qty {item.quantity}
                    {item.expiryDate ? ` · Exp ${item.expiryDate}` : ""}
                    {item.batchNumber ? ` · Batch ${item.batchNumber}` : ""}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator while more items stream in */}
            {!finished && revealed.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-lg bg-primary/60 animate-pulse" />
                <span
                  className="w-1.5 h-1.5 rounded-lg bg-primary/60 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-lg bg-primary/60 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                <span className="ml-1">reading more…</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {finished
            ? "Opening review so you can confirm before adding to inventory."
            : "Keep this window open — results appear as the document is read."}
        </p>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
