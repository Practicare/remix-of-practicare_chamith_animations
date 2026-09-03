import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { APP_BRAND, APP_LOGOS } from "@/config/branding";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailVerificationStep } from "@/components/onboarding/steps/EmailVerificationStep";
import { OnboardingData } from "@/types/onboarding";
import { toast } from "@/hooks/use-toast";
import { SignupStep } from "@/components/onboarding/steps/SignupStep";
import { CountrySelectStep } from "@/components/onboarding/steps/CountrySelectStep";
import { PracticeTypeStep } from "@/components/onboarding/steps/PracticeTypeStep";
import onboardingTeamImg from "@/assets/onboarding-team.jpg";
import { cn } from "@/lib/utils";

const STEPS = ["Country", "Practice Type", "Sign Up", "Verify Email"];

const initialData: OnboardingData = {
  practiceName: "",
  practiceEmail: "",
  practicePhone: "",
  address: "",
  country: null,
  industry: null,
  practiceSize: null,
  priorities: [],
  password: "",
  confirmPassword: "",
  agreedToTerms: false,
  agreedToPrivacy: false,
  accountCreated: false,
  demoCompleted: false,
  selectedPlan: null,
  mfaVerified: false,
  users: [],
};

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!data.country;
      case 2: return !!data.industry;
      case 3: {
        const p = data.password || "";
        return (
          !!data.practiceEmail &&
          p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) &&
          /\d/.test(p) && /[^A-Za-z0-9]/.test(p) &&
          p === data.confirmPassword
        );
      }
      case 4: return data.mfaVerified;
      default: return true;
    }
  };

  const goNext = async () => {
    if (currentStep < STEPS.length) {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(s => s + 1);
      setIsLoading(false);
    } else if (data.mfaVerified) {
      toast({ title: "Account created!", description: "Please log in with your credentials." });
      navigate("/login");
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentStep > 1 && !isLoading) setCurrentStep(s => s - 1);
  };

  const handleSocialLogin = (provider: "google" | "outlook") => {
    toast({
      title: "Coming soon",
      description: `${provider === "google" ? "Google" : "Outlook"} sign-up will be available soon.`,
    });
  };

  const isAutoAdvanceStep = false;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <CountrySelectStep data={data} onChange={updateData} />;
      case 2: return <PracticeTypeStep data={data} onChange={updateData} />;
      case 3: return <SignupStep data={data} onChange={updateData} onSocialLogin={handleSocialLogin} />;
      case 4: return <EmailVerificationStep data={data} onChange={updateData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* ── Left: Immersive imagery panel ─────────────────────── */}
      <aside className="hidden md:flex md:w-5/12 lg:w-1/2 relative items-center justify-center overflow-hidden bg-muted">
        <motion.img
          src={onboardingTeamImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-sm mx-10 mb-10 self-end"
        >
          <div className="bg-background/85 backdrop-blur-xl p-6 rounded-lg shadow-2xl border border-background/60">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-primary font-bold text-[11px] tracking-[0.18em] uppercase">
                Trusted by Practices
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight leading-snug">
              Ready to run your day, your way?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join hundreds of practice teams using {APP_BRAND.name} to simplify tasks, checklists, and compliance.
            </p>
          </div>
        </motion.div>
      </aside>

      {/* ── Right: Wizard content panel ───────────────────────── */}
      <section className="flex-1 flex flex-col bg-background min-h-screen">
        {/* Header */}
        <header className="px-6 md:px-10 py-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={APP_LOGOS.icon} alt={APP_BRAND.name} className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl text-foreground tracking-tight">{APP_BRAND.name}</span>
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground font-medium">
            Already registered? <span className="text-primary font-semibold hover:underline">Sign in</span>
          </Link>
        </header>

        {/* Body */}
        <main className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-20 py-8">
          <div className="w-full max-w-xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer progress */}
        <footer className="px-6 md:px-10 py-6 border-t border-border">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
                Onboarding Progress
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i + 1 <= currentStep ? "bg-primary" : "bg-muted",
                      i + 1 === currentStep ? "w-10" : "w-6"
                    )}
                    layout
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="ghost" size="sm" onClick={handleBack} disabled={isLoading} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              {!isAutoAdvanceStep && (
                <Button onClick={goNext} disabled={!canProceed() || isLoading} className="gap-2 min-w-[120px]">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {currentStep === STEPS.length ? "Complete" : "Continue"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
              {isAutoAdvanceStep && (
                <div className="text-sm font-bold text-foreground">
                  Step <span className="text-primary">{String(currentStep).padStart(2, "0")}</span>
                  <span className="text-muted-foreground"> / {String(STEPS.length).padStart(2, "0")}</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
