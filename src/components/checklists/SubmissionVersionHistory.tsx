import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, User, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmissionRevision } from "@/types/checklistSubmissions";

interface SubmissionVersionHistoryProps {
  revisions: SubmissionRevision[];
  selectedVersion: number;
  onSelectVersion: (version: number) => void;
}

/**
 * Version trail for an edited submission. Newest first; any version can be loaded
 * into the read-only checklist view.
 */
export const SubmissionVersionHistory = ({
  revisions,
  selectedVersion,
  onSelectVersion,
}: SubmissionVersionHistoryProps) => {
  const ordered = [...revisions].sort((a, b) => b.version - a.version);
  const latestVersion = ordered[0]?.version;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Version history</span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {revisions.length} version{revisions.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        {selectedVersion !== latestVersion && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/5"
            onClick={() => onSelectVersion(latestVersion)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Back to latest
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {ordered.map((rev) => {
          const isSelected = rev.version === selectedVersion;
          const isLatest = rev.version === latestVersion;
          return (
            <button
              key={rev.id}
              type="button"
              onClick={() => onSelectVersion(rev.version)}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2.5 transition-all",
                isSelected
                  ? "border-primary bg-primary/[0.06]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center h-5 min-w-[34px] px-1.5 rounded-md text-[11px] font-semibold shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    v{rev.version}
                  </span>
                  {isLatest ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      Current
                    </Badge>
                  ) : rev.version === 1 ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      Original
                    </Badge>
                  ) : null}
                  <span className="text-xs text-muted-foreground truncate">{rev.changeSummary}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium tabular-nums">
                    {rev.completionPercentage}%
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {rev.editedBy}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(rev.editedAt, "PP p")}
                </span>
                <span>
                  {rev.completedItems}/{rev.totalItems} items
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
