/**
 * Contribution-grid data.
 *
 * Deterministic on purpose: a seeded generator means the server and the client
 * produce byte-identical markup, so there is no hydration mismatch. Swap
 * `getContributionGrid` for a GitHub GraphQL call when you want it live — the
 * shape it returns is all the component knows about.
 */

import type { ContributionDay } from "./contributions";

export type { ContributionDay };

/** Small, fast, well-distributed PRNG. Same seed, same sequence, always. */
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const WEEKS = 53;
export const DAYS_PER_WEEK = 7;

export function getContributionGrid(seed = 20260811): ContributionDay[][] {
  const random = mulberry32(seed);
  const weeks: ContributionDay[][] = [];

  // A slow wave over the year plus a per-day multiplier gives the grid the
  // busy-stretch / quiet-stretch texture a real profile has.
  for (let w = 0; w < WEEKS; w++) {
    const season = 0.55 + 0.45 * Math.sin((w / WEEKS) * Math.PI * 2.4 + 0.8);
    const week: ContributionDay[] = [];

    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const weekend = d === 0 || d === 6;
      const intensity = season * (weekend ? 0.45 : 1) * random();

      let count = 0;
      if (intensity > 0.14) count = Math.round(intensity * 14);

      const level: ContributionDay["level"] =
        count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;

      week.push({ level, count });
    }
    weeks.push(week);
  }

  return weeks;
}

export function totalContributions(grid: ContributionDay[][]): number {
  return grid.reduce(
    (sum, week) => sum + week.reduce((s, day) => s + day.count, 0),
    0
  );
}
