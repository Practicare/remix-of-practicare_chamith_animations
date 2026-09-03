import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripHorizontal, Move, ArrowLeftRight, MousePointer2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShiftInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedCount: number;
  onDontShowAgain?: (value: boolean) => void;
}

export function ShiftInstructionsDialog({
  open,
  onOpenChange,
  addedCount,
  onDontShowAgain,
}: ShiftInstructionsDialogProps) {
  const [animationPhase, setAnimationPhase] = useState<"idle" | "drag" | "resize-right" | "resize-left">("idle");
  const [shiftPosition, setShiftPosition] = useState({ left: 10, right: 45 });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Animation cycle
  useEffect(() => {
    if (!open) {
      setAnimationPhase("idle");
      setShiftPosition({ left: 10, right: 45 });
      return;
    }

    const phases: Array<"idle" | "drag" | "resize-right" | "resize-left"> = ["idle", "drag", "resize-right", "resize-left"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      const phase = phases[currentIndex];
      setAnimationPhase(phase);

      // Update position based on phase
      switch (phase) {
        case "drag":
          setShiftPosition({ left: 35, right: 20 }); // Move right
          break;
        case "resize-right":
          setShiftPosition({ left: 35, right: 10 }); // Extend right edge
          break;
        case "resize-left":
          setShiftPosition({ left: 25, right: 10 }); // Shrink left edge
          break;
        case "idle":
          setShiftPosition({ left: 10, right: 45 }); // Reset
          break;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {addedCount} Team Member{addedCount !== 1 ? "s" : ""} Added!
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Here's how to manage their shifts
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Instructions */}
        <div className="p-6 pt-4 space-y-5">
          {/* Instruction 1: Drag to time slot */}
          <div className={cn(
            "flex gap-4 items-start transition-all duration-300",
            animationPhase === "drag" && "scale-[1.02]"
          )}>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300",
              animationPhase === "drag" ? "bg-blue-500 text-white" : "bg-blue-500/10"
            )}>
              <Move className={cn("h-5 w-5", animationPhase !== "drag" && "text-blue-500")} />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Drag to Position</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click and drag the shift block to move it to your desired time slot.
              </p>
            </div>
          </div>

          {/* Instruction 2: Resize edges */}
          <div className={cn(
            "flex gap-4 items-start transition-all duration-300",
            (animationPhase === "resize-right" || animationPhase === "resize-left") && "scale-[1.02]"
          )}>
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300",
              (animationPhase === "resize-right" || animationPhase === "resize-left") ? "bg-green-500 text-white" : "bg-green-500/10"
            )}>
              <ArrowLeftRight className={cn("h-5 w-5", animationPhase !== "resize-right" && animationPhase !== "resize-left" && "text-green-500")} />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">Resize with Edges</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drag the left or right edge to adjust start or end time.
              </p>
            </div>
          </div>

          {/* Interactive demo area */}
          <div className="relative rounded-xl border bg-muted/30 p-4 mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                animationPhase === "drag" && "bg-blue-500/20 text-blue-600",
                animationPhase === "resize-right" && "bg-green-500/20 text-green-600",
                animationPhase === "resize-left" && "bg-green-500/20 text-green-600",
                animationPhase === "idle" && "bg-muted text-muted-foreground"
              )}>
                {animationPhase === "drag" && "Dragging..."}
                {animationPhase === "resize-right" && "Extending end time..."}
                {animationPhase === "resize-left" && "Adjusting start time..."}
                {animationPhase === "idle" && "Watch the animation"}
              </span>
            </div>
            
            {/* Mock timeline */}
            <div className="relative h-12 bg-background rounded-lg border overflow-hidden">
              {/* Time markers */}
              <div className="absolute inset-x-0 top-0 h-5 flex border-b text-[10px] text-muted-foreground">
                <div className="flex-1 border-r px-1.5 py-0.5">6AM</div>
                <div className="flex-1 border-r px-1.5 py-0.5">9AM</div>
                <div className="flex-1 border-r px-1.5 py-0.5">12PM</div>
                <div className="flex-1 border-r px-1.5 py-0.5">3PM</div>
                <div className="flex-1 px-1.5 py-0.5">6PM</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute inset-x-0 top-5 bottom-0 flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 border-r border-dashed border-muted-foreground/20 last:border-r-0" />
                ))}
              </div>
              
              {/* Animated shift block */}
              <div 
                className={cn(
                  "absolute bottom-1.5 top-6 rounded flex items-center justify-center transition-all duration-700 ease-in-out",
                  animationPhase === "drag" && "bg-blue-500 shadow-lg shadow-blue-500/30",
                  animationPhase === "resize-right" && "bg-green-500 shadow-lg shadow-green-500/30",
                  animationPhase === "resize-left" && "bg-green-500 shadow-lg shadow-green-500/30",
                  animationPhase === "idle" && "bg-primary/80"
                )}
                style={{
                  left: `${shiftPosition.left}%`,
                  right: `${shiftPosition.right}%`,
                }}
              >
                <div className="flex items-center gap-1.5 px-2">
                  <GripHorizontal className="h-3 w-3 text-white/70" />
                  <span className="text-[10px] font-medium text-white whitespace-nowrap">John D.</span>
                </div>
                
                {/* Left resize handle */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full transition-all duration-300",
                  animationPhase === "resize-left" ? "bg-white scale-125" : "bg-white/40"
                )} />
                
                {/* Right resize handle */}
                <div className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-full transition-all duration-300",
                  animationPhase === "resize-right" ? "bg-white scale-125" : "bg-white/40"
                )} />

                {/* Cursor indicator */}
                {animationPhase !== "idle" && (
                  <div className={cn(
                    "absolute w-4 h-4 transition-all duration-700",
                    animationPhase === "drag" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    animationPhase === "resize-right" && "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
                    animationPhase === "resize-left" && "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
                  )}>
                    <MousePointer2 className="h-4 w-4 text-white drop-shadow-lg animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-4">
          <Button 
            onClick={() => {
              if (dontShowAgain && onDontShowAgain) {
                onDontShowAgain(true);
              }
              onOpenChange(false);
            }} 
            className="w-full"
            size="lg"
          >
            Got it, let's go!
          </Button>
          
          {/* Don't show again - clearly separated */}
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-muted/50 border border-border/50 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="h-5 w-5"
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium cursor-pointer select-none"
            >
              Don't show this again
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
