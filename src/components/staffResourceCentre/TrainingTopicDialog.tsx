import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export interface AnnotatedStep {
  /** Step number / order */
  step: number;
  /** Short title */
  title: string;
  /** Long description */
  description: string;
  /** Annotation overlays positioned over the screenshot (% based) */
  annotations?: Array<{
    type: "circle" | "arrow";
    /** Top % */
    top: number;
    /** Left % */
    left: number;
    /** Width % (for circle/arrow) */
    width?: number;
    /** Height % (for circle) */
    height?: number;
    /** Label shown next to the annotation */
    label?: string;
    /** Arrow rotation deg (only for arrow) */
    rotation?: number;
  }>;
  /** Caption shown in the title bar of the screenshot frame */
  screenshotCaption?: string;
  /** Optional override screenshot for this step (falls back to topic.screenshotUrl) */
  screenshotUrl?: string;
}

export interface TrainingTopic {
  id: string;
  title: string;
  /** Short description for the topic */
  summary: string;
  /** Video duration text */
  videoDuration?: string;
  /** Optional video URL */
  videoUrl?: string;
  /** Real screenshot of the page (used as default for all steps) */
  screenshotUrl?: string;
  steps: AnnotatedStep[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: TrainingTopic;
}

const AnnotatedScreenshot = ({ step, fallbackUrl }: { step: AnnotatedStep; fallbackUrl?: string }) => {
  const src = step.screenshotUrl ?? fallbackUrl;
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted">
      {/* App chrome */}
      <div className="absolute inset-x-0 top-0 h-7 bg-card/95 border-b border-border flex items-center gap-1.5 px-3 z-10">
        <span className="w-2 h-2 rounded-full bg-destructive/60" />
        <span className="w-2 h-2 rounded-full bg-warning/60" />
        <span className="w-2 h-2 rounded-full bg-success/60" />
        <span className="ml-3 text-[10px] text-muted-foreground truncate">
          {step.screenshotCaption ?? `Step ${step.step}`}
        </span>
      </div>

      {/* Real screenshot or fallback */}
      {src ? (
        <img
          src={src}
          alt={step.screenshotCaption ?? `Step ${step.step}`}
          className="absolute inset-0 w-full h-full object-cover object-top pt-7"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 pt-9 px-4 pb-4 flex flex-col gap-2">
          <div className="h-3 w-1/3 rounded bg-foreground/10" />
          <div className="h-2 w-1/2 rounded bg-foreground/5" />
        </div>
      )}


      {/* Annotations */}
      {step.annotations?.map((a, i) => {
        if (a.type === "circle") {
          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                top: `${a.top}%`,
                left: `${a.left}%`,
                width: `${a.width ?? 12}%`,
                height: `${a.height ?? 18}%`,
              }}
            >
              <div className="w-full h-full rounded-full border-[3px] border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] animate-pulse" />
              {a.label && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                  {a.label}
                </div>
              )}
            </div>
          );
        }
        // arrow
        return (
          <div
            key={i}
            className="absolute pointer-events-none flex items-center"
            style={{
              top: `${a.top}%`,
              left: `${a.left}%`,
              width: `${a.width ?? 14}%`,
              transform: `rotate(${a.rotation ?? 0}deg)`,
              transformOrigin: "left center",
            }}
          >
            <div className="flex-1 h-[3px] bg-primary rounded" />
            <div className="w-0 h-0 border-l-[10px] border-l-primary border-y-[6px] border-y-transparent" />
            {a.label && (
              <div className="absolute -top-5 left-0 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                {a.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const TrainingTopicDialog = ({ open, onOpenChange, topic }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] uppercase">Training</Badge>
              {topic.videoDuration && (
                <Badge variant="outline" className="text-[10px]">{topic.videoDuration}</Badge>
              )}
            </div>
            <DialogTitle className="text-xl leading-tight">{topic.title}</DialogTitle>
            <DialogDescription className="text-[13px]">{topic.summary}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Video */}
          <section>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="relative w-16 h-16 rounded-full bg-primary/15 backdrop-blur flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Play className="w-7 h-7 text-primary ml-1" />
              </div>
              {topic.videoDuration && (
                <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded">
                  {topic.videoDuration}
                </div>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground mt-2">
              Short walkthrough of {topic.title.toLowerCase()}.
            </p>
          </section>

          {/* Step by step */}
          <section className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step-by-step
            </h4>
            <ol className="space-y-5">
              {topic.steps.map((s) => (
                <li key={s.step} className="grid md:grid-cols-[1fr_1.2fr] gap-4 items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                        {s.step}
                      </span>
                      <h5 className="text-sm font-semibold text-foreground">{s.title}</h5>
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  <AnnotatedScreenshot step={s} fallbackUrl={topic.screenshotUrl} />
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-between items-center gap-2">
          <p className="text-[11px] text-muted-foreground">
            More videos and guides in the Training Centre.
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/training">
              <BookOpen className="w-3.5 h-3.5" />
              Open Training Centre
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
