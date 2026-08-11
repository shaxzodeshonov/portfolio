"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

const MANIFEST = ["shell", "geometry", "shaders", "content"];

/**
 * A short, honest-feeling boot sequence. It is time-based rather than tied to
 * real asset loading — the page is small enough that a genuine progress bar
 * would flash past — so it is capped at 1.6s and skippable with any key.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      onDone();
      gsap.to(root, {
        yPercent: -100,
        duration: reduced ? 0 : 0.9,
        ease: "expo.inOut",
        onComplete: () => setGone(true),
      });
    };

    if (reduced) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    const progress = { value: 0 };
    const tl = gsap.timeline({ onComplete: finish });

    tl.to(progress, {
      value: 100,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(progress.value);
        if (countRef.current) countRef.current.textContent = String(v).padStart(3, "0");
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
      },
    });

    tl.fromTo(
      root.querySelectorAll("[data-boot-line]"),
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, stagger: 0.16, duration: 0.4, ease: "power2.out" },
      0.05
    );

    const skip = () => {
      tl.progress(1);
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.body.style.overflow = "";
    };
  }, [onDone, reduced]);

  useEffect(() => {
    if (gone) document.body.style.overflow = "";
  }, [gone]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[190] flex flex-col justify-between bg-void px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative flex items-start justify-between">
        <span className="label">Booting</span>
        <span className="label">Press any key to skip</span>
      </div>

      <div className="relative mx-auto w-full max-w-3xl">
        <ul className="space-y-1.5 numeric text-[0.75rem] uppercase tracking-[0.1em] text-dim">
          {MANIFEST.map((item) => (
            <li key={item} data-boot-line className="flex items-center gap-3 opacity-0">
              <span className="text-signal">›</span>
              <span>init {item}</span>
              <span className="h-px flex-1 bg-line" />
              <span className="text-muted">ok</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="flex items-end justify-between">
          <span
            ref={countRef}
            className="numeric text-[13vw] leading-none tracking-tighter text-bone sm:text-[8vw]"
          >
            000
          </span>
          <span className="label pb-2">%</span>
        </div>
        <div className="mt-4 h-px w-full bg-line">
          <div
            ref={barRef}
            className="h-px w-full origin-left scale-x-0 bg-signal"
          />
        </div>
      </div>
    </div>
  );
}
