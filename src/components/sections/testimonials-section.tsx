"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  {
    id: "1",
    logoText: "apex agency",
    logoIcon: "A",
    quote: "The attention to detail and pacing in the edit took our commercial from good to exceptional. They understand rhythm and visual storytelling better than anyone we've worked with.",
    name: "Marcus Thorne",
    role: "Creative Director at Apex Agency",
    avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
    metric: "+145%",
    metricLabel: "Increase\nin audience retention",
  },
  {
    id: "2",
    logoText: "elena rostova",
    logoIcon: "E",
    quote: "A master of color grading and sound design. The final deliverable didn't just look cinematic; it felt incredibly immersive. Absolute professional from rough cut to final master.",
    name: "Elena Rostova",
    role: "Independent Filmmaker",
    avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
    metric: "4.8M",
    metricLabel: "Views\non first week of release",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIndex];

  return (
    <section id="testimonials" className="min-h-[100dvh] w-full relative bg-white text-black border-y border-gray-200 overflow-hidden flex flex-col justify-center py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        {/* ── Heading + Nav Arrows ── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold block mb-3">
              Our Customers
            </span>
            <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight leading-[0.9] text-black">
              How We Help<br />Marketers Win
            </h2>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-14 h-14 rounded-full border border-black/20 flex items-center justify-center text-black/70 hover:bg-black hover:text-white hover:border-black transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-14 h-14 rounded-full border border-black/20 flex items-center justify-center text-black/70 hover:bg-black hover:text-white hover:border-black transition-colors duration-200 cursor-pointer"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* ── Testimonial + Metric Slider ── */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 lg:grid-cols-[1.72fr_1fr] gap-6 items-stretch"
            >
              {/* Left Testimonial Card */}
              <div 
                className="relative rounded-2xl p-8 md:p-10 flex flex-col justify-between"
                style={{
                  background: "#181a17",
                }}
              >
                {/* Brand header */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-black text-sm tracking-tighter">
                    {current.logoIcon.toLowerCase()}
                  </div>
                  <span className="text-white font-bold text-base tracking-normal lowercase">
                    {current.logoText}
                  </span>
                </div>

                {/* Quote details */}
                <div className="mb-10 relative">
                  <p className="text-lg md:text-xl font-medium leading-relaxed text-white/90">
                    <span className="text-accent text-3xl font-serif leading-none align-top mr-1.5 select-none">“</span>
                    {current.quote}
                  </p>
                </div>

                {/* Profile card info */}
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.avatar}
                    alt={current.name}
                    width={52}
                    height={52}
                    className="rounded-full object-cover border-2 border-accent"
                    style={{ width: 52, height: 52 }}
                  />
                  <div>
                    <div className="font-bold text-base text-white tracking-wide font-sans">{current.name}</div>
                    <div className="text-sm text-gray-400">{current.role}</div>
                  </div>
                </div>
              </div>

              {/* Right Metric Card */}
              <div 
                className="relative rounded-2xl p-8 md:p-10 overflow-hidden flex flex-col justify-between border border-gray-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                style={{
                  background: "#f2f4f3",
                }}
              >
                {/* Diagonal stripes gradient pattern matching yellow/amber */}
                <svg className="absolute right-0 top-0 h-full w-[48%] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="yellow-stripes" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffea00" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#ffea00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 50,-10 L 110,50 M 60,-10 L 110,40 M 70,-10 L 110,30 M 80,-10 L 110,20 M 90,-10 L 110,10 M 40,-10 L 110,60 M 30,-10 L 110,70 M 20,-10 L 110,80 M 10,-10 L 110,90 M 0,-10 L 110,100" 
                    stroke="url(#yellow-stripes)" 
                    strokeWidth="3"
                  />
                </svg>

                {/* Metric value */}
                <div className="text-6xl md:text-7xl font-sans font-black tracking-tighter mt-4 relative z-10 text-black leading-none">
                  {current.metric}
                </div>

                {/* Metric label info */}
                <div className="text-sm md:text-base font-semibold text-gray-800 leading-normal uppercase tracking-wider relative z-10 max-w-[85%] whitespace-pre-line">
                  {current.metricLabel}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
