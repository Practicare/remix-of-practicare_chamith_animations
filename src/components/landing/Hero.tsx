import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-0 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
            For practice managers &amp; owners worldwide
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up tracking-tight leading-[1.03]"
            style={{ animationDelay: "0.1s" }}
          >
            Run Your Practice Smoothly.{" "}
            <span className="text-gradient">Every Day.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 animate-fade-up leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Tasks, stock, compliance and your team — all in one place.
          </p>

          <p
            className="text-xl font-bold text-primary mb-9 animate-fade-up tracking-tight"
            style={{ animationDelay: "0.3s" }}
          >
            Everything visible. Nothing missed.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Start your free trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" asChild>
              <a href="#outcomes">
                <Play className="w-5 h-5" />
                See how it works
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <p
            className="text-sm text-muted-foreground mt-6 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            No credit card · Set up in an hour · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
