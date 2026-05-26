"use client";

import { useState, useRef, useEffect } from "react";

const testimonial = {
  logoText: "tyson ridenour",
  logoIcon: "T",
  quote: "Working with TrenchVfx was a game-changer for my channel — the edits hit different and the pacing keeps viewers locked in from start to finish.",
  name: "Tyson Ridenour",
  role: "142K Subscribers",
  avatar: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg",
};

const WAVEFORM_BARS = [4,7,5,9,6,11,8,14,10,7,13,9,6,12,8,15,11,7,9,13,6,10,8,12,5,9,7,11,6,8,10,7,9,5,12,8,6,10,7,9];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Auto-play on scroll into view, pause on scroll away
  useEffect(() => {
    const section = sectionRef.current;
    const audio = audioRef.current;
    if (!section || !audio) return;

    let unlockedByUser = false;
    let sectionInView = false;

    const playIfReady = () => {
      if (unlockedByUser && sectionInView && !userPausedRef.current && audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    const onUserGesture = () => {
      if (unlockedByUser) return;
      unlockedByUser = true;
      playIfReady();
    };

    // Any user interaction unlocks audio autoplay
    document.addEventListener("click", onUserGesture, { passive: true });
    document.addEventListener("touchstart", onUserGesture, { passive: true });
    document.addEventListener("keydown", onUserGesture, { passive: true });
    // Wheel/scroll counts as interaction on most browsers
    document.addEventListener("wheel", onUserGesture, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionInView = entry.isIntersecting;
        if (entry.isIntersecting) {
          playIfReady();
        } else {
          if (!audio.paused) {
            audio.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onUserGesture);
      document.removeEventListener("touchstart", onUserGesture);
      document.removeEventListener("keydown", onUserGesture);
      document.removeEventListener("wheel", onUserGesture);
    };
  }, []);

  // Keep a ref in sync with progress so the RAF can read it without stale closure
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // RAF-driven waveform animation — each bar gets its own frequency + phase
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      barRefs.current.forEach((bar, i) => {
        if (bar) bar.style.height = `${(WAVEFORM_BARS[i] / 15) * 100}%`;
      });
      return;
    }

    const tick = (time: number) => {
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const base = (WAVEFORM_BARS[i] / 15) * 100;
        const isActive = (i / WAVEFORM_BARS.length) * 100 <= progressRef.current;
        if (isActive) {
          // Two overlapping sine waves per bar for organic speech texture
          const w1 = Math.sin(time * 0.003 * (1 + (i % 4) * 0.4) + i * 0.7);
          const w2 = Math.sin(time * 0.007 * (1 + (i % 3) * 0.3) + i * 0.4) * 0.4;
          const newH = base + ((w1 + w2) / 1.4) * base * 0.55;
          bar.style.height = `${Math.max(8, Math.min(100, newH))}%`;
        } else {
          bar.style.height = `${base}%`;
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      userPausedRef.current = true;
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      userPausedRef.current = false;
      setIsPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  return (
    <section ref={sectionRef} id="testimonials" className="min-h-[100dvh] w-full relative bg-white text-black border-y border-gray-200 overflow-hidden flex flex-col justify-center py-24">
      <audio ref={audioRef} src="/audio/testimonial-1.ogg" preload="auto" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        {/* ── Heading ── */}
        <div className="mb-12">
          <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold block mb-3">
            Testimonials
          </span>
          <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight leading-[0.9] text-black">
            What My Clients<br />Say About Me
          </h2>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.72fr_1fr] gap-6 items-stretch">

          {/* Left — Quote card */}
          <div
            className="relative rounded-2xl p-8 md:p-10 flex flex-col justify-between"
            style={{ background: "#181a17" }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-black text-sm tracking-tighter">
                {testimonial.logoIcon.toLowerCase()}
              </div>
              <span className="text-white font-bold text-base tracking-normal lowercase">
                {testimonial.logoText}
              </span>
            </div>

            {testimonial.quote && (
              <div className="mb-10">
                <p className="text-lg md:text-xl font-medium leading-relaxed text-white/90">
                  <span className="text-accent text-3xl font-serif leading-none align-top mr-1.5 select-none">"</span>
                  {testimonial.quote}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                width={52}
                height={52}
                className="rounded-full object-cover border-2 border-accent"
                style={{ width: 52, height: 52 }}
              />
              <div>
                <div className="font-bold text-base text-white tracking-wide font-sans">{testimonial.name}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
              </div>
            </div>
          </div>

          {/* Right — Audio player card */}
          <div
            className="relative rounded-2xl p-8 md:p-10 overflow-hidden flex flex-col justify-between border border-gray-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
            style={{ background: "#f2f4f3" }}
          >
            {/* Same diagonal stripe pattern as the original metric card */}
            <svg className="absolute right-0 top-0 h-full w-[48%] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="yellow-stripes-audio" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffea00" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ffea00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 50,-10 L 110,50 M 60,-10 L 110,40 M 70,-10 L 110,30 M 80,-10 L 110,20 M 90,-10 L 110,10 M 40,-10 L 110,60 M 30,-10 L 110,70 M 20,-10 L 110,80 M 10,-10 L 110,90 M 0,-10 L 110,100"
                stroke="url(#yellow-stripes-audio)"
                strokeWidth="3"
              />
            </svg>

            {/* Label */}
            <div className="relative z-10">
              <span className="text-gray-500 text-xs uppercase tracking-[0.2em] font-semibold block mb-1">
                Voice Message
              </span>
              <p className="text-gray-400 text-sm">Hear it directly from the client</p>
            </div>

            {/* Waveform */}
            <div
              className="relative z-10 flex items-end gap-[3px] h-16 cursor-pointer select-none"
              onClick={seek}
            >
              {WAVEFORM_BARS.map((h, i) => {
                const barProgress = (i / WAVEFORM_BARS.length) * 100;
                const active = barProgress <= progress;
                return (
                  <div
                    key={i}
                    ref={(el) => { barRefs.current[i] = el; }}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${(h / 15) * 100}%`,
                      backgroundColor: active ? "#ffea00" : "rgba(0,0,0,0.15)",
                      transition: "background-color 0.1s",
                    }}
                  />
                );
              })}
            </div>

            {/* Controls row */}
            <div className="relative z-10 flex items-center gap-4">
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform flex-shrink-0 shadow-[0_4px_20px_rgba(255,234,0,0.4)]"
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-1 text-sm font-mono text-gray-500">
                <span className="text-gray-800 font-semibold">{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{duration ? formatTime(duration) : "--:--"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
