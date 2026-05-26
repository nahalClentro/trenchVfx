"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinematicWorks } from "@/data/cinematic-works";
import { WorkCard } from "./work-card";
import { ArrowLeft, ArrowRight } from "lucide-react";

const VISIBLE = 1;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function getInitialScreenType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

export function CinematicWorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">(getInitialScreenType);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setScreenType("mobile");
      else if (window.innerWidth < 1024) setScreenType("tablet");
      else setScreenType("desktop");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // See selected-work-section.tsx for why this synchronous on-mount check
  // matters — fixes "videos disappear on refresh" and "cards stay at the
  // pre-entrance size until you navigate."
  useIsoLayoutEffect(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      setHasEntered(true);
    }
  }, []);

  useEffect(() => {
    if (hasEntered) return;
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasEntered]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heading = headingRef.current;
    let headingAnim: gsap.core.Tween | undefined;
    if (heading) {
      headingAnim = gsap.fromTo(
        heading.children,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: heading, start: "top 85%", once: true },
        }
      );
    }

    const nav = navRef.current;
    let navAnim: gsap.core.Tween | undefined;
    if (nav) {
      navAnim = gsap.fromTo(
        nav,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: nav, start: "top 95%", once: true },
        }
      );
    }

    return () => {
      if (headingAnim?.scrollTrigger) headingAnim.scrollTrigger.kill();
      headingAnim?.kill();
      if (navAnim?.scrollTrigger) navAnim.scrollTrigger.kill();
      navAnim?.kill();
    };
  }, []);

  // Carousel layout configuration per screen size (Bigger and responsive, exact 16:9 ratio)
  const config = {
    mobile: {
      cardWidth: 288,
      cardHeight: 162,
      spacing: 160,
      yOffset: 25,
      rotateStep: 5,
      carouselHeight: 300,
    },
    tablet: {
      cardWidth: 448,
      cardHeight: 252,
      spacing: 280,
      yOffset: 40,
      rotateStep: 6,
      carouselHeight: 450,
    },
    desktop: {
      cardWidth: 640,
      cardHeight: 360,
      spacing: 440,
      yOffset: 65,
      rotateStep: 7,
      carouselHeight: 550,
    },
  }[screenType];

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + cinematicWorks.length) % cinematicWorks.length),
    []
  );

  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % cinematicWorks.length),
    []
  );

  const handleCardClick = useCallback((pos: number) => {
    if (pos === 0) return;
    setActiveIndex((i) => (i + pos + cinematicWorks.length) % cinematicWorks.length);
  }, []);

  const cards = Array.from({ length: VISIBLE * 2 + 1 }, (_, i) => {
    const pos = i - VISIBLE;
    const idx = (activeIndex + pos + cinematicWorks.length) % cinematicWorks.length;
    return { pos, item: cinematicWorks[idx] };
  });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full overflow-hidden bg-black text-white"
      style={{
        minHeight: "100dvh",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        ref={headingRef}
        className="relative px-8 pt-24 pb-4 sm:px-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="opacity-0">
          <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold block mb-3">
            Long Form Storytelling
          </span>
          <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight leading-[0.9] text-white">
            Selected<br />Long Form
          </h2>
        </div>
        <p className="text-white/50 text-[14px] sm:text-[15px] leading-relaxed max-w-[320px] font-sans opacity-0 text-left md:text-right">
          A showcase of our most technically demanding and visually striking long-form projects.
        </p>
      </div>

      <div
        className="relative w-full overflow-visible flex items-end justify-center"
        style={{ height: config.carouselHeight, marginTop: "3rem" }}
      >
        {cards.map(({ pos, item }) => (
          <WorkCard
            key={pos}
            item={item as any}
            isActive={pos === 0}
            position={pos}
            onClick={() => handleCardClick(pos)}
            cardWidth={config.cardWidth}
            cardHeight={config.cardHeight}
            spacing={config.spacing}
            yOffset={config.yOffset}
            rotateStep={config.rotateStep}
            hasEntered={hasEntered}
          />
        ))}
      </div>

      <div
        ref={navRef}
        className="flex items-center justify-center gap-4 pt-12 pb-24 opacity-0"
      >
        <button
          onClick={prev}
          aria-label="Previous work"
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all duration-300 hover:border-white hover:text-white hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
        <button
          onClick={next}
          aria-label="Next work"
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/60 text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95"
        >
          <ArrowRight size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
