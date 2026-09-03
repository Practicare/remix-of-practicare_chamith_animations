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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim() && rating === 0) {
      toast({
        title: "Missing Feedback",
        description: "Please provide a rating or write some feedback.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent("User Feedback");
    const body = encodeURIComponent(
      `FEEDBACK\n` +
      `========\n\n` +
      `Rating: ${rating > 0 ? `${rating}/5 stars` : "Not provided"}\n\n` +
      `Feedback:\n${feedback || "No written feedback provided"}\n\n` +
      `---\n` +
      `Submitted from: ${window.location.origin}\n` +
      `Date: ${new Date().toLocaleString()}`
    );

    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;

    toast({
      title: "Email Client Opened",
      description: "Thank you for your feedback! Please send the email to submit.",
    });

    setRating(0);
    setFeedback("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setRating(0);
    setFeedback("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Tell us what you think, what could be improved, or what you love about the platform..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="w-4 h-4" />
            Send Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
