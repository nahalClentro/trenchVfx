"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/constants";
import { VolumeX, Volume2 } from "lucide-react";

export function VideoBackground() {
  const { featuredVideoId } = siteConfig.portfolio;
  const [muted, setMuted] = useState(true);

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

  const src = `https://www.youtube.com/embed/${featuredVideoId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&loop=1&playlist=${featuredVideoId}&controls=0&fs=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&showinfo=0&cc_load_policy=0`;

  return (
    <div aria-hidden="false" className="absolute inset-0 overflow-hidden">
      {/* iframe key forces remount (and thus src reload) when mute toggles */}
      <iframe
        key={String(muted)}
        src={src}
        allow="autoplay; encrypted-media"
        title=""
        tabIndex={-1}
        className="absolute border-none"
        style={{
          top: "50%",
          left: "50%",
          width: "max(100%, calc(100vh * 16 / 9))",
          height: "max(100%, calc(100vw * 9 / 16))",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Overlay prevents YouTube hover controls */}
      <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }} />

      {/* Mute / unmute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-6 right-8 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:text-white sm:right-14"
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
