"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { registerGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/** Breathing room between the bottom of the fixed nav and the heading. */
const GAP = 28;

/**
 * Where an in-page link should actually land.
 *
 * Scrolling a <section> to the top of the viewport puts its *box* there, and
 * every section carries 80–144px of its own top padding — so the heading you
 * navigated to ends up halfway down the screen. Aim at the heading block
 * instead (SectionHead marks itself with `data-section-anchor`) and subtract
 * the live height of the nav that would otherwise cover it.
 */
function anchorTargetFor(section: Element): { element: HTMLElement; top: number } | null {
  const anchor =
    section.querySelector<HTMLElement>("[data-section-anchor]") ??
    (section as HTMLElement);

  const navHeight =
    document.querySelector("header")?.getBoundingClientRect().height ?? 0;

  const documentTop = anchor.getBoundingClientRect().top + window.scrollY;
  const top = Math.max(0, documentTop - navHeight - GAP);

  return { element: anchor, top };
}

/**
 * Drives page scroll through Lenis and keeps ScrollTrigger in step with it.
 *
 * Lenis is skipped entirely under `prefers-reduced-motion` — hijacking scroll
 * is one of the more unpleasant things you can do to somebody with a
 * vestibular disorder. The anchor handler still runs in that case, so links
 * land in the same place; they just jump instead of gliding.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const { gsap, ScrollTrigger } = registerGsap();

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (reduced) {
      document.documentElement.classList.add("motion-off");
    } else {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Touch devices already have excellent native inertia; overriding it
        // makes the page feel laggy on exactly the hardware that can least
        // afford the extra work.
        syncTouch: false,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const onClick = (event: MouseEvent) => {
      // Let modified clicks (new tab, download, etc.) behave normally.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const section = document.querySelector(id);
      if (!section) return;

      const destination = anchorTargetFor(section);
      if (!destination) return;

      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(destination.top, { lock: true });
      } else {
        window.scrollTo({ top: destination.top, behavior: "auto" });
      }

      // Keep the URL and the focus ring in step with the jump, so keyboard
      // users continue from the heading rather than from the top of the page.
      history.replaceState(null, "", id);
      destination.element.setAttribute("tabindex", "-1");
      destination.element.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);
    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      document.documentElement.classList.remove("motion-off");
    };
  }, [reduced]);

  return null;
}
