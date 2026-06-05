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
  const [ready, setReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [cardMuted, setCardMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Track whether this card has ever been the active card while its section
  // was in view. Once true, we keep the iframe mounted even when the card
  // slides away so there's no reload flicker when the user navigates back.
  const [hasBeenActive, setHasBeenActive] = useState(false);
  const abs = Math.abs(position);

  // Load the YouTube iframe immediately on mount for the active card (or any
  // card that was previously active). This is critical because iOS Safari only
  // allows autoplay=1 on iframes that are part of the initial page load —
  // dynamically-inserted iframes (e.g. when sectionInView becomes true) get
  // their autoplay silently blocked and show the red YouTube play button.
  //
  // hasBeenActive keeps the iframe mounted after the card slides away so
  // there's no reload flicker when the user navigates back.
  const shouldLoadIframe = ready && (isActive || hasBeenActive);

  // Compute embedSrc once on the client — stored in a ref so it never
  // triggers a re-render and the iframe src never mutates after mount.
  const embedSrc = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    embedSrc.current = [
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
    setReady(true);

    // Mark this card as "has been active" if it starts as the active card
    // (i.e. position 0 on initial mount)
    // Note: sectionInView may not be true yet, so we handle that in a
    // separate effect below.

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once — youtubeId is stable per card instance

  const sendCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
  };

  // When this card becomes active while its section is in view, mark it so
  // the iframe stays mounted even after it slides away.
  useEffect(() => {
    if (isActive && sectionInView) {
      setHasBeenActive(true);
    }
  }, [isActive, sectionInView]);

  // Listen for YouTube's postMessage events (onReady / onStateChange).
  // On iOS, the autoplay=1 URL param may succeed on initial load (since the
  // iframe is part of the page render), but the player might pause itself
  // because it's off-screen. When the section scrolls into view, we need to
  // send playVideo at the exact moment the player is ready.
  useEffect(() => {
    if (!shouldLoadIframe || !isActive) return;

    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        // YouTube sends {"event":"onReady"} when the player API is ready
        // and {"event":"onStateChange","info":-1} when unstarted
        if (
          data.event === "onReady" ||
          (data.event === "onStateChange" && data.info === -1)
        ) {
          if (sectionInView) {
            sendCommand("playVideo");
            sendCommand("mute");
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [shouldLoadIframe, isActive, sectionInView]);

  // Sync play/pause/mute with the YouTube Player API.
  // Since only the active card has an iframe loaded, we can safely always
  // send playVideo — there's no autoplay budget conflict.
  useEffect(() => {
    if (!iframeLoaded) return;

    const sync = () => {
      if (isActive && sectionInView) {
        sendCommand("playVideo");
        if (cardMuted) {
          sendCommand("mute");
        } else if (hasInteracted) {
          sendCommand("unMute");
        } else {
          sendCommand("mute");
        }
      } else {
        sendCommand("mute");
        sendCommand("pauseVideo");
      }
    };

    sync();
    const t1 = setTimeout(sync, 300);
    const t2 = setTimeout(sync, 800);
    const t3 = setTimeout(sync, 1500);
    const t4 = setTimeout(sync, 3000);
    const t5 = setTimeout(sync, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [iframeLoaded, cardMuted, hasInteracted, isActive, sectionInView]);

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
            src={embedSrc.current}
            onLoad={() => setIframeLoaded(true)}
            title={item.title}
            // "autoplay" must appear first — some WebKit versions gate on order
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            {...{ "playsinline": "" }}
            className="w-full h-full border-none pointer-events-none"
          />
        </div>
      )}

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