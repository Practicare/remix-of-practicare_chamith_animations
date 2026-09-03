import { motion } from "framer-motion";
import { ArrowRight, Users, Clock, TrendingUp, Globe, Briefcase, Star, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData, COUNTRIES, INDUSTRIES, Country, Industry } from "@/types/onboarding";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WelcomeStepProps {
  onGetStarted: () => void;
  onSocialLogin?: (provider: "google" | "outlook") => void;
  data?: OnboardingData;
  onChange?: (data: Partial<OnboardingData>) => void;
}

export function WelcomeStep({ onGetStarted, onSocialLogin, data, onChange }: WelcomeStepProps) {
  const hasBasicInfo = data?.country && data?.industry;
  const canProceedEmail = hasBasicInfo && data?.practiceEmail;

  const handleSocialLogin = (provider: "google" | "outlook") => {
    if (!hasBasicInfo) {
      toast({
        title: "Missing info",
        description: "Please select your country and industry first.",
        variant: "destructive",
      });
      return;
    }
    if (onSocialLogin) {
      onSocialLogin(provider);
    } else {
      toast({
        title: "Coming soon",
        description: `${provider === "google" ? "Google" : "Outlook"} sign-up will be available soon.`,
      });
    }
  };

  return (
    <div className="text-center space-y-6 py-8">
      {/* 5-Star Rating Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1"
      >
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-warning fill-warning" />
        ))}
      </motion.div>

      {/* Main headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
          Welcome aboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Let's set up your practice to run smoother than ever.
        </p>
      </motion.div>

      {/* Country & Industry Selection */}
      {data && onChange && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left"
          >
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country
              </Label>
              <Select
                value={data.country || ""}
                onValueChange={(value) => onChange({ country: value as Country })}
              >
                <SelectTrigger className="h-12 bg-background">
                  <Globe className="w-4 h-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">
                Industry
              </Label>
              <Select
                value={data.industry || ""}
                onValueChange={(value) => onChange({ industry: value as Industry })}
              >
                <SelectTrigger className="h-12 bg-background">
                  <Briefcase className="w-4 h-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Social Login - shown after country/industry selected */}
          {hasBasicInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto space-y-5"
            >
              <p className="text-sm font-medium text-foreground">Create your account</p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 text-sm font-medium rounded-xl gap-2.5"
                  onClick={() => handleSocialLogin("google")}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 text-sm font-medium rounded-xl gap-2.5"
                  onClick={() => handleSocialLogin("outlook")}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M2 3h9v9H2V3z" fill="#F25022" />
                    <path d="M13 3h9v9h-9V3z" fill="#7FBA00" />
                    <path d="M2 13h9v9H2v-9z" fill="#00A4EF" />
                    <path d="M13 13h9v9h-9v-9z" fill="#FFB900" />
                  </svg>
                  Sign up with Outlook
                </Button>
              </div>

              {/* Or divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-3 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@yourpractice.com"
                    value={data.practiceEmail || ""}
                    onChange={(e) => onChange({ practiceEmail: e.target.value })}
                    className="pl-10 h-12 bg-background"
                  />
                </div>
              </div>

              {/* Continue with email button */}
              <Button
                size="lg"
                onClick={onGetStarted}
                disabled={!canProceedEmail}
                className="w-full gradient-hero text-white shadow-elevated hover:shadow-card transition-all py-6 text-base disabled:opacity-50"
              >
                Continue with Email
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-wrap justify-center gap-6 py-4"
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50">
          <Clock className="w-5 h-5 text-success" />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">4+ hours</p>
            <p className="text-xs text-muted-foreground">saved weekly</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50">
          <Users className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">15k+</p>
            <p className="text-xs text-muted-foreground">team members</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50">
          <TrendingUp className="w-5 h-5 text-warning" />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">87%</p>
            <p className="text-xs text-muted-foreground">less missed tasks</p>
          </div>
        </div>
      </motion.div>

      {/* Trust indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-sm text-muted-foreground"
      >
        ✨ Free 14-day trial • No credit card required
      </motion.p>
    </div>
  );
}
