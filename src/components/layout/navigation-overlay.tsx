"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { X } from "lucide-react";

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
] as const;

const socialLinks = [
  { label: "Instagram", href: siteConfig.links.instagram },
  { label: "YouTube", href: "#" },
] as const;

/* ── Easing curves ─────────────────────────────────────── */

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ── Variants ─────────────────────────────────────────── */

const overlay: Variants = {
  initial: { clipPath: "inset(0 0 100% 0)" },
  animate: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.75, ease: EASE_IN_OUT },
  },
  exit: {
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.55, ease: EASE_IN_OUT, delay: 0.05 },
  },
};

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const slideUp: Variants = {
  initial: { y: 80, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
  exit: { y: -30, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, delay: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* ── Component ────────────────────────────────────────── */

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationOverlay({ isOpen, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex overflow-hidden bg-background font-sans"
          variants={overlay}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* ── Left panel ── */}
          <div className="flex flex-1 flex-col justify-between px-8 py-7 sm:px-14 sm:py-9">

            {/* Logo */}
            <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit">
              <Link href="/" onClick={onClose} className="inline-block font-display text-2xl">
                <span className="text-foreground">Trench</span>
                <span className="text-accent">Vfx</span>
              </Link>
            </motion.div>

            {/* Nav items */}
            <motion.nav
              variants={stagger}
              initial="initial"
              animate="animate"
              exit="exit"
              aria-label="Overlay navigation"
            >
              {navItems.map(({ label, href }) => (
                <motion.div key={href} variants={slideUp} className="overflow-hidden">
                  <Link
                    href={href}
                    onClick={onClose}
                    className="group block py-3 sm:py-4"
                  >
                    <span className="block text-[3.2rem] font-light leading-none tracking-tight text-foreground/25 transition-colors duration-300 group-hover:text-foreground sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]">
                      {label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Social footer */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-8"
            >
              {socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
                >
                  {label}
                </a>
              ))}
            </motion.div>
          </div>

          {/* ── Right decorative panel ── */}
          <div className="pointer-events-none hidden select-none items-end justify-end overflow-hidden pb-8 pr-8 lg:flex lg:w-[35%]">
            <motion.span
              className="font-display text-[20vw] leading-none text-foreground/[0.03]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.4, duration: 1, ease: EASE_OUT } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              aria-hidden="true"
            >
              VFX
            </motion.span>
          </div>

          {/* ── Close button ── */}
          <motion.button
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute right-8 top-5 flex size-14 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-colors duration-200 hover:border-accent hover:text-accent sm:right-14"
            aria-label="Close navigation"
          >
            <X size={28} strokeWidth={1.8} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
