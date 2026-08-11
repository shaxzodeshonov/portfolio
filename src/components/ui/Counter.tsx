"use client";

import { useEffect, useRef } from "react";

import { registerGsap } from "@/lib/gsap";

/**
 * Counts from zero to `value` when scrolled into view. Renders the final value
 * in the markup first so the number is correct without JS and for anyone who
 * has reduced motion turned on.
 */
export default function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Take the precision from the value itself. Assuming one decimal place for
  // any non-integer silently rendered 99.95 as "99.9".
  const places = decimals ?? (String(value).split(".")[1]?.length ?? 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.classList.contains("motion-off")) return;

    const { gsap } = registerGsap();
    const state = { n: 0 };

    const ctx = gsap.context(() => {
      gsap.to(state, {
        n: value,
        duration: 1.9,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = state.n.toLocaleString("en-US", {
            minimumFractionDigits: places,
            maximumFractionDigits: places,
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, places]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });

  return (
    <span className={className}>
      {prefix}
      <span ref={ref}>{formatted}</span>
      {suffix}
    </span>
  );
}
