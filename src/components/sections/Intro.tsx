"use client";

import { useCallback, useState } from "react";

import Preloader from "@/components/layout/Preloader";
import Hero from "@/components/sections/Hero";

/**
 * Owns the handoff from preloader to hero: the headline animation waits for
 * `started` so the reveal isn't playing to an empty room behind the overlay.
 */
export default function Intro() {
  const [started, setStarted] = useState(false);
  const start = useCallback(() => setStarted(true), []);

  return (
    <>
      <Preloader onDone={start} />
      <Hero start={started} />
    </>
  );
}
