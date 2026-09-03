import { useState, useRef, useEffect } from "react";
import { Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/types/onboarding";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

interface EmailVerificationStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function EmailVerificationStep({ data, onChange }: EmailVerificationStepProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(data.mfaVerified || false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo: accept any 6-digit code
    setIsVerified(true);
    onChange({ mfaVerified: true });
    
    toast({
      title: "Email verified!",
      description: "Your email has been successfully verified.",
    });
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResending(false);
    setCountdown(60);
    
    toast({
      title: "Code sent!",
      description: `A new verification code has been sent to ${data.practiceEmail}`,
    });
  };

  if (isVerified) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
          <p className="text-muted-foreground mt-2">
            Your email address has been successfully verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Verify your email</h2>
        <p className="text-muted-foreground mt-2">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium text-foreground mt-1">
          {data.practiceEmail || "your email"}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          disabled={isVerifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full max-w-xs"
          size="lg"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend code"
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        For demo purposes, enter any 6-digit code to proceed.
      </p>
    </div>
  );
}
