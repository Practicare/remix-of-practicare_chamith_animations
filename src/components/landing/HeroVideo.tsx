import { Play } from "lucide-react";
import { useState } from "react";
import { APP_BRAND } from "@/config/branding";

/**
 * Single hero video slot.
 * Drop a hosted MP4 or embed URL into VIDEO_SRC to go live.
 */
const VIDEO_SRC = "";

const HeroVideo = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="pb-24 -mt-4">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-6 gradient-hero opacity-20 blur-3xl rounded-[2rem]" />
          <div className="relative aspect-video rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            {playing && VIDEO_SRC ? (
              <video src={VIDEO_SRC} className="w-full h-full object-cover" controls autoPlay />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play the ${APP_BRAND.name} product tour`}
                className="group w-full h-full flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary/10 via-background to-secondary/40"
              >
                <span className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated transition-transform group-hover:scale-105">
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </span>
                <span className="text-center px-6">
                  <span className="block text-xl md:text-2xl font-bold text-foreground">
                    Watch {APP_BRAND.name} run a practice day
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    2 minutes · from morning checklist to end-of-day sign-off
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroVideo;
