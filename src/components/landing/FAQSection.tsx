import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_BRAND } from "@/config/branding";

const faqs = [
  {
    q: "How long does it take to get our practice up and running?",
    a: "Guided onboarding takes you through sites, departments, rooms, staff, stock and documents step by step. Most practices complete setup in under an hour and run their first digital checklist the same day.",
  },
  {
    q: "Will my team actually use it?",
    a: `${APP_BRAND.name} is mobile-first and installs to the home screen like a native app. Staff see one screen with today's checklists, tasks, shifts and memos — no training manual, no logins into five different systems.`,
  },
  {
    q: "Does it work for practices outside Australia?",
    a: "Yes. You select your country and industry during setup, and the platform is used by medical, dental and allied health practices in Australia, the United States and other countries. Compliance categories are configurable to match your local requirements.",
  },
  {
    q: "Can we manage more than one location?",
    a: "Yes. Multiple sites sit under one organisation with instant site switching, per-site data separation and group-level reporting.",
  },
  {
    q: "What happens to our existing checklists and stock lists?",
    a: "You can upload existing documents, invoices and lists, and the AI import turns them into structured checklists, inventory items and compliance records you can review and edit before saving.",
  },
  {
    q: "Who can see what?",
    a: "Access is controlled by a permissions matrix by role, with separate view, edit and create rights for each module. Owners and practice managers decide exactly what each role can access.",
  },
  {
    q: "What does it cost, and is there a trial?",
    a: "Plans are priced by practice size and every plan starts with a 14-day free trial. No credit card is required to start and you can cancel any time.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Questions practice managers ask us
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
