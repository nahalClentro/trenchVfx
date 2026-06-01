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
  // Per-card audio preference. Starts unmuted so the video attempts to play
  // with audio from the first frame — the browser will allow it when
  // allow="autoplay" is set on the iframe and mute=0 is in the URL.
  const [cardMuted, setCardMuted] = useState(false);
  const abs = Math.abs(position);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
  };


  // Play / mute / unmute based on active state, section visibility, and the
  // user's explicit audio preference for this card.
  useEffect(() => {
    if (!iframeLoaded) return;

    const run = () => {
      if (isActive && sectionInView) {
        sendCommand("playVideo");
        if (cardMuted) {
          sendCommand("mute");
        } else {
          sendCommand("unMute");
        }
      } else {
        sendCommand("mute");
        sendCommand("pauseVideo");
      }
    };

    run();
    const ts = [150, 400, 900, 2000].map((d) => setTimeout(run, d));
    return () => ts.forEach(clearTimeout);
  }, [isActive, iframeLoaded, sectionInView, cardMuted]);

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
    const targetY = hasEntered ? (isActive ? -yOffset * 2.3 : abs === 1 ? -yOffset : 0) : 220;
    const targetRotate = hasEntered ? position * rotateStep : 0;
    const targetScale = hasEntered ? (isActive ? 1.08 : 1 - abs * 0.1) : 0.7;
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

  // Mount the iframe only when the card is active AND the section has entered
  // view — avoids loading YouTube in the background before the user reaches
  // this section. On mobile, delay slightly so the GSAP animation finishes
  // before the heavy iframe loads.
  useEffect(() => {
    if (!isActive || !hasEntered) {
      if (!isActive) {
        // Delay unmount so quick back-navigation keeps the iframe alive
        const t = setTimeout(() => {
          setIframeMounted(false);
          setIframeLoaded(false);
        }, 400);
        return () => clearTimeout(t);
      }
      return;
    }
    const isMobile = window.innerWidth < 640;
    const delay = isMobile ? 600 : 80;
    const t = setTimeout(() => setIframeMounted(true), delay);
    return () => clearTimeout(t);
  }, [isActive, hasEntered]);

  // Safety net: if YouTube never fires onLoad (CSP, network blip, extension)
  // reveal the iframe after 6 s anyway so the user isn't stuck on a blank card.
  useEffect(() => {
    if (!iframeMounted || iframeLoaded) return;
    const t = setTimeout(() => setIframeLoaded(true), 6000);
    return () => clearTimeout(t);
  }, [iframeMounted, iframeLoaded]);

  const zIndexVal = isActive ? 20 : 10 - abs;

  // mute=0 so YouTube starts with audio when allow="autoplay" grants permission.
  // The playOrMute effect mutes it programmatically if sectionInView is false or
  // the user has toggled mute on this card.
  const embedSrc = mounted
    ? `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=0&playsinline=1&loop=1&playlist=${item.youtubeId}&controls=0&fs=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`
    : "";

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
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            title={item.title}
            tabIndex={-1}
            loading="eager"
            referrerPolicy="origin"
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-none"
            style={{ pointerEvents: "none" }}
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
