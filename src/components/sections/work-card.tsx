"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useInView } from "framer-motion";
import type { WorkItem } from "@/data/works";

interface Props {
  item: WorkItem;
  isActive: boolean;
  position: number; // -2 … 0 … 2
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
  const [isPaused, setIsPaused] = useState(false);
  const abs = Math.abs(position);

  // amount:0.5 — card must be ≥50% visible before we consider it "in view"
  const isInView = useInView(cardRef, { amount: 0.5 });

  // Handle GSAP layout animations when card props update
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Cancel any active or delayed/queued animations to prevent race conditions on fast state updates
    gsap.killTweensOf(el);

    const prevPos = prevPosRef.current;
    prevPosRef.current = position;

    const targetX = hasEntered ? position * spacing : 0;
    // Upward-arch baseline mapping (outer cards at y:0, middle cards up, active card up even more)
    const targetY = hasEntered ? (isActive ? -yOffset * 2.3 : (abs === 1 ? -yOffset : 0)) : 220;
    const targetRotate = hasEntered ? position * rotateStep : 0;
    const targetScale = hasEntered ? (isActive ? 1.08 : 1 - abs * 0.1) : 0.7;
    const targetOpacity = hasEntered ? 1 : 0;

    // Detect extreme wrap-around jump (e.g., from -2 to 2 or vice versa)
    const isExtremeJump = Math.abs(prevPos - position) > 2;

    if (isExtremeJump) {
      // Instantly position on the new side and fade in, preventing slide-across clutter
      gsap.set(el, {
        x: targetX,
        y: targetY,
        rotation: targetRotate,
        scale: targetScale,
        opacity: 0,
      });
      gsap.to(el, {
        opacity: targetOpacity,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      // Normal smooth slide and rotation
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
        delay: !hasEntered ? (2 - abs) * 0.08 : 0,
      });
    }
  }, [position, isActive, cardWidth, cardHeight, spacing, yOffset, rotateStep, hasEntered, abs]);

  // Show thumbnail until the active card's video has buffered and settled
  useEffect(() => {
    if (!isActive || !isInView) {
      setVideoFadedIn(false);
      setIsPaused(false);
      return;
    }
    const t = setTimeout(() => setVideoFadedIn(true), 450);
    return () => {
      clearTimeout(t);
      setVideoFadedIn(false);
    };
  }, [isActive, isInView]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    if (isPaused) {
      win.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
    } else {
      win.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
    }
    setIsPaused((p) => !p);
  };

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
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translateZ(0)",
        backgroundColor: "#000",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: isActive
          ? "0 32px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 12px 32px rgba(0,0,0,0.5)",
        zIndex: zIndexVal,
        opacity: 0, // initially hidden for entrance transition
      }}
    >
      {/* ── Thumbnail ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          opacity: videoFadedIn ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
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
        {/* Recessed dark overlay for inactive cards, lighter for active card */}
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundColor: isActive
              ? "transparent"
              : hovered
              ? "rgba(0, 0, 0, 0.35)"
              : "rgba(0, 0, 0, 0.45)",
          }}
        />
      </div>

      {/* ── YouTube Video Player — only mounted when active AND visible ── */}
      {isActive && isInView && (
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
