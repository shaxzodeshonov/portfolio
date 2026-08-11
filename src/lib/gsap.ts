"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registers GSAP plugins exactly once, on the client. Importing ScrollTrigger
 * at module scope in an app-router file is safe, but registering repeatedly
 * across Fast Refresh is not — hence the guard.
 */
export function registerGsap() {
  if (registered || typeof window === "undefined") return { gsap, ScrollTrigger };
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

/**
 * Splits an element's text into per-character spans wrapped in per-word spans,
 * so words still wrap correctly and screen readers still read the original
 * string (the source text is preserved in an aria-label by the caller).
 *
 * Hand-rolled rather than pulled from a plugin: it is fifteen lines, it has no
 * licence questions, and it does exactly what this page needs.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  const source = el.dataset.splitSource ?? el.textContent ?? "";
  el.dataset.splitSource = source;

  const chars: HTMLElement[] = [];
  const frag = document.createDocumentFragment();

  source.split(/(\s+)/).forEach((chunk) => {
    if (/^\s+$/.test(chunk)) {
      frag.appendChild(document.createTextNode(" "));
      return;
    }
    const word = document.createElement("span");
    word.style.display = "inline-block";
    word.style.whiteSpace = "nowrap";

    for (const ch of chunk) {
      const outer = document.createElement("span");
      outer.style.display = "inline-block";
      outer.style.overflow = "hidden";
      outer.style.verticalAlign = "top";

      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.textContent = ch;

      outer.appendChild(inner);
      word.appendChild(outer);
      chars.push(inner);
    }
    frag.appendChild(word);
  });

  el.setAttribute("aria-label", source);
  el.replaceChildren(frag);
  // Children are decorative once the label is set.
  Array.from(el.children).forEach((c) => c.setAttribute("aria-hidden", "true"));

  return chars;
}
