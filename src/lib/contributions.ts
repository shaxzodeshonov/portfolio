/**
 * Contribution-grid types and the pure mapping from GitHub's GraphQL shape.
 *
 * Deliberately free of imports and side effects, so it can be exercised
 * directly by `npm run verify:github` without pulling in a fetch, a token, or
 * the placeholder generator.
 */

export interface ContributionDay {
  /** 0 = none, 4 = busiest. */
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
}

export interface ContributionData {
  weeks: ContributionDay[][];
  total: number;
  /** Whether this is real data or the seeded stand-in. */
  source: "github" | "placeholder";
}

export interface GraphQlDay {
  contributionCount: number;
  contributionLevel: string;
}

export interface GraphQlCalendar {
  totalContributions: number;
  weeks: { contributionDays: GraphQlDay[] }[];
}

/** GitHub's five-step enum, in the same order as our 0–4 levels. */
const LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const EMPTY_DAY: ContributionDay = { level: 0, count: 0 };

/**
 * GitHub's first and last weeks are partial — a year rarely starts on a
 * Sunday — so they arrive with fewer than seven days. Rendered as-is that
 * gives two short columns and a ragged grid. Pad the first week at its start
 * and the last at its end, which is where the missing days actually belong.
 */
export function padWeeks(weeks: ContributionDay[][]): ContributionDay[][] {
  return weeks.map((week, index) => {
    if (week.length >= 7) return week;
    const filler = Array.from({ length: 7 - week.length }, () => ({ ...EMPTY_DAY }));
    return index === 0 ? [...filler, ...week] : [...week, ...filler];
  });
}

export function parseCalendar(calendar: GraphQlCalendar): ContributionData {
  const weeks: ContributionDay[][] = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      count: day.contributionCount,
      // An unrecognised level degrades to 0 rather than throwing, so GitHub
      // adding a sixth quartile someday cannot take the page down.
      level: LEVELS[day.contributionLevel] ?? 0,
    }))
  );

  return {
    weeks: padWeeks(weeks),
    total: calendar.totalContributions ?? 0,
    source: "github",
  };
}
