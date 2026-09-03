import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SUGGESTED = [
  "What does GP3.2 require?",
  "Show missing evidence",
  "What should I do next?",
  "Generate a policy draft",
];

const SAMPLE_THREAD = [
  { role: "assistant", text: "Hi Sarah — you're 72% ready for RACGP 6th Ed. Want a summary of the top 3 gaps I'd tackle this week?" },
  { role: "user", text: "Yes, and what should I do first?" },
  { role: "assistant", text: "Start with anaphylaxis training records (QI 3.2, critical). 4 staff overdue — I can draft the email to book training. Then update the cold chain breach protocol (GP 4.1)." },
];

export function AIAssistantSheet({ open, onOpenChange }: Props) {
  const [input, setInput] = useState("");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <SheetTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div>Ask Accreditation AI</div>
              <div className="text-[11px] font-normal text-muted-foreground">Context: RACGP 6th Ed · 72% ready</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {SAMPLE_THREAD.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[12px] text-muted-foreground flex gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Answers are grounded in your uploaded standards and evidence. Always verify before submission.</span>
          </div>
        </div>

        <div className="border-t p-3 space-y-2 bg-card">
          <div className="flex gap-1.5 flex-wrap">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground border border-border/60"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your accreditation…"
              className="text-[13px]"
            />
            <Button size="icon" className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function FloatingAIButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-12 pl-3 pr-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
    >
      <div className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
        <Sparkles className="w-4 h-4" />
      </div>
      <span className="text-[13px] font-medium">Ask AI</span>
    </button>
  );
}
