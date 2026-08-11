"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { registerGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Drives page scroll through Lenis and keeps ScrollTrigger in step with it.
 *
 * Skipped entirely under `prefers-reduced-motion` — hijacking scroll is one of
 * the more unpleasant things you can do to somebody with a vestibular
 * disorder, and native scrolling is a perfectly good fallback.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();
    if (reduced) {
      document.documentElement.classList.add("motion-off");
      ScrollTrigger.refresh();
      return () => {
        document.documentElement.classList.remove("motion-off");
      };
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have excellent native inertia; overriding it
      // makes the page feel laggy on exactly the hardware that can least
      // afford the extra work.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links need routing through Lenis or they jump instantly.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -24 });
    };
    document.addEventListener("click", onClick);

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
