"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { NavigationOverlay } from "./navigation-overlay";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 sm:px-14">

        {/* Logo — left */}
        <Link href="/" className="font-display text-xl tracking-wide">
          <span className="text-foreground">Trench</span>
          <span className="text-accent">Vfx</span>
        </Link>

        {/* Hamburger — right */}
        <button
          onClick={open}
          className="group flex flex-col gap-[8px] p-2 transition-opacity hover:opacity-60"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <span className="block h-[1.5px] w-9 bg-foreground transition-all" />
          <span className="block h-[1.5px] w-6 bg-foreground transition-all group-hover:w-9" />
        </button>

      </header>

      <NavigationOverlay isOpen={isOpen} onClose={close} />
    </>
  );
}
