"use client";

import { siteConfig } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="w-full min-h-[100dvh] bg-black text-white relative overflow-hidden flex items-center justify-center">
      {/* Cinematic loop video background using local MP4 source */}
      {/* Using z-0 instead of -z-10 to prevent the video from being rendered behind the parent's bg-black */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80 scale-105"
        >
          <source 
            src="/videos/cta-video.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Centered CTA content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8 text-white leading-tight">
          Your path to viral content starts now
        </h2>
        
        <div>
          <a 
            href={siteConfig.links.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-md bg-accent text-black font-semibold text-base hover:bg-yellow-400 transition-colors shadow-lg cursor-pointer"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
