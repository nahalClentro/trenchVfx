"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { works } from "@/data/works";
import { WorkCard } from "./work-card";
import { ArrowLeft, ArrowRight } from "lucide-react";

const VISIBLE = 1;

interface Props {
  id?: string;
}

export function SelectedWorkSection({ id }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  // Safe client-side screen size detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenType("mobile");
      } else if (window.innerWidth < 1024) {
        setScreenType("tablet");
      } else {
        setScreenType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set up GSAP ScrollTriggers for scroll reveals
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Trigger the card fan-out when the section enters 80% of the viewport height, or immediately if already past on page load/refresh
    const mainTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%",
      onUpdate: (self) => {
        if (self.progress > 0) {
          setHasEntered(true);
          self.kill();
        }
      },
    });

    // Run an immediate check on load/refresh in case the browser scrolled straight to the anchor
    if (mainTrigger.progress > 0) {
      setHasEntered(true);
      mainTrigger.kill();
    }

    // Stagger fade-up the description and heading
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
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Fade-up the navigation buttons
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
          scrollTrigger: {
            trigger: nav,
            start: "top 95%",
            once: true,
          },
        }
      );
    }

    // Clean up to prevent memory leaks in React StrictMode
    return () => {
      mainTrigger.kill();
      if (headingAnim?.scrollTrigger) headingAnim.scrollTrigger.kill();
      headingAnim?.kill();
      if (navAnim?.scrollTrigger) navAnim.scrollTrigger.kill();
      navAnim?.kill();
    };
  }, []);

  // Carousel layout configuration per screen size (Bigger and responsive, exact 9:16 ratio)
  const config = {
    mobile: {
      cardWidth: 180,
      cardHeight: 320,
      spacing: 80,
      yOffset: 30,
      rotateStep: 6,
      carouselHeight: 400,
    },
    tablet: {
      cardWidth: 252,
      cardHeight: 448,
      spacing: 150,
      yOffset: 45,
      rotateStep: 7,
      carouselHeight: 570,
    },
    desktop: {
      cardWidth: 324,
      cardHeight: 576,
      spacing: 230,
      yOffset: 60,
      rotateStep: 8,
      carouselHeight: 740,
    },
  }[screenType];

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + works.length) % works.length),
    []
  );

  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % works.length),
    []
  );

  const handleCardClick = useCallback((pos: number) => {
    if (pos === 0) return;
    setActiveIndex((i) => (i + pos + works.length) % works.length);
  }, []);

  // Get current fanned set of 5 cards
  const cards = Array.from({ length: VISIBLE * 2 + 1 }, (_, i) => {
    const pos = i - VISIBLE;
    const idx = (activeIndex + pos + works.length) % works.length;
    return { pos, item: works[idx] };
  });

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative z-10 w-full overflow-hidden bg-background text-foreground"
      style={{
        minHeight: "100dvh",
        borderRadius: "40px 40px 0 0",
        boxShadow: "0 -24px 48px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* ── Heading Container ── */}
      <div
        ref={headingRef}
        className="relative px-8 pt-24 pb-4 sm:px-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="opacity-0">
          <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold block mb-3">
            Our Work
          </span>
          <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight leading-[0.9] text-white">
            Selected<br />Works
          </h2>
        </div>
        
        {/* Right descriptor text */}
        <p className="text-white/50 text-[14px] sm:text-[15px] leading-relaxed max-w-[320px] font-sans opacity-0 text-left md:text-right">
          A curated sequence of high-impact edits designed for maximum retention and authority building.
        </p>
      </div>

      {/* ── Fan Carousel ── */}
      <div
        className="relative w-full overflow-visible flex items-end justify-center"
        style={{
          height: config.carouselHeight,
          marginTop: "3rem",
        }}
      >
        {cards.map(({ pos, item }) => (
          <WorkCard
            key={item.id}
            item={item}
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

      {/* ── Navigation ── */}
      <div
        ref={navRef}
        className="flex items-center justify-center gap-4 pt-12 pb-24 opacity-0"
      >
        {/* Prev Button */}
        <button
          onClick={prev}
          aria-label="Previous work"
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all duration-300 hover:border-white hover:text-white hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </button>

        {/* Next Button — Highlighted */}
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
