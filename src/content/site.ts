/**
 * ============================================================================
 *  EDIT THIS FILE.
 * ----------------------------------------------------------------------------
 *  Every piece of copy, every project, every number on the site comes from
 *  here. Nothing else needs touching to make the page yours.
 *
 *  The project metrics and links below are realistic placeholders. Swap them
 *  for real ones before you send this to anybody — made-up numbers on a
 *  portfolio are the fastest way to lose an interview.
 * ============================================================================
 */

export const identity = {
  name: "Shaxzod",
  /** Shown under the wordmark and in the page <title>. */
  role: "Frontend-leaning full-stack engineer",
  /** One sentence. This is the thing a recruiter actually reads. */
  tagline:
    "I build interfaces that feel fast and backends that stay boring — React and TypeScript on the surface, Node and Postgres underneath.",
  email: "shaxzod221007@gmail.com",
  availability: {
    open: true,
    label: "Available for work",
    detail: "Remote or relocation · full-time",
  },
  socials: [
    { label: "GitHub", handle: "@shaxzod", href: "https://github.com" },
    { label: "LinkedIn", handle: "in/shaxzod", href: "https://linkedin.com" },
    { label: "Codeforces", handle: "shaxzod", href: "https://codeforces.com" },
    { label: "Email", handle: "shaxzod221007@gmail.com", href: "mailto:shaxzod221007@gmail.com" },
  ],
} as const;

/**
 * The hero headline, one array entry per line.
 * Keep it to three lines and 14 characters each — the type scale in
 * globals.css is tuned so that width never wraps, down to a 320px screen.
 */
export const heroLines = ["I build things", "that ship —", "and stay up."];

export const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "PostgreSQL",
  "Prisma",
  "Tailwind",
  "GSAP",
  "Three.js",
  "Docker",
  "Redis",
  "Vitest",
  "Playwright",
  "tRPC",
  "Zod",
] as const;

export const manifesto = {
  label: "02 / Approach",
  heading: "Most of the job is\ndeciding what not to build.",
  body: [
    "I care about the seam between design and engineering — the place where a beautiful mockup meets a slow query and one of them has to give. My instinct is to make the interface feel instant first, then go make the truth underneath actually be that fast.",
    "That means measuring before optimising, shipping the boring schema, and treating loading, empty, and error states as part of the design rather than as cleanup. It also means saying no to the fourth abstraction layer.",
  ],
  annotations: [
    { at: "surface", note: "React · TS · Next.js — accessible, animated, measured" },
    { at: "core", note: "Node · Express · Postgres · Prisma — typed end to end" },
    { at: "edge", note: "ESP8266 · MQTT — where the data actually comes from" },
  ],
} as const;

export type Project = {
  index: string;
  name: string;
  year: string;
  role: string;
  summary: string;
  detail: string;
  stack: string[];
  metrics: { value: number; suffix?: string; prefix?: string; label: string }[];
  href: string;
  accent: "signal" | "blueprint";
};

export const projects: Project[] = [
  {
    index: "01",
    name: "Ledgerline",
    year: "2025",
    role: "Solo — design, frontend, backend, infra",
    summary: "Real-time expense tracking for small teams.",
    detail:
      "Optimistic UI over a WebSocket feed, so a transaction appears the instant you hit enter and reconciles against Postgres in the background. The hard part was conflict resolution when two people edit the same ledger offline — solved with a per-row version vector and a replay queue.",
    stack: ["Next.js 15", "TypeScript", "Prisma", "PostgreSQL", "WebSockets", "Redis"],
    metrics: [
      { value: 42, suffix: "k", label: "Transactions / month" },
      { value: 180, suffix: "ms", label: "p95 API latency" },
      { value: 99.95, suffix: "%", label: "Uptime, 12 mo" },
    ],
    href: "#",
    accent: "signal",
  },
  {
    index: "02",
    name: "Gambit",
    year: "2025",
    role: "Solo — frontend, WASM integration",
    summary: "An opening trainer that works on a plane.",
    detail:
      "Stockfish compiled to WebAssembly runs in a worker so the board never drops a frame while it thinks. The whole puzzle set lives in IndexedDB, which means the app is fully usable offline and cold-starts in under a second on a mid-range Android.",
    stack: ["React", "TypeScript", "WebAssembly", "Web Workers", "IndexedDB", "Vite"],
    metrics: [
      { value: 12, suffix: "k", label: "Puzzles indexed" },
      { value: 60, suffix: "fps", label: "Board render, sustained" },
      { value: 1, prefix: "<", suffix: "s", label: "Offline cold start" },
    ],
    href: "#",
    accent: "blueprint",
  },
  {
    index: "03",
    name: "Nexus",
    year: "2024",
    role: "Frontend lead — 3 engineers",
    summary: "A design system that survived three products.",
    detail:
      "Sixty-odd components built on Radix primitives, documented in Storybook, versioned through a Turborepo monorepo with changesets. Every component ships with axe tests in CI, which is why the accessibility audit before launch turned up four issues instead of four hundred.",
    stack: ["Turborepo", "React", "Radix UI", "Storybook", "Changesets", "Playwright"],
    metrics: [
      { value: 62, label: "Components shipped" },
      { value: 3, label: "Products consuming" },
      { value: 41, suffix: "%", label: "Less UI code downstream" },
    ],
    href: "#",
    accent: "signal",
  },
  {
    index: "04",
    name: "PulseGrid",
    year: "2024",
    role: "Solo — firmware, ingest, dashboard",
    summary: "Sensors in my flat, charted properly.",
    detail:
      "ESP8266 nodes publish temperature and humidity over MQTT every second. An Express ingest service batches writes into TimescaleDB, and a Next.js dashboard streams live readings with a canvas chart that stays smooth at two million points. Started as a way to win an argument about which room is coldest.",
    stack: ["ESP8266", "C++", "MQTT", "Node.js", "TimescaleDB", "Next.js"],
    metrics: [
      { value: 2.1, suffix: "M", label: "Datapoints stored" },
      { value: 8, label: "Sensor nodes live" },
      { value: 1, suffix: "s", label: "Sample resolution" },
    ],
    href: "#",
    accent: "blueprint",
  },
];

export const signal = {
  label: "05 / Signal",
  heading: "The receipts.",
  note: "Static snapshot — wire `getStats()` in src/lib/stats.ts to the GitHub API when you're ready.",
  stats: [
    {
      // Computed from the heatmap above it rather than typed in here, so the
      // headline number and the squares can never disagree.
      derived: "contributions" as const,
      value: 0,
      label: "Contributions, past year",
      suffix: "",
    },
    { value: 340, label: "Competitive problems solved", suffix: "+" },
    { value: 1742, label: "Codeforces peak rating", suffix: "" },
    { value: 4, label: "Years shipping to production", suffix: "" },
  ],
} as const;

export const offHours = {
  label: "06 / Off-hours",
  heading: "What I do when\nnobody's paying me.",
  items: [
    {
      title: "Chess",
      body: "Roughly 1900 rapid. Mostly useful for the same reason code review is useful — it teaches you to look for your opponent's best reply before you commit.",
      meta: "~1900 rapid",
    },
    {
      title: "Competitive programming",
      body: "Codeforces most weekends. It is the only training I've found that makes you genuinely fast at reasoning about complexity under time pressure.",
      meta: "Codeforces · Expert",
    },
    {
      title: "Hardware",
      body: "Arduino and ESP8266. There is a specific pleasure in code whose bug report is a physically warm room, and no stack trace to help you.",
      meta: "ESP8266 · MQTT · C++",
    },
  ],
} as const;

export const contact = {
  label: "07 / Contact",
  heading: "Let's talk.",
  body: "I'm looking for a frontend or full-stack role on a team that cares about craft. If that's yours, tell me what you're building.",
} as const;
