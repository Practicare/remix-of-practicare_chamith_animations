import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { OnboardingData } from "@/types/onboarding";

interface PracticeInfoStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

export function PracticeInfoStep({ data, onChange }: PracticeInfoStepProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Tell us about your practice</h2>
        <p className="text-muted-foreground mt-2">Let's get started with some basic information</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="practiceName" className="text-sm font-medium">
            Practice Name
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="practiceName"
              placeholder="Enter your practice name"
              value={data.practiceName}
              onChange={(e) => onChange({ practiceName: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceEmail" className="text-sm font-medium">
            Practice Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="practiceEmail"
              type="email"
              placeholder="admin@yourpractice.com"
              value={data.practiceEmail}
              onChange={(e) => onChange({ practiceEmail: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practicePhone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="practicePhone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={data.practicePhone}
              onChange={(e) => onChange({ practicePhone: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Practice Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="123 Medical Centre Drive, Suite 100"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
