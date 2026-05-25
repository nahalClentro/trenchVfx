import { HeroSection } from "@/components/sections/hero-section";
import { SelectedWorkSection } from "@/components/sections/selected-work-section";
import { CinematicWorkSection } from "@/components/sections/cinematic-work-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaSection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <main>
      <div style={{ position: "sticky", top: 0, zIndex: 0 }}>
        <HeroSection />
      </div>
      <SelectedWorkSection id="work" />
      <CinematicWorkSection />
      <TestimonialsSection />
      <FaqSection />
      
      {/* Parallax overlap choreography for the Footer */}
      <div className="relative h-[200vh]">
        <div className="sticky top-0 h-[100dvh] w-full z-0 overflow-hidden">
          <CtaSection />
        </div>
      </div>
      
      {/* This negative margin pulls the layout Footer up so it scrolls over the sticky CTA section exactly as the Selected Work section does to the Hero */}
      <div className="-mb-[100vh]" />
    </main>
  );
}
