"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/constants";

export function HeroSection() {
  const { featuredVideoId } = siteConfig.portfolio;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // Track the user's explicit mute preference in a ref so scroll callbacks
  // can read it without stale closures.
  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = useRef(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  // `mounted` guards the iframe src (which uses window.location.origin) from
  // running during SSR.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep ref in sync so scroll handler always has the current value.
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Stable helper — reads the ref so it never goes stale in effect closures.
  const send = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
  }, []);

  // Apply the user's mute preference to the player once it reports ready,
  // with retries in case the YouTube API needs a moment.
  useEffect(() => {
    if (!iframeLoaded) return;
    const cmd = isMuted ? "mute" : "unMute";
    send(cmd);
    const ts = [300, 800, 2000].map((d) => setTimeout(() => send(cmd), d));
    return () => ts.forEach(clearTimeout);
  }, [isMuted, iframeLoaded, send]);

  // Unmute on the user's first intentional click anywhere on the page.
  // Required by browser autoplay policy — YouTube won't respond to unMute
  // postMessage until there has been a user gesture on the page.
  useEffect(() => {
    const handle = () => {
      if (isMutedRef.current) {
        isMutedRef.current = false;
        setIsMuted(false);
      }
    };
    window.addEventListener("click", handle, { once: true });
    return () => window.removeEventListener("click", handle);
  }, []);

  // Pause + mute when the hero scrolls out of view; resume + restore audio
  // when the user scrolls back. The iframe stays mounted so YouTube never
  // has to reload (unmounting caused a black-screen on every return).
  useEffect(() => {
    if (!mounted) return;
    let scrolledAway = false;
    let retryTimers: ReturnType<typeof setTimeout>[] = [];

    const onScroll = () => {
      const heroGone = window.scrollY > window.innerHeight * 0.6;

      if (heroGone && !scrolledAway) {
        scrolledAway = true;
        send("mute");
        send("pauseVideo");
        // Retry pauseVideo — the first call can arrive before the player API
        // is ready or while the browser is mid-scroll.
        retryTimers = [300, 800, 1500].map((d) =>
          setTimeout(() => send("pauseVideo"), d)
        );
      } else if (!heroGone && scrolledAway) {
        scrolledAway = false;
        retryTimers.forEach(clearTimeout);
        retryTimers = [];
        send("playVideo");
        if (!isMutedRef.current) send("unMute");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      retryTimers.forEach(clearTimeout);
    };
  }, [mounted, send]);

  // Pause + mute if a carousel video takes over.
  useEffect(() => {
    const off = () => { send("pauseVideo"); send("mute"); };
    window.addEventListener("carouselVideoPlaying", off);
    return () => window.removeEventListener("carouselVideoPlaying", off);
  }, [send]);

  const toggleMute = () => {
    const next = !isMuted;
    send(next ? "mute" : "unMute");
    isMutedRef.current = next;
    setIsMuted(next);
  };

  const embedSrc = mounted
    ? `https://www.youtube.com/embed/${featuredVideoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${featuredVideoId}&controls=0&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : "";

  return (
    <section
      id="hero"
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      className="relative w-full min-h-[100dvh] px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10 sm:pb-14 overflow-hidden flex items-center justify-center"
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] pointer-events-none -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255, 234, 0, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-7xl flex flex-col items-center text-center gap-6 sm:gap-8">

        {/* Heading + CTA */}
        <div className="flex flex-col items-center z-10 w-full max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight mb-3 leading-[1.1] select-none"
          >
            <span className="text-white">Trench</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-500">
              Vfx
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-muted-foreground w-full font-light mb-5 leading-relaxed"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
          >
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-yellow-500 text-black text-base sm:text-lg font-bold hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,234,0,0.3)] w-full sm:w-auto cursor-pointer"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              Hire Me on Instagram
            </a>
            <a
              href="#work"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white text-base sm:text-lg font-medium hover:bg-white/10 transition-all w-full sm:w-auto cursor-pointer"
            >
              View Portfolio
            </a>
          </motion.div>
        </div>

        {/* Featured Video */}
        {featuredVideoId && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="w-full mx-auto z-10 flex-shrink-0"
            style={{
              maxWidth: "min(90vw, 96rem, calc((100dvh - 440px) * (16 / 9)))",
            }}
          >
            <div className="relative w-full aspect-video max-h-[35dvh] sm:max-h-[45dvh] md:max-h-[50dvh] rounded-[16px] sm:rounded-[24px] p-[1px] bg-gradient-to-b from-white/[0.06] to-transparent shadow-2xl group mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent via-transparent to-yellow-500 rounded-[18px] sm:rounded-[26px] blur-xl opacity-[0.07] group-hover:opacity-[0.18] transition-opacity duration-500 -z-10" />
              <div
                className="absolute inset-0 rounded-[18px] sm:rounded-[26px] -z-10"
                style={{ boxShadow: "0 8px 80px 10px rgba(255, 214, 0, 0.25)" }}
              />

              <div className="w-full h-full rounded-[12px] sm:rounded-[20px] overflow-hidden bg-card border border-white/5 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Iframe is kept in the DOM for the lifetime of the page.
                    YouTube loads once and stays loaded — no reload / black-screen
                    when the user scrolls away and comes back. */}
                {mounted && (
                  <iframe
                    ref={iframeRef}
                    src={embedSrc}
                    onLoad={() => setIframeLoaded(true)}
                    title="TrenchVfx Featured Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none pointer-events-none"
                  />
                )}
              </div>

              {/* Mute / unmute toggle */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-[background-color,color] duration-200 hover:bg-black/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {isMuted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
