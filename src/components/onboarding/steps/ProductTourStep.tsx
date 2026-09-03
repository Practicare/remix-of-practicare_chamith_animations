import { useState, useEffect } from "react";
import { APP_BRAND } from "@/config/branding";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingData } from "@/types/onboarding";
import { Skeleton } from "@/components/ui/skeleton";

// Import screenshots
import dashboardImg from "@/assets/tour/dashboard.png";
import tasksImg from "@/assets/tour/tasks.png";
import stockImg from "@/assets/tour/stock.png";
import checklistsImg from "@/assets/tour/checklists.png";

interface ProductTourStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
}

interface Highlight {
  x: string;
  y: string;
  label: string;
}

const TOUR_SLIDES = [
  {
    id: "dashboard",
    image: dashboardImg,
    title: "Your Command Centre",
    description: "See everything at a glance — tasks, alerts, and team performance in one beautiful view.",
    highlights: [
      { x: "85%", y: "15%", label: "Today's stats" },
      { x: "35%", y: "55%", label: "Critical alerts" },
    ] as Highlight[],
  },
  {
    id: "tasks",
    image: tasksImg,
    title: "Tasks That Get Done",
    description: "Create, assign, and track tasks by department. Filter by status and never miss a deadline.",
    highlights: [
      { x: "25%", y: "22%", label: "Department filters" },
      { x: "85%", y: "40%", label: "Add new tasks" },
    ] as Highlight[],
  },
  {
    id: "checklists",
    image: checklistsImg,
    title: "Checklists & Audits",
    description: "Daily opening, closing, and compliance checklists with real-time completion tracking.",
    highlights: [
      { x: "85%", y: "28%", label: "Add checklists" },
      { x: "92%", y: "45%", label: "Progress tracking" },
    ] as Highlight[],
  },
  {
    id: "stock",
    image: stockImg,
    title: "Never Run Out Again",
    description: "Track inventory, expiry dates, and get automatic alerts before problems happen.",
    highlights: [
      { x: "35%", y: "28%", label: "Quick filters" },
      { x: "85%", y: "55%", label: "Expiry warnings" },
    ] as Highlight[],
  },
];

export function ProductTourStep({ data, onChange }: ProductTourStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Preload all images
  useEffect(() => {
    TOUR_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(slide.id));
      };
    });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        if (next >= TOUR_SLIDES.length) {
          setIsAutoPlaying(false);
          onChange({ demoCompleted: true });
          return prev;
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, onChange]);

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide < TOUR_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onChange({ demoCompleted: true });
    }
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = TOUR_SLIDES[currentSlide];
  const isImageLoaded = loadedImages.has(slide.id);

  return (
    <div className="space-y-4">
      {/* Header - Fixed position */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Quick Tour</h2>
        <p className="text-muted-foreground mt-1 text-sm">See what's possible with {APP_BRAND.name}</p>
      </div>

      {/* Slide indicators - Fixed position */}
      <div className="flex justify-center gap-2">
        {TOUR_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentSlide 
                ? "w-8 bg-primary" 
                : index < currentSlide 
                  ? "w-2 bg-primary/50" 
                  : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Fixed height reel container */}
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-elevated bg-muted/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Loading skeleton */}
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}

            {/* Screenshot */}
            <img 
              src={slide.image} 
              alt={slide.title}
              className={cn(
                "w-full h-full object-cover object-top transition-opacity duration-300",
                isImageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Highlight points with arrows - only show when image is loaded */}
            {isImageLoaded && slide.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.15, type: "spring" }}
                className="absolute z-10"
                style={{ left: highlight.x, top: highlight.y }}
              >
                {/* Pulsing dot */}
                <div className="relative">
                  <div className="absolute -inset-3 bg-primary/20 rounded-full animate-ping" />
                  <div className="absolute -inset-1.5 bg-primary/30 rounded-full" />
                  <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg relative z-10" />
                </div>
                
                {/* Label with arrow */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 whitespace-nowrap flex items-center gap-1",
                    index % 2 === 0 ? "right-5" : "left-5"
                  )}
                >
                  {index % 2 === 0 && (
                    <>
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded shadow-md">
                        {highlight.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </>
                  )}
                  {index % 2 !== 0 && (
                    <>
                      <ArrowRight className="w-3 h-3 text-primary rotate-180" />
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded shadow-md">
                        {highlight.label}
                      </span>
                    </>
                  )}
                </motion.div>
              </motion.div>
            ))}

            {/* Title and description - positioned at bottom of container */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
              <h3 className="text-lg font-bold text-foreground mb-1">{slide.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{slide.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation - Fixed position below reel */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-full h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-muted-foreground gap-1 h-7 px-2"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span className="text-xs">Playing</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span className="text-xs">Play</span>
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentSlide + 1} / {TOUR_SLIDES.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="rounded-full h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Skip button */}
      <div className="text-center">
        <Button 
          variant="link" 
          size="sm"
          className="text-muted-foreground text-xs h-6"
          onClick={() => {
            setIsAutoPlaying(false);
            onChange({ demoCompleted: true });
          }}
        >
          Skip tour
        </Button>
      </div>
    </div>
  );
}
