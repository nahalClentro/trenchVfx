"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/constants";
import { VolumeX, Volume2 } from "lucide-react";

export function VideoBackground() {
  const { featuredVideoId } = siteConfig.portfolio;
  const [muted, setMuted] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  // Safety net for the hero: if onLoad never fires, reveal anyway after 6s
  useEffect(() => {
    if (iframeLoaded) return;
    const t = window.setTimeout(() => setIframeLoaded(true), 6000);
    return () => window.clearTimeout(t);
  }, [iframeLoaded, muted]);

  if (!featuredVideoId) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 60% 40%, #1a1a1a 0%, #000 70%)",
        }}
      />
    );
  }

  const src = `https://www.youtube.com/embed/${featuredVideoId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&loop=1&playlist=${featuredVideoId}&controls=0&fs=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&showinfo=0&cc_load_policy=0${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;

  return (
    <div aria-hidden="false" className="absolute inset-0 overflow-hidden bg-black">
      {/* Thumbnail fallback — always behind the iframe so a failed/slow embed
          never leaves the hero as a black void. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(https://img.youtube.com/vi/${featuredVideoId}/maxresdefault.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* iframe key forces remount (and thus src reload) when mute toggles */}
      <iframe
        key={String(muted)}
        src={src}
        allow="autoplay; encrypted-media; picture-in-picture"
        title=""
        tabIndex={-1}
        loading="eager"
        referrerPolicy="origin"
        onLoad={() => setIframeLoaded(true)}
        className="absolute border-none z-10"
        style={{
          top: "50%",
          left: "50%",
          width: "max(100%, calc(100vh * 16 / 9))",
          height: "max(100%, calc(100vw * 9 / 16))",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          opacity: iframeLoaded ? 1 : 0,
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Overlay prevents YouTube hover controls */}
      <div className="absolute inset-0 z-20" style={{ pointerEvents: "none" }} />

      {/* Mute / unmute toggle */}
      <button
        onClick={() => {
          setIframeLoaded(false);
          setMuted((m) => !m);
        }}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-6 right-8 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:text-white sm:right-14"
        style={{ pointerEvents: "auto" }}
      >
        {muted ? (
          <VolumeX size={16} strokeWidth={1.8} />
        ) : (
          <Volume2 size={16} strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}
