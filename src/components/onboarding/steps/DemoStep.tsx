import { useState } from "react";
import { Play, CheckCircle2, ClipboardList, Users, Calendar, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/types/onboarding";

interface DemoStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

const DEMO_FEATURES = [
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Dashboard Overview",
    description: "Get a bird's eye view of your practice performance, tasks, and team activity.",
    duration: "1 min",
  },
  {
    id: "tasks",
    icon: ClipboardList,
    title: "Task Management",
    description: "Create, assign, and track tasks across your team with our intuitive board view.",
    duration: "2 min",
  },
  {
    id: "team",
    icon: Users,
    title: "Team Management",
    description: "Organize your staff, manage permissions, and track performance.",
    duration: "1 min",
  },
];

export function DemoStep({ data, onChange }: DemoStepProps) {
  const [viewedFeatures, setViewedFeatures] = useState<string[]>([]);
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const handleViewFeature = (featureId: string) => {
    setCurrentDemo(featureId);
    // Simulate demo viewing
    setTimeout(() => {
      if (!viewedFeatures.includes(featureId)) {
        setViewedFeatures([...viewedFeatures, featureId]);
      }
      setCurrentDemo(null);
    }, 2000);
  };

  const progress = (viewedFeatures.length / DEMO_FEATURES.length) * 100;
  const allViewed = viewedFeatures.length === DEMO_FEATURES.length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Quick Platform Tour</h2>
        <p className="text-muted-foreground mt-2">Let's explore the key features of your new workspace</p>
      </div>

      {/* Progress indicator */}
      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Tour Progress</span>
          <span className="text-sm text-muted-foreground">{viewedFeatures.length} of {DEMO_FEATURES.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Feature demos */}
      <div className="space-y-3">
        {DEMO_FEATURES.map((feature, index) => {
          const isViewed = viewedFeatures.includes(feature.id);
          const isPlaying = currentDemo === feature.id;
          const Icon = feature.icon;
          
          return (
            <button
              key={feature.id}
              onClick={() => handleViewFeature(feature.id)}
              disabled={isPlaying}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300",
                isViewed 
                  ? "border-success/50 bg-success/5" 
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                isPlaying && "border-primary animate-pulse"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                isViewed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              )}>
                {isViewed ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {feature.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{feature.description}</p>
              </div>
              {isPlaying ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isViewed ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {allViewed && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center animate-scale-in">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="font-semibold text-foreground">Tour Complete!</p>
          <p className="text-sm text-muted-foreground">You're ready to start using the platform</p>
        </div>
      )}

      <div className="text-center">
        <Button 
          variant="link" 
          className="text-muted-foreground"
          onClick={() => setViewedFeatures(DEMO_FEATURES.map(f => f.id))}
        >
          Skip tour
        </Button>
      </div>
    </div>
  );
}
