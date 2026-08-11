/**
 * Verifies the GitHub contribution parser against a payload shaped exactly
 * like GitHub's, including the partial first and last weeks that a real
 * response always has. Run with: npm run verify:github
 *
 * This deliberately needs no token — it tests our mapping, not GitHub.
 */

import { parseCalendar, type GraphQlCalendar } from "../src/lib/contributions.ts";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`  ${ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${label}`);
  if (!ok) {
    console.log(`        expected ${JSON.stringify(expected)}`);
    console.log(`        got      ${JSON.stringify(actual)}`);
  }
}

const LEVEL_NAMES = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];

/** A year's calendar: 53 weeks, first and last deliberately partial. */
function buildCalendar(): GraphQlCalendar {
  const weeks: GraphQlCalendar["weeks"] = [];
  let total = 0;

  for (let w = 0; w < 53; w++) {
    // GitHub sends 4 days in the opening week and 3 in the closing one.
    const days = w === 0 ? 4 : w === 52 ? 3 : 7;
    const contributionDays = [];
    for (let d = 0; d < days; d++) {
      const count = (w + d) % 13;
      total += count;
      const levelIndex = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
      contributionDays.push({
        contributionCount: count,
        contributionLevel: LEVEL_NAMES[levelIndex],
      });
    }
    weeks.push({ contributionDays });
  }

  return { totalContributions: total, weeks };
}

const calendar = buildCalendar();
const parsed = parseCalendar(calendar);

console.log("\nShape");
check("53 weeks preserved", parsed.weeks.length, 53);
check(
  "every column is 7 tall after padding",
  [...new Set(parsed.weeks.map((w) => w.length))],
  [7]
);
check("source is reported as github", parsed.source, "github");
check("total passes through unchanged", parsed.total, calendar.totalContributions);

console.log("\nPadding position");
// The opening week had 4 real days, so 3 fillers belong at its start.
check(
  "first week is padded at the start",
  parsed.weeks[0].slice(0, 3).map((d) => d.count),
  [0, 0, 0]
);
check(
  "first week keeps its real days last",
  parsed.weeks[0].slice(3).map((d) => d.count),
  calendar.weeks[0].contributionDays.map((d) => d.contributionCount)
);
// The closing week had 3 real days, so 4 fillers belong at its end.
check(
  "last week keeps its real days first",
  parsed.weeks[52].slice(0, 3).map((d) => d.count),
  calendar.weeks[52].contributionDays.map((d) => d.contributionCount)
);
check(
  "last week is padded at the end",
  parsed.weeks[52].slice(3).map((d) => d.count),
  [0, 0, 0, 0]
);

console.log("\nLevel mapping");

/**
 * Maps a single level name through the parser. Uses a full seven-day week on
 * purpose: a short week gets padded at the start, so index 0 would be a
 * filler rather than the day under test.
 */
function levelFor(name: string): number {
  const contributionDays = Array.from({ length: 7 }, () => ({
    contributionCount: 1,
    contributionLevel: name,
  }));
  return parseCalendar({ totalContributions: 7, weeks: [{ contributionDays }] })
    .weeks[0][0].level;
}

check("NONE maps to 0", levelFor("NONE"), 0);
check(
  "the four quartiles map to 1-4",
  LEVEL_NAMES.slice(1).map(levelFor),
  [1, 2, 3, 4]
);
check(
  "an unknown level degrades to 0 rather than throwing",
  levelFor("SOMETHING_NEW"),
  0
);

console.log(
  failures === 0
    ? "\n\x1b[32mAll GitHub parser checks passed.\x1b[0m\n"
    : `\n\x1b[31m${failures} check(s) failed.\x1b[0m\n`
);

process.exit(failures === 0 ? 0 : 1);
