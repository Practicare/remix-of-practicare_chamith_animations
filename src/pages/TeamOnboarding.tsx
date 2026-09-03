import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  DoorOpen,
  Package,
  UserPlus,
  ClipboardCheck,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import practicareLogoAsset from "@/assets/practicare-logo.png.asset.json";
import { cn } from "@/lib/utils";
import { IndustryContextStep } from "@/components/onboarding/team/IndustryContextStep";
import { FoundationStep } from "@/components/onboarding/team/FoundationStep";
import { LocationsStep } from "@/components/onboarding/team/LocationsStep";
import { StockStep } from "@/components/onboarding/team/StockStep";
import { TeamRolesStep } from "@/components/onboarding/team/TeamRolesStep";
import { ChecklistsStep } from "@/components/onboarding/team/ChecklistsStep";
import { CompletionStep } from "@/components/onboarding/team/CompletionStep";
import {
  loadTeamOnboarding,
  saveTeamOnboarding,
  type TeamOnboardingState,
} from "@/types/onboardingTeam";

const practicareLogo = practicareLogoAsset.url;

const PHASES = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Foundation", icon: Building2 },
  { id: 3, title: "Locations", icon: DoorOpen },
  { id: 4, title: "Stock", icon: Package },
  { id: 5, title: "Team & Roles", icon: UserPlus },
  { id: 6, title: "Checklists", icon: ClipboardCheck },
  { id: 7, title: "Go Live", icon: Rocket },
];

const TOTAL_STEPS = PHASES.length;

function phaseComplete(step: number, state: TeamOnboardingState): boolean {
  switch (step) {
    case 1:
      return Boolean(state.practiceName && state.country && state.industry);
    case 2:
      return Boolean(state.practiceEmail && state.siteName);
    case 3:
      return state.rooms.length > 0;
    case 4:
      return state.stockMethod !== null;
    case 5:
      return state.roles.length > 0;
    case 6:
      return true; // optional — templates can be activated later
    default:
      return true;
  }
}

export default function TeamOnboarding() {
  const navigate = useNavigate();
  const [state, setState] = useState<TeamOnboardingState>(() => loadTeamOnboarding());
  const [step, setStep] = useState(1);

  // Resume at the first phase that isn't complete yet.
  useEffect(() => {
    const firstIncomplete = PHASES.find((p) => !state.completed.includes(p.id));
    if (firstIncomplete) setStep(firstIncomplete.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist progress after every change so users can resume.
  useEffect(() => {
    saveTeamOnboarding(state);
  }, [state]);

  const update = (patch: Partial<TeamOnboardingState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const currentValid = useMemo(() => phaseComplete(step, state), [step, state]);

  const next = () => {
    if (!currentValid) {
      toast.error("Complete this step to continue — or use Skip for now.");
      return;
    }
    setState((prev) => ({
      ...prev,
      completed: prev.completed.includes(step) ? prev.completed : [...prev.completed, step],
    }));
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = () => {
    setState((prev) => ({
      ...prev,
      done: true,
      completed: Array.from(new Set([...prev.completed, ...PHASES.map((p) => p.id)])),
    }));
    toast.success("You're all set! Welcome to Practicare.");
    navigate("/dashboard");
  };

  const progress = (step / TOTAL_STEPS) * 100;
  const isLast = step === TOTAL_STEPS;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <img src={practicareLogo} alt="Practicare" className="h-9" />
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8 md:py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {state.practiceName ? `Setting up ${state.practiceName}` : "Let's set up your practice"}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Seven quick phases — your progress is saved automatically.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            {PHASES.map((p, i) => {
              const active = step === p.id;
              const done = step > p.id || state.completed.includes(p.id);
              const Icon = p.icon;
              return (
                <div key={p.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => setStep(p.id)}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all",
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : active
                            ? "bg-primary/10 border-primary text-primary scale-110"
                            : "bg-background border-border text-muted-foreground"
                      )}
                      aria-label={`Go to step ${p.id}: ${p.title}`}
                    >
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </button>
                    <div
                      className={cn(
                        "mt-1.5 text-[10px] sm:text-xs font-medium text-center hidden sm:block leading-tight",
                        active || done ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {p.title}
                    </div>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-1 -mt-6 transition-colors",
                        step > p.id ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-card border rounded-lg shadow-sm overflow-hidden"
          >
            {step === 1 && <IndustryContextStep state={state} update={update} />}
            {step === 2 && <FoundationStep state={state} update={update} />}
            {step === 3 && <LocationsStep state={state} update={update} />}
            {step === 4 && <StockStep state={state} update={update} />}
            {step === 5 && <TeamRolesStep state={state} update={update} />}
            {step === 6 && <ChecklistsStep state={state} update={update} />}
            {step === 7 && <CompletionStep state={state} onComplete={finish} />}
          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        {!isLast && (
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={step === 1}
              className="h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step < TOTAL_STEPS - 1 && !phaseComplete(step + 1, state) && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Progress saved
                </span>
              )}
              <Button type="button" onClick={next} className="h-10" disabled={!currentValid}>
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
