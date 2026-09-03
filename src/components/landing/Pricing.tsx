import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Small",
    price: "$95",
    period: "/fortnight",
    monthlyNote: "Billed monthly at $189",
    description: "Perfect for small practices just getting started.",
    features: [
      "Up to 10 staff members",
      "Task management",
      "Team management",
      "Stock management",
      "Checklist management",
      "5GB storage",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Medium",
    price: "$145",
    period: "/fortnight",
    monthlyNote: "Billed monthly at $289",
    description: "For growing practices that need more power.",
    features: [
      "11-25 staff members",
      "Everything in Small",
      "Advanced reporting",
      "Full compliance suite",
      "SMS & email reminders",
      "25GB storage",
      "Priority support",
      "Reporting & analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Large",
    price: "$195",
    period: "/fortnight",
    monthlyNote: "Billed monthly at $389",
    description: "For larger practices with advanced needs.",
    features: [
      "26-51 staff members",
      "Everything in Medium",
      "Multi-location support",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited storage",
      "24/7 phone support",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your practice. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border flex flex-col ${
                plan.popular
                  ? "border-primary shadow-elevated scale-105"
                  : "border-border shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 gradient-hero rounded-full text-sm font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              {/* Content container */}
              <div className="p-8 flex-1 bg-card rounded-t-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.monthlyNote}</p>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA container */}
              <div className="p-8 pt-6 border-t border-border bg-muted/30 rounded-b-2xl">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
