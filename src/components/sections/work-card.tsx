"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
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
  const [hovered, setHovered] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cardMuted, setCardMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const abs = Math.abs(position);

  useEffect(() => {
    setMounted(true);
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

    // Set up global interaction listener to unlock audio/autoplay restrictions on mobile
    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const sendCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
  };


  // Synchronize play/pause and mute/unmute states with the YouTube Player API.
  // We play the video and manage audio only when active and the section is in view.
  useEffect(() => {
    if (!iframeLoaded) return;

    const syncPlayer = () => {
      if (isActive && sectionInView) {
        sendCommand("playVideo");
        if (cardMuted) {
          sendCommand("mute");
        } else {
          // On mobile, keep it muted until the user has interacted with the document
          const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
          if (isMobile && !hasInteracted) {
            sendCommand("mute");
          } else {
            sendCommand("unMute");
          }
        }
      } else {
        sendCommand("mute");
        sendCommand("pauseVideo");
      }
    };

    syncPlayer();
    const ts = [150, 500, 1000].map((d) => setTimeout(syncPlayer, d));
    return () => ts.forEach(clearTimeout);
  }, [iframeLoaded, cardMuted, hasInteracted, isActive, sectionInView]);

  // Notify the hero to stop as soon as the carousel's active video is live
  // and the section is actually in view (not just loaded in the background).
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
    // Cards at abs≥2 are off-screen buffer slots — keep invisible so they
    // don't bleed into view on smaller screens.
    const targetOpacity = hasEntered ? (abs >= 2 ? 0 : 1) : 0;

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

  // Mount the iframe when the card is active.
  // Keeping the active card's iframe mounted (similar to the hero section) prevents
  // it from reloading when scrolling in/out of view, which bypasses mobile autoplay blocks.
  useEffect(() => {
    if (isActive) {
      setIframeMounted(true);
    } else {
      // Delay unmount of inactive card so quick back-navigation keeps the iframe alive
      const t = setTimeout(() => {
        setIframeMounted(false);
        setIframeLoaded(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // Pre-build the exact YouTube embed URL matching the working hero section parameters.
  const youtubeUrl = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${item.youtubeId}&controls=0&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`;

  // On touch/mobile devices, we start with an empty src to prevent the browser from blocking autoplay off-screen.
  // On desktop, we load it immediately on mount.
  const embedSrc = (mounted && !isMobile) ? youtubeUrl : "";

  // On mobile/touch devices, we listen to the very first user interaction (touchstart or click)
  // and synchronously set the iframe's src directly on the DOM element. This preserves the user gesture
  // context so iOS Safari and Android Chrome allow the media to load and autoplay.
  useEffect(() => {
    if (!iframeMounted || !isMobile) return;

    const loadIframe = () => {
      const iframe = iframeRef.current;
      if (iframe && !iframe.src) {
        iframe.src = youtubeUrl;
      }
    };

    window.addEventListener("touchstart", loadIframe, { passive: true });
    window.addEventListener("click", loadIframe, { passive: true });

    return () => {
      window.removeEventListener("touchstart", loadIframe);
      window.removeEventListener("click", loadIframe);
    };
  }, [iframeMounted, isMobile, youtubeUrl]);

  // Safety net: if YouTube never fires onLoad (CSP, network blip, extension)
  // reveal the iframe after 6 s anyway so the user isn't stuck on a blank card.
  useEffect(() => {
    if (!iframeMounted || iframeLoaded) return;
    const t = setTimeout(() => setIframeLoaded(true), 6000);
    return () => clearTimeout(t);
  }, [iframeMounted, iframeLoaded]);

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
        opacity: 0,
      }}
    >
      {/* Thumbnail fallback shown while the iframe loads */}
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

      {/* YouTube iframe — fades in over thumbnail once loaded */}
      {iframeMounted && (
        <div
          className="absolute inset-0 z-10 bg-transparent"
          style={{
            opacity: iframeLoaded ? 1 : 0,
            transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "none",
          }}
        >
          <iframe
            ref={iframeRef}
            src={embedSrc}
            onLoad={() => setIframeLoaded(true)}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-none pointer-events-none"
          />
        </div>
      )}

      {/* Audio toggle — shown only on the active card so the user always has
          a reliable way to control sound regardless of browser autoplay policy */}
      {isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
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
