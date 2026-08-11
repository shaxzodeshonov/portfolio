"use client";

import { useEffect, useRef, useState } from "react";

import { identity } from "@/content/site";
import { gsap } from "@/lib/gsap";

export const NAV_LINKS = [
  { href: "#work", label: "Work", index: "03" },
  { href: "#chess", label: "Mate in one", index: "04" },
  { href: "#signal", label: "Signal", index: "05" },
  { href: "#contact", label: "Contact", index: "07" },
];

/** Visitor's local time, updated once a second. Empty until mounted. */
function useLocalClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const clock = useLocalClock();
  const menuRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  // Hide the bar on downward scroll, bring it back on upward — standard, and
  // it buys back vertical space on short mobile viewports.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 240 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape, and lock the page behind the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const el = menuRef.current;
    if (!el || !open) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-menu-item]"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "expo.out", delay: 0.1 }
      );
    }, el);
    return () => ctx.revert();
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] transition-transform duration-500 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="border-b border-line/80 bg-void/70 backdrop-blur-md">
          <div className="shell flex h-14 items-center justify-between gap-6 sm:h-16">
            <a
              href="#top"
              className="group -my-3 flex min-h-11 items-center gap-2.5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-bone"
            >
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  identity.availability.open ? "bg-signal" : "bg-muted"
                }`}
              />
              {identity.shortName}
              <span className="hidden text-dim transition-colors group-hover:text-muted sm:inline">
                / dev
              </span>
            </a>

            <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative -my-3 inline-flex min-h-11 items-center py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-bone"
                >
                  <span className="mr-1.5 text-dim group-hover:text-signal">{link.index}</span>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted lg:inline">
                <span className="text-dim">local</span> {clock || "--:--:--"}
              </span>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
              >
                <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                <span aria-hidden="true" className="relative block h-3 w-6">
                  <span
                    className={`absolute left-0 block h-px w-6 bg-bone transition-transform duration-300 ${
                      open ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-px w-6 bg-bone transition-transform duration-300 ${
                      open ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="fixed inset-0 z-[110] flex flex-col justify-center bg-void px-6 pb-16 pt-24 md:hidden"
        >
          <div className="blueprint-grid pointer-events-none absolute inset-0" />
          <nav aria-label="Sections" className="relative">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="overflow-hidden">
                  <a
                    data-menu-item
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-baseline gap-4 py-2 text-[13vw] text-bone"
                  >
                    <span className="font-mono text-xs tracking-[0.18em] text-dim">
                      {link.index}
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="relative mt-12 border-t border-line pt-6">
            <p className="label">{identity.availability.label}</p>
            <a
              href={`mailto:${identity.email}`}
              className="mt-1 inline-flex min-h-11 items-center font-mono text-sm text-signal"
            >
              {identity.email}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
