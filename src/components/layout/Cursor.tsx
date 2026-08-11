"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";

/**
 * A two-part cursor: a hard dot that tracks exactly, and a ring that trails.
 * Mounted only for fine pointers with motion enabled — touch users get their
 * own finger, which is a considerably better pointing device.
 */
export default function Cursor() {
  const finePointer = useFinePointer();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    let visible = false;
    const onMove = (event: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
      }
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const INTERACTIVE = 'a, button, [role="button"], input, textarea, [data-cursor="grow"]';

    const onOver = (event: PointerEvent) => {
      const hit = (event.target as HTMLElement | null)?.closest?.(INTERACTIVE);
      gsap.to(ring, {
        scale: hit ? 1.9 : 1,
        borderColor: hit ? "rgb(74 222 128)" : "rgba(237,234,228,0.35)",
        duration: 0.3,
        ease: "power3.out",
      });
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150]">
      <div
        ref={ringRef}
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border border-bone/35 opacity-0"
      />
      <div
        ref={dotRef}
        className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-signal opacity-0"
      />
    </div>
  );
}
