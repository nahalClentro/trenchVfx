"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useInView } from "framer-motion";
import type { WorkItem } from "@/data/works";

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
  const [hovered, setHovered] = useState(false);
  const [videoFadedIn, setVideoFadedIn] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);
  const abs = Math.abs(position);

  const isInView = useInView(cardRef, { amount: 0.5 });

  // Pre-compile quickTo animators once on mount — much cheaper than gsap.to() on every change
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotateTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const scaleTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const opacityTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    xTo.current = gsap.quickTo(el, "x", { duration: 0.55, ease: "expo.out" });
    yTo.current = gsap.quickTo(el, "y", { duration: 0.55, ease: "expo.out" });
    rotateTo.current = gsap.quickTo(el, "rotation", { duration: 0.55, ease: "expo.out" });
    scaleTo.current = gsap.quickTo(el, "scale", { duration: 0.45, ease: "expo.out" });
    opacityTo.current = gsap.quickTo(el, "opacity", { duration: 0.3, ease: "power2.out" });
  }, []);

  // Drive animations via quickTo — no new tween objects, just value updates
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prevPos = prevPosRef.current;
    prevPosRef.current = position;

    const targetX = hasEntered ? position * spacing : 0;
    const targetY = hasEntered ? (isActive ? -yOffset * 2.3 : abs === 1 ? -yOffset : 0) : 220;
    const targetRotate = hasEntered ? position * rotateStep : 0;
    const targetScale = hasEntered ? (isActive ? 1.08 : 1 - abs * 0.1) : 0.7;
    const targetOpacity = hasEntered ? 1 : 0;

    // Entrance animation: use gsap.to with stagger (quickTo not ready yet on first render)
    if (!hasEntered) {
      gsap.to(el, {
        x: targetX, y: targetY, rotation: targetRotate,
        scale: targetScale, opacity: targetOpacity,
        duration: 0.8, ease: "power3.out",
        overwrite: "auto", force3D: true,
        delay: (2 - abs) * 0.08,
      });
      return;
    }

    // Wrap-around jump: snap position then fade in
    if (Math.abs(prevPos - position) > 2) {
      gsap.set(el, { x: targetX, y: targetY, rotation: targetRotate, scale: targetScale, opacity: 0, force3D: true });
      opacityTo.current?.(targetOpacity);
      return;
    }

    // Normal transition: call pre-compiled animators (no allocation, no jank)
    xTo.current?.(targetX);
    yTo.current?.(targetY);
    rotateTo.current?.(targetRotate);
    scaleTo.current?.(targetScale);
    opacityTo.current?.(targetOpacity);
  }, [position, isActive, spacing, yOffset, rotateStep, hasEntered, abs]);

  // Delay iframe mount by 2 frames so the card slide animation starts in a clean frame
  useEffect(() => {
    if (!isActive || !isInView) {
      setIframeMounted(false);
      setVideoFadedIn(false);
      return;
    }
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIframeMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isActive, isInView]);

  // Fade in video after iframe has had time to buffer
  useEffect(() => {
    if (!iframeMounted) { setVideoFadedIn(false); return; }
    const t = setTimeout(() => setVideoFadedIn(true), 400);
    return () => clearTimeout(t);
  }, [iframeMounted]);

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
        // Static shadow — no reactive repaint on active change
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        zIndex: zIndexVal,
        opacity: 0,
      }}
    >
      {/* ── Thumbnail ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          opacity: videoFadedIn ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Image
          src={`https://img.youtube.com/vi/${item.youtubeId}/0.jpg`}
          alt={item.title}
          fill
          className="object-cover"
          sizes={`${cardWidth}px`}
          priority={abs <= 1}
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

      {/* ── YouTube iframe — mounted 2 frames after card becomes active ── */}
      {iframeMounted && (
        <div className="absolute inset-0 z-0 bg-black">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${item.youtubeId}&controls=0&fs=0&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            title={item.title}
            tabIndex={-1}
            className="w-full h-full border-none"
            style={{ pointerEvents: "none" }}
          />
        </div>
      )}
    </div>
  );
}
