import { useState, useRef, useEffect } from "react";
import { Shield, Smartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/types/onboarding";
import { toast } from "sonner";

interface MFAVerificationStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function MFAVerificationStep({ data, onChange }: MFAVerificationStepProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (newCode.every(c => c) && newCode.join("").length === 6) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setIsVerifying(true);
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, accept any 6-digit code
    if (verificationCode.length === 6) {
      onChange({ mfaVerified: true });
      toast.success("Verification successful!");
    } else {
      toast.error("Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const handleResend = () => {
    setResendTimer(30);
    toast.success("Verification code sent!");
  };

  if (data.mfaVerified) {
    return (
      <div className="space-y-6 animate-fade-up text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-10 h-10 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verified!</h2>
          <p className="text-muted-foreground mt-2">Your account is now secured with two-factor authentication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Secure your account</h2>
        <p className="text-muted-foreground mt-2">
          We've sent a 6-digit verification code to your email
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <Smartphone className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{data.practiceEmail || "your email"}</span>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
            className={cn(
              "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200",
              "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20",
              digit ? "border-primary bg-primary/5" : "border-border bg-card",
              isVerifying && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Verifying...</span>
        </div>
      )}

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          {resendTimer > 0 ? (
            <span className="text-muted-foreground">Resend in {resendTimer}s</span>
          ) : (
            <Button variant="link" className="p-0 h-auto text-primary" onClick={handleResend}>
              Resend code
            </Button>
          )}
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 mt-6">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Demo:</strong> Enter any 6 digits to continue
        </p>
      </div>
    </div>
  );
}
