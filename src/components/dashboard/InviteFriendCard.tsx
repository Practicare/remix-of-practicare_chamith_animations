import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ChevronRight, X } from "lucide-react";
import { InviteFriendDialog } from "@/components/feedback/InviteFriendDialog";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "invite_friend_card_dismissed";

export function InviteFriendCard({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "true"
  );

  if (dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-transparent cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">Invite a friend, earn 10% off</p>
              <Badge variant="secondary" className="text-[10px]">
                Stackable
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              For every practice that subscribes via your link, get 10% off next month's invoice.
            </p>
          </div>
          <Button size="sm" className="shrink-0 gap-1 hidden sm:inline-flex">
            Invite
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>
      <InviteFriendDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
