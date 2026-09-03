import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, PlayCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { TrainingTopic } from "./TrainingTopicDialog";

interface PracticeTipCardProps {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
  storageKey?: string;
  /** Label shown on the back button on the training article. Defaults to "Staff Resource Centre". */
  fromLabel?: string;
}

export const PracticeTipCard = ({ topic, about, howToUse, storageKey, fromLabel = "Staff Resource Centre" }: PracticeTipCardProps) => {
  const lsKey = storageKey ?? `practice-tip-dismissed:${topic.id}`;
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(lsKey) === "1" : false
  );
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(lsKey, "1");
    setDismissed(true);
  };

  const openArticle = () => {
    navigate(`/training/article/${topic.id}`, {
      state: { from: location.pathname + location.search, fromLabel },
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Practice Tip</h3>
              <span className="text-[11px] text-muted-foreground">·  {topic.title}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setExpanded((e) => !e)}
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDismiss}
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {expanded ? (
            <div className="mt-2 space-y-3">
              <p className="text-[13px] text-muted-foreground leading-relaxed">{about}</p>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  How to use
                </p>
                <ul className="space-y-1">
                  {howToUse.map((step, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-foreground/90">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="default" className="gap-1.5 h-8" onClick={openArticle}>
                  <PlayCircle className="w-4 h-4" />
                  Open training article
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-[12px] text-muted-foreground/70 italic">
              Tap to expand and learn how to use this page — includes step-by-step guide & training video.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

