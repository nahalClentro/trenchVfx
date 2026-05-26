"use client";

import { siteConfig } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="w-full min-h-[100dvh] bg-black text-white relative overflow-hidden flex items-center justify-center">
      {/* Video background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 scale-105"
        >
          <source src="/videos/cta-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Ambient yellow glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none z-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,234,0,0.6) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
        {/* Eyebrow */}
        <span className="text-white/40 text-xs sm:text-sm uppercase tracking-[0.3em] font-semibold">
          Let's work together
        </span>

        {/* Heading */}
        <h2 className="font-sans font-black uppercase whitespace-nowrap text-[clamp(1.75rem,8vw,6rem)] tracking-tight leading-[0.9] text-white select-none">
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-400">create?</span>
        </h2>

        {/* Sub-line */}
        <p className="text-white/50 text-base sm:text-lg font-light max-w-md leading-relaxed">
          Shoot me a message and let's make something your audience won't forget.
        </p>

        {/* CTA button */}
        <a
          href={siteConfig.links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-yellow-500 text-black font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,234,0,0.35)] cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          Shoot me a message
        </a>
      </div>
    </section>
  );
}
