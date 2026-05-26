"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { WorkItem } from "@/data/works";

// Avoid useLayoutEffect SSR warning while still running synchronously on the client
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
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevPosRef = useRef(position);
  const prevHasEnteredRef = useRef(false);
  const isFirstRunRef = useRef(true);
  const [hovered, setHovered] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const abs = Math.abs(position);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

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

  // Position / animation driver.
  //
  // We use useLayoutEffect so the very first paint already has the card at
  // its final transform — without this, the card briefly paints at gsap's
  // default scale (1) before snapping to its real target, which combined with
  // refresh-while-on-section produced the "video appears smaller / disappears"
  // bug. Four cases:
  //   1. First run, section NOT yet in view  → snap to hidden state.
  //   2. First run, section ALREADY in view  → snap to final state (no entrance anim).
  //   3. hasEntered transitions false → true → play entrance animation.
  //   4. Position change (carousel switch)   → quickTo to new target.
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
    const targetOpacity = hasEntered ? 1 : 0;

    // Case 1 & 2: first effect run — always snap, never animate
    if (isFirstRun) {
      gsap.set(el, {
        x: targetX,
        y: targetY,
        rotation: targetRotate,
        scale: targetScale,
        opacity: targetOpacity,
        force3D: true,
      });
      return;
    }

    // Case 3: entrance animation (hasEntered just flipped true)
    if (!prevHasEntered && hasEntered) {
      gsap.to(el, {
        x: targetX,
        y: targetY,
        rotation: targetRotate,
        scale: targetScale,
        opacity: targetOpacity,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
        force3D: true,
        delay: (2 - abs) * 0.08,
      });
      return;
    }

    // Wrap-around jump (carousel index crossed the end)
    if (Math.abs(prevPos - position) > 2) {
      gsap.set(el, { x: targetX, y: targetY, rotation: targetRotate, scale: targetScale, opacity: 0, force3D: true });
      opacityTo.current?.(targetOpacity);
      return;
    }

    // Case 4: normal carousel transition
    xTo.current?.(targetX);
    yTo.current?.(targetY);
    rotateTo.current?.(targetRotate);
    scaleTo.current?.(targetScale);
    opacityTo.current?.(targetOpacity);
  }, [position, isActive, spacing, yOffset, rotateStep, hasEntered, abs]);

  // Mount iframe only when card is active. Once mounted, KEEP it mounted as long
  // as the card stays active — never tie this to scroll/viewport state.
  useEffect(() => {
    if (!isActive) {
      setIframeMounted(false);
      setIframeLoaded(false);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIframeMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isActive]);

  // Safety net: if YouTube never fires onLoad (CSP, network blip, blocked
  // by extension), reveal the iframe after 6s anyway.
  useEffect(() => {
    if (!iframeMounted || iframeLoaded) return;
    const t = window.setTimeout(() => setIframeLoaded(true), 6000);
    return () => window.clearTimeout(t);
  }, [iframeMounted, iframeLoaded]);

  const zIndexVal = isActive ? 20 : 10 - abs;

  const embedSrc = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${item.youtubeId}&controls=0&fs=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;

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
        // initial opacity 0 so the card is invisible until the first useLayoutEffect
        // runs and applies the correct gsap state (prevents a flash at gsap defaults)
        opacity: 0,
      }}
    >
      {/* Thumbnail — permanent fallback layer (z-0). */}
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

      {/* YouTube iframe layered ON TOP of the thumbnail. */}
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
            allow="autoplay; encrypted-media; picture-in-picture"
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
    </div>
  );
}
