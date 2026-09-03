import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Sparkles, Heart, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/types/onboarding";
import Confetti from "@/components/onboarding/Confetti";

interface CompletionStepProps {
  data: OnboardingData;
}

export function CompletionStep({ data }: CompletionStepProps) {
  const navigate = useNavigate();

  const priorityCount = (data.priorities || []).length;
  const priorityText = priorityCount === 1 
    ? "1 key area" 
    : priorityCount > 1 
      ? `${priorityCount} key areas` 
      : "your practice";

  return (
    <div className="space-y-8 text-center relative py-8">
      <Confetti />
      
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative inline-block"
      >
        <div className="w-28 h-28 bg-gradient-to-br from-primary via-[hsl(190_65%_40%)] to-[hsl(180_60%_35%)] rounded-3xl flex items-center justify-center mx-auto shadow-elevated relative overflow-hidden">
          {/* Sparkle overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 animate-shimmer" />
          <PartyPopper className="w-14 h-14 text-white relative z-10" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Emotional headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Well done — <span className="text-gradient">you take action!</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {data.practiceName ? (
            <>
              <span className="font-semibold text-primary">{data.practiceName}</span> is all set up and ready to thrive.
            </>
          ) : (
            "Your practice is all set up and ready to thrive."
          )}
        </p>
      </motion.div>

      {/* Outcome preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/30 rounded-2xl p-6 max-w-md mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">What's next?</span>
        </div>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-success text-xs font-bold">1</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Log in to configure your <span className="text-foreground font-medium">departments and roles</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-success text-xs font-bold">2</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Invite your team and start delegating in seconds
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-success text-xs font-bold">3</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Watch the chaos transform into calm
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <Button 
          size="lg" 
          className="w-full max-w-md gradient-hero text-white shadow-elevated hover:shadow-card transition-all py-6 text-lg"
          onClick={() => navigate("/login")}
        >
          Login
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for Practice Managers
        </p>
      </motion.div>
    </div>
  );
}
