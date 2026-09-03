import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HeroVideo from "@/components/landing/HeroVideo";
import PainPoints from "@/components/landing/PainPoints";
import SolutionStatement from "@/components/landing/SolutionStatement";
import Outcomes from "@/components/landing/Outcomes";
import WhyPracticare from "@/components/landing/WhyPracticare";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HeroVideo />
        <PainPoints />
        <SolutionStatement />
        <Outcomes />
        <WhyPracticare />
        <Testimonials />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
