import { useState } from "react";
import { APP_BRAND } from "@/config/branding";
import { Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "@/types/onboarding";

interface SignupStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onSocialLogin: (provider: "google" | "outlook") => void;
}

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string) {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  if (passed <= 1) return { label: "Weak", color: "bg-destructive", percent: 20 };
  if (passed <= 2) return { label: "Weak", color: "bg-destructive", percent: 40 };
  if (passed <= 3) return { label: "Fair", color: "bg-warning", percent: 60 };
  if (passed <= 4) return { label: "Good", color: "bg-primary", percent: 80 };
  return { label: "Strong", color: "bg-success", percent: 100 };
}

export function SignupStep({ data, onChange, onSocialLogin }: SignupStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = data.password || "";
  const confirmPassword = data.confirmPassword || "";
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const strength = getStrength(password);
  const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground">
          Get started with {APP_BRAND.name} in seconds
        </p>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 text-sm font-medium rounded-xl gap-2"
          onClick={() => onSocialLogin("google")}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 text-sm font-medium rounded-xl gap-2"
          onClick={() => onSocialLogin("outlook")}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path d="M2 3h9v9H2V3z" fill="#F25022" />
            <path d="M13 3h9v9h-9V3z" fill="#7FBA00" />
            <path d="M2 13h9v9H2v-9z" fill="#00A4EF" />
            <path d="M13 13h9v9h-9v-9z" fill="#FFB900" />
          </svg>
          Outlook
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
        </div>
      </div>

      {/* Email & Password form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@yourpractice.com"
              value={data.practiceEmail || ""}
              onChange={(e) => onChange({ practiceEmail: e.target.value })}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="pl-10 pr-10 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ml-3 ${
                  strength.percent <= 40 ? "text-destructive" : 
                  strength.percent <= 60 ? "text-warning" : 
                  strength.percent <= 80 ? "text-primary" : "text-success"
                }`}>
                  {strength.label}
                </span>
              </div>

              {/* Requirements checklist */}
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li key={rule.label} className="flex items-center gap-2 text-xs">
                      {passed ? (
                        <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={passed ? "text-success" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              className={`pl-10 pr-10 h-11 ${passwordMismatch ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordMismatch && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
