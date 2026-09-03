import { Checklist, ChecklistItem } from "@/types/checklists";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, AlertTriangle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ItemCommentPopover } from "./ItemCommentPopover";

interface ChecklistTableViewProps {
  checklist: Checklist;
  categoryName?: string;
  onToggleItem: (cId: string, itemId: string) => void;
  onUpdateItemValue: (
    cId: string,
    itemId: string,
    value: { yesNoValue?: "yes" | "no"; numberValue?: string; comment?: string }
  ) => void;
  onDeleteItem?: (cId: string, itemId: string) => void;
}

export function ChecklistTableView({
  checklist,
  categoryName,
  onToggleItem,
  onUpdateItemValue,
  onDeleteItem,
}: ChecklistTableViewProps) {
  const total = checklist.items.length;
  const done = checklist.items.filter((i) => i.completed).length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden print:border-0 print:shadow-none">
      {/* Document header */}
      <div className="px-6 py-5 border-b border-border bg-muted/30 print:bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight">{checklist.title}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-muted-foreground">
              {categoryName && <span>Department: <span className="text-foreground font-medium">{categoryName}</span></span>}
              {checklist.recurring && (
                <span className="capitalize">Frequency: <span className="text-foreground font-medium">{checklist.recurring}</span></span>
              )}
              <span>Date: <span className="text-foreground font-medium">{format(new Date(), "dd MMM yyyy")}</span></span>
              <span>Progress: <span className="text-foreground font-medium">{done}/{total}</span></span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold w-10 border-b border-border">#</th>
              <th className="px-3 py-2.5 text-left font-semibold border-b border-border">Item</th>
              <th className="px-3 py-2.5 text-left font-semibold w-40 border-b border-border">Completed by</th>
              <th className="px-3 py-2.5 text-left font-semibold w-36 border-b border-border">Completed at</th>
              <th className="px-3 py-2.5 text-center font-semibold w-32 border-b border-border border-l">Entry</th>
              <th className="px-3 py-2.5 text-right font-semibold w-24 border-b border-border border-l">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checklist.items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                index={idx + 1}
                onToggle={() => onToggleItem(checklist.id, item.id)}
                onUpdate={(v) => onUpdateItemValue(checklist.id, item.id, v)}
                onDelete={onDeleteItem ? () => onDeleteItem(checklist.id, item.id) : undefined}
              />
            ))}
            {checklist.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No items in this checklist.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sign-off footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/20 print:bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
        <div>
          <div className="text-muted-foreground mb-1">Completed by (signature)</div>
          <div className="h-8 border-b border-dashed border-border" />
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Date</div>
          <div className="h-8 border-b border-dashed border-border" />
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  index,
  onToggle,
  onUpdate,
  onDelete,
}: {
  item: ChecklistItem;
  index: number;
  onToggle: () => void;
  onUpdate: (v: { yesNoValue?: "yes" | "no"; numberValue?: string; comment?: string }) => void;
  onDelete?: () => void;
}) {
  return (
    <tr className="border-b border-border/60 hover:bg-muted/30 transition-colors">
      <td className="px-3 py-2.5 align-top text-muted-foreground tabular-nums">{index}</td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex items-start gap-2">
          {item.critical && (
            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span className={item.completed ? "line-through text-muted-foreground" : ""}>
              {item.text}
            </span>
            {item.comment && (
              <p className="mt-1 text-[11px] text-muted-foreground italic">“{item.comment}”</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground">
        {item.completedBy || <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground tabular-nums">
        {item.completedAt ? format(new Date(item.completedAt), "dd MMM HH:mm") : <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-3 py-2.5 align-top border-l border-border/60">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-[104px]">
            {item.type === "tick" && (
              <Checkbox checked={item.completed} onCheckedChange={onToggle} />
            )}
            {item.type === "yesno" && (
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
                <button
                  type="button"
                  className={
                    "w-[46px] h-6 rounded-md text-[11px] font-medium transition-all " +
                    (item.yesNoValue === "yes"
                      ? "bg-success text-success-foreground shadow-sm"
                      : "text-muted-foreground hover:text-success")
                  }
                  onClick={() => onUpdate({ yesNoValue: item.yesNoValue === "yes" ? undefined : "yes" })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={
                    "w-[46px] h-6 rounded-md text-[11px] font-medium transition-all " +
                    (item.yesNoValue === "no"
                      ? "bg-destructive text-destructive-foreground shadow-sm"
                      : "text-muted-foreground hover:text-destructive")
                  }
                  onClick={() => onUpdate({ yesNoValue: item.yesNoValue === "no" ? undefined : "no" })}
                >
                  No
                </button>
              </div>
            )}
            {item.type === "number" && (
              <Input
                type="number"
                value={item.numberValue ?? ""}
                onChange={(e) => onUpdate({ numberValue: e.target.value })}
                className="h-7 w-20 text-center text-[12px]"
                placeholder="—"
              />
            )}
          </div>

        </div>
      </td>

      <td className="px-3 py-2.5 align-top border-l border-border/60">
        <div className="flex items-center justify-end gap-1.5">
          <ItemCommentPopover
            comment={item.comment}
            onSave={(comment) => onUpdate({ comment })}
          />

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              title="Delete item"
              className="h-7 w-7 text-muted-foreground hover:text-destructive print:hidden"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
