"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import Magnetic from "@/components/ui/Magnetic";
import { heroLines, identity } from "@/content/site";
import { gsap, splitChars } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks";

const LatticeField = dynamic(() => import("@/components/three/LatticeField"), {
  ssr: false,
});

/** Cheap capability probe — some VMs and locked-down browsers have no WebGL. */
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function Hero({ start }: { start: boolean }) {
  const reduced = useReducedMotion();
  const wideEnough = useMediaQuery("(min-width: 768px)");
  const [webgl, setWebgl] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => setWebgl(hasWebGL()), []);

  // The 3D field is desktop-only: on phones it is the single most expensive
  // thing on the page and the static gradient reads almost identically.
  const showField = wideEnough && !reduced && webgl;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !start || played.current) return;
    played.current = true;

    if (reduced) {
      gsap.set(root.querySelectorAll("[data-hero]"), { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const lines = Array.from(
        root.querySelectorAll<HTMLElement>("[data-hero-line]")
      );
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      lines.forEach((line, i) => {
        const chars = splitChars(line);
        tl.fromTo(
          chars,
          { yPercent: 118 },
          { yPercent: 0, duration: 1.15, stagger: 0.022 },
          i * 0.09
        );
      });

      tl.fromTo(
        root.querySelectorAll("[data-hero]"),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 },
        0.45
      );

      tl.fromTo(
        root.querySelectorAll("[data-hero-rule]"),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, stagger: 0.08, transformOrigin: "left center" },
        0.3
      );
    }, root);

    return () => ctx.revert();
  }, [start, reduced]);

  return (
    <section
      ref={rootRef}
      id="top"
      // The gap is a floor, not a fixed rhythm: justify-between still spreads
      // the three blocks on a tall screen, but on a short or landscape one
      // they can no longer collapse into each other.
      className="grain relative flex min-h-[100svh] flex-col justify-between gap-6 overflow-hidden pb-6 pt-20 sm:gap-8 sm:pb-10 sm:pt-24"
    >
      {/* --- backdrop ---------------------------------------------------- */}
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0">
        {showField ? (
          <LatticeField />
        ) : (
          // Static stand-in: a horizon glow that keeps the same composition
          // as the lattice so the layout doesn't shift between the two.
          <div className="absolute inset-0">
            <div
              className="absolute inset-x-0 bottom-0 h-3/4"
              style={{
                background:
                  "radial-gradient(125% 95% at 50% 115%, rgba(61,126,255,0.42) 0%, rgba(61,126,255,0.16) 30%, rgba(74,222,128,0.09) 52%, transparent 74%)",
              }}
            />
            {/* A hint of the lattice's horizon so the mobile hero keeps the
                same silhouette as the WebGL one. */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 100%, rgba(237,234,228,0.10) 0%, transparent 70%)",
              }}
            />
            <div className="blueprint-grid-fine absolute inset-x-0 bottom-0 h-3/5 opacity-70 [mask-image:linear-gradient(to_top,black,transparent)]" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,transparent_40%,rgba(8,9,11,0.85)_100%)]" />

      {/* --- top annotations --------------------------------------------- */}
      <div className="relative shell flex items-start justify-between gap-6">
        {/* Was "00 / Index" — a label that named nothing. The location is
            information a reader actually wants, and it balances the role. */}
        <p data-hero className="label max-w-[15ch] opacity-0 sm:max-w-none">
          {identity.location}
        </p>
        <p
          data-hero
          className="label max-w-[22ch] text-right opacity-0 sm:max-w-[28ch]"
        >
          {identity.role}
        </p>
      </div>

      {/* --- headline ----------------------------------------------------- */}
      <div className="relative shell">
        <h1 className="display text-[length:var(--text-display)] text-bone">
          {heroLines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div
          data-hero-rule
          className="mt-8 h-px w-full origin-left bg-line sm:mt-10"
        />

        {/* items-center, not items-end: when the tagline wraps to two lines,
            bottom-aligning the buttons drops them well below its optical
            centre and the row reads as misaligned. */}
        <div className="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
          <p
            data-hero
            className="max-w-[46ch] text-[length:var(--text-lede)] leading-[1.45] text-muted opacity-0"
          >
            {identity.tagline.split("—")[0]}
            <span className="editorial text-bone">
              —{identity.tagline.split("—")[1]}
            </span>
          </p>

          <div data-hero className="flex flex-wrap items-center gap-3 opacity-0 sm:gap-4">
            <Magnetic strength={0.28}>
              <a
                href="#work"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-bone px-6 text-[0.9rem] font-medium tracking-[-0.01em] text-void transition-colors hover:bg-signal sm:h-13"
              >
                Selected work
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  ↓
                </span>
              </a>
            </Magnetic>

            <Magnetic strength={0.28}>
              <a
                href="#contact"
                className="group inline-flex h-12 items-center gap-3 rounded-full border border-line px-6 text-[0.9rem] font-medium tracking-[-0.01em] text-bone transition-colors hover:border-signal hover:text-signal sm:h-13"
              >
                Get in touch
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* --- bottom strip -------------------------------------------------- */}
      <div className="relative shell">
        <div data-hero-rule className="h-px w-full origin-left bg-line" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4">
          <p data-hero className="flex items-center gap-2.5 opacity-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="label !text-bone">{identity.availability.label}</span>
            <span className="label hidden sm:inline">
              · {identity.availability.detail}
            </span>
          </p>

          <p data-hero className="label opacity-0">
            Scroll to begin ↓
          </p>
        </div>
      </div>
    </section>
  );
}
