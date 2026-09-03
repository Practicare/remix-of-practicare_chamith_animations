import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, Clock, User, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChecklistSubmission } from "@/types/checklistSubmissions";

interface SubmissionChecklistViewProps {
  submission: ChecklistSubmission;
  categoryName?: string;
}

/**
 * Read-only rendering of a submitted checklist, using the same visual
 * language as ChecklistCard (numbered rows, entry control column, comments).
 */
export const SubmissionChecklistView = ({ submission, categoryName }: SubmissionChecklistViewProps) => {
  const isComplete = submission.completionPercentage === 100;
  const criticalMissed = submission.itemsSnapshot.filter((i) => i.critical && !i.completed);

  return (
    <div className="space-y-4">
      {/* Header — mirrors the checklist card header */}
      <Card className={cn("border-border/60", isComplete && "bg-success/[0.02]")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" className="fill-none stroke-muted/30" strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  className={cn("fill-none", isComplete ? "stroke-success" : "stroke-primary")}
                  strokeWidth="4"
                  strokeDasharray={`${submission.completionPercentage * 1.508} 150.8`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-xs font-bold",
                  isComplete ? "text-success" : "text-foreground"
                )}
              >
                {submission.completionPercentage}%
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="font-semibold text-base truncate">{submission.checklistTitle}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {isComplete ? "Complete" : "Partial"}
                </Badge>
                {categoryName && (
                  <Badge variant="secondary" className="text-xs">
                    {categoryName}
                  </Badge>
                )}
                {criticalMissed.length > 0 && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {criticalMissed.length} critical missed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {submission.submittedBy}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(submission.submittedAt, "PPp")}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {submission.completedItems}/{submission.totalItems} items
                </span>
              </div>
              <Progress value={submission.completionPercentage} className="h-1.5 mt-1" />
            </div>
          </div>

          {submission.notes && (
            <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground">
              {submission.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items — same row layout as the live checklist */}
      <div className="space-y-1.5">
        {submission.itemsSnapshot.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-lg",
              item.completed ? "bg-success/[0.06]" : "bg-muted/30"
            )}
          >
            <span
              className={cn(
                "w-5 text-xs font-medium tabular-nums shrink-0",
                item.completed ? "text-success" : "text-muted-foreground"
              )}
            >
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm leading-snug", item.completed && "line-through text-muted-foreground")}>
                  {item.text}
                </p>
                {item.critical && (
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
                    Critical
                  </Badge>
                )}
              </div>
              {item.comment && (
                <p className="mt-1 text-[11px] text-muted-foreground italic flex items-start gap-1">
                  <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                  {item.comment}
                </p>
              )}
              {(item.completedBy || item.completedAt) && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.completedBy}
                  {item.completedBy && item.completedAt ? " • " : ""}
                  {item.completedAt ? format(new Date(item.completedAt), "PP p") : ""}
                </p>
              )}
            </div>

            {/* Entry column (read-only) */}
            <div className="flex items-center shrink-0 px-3 border-l border-border/60">
              <div className="flex items-center justify-center w-[104px]">
                {item.type === "tick" && (
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border",
                      item.completed
                        ? "bg-success border-success text-success-foreground"
                        : "border-muted-foreground/40 text-muted-foreground/50"
                    )}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                )}

                {item.type === "yesno" && (
                  <div className="inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
                    <div
                      className={cn(
                        "w-[46px] h-6 rounded-md text-[11px] font-medium flex items-center justify-center gap-1",
                        item.yesNoValue === "yes"
                          ? "bg-success text-success-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      <Check className="w-3 h-3" />
                      Yes
                    </div>
                    <div
                      className={cn(
                        "w-[46px] h-6 rounded-md text-[11px] font-medium flex items-center justify-center gap-1",
                        item.yesNoValue === "no"
                          ? "bg-destructive text-destructive-foreground shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      <X className="w-3 h-3" />
                      No
                    </div>
                  </div>
                )}

                {item.type === "number" && (
                  <div
                    className={cn(
                      "w-16 h-7 rounded-lg border flex items-center justify-center text-xs font-medium",
                      item.numberValue ? "border-success bg-success/10" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.numberValue ?? "—"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
