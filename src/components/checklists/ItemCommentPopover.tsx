import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageSquare, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemCommentPopoverProps {
  comment?: string;
  onSave: (comment: string | undefined) => void;
  className?: string;
}

export const ItemCommentPopover = ({
  comment,
  onSave,
  className,
}: ItemCommentPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(comment ?? "");

  useEffect(() => {
    if (open) setDraft(comment ?? "");
  }, [open, comment]);

  const hasComment = Boolean(comment && comment.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={hasComment ? "Edit comment" : "Add comment"}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-7 w-7 shrink-0",
            hasComment
              ? "text-primary hover:text-primary"
              : "text-muted-foreground hover:text-foreground",
            className
          )}
        >
          {hasComment ? (
            <MessageSquareText className="w-3.5 h-3.5" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-3 space-y-2 bg-popover z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium text-foreground">Comment</p>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for this item..."
          className="min-h-[80px] text-sm"
        />
        <div className="flex items-center justify-end gap-2">
          {hasComment && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive hover:text-destructive"
              onClick={() => {
                onSave(undefined);
                setOpen(false);
              }}
            >
              Remove
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              onSave(draft.trim() ? draft.trim() : undefined);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
