import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Mail, Check, X, FileText, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/types/onboarding";
import { cn } from "@/lib/utils";
import { LegalAgreementDialog } from "../LegalAgreementDialog";

interface AccountSetupStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function AccountSetupStep({ data, onChange }: AccountSetupStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const password = data.password || "";
  const confirmPassword = data.confirmPassword || "";
  const agreedToTerms = data.agreedToTerms || false;
  const agreedToPrivacy = data.agreedToPrivacy || false;

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const requirements = [
    { met: hasMinLength, label: "At least 8 characters" },
    { met: hasUppercase, label: "One uppercase letter" },
    { met: hasNumber, label: "One number" },
    { met: hasSpecialChar, label: "One special character (!@#$%^&*)" },
  ];

  const allPasswordRequirementsMet = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;
  const allRequirementsMet = allPasswordRequirementsMet && agreedToTerms && agreedToPrivacy;

  // Update accountCreated when all requirements are met
  if (allRequirementsMet && !data.accountCreated) {
    onChange({ accountCreated: true });
  } else if (!allRequirementsMet && data.accountCreated) {
    onChange({ accountCreated: false });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Lock className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Secure your account</h2>
        <p className="text-muted-foreground mt-2">Create a password to protect your practice data</p>
      </div>

      {/* Email display */}
      <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
        <Mail className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Logging in as</p>
          <p className="font-medium text-foreground">{data.practiceEmail || "your-email@practice.com"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Create Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a secure password"
              value={password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="pl-10 pr-10 h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center",
                req.met ? "bg-success" : "bg-muted"
              )}>
                {req.met ? (
                  <Check className="w-3 h-3 text-success-foreground" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-sm",
                req.met ? "text-success" : "text-muted-foreground"
              )}>
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              className={cn(
                "pl-10 pr-10 h-12",
                confirmPassword.length > 0 && (passwordsMatch ? "border-success" : "border-destructive")
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords don't match</p>
          )}
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="space-y-3 pt-2">
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
            agreedToTerms 
              ? "border-success/50 bg-success/5" 
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
          onClick={() => !agreedToTerms && setTermsDialogOpen(true)}
        >
          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
            agreedToTerms ? "bg-success border-success" : "border-muted-foreground/30"
          )}>
            {agreedToTerms && <Check className="w-3 h-3 text-success-foreground" />}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm">Terms and Conditions</span>
          </div>
          {agreedToTerms ? (
            <span className="text-xs text-success font-medium">Accepted</span>
          ) : (
            <span className="text-xs text-muted-foreground">Tap to read</span>
          )}
        </div>

        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
            agreedToPrivacy 
              ? "border-success/50 bg-success/5" 
              : "border-border hover:border-primary/30 hover:bg-muted/30"
          )}
          onClick={() => !agreedToPrivacy && setPrivacyDialogOpen(true)}
        >
          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
            agreedToPrivacy ? "bg-success border-success" : "border-muted-foreground/30"
          )}>
            {agreedToPrivacy && <Check className="w-3 h-3 text-success-foreground" />}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm">Privacy Policy</span>
          </div>
          {agreedToPrivacy ? (
            <span className="text-xs text-success font-medium">Accepted</span>
          ) : (
            <span className="text-xs text-muted-foreground">Tap to read</span>
          )}
        </div>
      </div>

      {/* Legal Agreement Dialogs */}
      <LegalAgreementDialog
        open={termsDialogOpen}
        onOpenChange={setTermsDialogOpen}
        type="terms"
        onAccept={() => onChange({ agreedToTerms: true })}
      />
      <LegalAgreementDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
        type="privacy"
        onAccept={() => onChange({ agreedToPrivacy: true })}
      />

      {allRequirementsMet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-success/10 border border-success/30 rounded-xl p-4 text-center"
        >
          <Check className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-sm text-success font-medium">
            Perfect! Your account is ready to be created.
          </p>
        </motion.div>
      )}
    </div>
  );
}
