"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { cinematicWorks } from "@/data/cinematic-works";

export function CinematicWorkSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Track vertical scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Map vertical scroll (0 to 1) to horizontal movement.
  // We use calc to ensure the scrolling perfectly stops when the end of the container reaches the end of the screen.
  const x = useTransform(scrollYProgress, [0, 1], ["calc(0% + 0vw)", "calc(-100% + 100vw)"]);

  const isInView = useInView(targetRef, { amount: 0.05 });

  // Mute all videos when scrolling away
  useEffect(() => {
    if (!isInView) {
      const iframes = targetRef.current?.querySelectorAll("iframe");
      iframes?.forEach((iframe) => {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });
    }
  }, [isInView]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black text-white">
      {/* ── Sticky Container ── */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* ── Horizontally Scrolling Track ── */}
        <motion.div 
          style={{ x }} 
          className="flex gap-8 md:gap-16 px-[10vw] w-max"
        >
          {cinematicWorks.map((work) => (
            <div
              key={work.id}
              className="relative shrink-0 w-[85vw] sm:w-[600px] md:w-[700px] aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.02]"
            >
              <iframe
                src={`https://www.youtube.com/embed/${work.youtubeId}?autoplay=0&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1`}
                title={work.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-none"
              />
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
