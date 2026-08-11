"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A thin measurement rail down the right edge showing scroll depth as a
 * percentage. Decorative — hidden from assistive tech and from small screens
 * where the space is better spent on content.
 */
export default function ScrollRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      setPercent(Math.round(p * 100));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-6 top-1/2 z-[100] hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
    >
      <span className="numeric text-[0.65rem] text-dim">
        {String(percent).padStart(3, "0")}
      </span>
      <div className="relative h-40 w-px bg-line">
        <div ref={fillRef} className="h-full w-px origin-top scale-y-0 bg-signal" />
        {[0, 25, 50, 75, 100].map((tick) => (
          <span
            key={tick}
            className="absolute -left-1 h-px w-2 bg-line"
            style={{ top: `${tick}%` }}
          />
        ))}
      </div>
      <span className="numeric text-[0.65rem] text-dim">scr</span>
    </div>
  );
}
