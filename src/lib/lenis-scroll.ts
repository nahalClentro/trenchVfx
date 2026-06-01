import type Lenis from "lenis";

let instance: Lenis | null = null;

export function registerLenis(l: Lenis) {
  instance = l;
}

export function lenisScrollTo(target: string | number | HTMLElement) {
  if (instance) {
    instance.scrollTo(target as any, { duration: 2 });
  } else {
    // Fallback if Lenis hasn't initialised yet
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else if (typeof target === "string") {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }
}
