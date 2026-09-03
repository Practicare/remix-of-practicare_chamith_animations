import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Mail, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REFERRAL_CODE = "PRACTI-10OFF";
const REFERRAL_URL = `https://practicare.app/r/${REFERRAL_CODE}`;

export function InviteFriendDialog({ open, onOpenChange }: InviteFriendDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");
  const [note, setNote] = useState(
    "I've been using Practicare to run our practice — it's saved us hours each week. Use my link to get started."
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(REFERRAL_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Share it with your friends." });
  };

  const handleSend = () => {
    const list = emails
      .split(/[,\s\n]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (list.length === 0) {
      toast({
        title: "Add at least one email",
        description: "Enter the email addresses you'd like to invite.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Invites sent to ${list.length} ${list.length === 1 ? "person" : "people"}`,
      description: "You'll earn 10% off next month for each one that subscribes.",
    });
    setEmails("");
    onOpenChange(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Try Practicare",
          text: note,
          url: REFERRAL_URL,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Invite a friend, get 10% off
          </DialogTitle>
          <DialogDescription>
            For every practice that subscribes through your link, you get{" "}
            <span className="font-medium text-foreground">10% off</span> your next month's invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Reward strip */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Stackable discount</p>
              <p className="text-xs text-muted-foreground">
                Invite 10 → get a free month. No cap.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              0 credited
            </Badge>
          </div>

          {/* Referral link */}
          <div className="space-y-2">
            <Label className="text-xs">Your referral link</Label>
            <div className="flex gap-2">
              <Input value={REFERRAL_URL} readOnly className="text-xs font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNativeShare}
                className="shrink-0"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Email invites */}
          <div className="space-y-2">
            <Label htmlFor="invite-emails" className="text-xs">
              Or send by email
            </Label>
            <Input
              id="invite-emails"
              placeholder="friend@practice.com, colleague@practice.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSend} className="gap-2">
            <Mail className="w-4 h-4" />
            Send invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
