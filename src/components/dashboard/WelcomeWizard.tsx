import { useState } from "react";
import { APP_BRAND } from "@/config/branding";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Play,
  X,
  Sparkles,
  ShieldCheck,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface WelcomeWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Users,
    title: "Add Your Team",
    description:
      "Start by adding your team members, assigning their roles, and setting up permissions so everyone has the right level of access.",
    color: "text-primary",
    bg: "bg-primary/10",
    highlights: [
      { icon: UserPlus, label: "Add staff members" },
      { icon: ShieldCheck, label: "Assign roles & permissions" },
    ],
  },
  {
    icon: Settings,
    title: "Complete Your Practice Profile",
    description:
      "Head over to Settings to fill in your practice details, departments, and preferences to personalise your experience.",
    color: "text-success",
    bg: "bg-success/10",
    highlights: [
      { icon: Settings, label: "Practice details & departments" },
      { icon: Users, label: "Billing & notifications" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Training & Resources",
    description:
      `Explore orientation videos and guides in the Training & Resources section to get the most out of ${APP_BRAND.name}.`,
    color: "text-warning",
    bg: "bg-warning/10",
    highlights: [
      { icon: Play, label: "Watch orientation videos" },
      { icon: BookOpen, label: "Browse help guides" },
    ],
  },
];

export function WelcomeWizard({ open, onClose }: WelcomeWizardProps) {
  const [step, setStep] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (showVideo) {
      setShowVideo(false);
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-border [&>button]:hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Welcome to {APP_BRAND.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-6 pt-2 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 min-h-[280px] flex flex-col">
          <AnimatePresence mode="wait">
            {showVideo ? (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-full aspect-video rounded-xl bg-muted border border-border flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Play className="w-7 h-7 text-primary ml-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Product tour video
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon — we're polishing the final cut!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-5"
              >
                <div
                  className={`w-20 h-20 rounded-2xl ${currentStep.bg} flex items-center justify-center`}
                >
                  <currentStep.icon
                    className={`w-10 h-10 ${currentStep.color}`}
                  />
                </div>
                <div className="space-y-3 max-w-sm">
                  <h3 className="text-xl font-bold text-foreground">
                    {currentStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentStep.description}
                  </p>
                  {currentStep.highlights && (
                    <div className="flex flex-col gap-2 pt-2">
                      {currentStep.highlights.map((h) => (
                        <div key={h.label} className="flex items-center gap-2 text-sm text-foreground">
                          <div className={`w-7 h-7 rounded-lg ${currentStep.bg} flex items-center justify-center shrink-0`}>
                            <h.icon className={`w-3.5 h-3.5 ${currentStep.color}`} />
                          </div>
                          {h.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div>
            {(step > 0 || showVideo) && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!showVideo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideo(true)}
                className="gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Watch Video
              </Button>
            )}
            {!showVideo && !isLast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
            {!showVideo && (
              <Button size="sm" onClick={handleNext} className="gap-1.5">
                {isLast ? "Get Started" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {showVideo && (
              <Button size="sm" onClick={() => setShowVideo(false)} className="gap-1.5">
                Continue Tour
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
