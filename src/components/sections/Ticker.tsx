"use client";

import { useEffect, useRef } from "react";

import { stack } from "@/content/site";
import { registerGsap } from "@/lib/gsap";

function Row({
  items,
  reverse,
  duration,
}: {
  items: readonly string[];
  reverse?: boolean;
  duration: number;
}) {
  return (
    <div className="flex w-full overflow-hidden" aria-hidden="true">
      <div
        className="marquee-track flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-direction": reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {/* Rendered twice: the keyframe translates by exactly -50%, so the
            second copy lands where the first began and the loop is seamless. */}
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
 * Two counter-scrolling rows of the stack. Scroll velocity nudges the playback
 * rate, so flicking the page makes the type surge — a small reward for
 * interacting rather than a decoration that ignores you.
 */
export default function Ticker() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (document.documentElement.classList.contains("motion-off")) return;

    const { ScrollTrigger } = registerGsap();
    const tracks = Array.from(root.querySelectorAll<HTMLElement>(".marquee-track"));

    // Capture each row's resting speed before we start modulating it.
    const baseDuration = tracks.map(
      (track) =>
        Number.parseFloat(
          getComputedStyle(track).getPropertyValue("--marquee-duration")
        ) || 40
    );

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        // Shorter duration = faster. Capped so a trackpad flick surges
        // rather than turning the row into an unreadable blur.
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1600, 4);
        tracks.forEach((track, i) => {
          track.style.animationDuration = `${baseDuration[i] / boost}s`;
        });
      },
    });

    return () => {
      trigger.kill();
      tracks.forEach((track, i) => {
        track.style.animationDuration = `${baseDuration[i]}s`;
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
        <Row items={stack.slice(0, half)} duration={38} />
        <Row items={stack.slice(half)} duration={46} reverse />
      </div>

      {/* The real, readable list for assistive tech and for search engines. */}
      <p className="sr-only">{stack.join(", ")}</p>
    </section>
  );
}
