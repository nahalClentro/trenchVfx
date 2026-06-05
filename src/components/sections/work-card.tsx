"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { WorkItem } from "@/data/works";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Props {
  item: WorkItem;
  isActive: boolean;
  position: number;
  onClick: () => void;
  cardWidth: number;
  cardHeight: number;
  spacing: number;
  yOffset: number;
  rotateStep: number;
  hasEntered: boolean;
  sectionInView: boolean;
}

export function WorkCard({
  item,
  isActive,
  position,
  onClick,
  cardWidth,
  cardHeight,
  spacing,
  yOffset,
  rotateStep,
  hasEntered,
  sectionInView,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevPosRef = useRef(position);
  const prevHasEnteredRef = useRef(false);
  const isFirstRunRef = useRef(true);
  const isPausedByUs = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [cardMuted, setCardMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    if (typeof window === "undefined") return false;
    return (window as Window & { __userInteracted?: boolean }).__userInteracted || false;
  });
  const [hasBeenActive, setHasBeenActive] = useState(false);
  const abs = Math.abs(position);

  // Mount the active card immediately on load so it is part of the initial page load (bypassing
  // iOS Safari's block on dynamically-inserted iframes), but delay preloading neighbors until after
  // user interaction to respect the concurrent media autoplay budget.
  const isNearActive = abs <= 1;
  const shouldLoadIframe = ready && (
    isActive ||
    (isNearActive && hasInteracted) ||
    hasBeenActive
  );

  // Memoize the iframe src to avoid rendering ref access and prevent reloads
  const embedSrc = useMemo(() => {
    if (typeof window === "undefined") return "";
    return [
      `https://www.youtube.com/embed/${item.youtubeId}`,
      `?autoplay=1`,
      `&mute=1`,
      `&playsinline=1`,
      `&loop=1`,
      `&playlist=${item.youtubeId}`,
      `&controls=0`,
      `&rel=0`,
      `&modestbranding=1`,
      `&enablejsapi=1`,
      `&origin=${encodeURIComponent(window.location.origin)}`,
    ].join("");
  }, [item.youtubeId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setReady(true);
    });
  }, []);

  // Track global user interactions across components/sections
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cleanup = () => {
      window.removeEventListener("click", handleInteraction);
    };

    const handleInteraction = () => {
      if ((window as Window & { __userInteracted?: boolean }).__userInteracted) {
        cleanup();
        return;
      }
      (window as Window & { __userInteracted?: boolean }).__userInteracted = true;
      setHasInteracted(true);
      window.dispatchEvent(new CustomEvent("userInteraction"));
      cleanup();
    };

    const handleCustomEvent = () => {
      setHasInteracted(true);
    };

    window.addEventListener("click", handleInteraction, { capture: true, passive: true });
    window.addEventListener("userInteraction", handleCustomEvent);

    return () => {
      cleanup();
      window.removeEventListener("userInteraction", handleCustomEvent);
    };
  }, []);

  const sendCommand = (func: string, args: string | number | number[] = "") => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    } catch {
      // ignore message sending errors
    }
  };

  // Mark the card as hasBeenActive when it gets active (asynchronously to avoid cascading render lint)
  useEffect(() => {
    if (isActive && sectionInView) {
      Promise.resolve().then(() => {
        setHasBeenActive(true);
      });
    }
  }, [isActive, sectionInView]);

  // Listen to postMessage events from the YouTube player to mark as ready
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;

      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && (data.event === "onReady" || data.id === "onReady")) {
          setPlayerReady(true);
          setIframeLoaded(true);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Safety net fallbacks — only run when the section is in view
  useEffect(() => {
    if (!shouldLoadIframe || !sectionInView || playerReady) return;
    if (iframeLoaded) {
      const timer = setTimeout(() => setPlayerReady(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldLoadIframe, sectionInView, iframeLoaded, playerReady]);

  useEffect(() => {
    if (!shouldLoadIframe || !sectionInView || iframeLoaded) return;
    const timer = setTimeout(() => setIframeLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, [shouldLoadIframe, sectionInView, iframeLoaded]);

  // Synchronize playback and volume state
  useEffect(() => {
    if (!playerReady) return;

    if (isActive && sectionInView) {
      // If user has interacted, we can safely play/unmute programmatically
      if (hasInteracted) {
        if (isPausedByUs.current) {
          sendCommand("playVideo");
          isPausedByUs.current = false;
        }
        if (cardMuted) {
          sendCommand("mute");
        } else {
          sendCommand("unMute");
          sendCommand("setVolume", 100);
        }
      }
      // If hasInteracted is false, we do absolutely nothing to let the native autoplay play muted without interruption.
    } else {
      // Inactive card or section out of view
      if (!isActive) {
        sendCommand("mute");
        sendCommand("pauseVideo");
        isPausedByUs.current = true;
      } else if (hasInteracted) {
        sendCommand("mute");
        sendCommand("pauseVideo");
        isPausedByUs.current = true;
      }
    }
  }, [playerReady, isActive, sectionInView, cardMuted, hasInteracted]);

  // Notify hero to pause once the active carousel video is live and visible
  useEffect(() => {
    if (!isActive || !iframeLoaded || !sectionInView) return;
    window.dispatchEvent(new CustomEvent("carouselVideoPlaying"));
  }, [isActive, iframeLoaded, sectionInView]);

  // ─── GSAP quickTo targets ────────────────────────────────────────────────
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotateTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const scaleTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const opacityTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useIsoLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, "x", { duration: 0.55, ease: "expo.out" });
    yTo.current = gsap.quickTo(el, "y", { duration: 0.55, ease: "expo.out" });
    rotateTo.current = gsap.quickTo(el, "rotation", { duration: 0.55, ease: "expo.out" });
    scaleTo.current = gsap.quickTo(el, "scale", { duration: 0.45, ease: "expo.out" });
    opacityTo.current = gsap.quickTo(el, "opacity", { duration: 0.3, ease: "power2.out" });
  }, []);

  useIsoLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prevPos = prevPosRef.current;
    prevPosRef.current = position;
    const prevHasEntered = prevHasEnteredRef.current;
    prevHasEnteredRef.current = hasEntered;
    const isFirstRun = isFirstRunRef.current;
    isFirstRunRef.current = false;

    const targetX = hasEntered ? position * spacing : 0;
    const targetY = hasEntered ? (abs >= 2 ? 0 : -yOffset) : 220;
    const targetRotate = hasEntered ? position * rotateStep : 0;
    const targetScale = hasEntered ? (abs >= 2 ? 0.7 : 1) : 0.7;
    const targetOpacity = hasEntered ? (abs >= 2 ? 0 : 1) : (isActive ? 1 : 0);

    if (isFirstRun) {
      gsap.set(el, { x: targetX, y: targetY, rotation: targetRotate, scale: targetScale, opacity: targetOpacity, force3D: true });
      return;
    }

    if (!prevHasEntered && hasEntered) {
      gsap.to(el, {
        x: targetX, y: targetY, rotation: targetRotate, scale: targetScale, opacity: targetOpacity,
        duration: 0.8, ease: "power3.out", overwrite: true, force3D: true,
        delay: (2 - abs) * 0.08,
      });
      return;
    }

    if (Math.abs(prevPos - position) > 2) {
      gsap.set(el, { x: targetX, y: targetY, rotation: targetRotate, scale: targetScale, opacity: 0, force3D: true });
      opacityTo.current?.(targetOpacity);
      return;
    }

    xTo.current?.(targetX);
    yTo.current?.(targetY);
    rotateTo.current?.(targetRotate);
    scaleTo.current?.(targetScale);
    opacityTo.current?.(targetOpacity);
  }, [position, isActive, spacing, yOffset, rotateStep, hasEntered, abs]);

  // Safety net: if YouTube never fires onLoad (iOS WebKit, CSP, network blip)
  // mark as loaded after 3 s so the user isn't stuck on a blank card.
  useEffect(() => {
    if (!ready || iframeLoaded) return;
    const t = setTimeout(() => setIframeLoaded(true), 3000);
    return () => clearTimeout(t);
  }, [ready, iframeLoaded]);

  const zIndexVal = isActive ? 20 : 10 - abs;

  return (
    <div
      ref={cardRef}
      onClick={position !== 0 ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        left: "50%",
        bottom: 0,
        marginLeft: -(cardWidth / 2),
        transformOrigin: "bottom center",
        borderRadius: cardWidth > 200 ? 32 : 20,
        overflow: "hidden",
        cursor: position === 0 ? "default" : "pointer",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        backgroundColor: "#000",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        zIndex: zIndexVal,
        opacity: isActive ? 1 : 0,
      }}
    >
      {/* Thumbnail shown while iframe loads */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={`https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
          alt={item.title}
          fill
          className="object-cover"
          sizes={`${cardWidth}px`}
          priority={abs <= 1}
          unoptimized
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.src.includes("hqdefault")) {
              img.src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
            }
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isActive
              ? "transparent"
              : hovered
                ? "rgba(0,0,0,0.35)"
                : "rgba(0,0,0,0.45)",
            transition: "background-color 0.4s ease",
          }}
        />
      </div>

      {shouldLoadIframe && (
        <div
          className="absolute inset-0 z-10 bg-transparent"
          style={{
            opacity: isActive && iframeLoaded ? 1 : 0,
            transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none",
          }}
        >
          <iframe
            ref={iframeRef}
            src={embedSrc}
            onLoad={() => setIframeLoaded(true)}
            title={item.title}
            // "autoplay" must appear first — some WebKit versions gate on order
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            {...{ "playsInline": "" }}
            className="w-full h-full border-none pointer-events-none"
          />
        </div>
      )}

      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Register interaction globally since this is an explicit click gesture
            (window as Window & { __userInteracted?: boolean }).__userInteracted = true;
            setHasInteracted(true);
            window.dispatchEvent(new CustomEvent("userInteraction"));
            setCardMuted((m) => !m);
          }}
          aria-label={cardMuted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-black/80 hover:text-white"
        >
          {cardMuted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}