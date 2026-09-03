import { Star } from "lucide-react";
import { APP_BRAND } from "@/config/branding";

const testimonials = [
  {
    quote: `${APP_BRAND.name} has transformed how we manage our practice. The compliance tracking alone has saved us countless hours.`,
    author: "Dr. Sarah Mitchell",
    role: "Practice Manager, Melbourne Medical Centre",
    avatar: "SM",
  },
  {
    quote: "Finally, a system that understands the unique needs of allied health practices. The compliance tracking is a game-changer.",
    author: "James Chen",
    role: "Owner, PhysioFirst Practices",
    avatar: "JC",
  },
  {
    quote: "We never miss a certification renewal anymore. The automated reminders have made compliance effortless.",
    author: "Emma Thompson",
    role: "HR Manager, Community Health Plus",
    avatar: "ET",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by healthcare professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            See what practice managers and owners are saying about {APP_BRAND.name}.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-elevated transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
