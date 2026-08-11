"use client";

import { useEffect, useRef } from "react";

import { stack } from "@/content/site";
import { registerGsap } from "@/lib/gsap";

function Row({
  items,
  reverse,
  speed,
  fallbackSeconds,
}: {
  items: readonly string[];
  reverse?: boolean;
  /** Pixels per second at rest — used by the JS transform loop. */
  speed: number;
  /** Duration for the CSS keyframe fallback when JS never runs. */
  fallbackSeconds: number;
}) {
  return (
    <div className="flex w-full overflow-hidden" aria-hidden="true">
      <div
        className="marquee-track flex shrink-0 items-center gap-8 sm:gap-12"
        data-speed={speed}
        data-reverse={reverse ? "1" : "0"}
        style={
          {
            "--marquee-duration": `${fallbackSeconds}s`,
            "--marquee-direction": reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {/* Rendered twice: the track is translated by exactly half its width,
            so the second copy lands where the first began. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-8 sm:gap-12">
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="flex shrink-0 items-center gap-8 sm:gap-12">
                <span className="whitespace-nowrap text-[clamp(1.5rem,3.6vw,2.75rem)] font-medium tracking-tight text-bone/90">
                  {item}
                </span>
                <span className="text-signal/70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Two counter-scrolling rows of the stack, driven by transform on the GSAP
 * ticker rather than by a CSS animation.
 *
 * The earlier version reacted to scroll by rewriting `animation-duration`.
 * That visibly stutters: changing the duration of a running CSS animation
 * remaps its current time onto the new timeline, so the track jumps every
 * time the value changes — which, during a scroll, is every frame. Advancing
 * an offset ourselves means speed can change continuously without ever moving
 * the track anywhere it wasn't already going.
 */
export default function Ticker() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Reduced motion keeps the CSS path, which the media query disables.
    if (document.documentElement.classList.contains("motion-off")) return;

    const { gsap, ScrollTrigger } = registerGsap();
    const tracks = Array.from(root.querySelectorAll<HTMLElement>(".marquee-track"));

    /**
     * The distance from the start of the first copy to the start of the
     * second — i.e. one copy's width plus the flex gap. Deliberately not
     * `scrollWidth / 2`, which also counts padding and would leave the loop
     * point a few pixels off, showing a jump on every cycle.
     */
    const cycleWidth = (track: HTMLElement) => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return 0;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    };

    const rows = tracks.map((track) => {
      // Taking over from CSS: kill the keyframe animation so the two can't
      // both write to `transform`.
      track.style.animation = "none";
      return {
        el: track,
        offset: 0,
        speed: Number(track.dataset.speed) || 50,
        direction: track.dataset.reverse === "1" ? 1 : -1,
        cycle: cycleWidth(track),
      };
    });

    const measure = () => {
      rows.forEach((row) => {
        row.cycle = cycleWidth(row.el);
      });
    };
    measure();

    let boost = 1;
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        // Store it; the ticker eases toward it instead of snapping.
        boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1600, 4);
      },
    });

    let current = 1;

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      // Ease toward the target so a flick ramps up and coasts back down.
      current += (boost - current) * Math.min(1, dt * 4);
      boost += (1 - boost) * Math.min(1, dt * 2);

      rows.forEach((row) => {
        if (row.cycle <= 0) return;
        row.offset += row.direction * row.speed * current * dt;
        // Wrapping into exactly one cycle means the second copy is always
        // sitting where the first one just left, so the seam is invisible and
        // the offset never grows without bound.
        row.offset = gsap.utils.wrap(-row.cycle, 0, row.offset);
        row.el.style.transform = `translate3d(${row.offset}px, 0, 0)`;
      });
    };

    gsap.ticker.add(tick);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      trigger.kill();
      rows.forEach((row) => {
        row.el.style.animation = "";
        row.el.style.transform = "";
      });
    };
  }, []);

  const half = Math.ceil(stack.length / 2);

  return (
    <section
      ref={rootRef}
      aria-label="Technologies I work with"
      className="relative select-none border-y border-line bg-surface/40 py-6 sm:py-8"
    >
      {/* Feather the edges so items enter and leave rather than being clipped. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent sm:w-32" />

      <div className="flex flex-col gap-3 sm:gap-5">
        <Row items={stack.slice(0, half)} speed={52} fallbackSeconds={38} />
        <Row items={stack.slice(half)} speed={40} fallbackSeconds={48} reverse />
      </div>

      {/* The real, readable list for assistive tech and for search engines. */}
      <p className="sr-only">{stack.join(", ")}</p>
    </section>
  );
}
