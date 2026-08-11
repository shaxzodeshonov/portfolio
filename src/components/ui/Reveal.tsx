"use client";

import {
  useEffect,
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";

import { registerGsap } from "@/lib/gsap";

/**
 * The subset of props Reveal forwards to whatever tag it renders. Casting to a
 * concrete component type is what stops TypeScript from intersecting every
 * intrinsic element's props down to `never`.
 */
type ForwardedProps = {
  ref?: Ref<HTMLElement>;
  id?: string;
  className?: string;
  children?: ReactNode;
  "data-reveal"?: string | boolean;
};

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay after the trigger fires. */
  delay?: number;
  /** Stagger applied to direct children instead of the wrapper itself. */
  stagger?: number;
  y?: number;
  id?: string;
};

/**
 * Scroll-triggered entrance. The "hidden" state lives in CSS (`[data-reveal]`
 * sets opacity: 0) so there is no flash of visible-then-hidden content, and a
 * `.motion-off` class on <html> forces everything visible for reduced motion.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  stagger,
  y = 28,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { gsap, ScrollTrigger } = registerGsap();

    if (document.documentElement.classList.contains("motion-off")) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const targets = stagger ? Array.from(el.children) : [el];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          stagger: stagger ?? 0,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
      if (stagger) gsap.set(el, { opacity: 1 });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [delay, stagger, y]);

  const Component = Tag as ComponentType<ForwardedProps>;

  return (
    <Component ref={ref} id={id} data-reveal className={className}>
      {children}
    </Component>
  );
}
