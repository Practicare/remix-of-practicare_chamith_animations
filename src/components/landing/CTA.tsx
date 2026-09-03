import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const reassurances = [
  "14-day free trial",
  "No credit card required",
  "Setup support included",
  "Cancel anytime",
];

const CTA = () => {
  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl gradient-hero p-12 md:p-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-foreground blur-2xl" />
          </div>

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
Stop chasing. Start running it well.
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Free for 14 days. Your first checklist is live before lunch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link to="/signup">
                  Start your free trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="#pricing">See pricing</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
              {reassurances.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 text-sm text-primary-foreground/80"
                >
                  <Check className="w-4 h-4" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
