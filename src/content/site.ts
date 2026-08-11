/**
 * ============================================================================
 *  EDIT THIS FILE.
 * ----------------------------------------------------------------------------
 *  Every piece of copy and data on the site comes from here.
 *
 *  Sourced from portfolio-content.md and from the project READMEs in
 *  D:\art_coding. Anything still unconfirmed is marked NEED — search this file
 *  for that word to find the remaining gaps.
 *
 *  Nothing here is invented. Earlier drafts carried placeholder metrics
 *  (transaction counts, latency figures, a Codeforces rating); those have been
 *  removed rather than attached to real project names.
 * ============================================================================
 */

export const identity = {
  name: "Shaxzod Eshonov",
  /** Used for the nav wordmark, where the full name is too wide. */
  shortName: "Shaxzod",
  role: "Full-stack engineer",
  location: "Tashkent, Uzbekistan",
  /**
   * One sentence. Must contain exactly one em dash — the hero splits on it to
   * set the second half in italic serif.
   */
  tagline:
    "I build the whole thing and keep it running — React and TypeScript on the surface, Node and Postgres underneath.",
  email: "es.shaxzod@gmail.com",
  phone: "+998 93 337 19 81",
  availability: {
    open: true,
    label: "Open to work",
    detail: "Internships and junior roles · remote or Tashkent",
  },
  socials: [
    { label: "GitHub", handle: "@shaxzodeshonov", href: "https://github.com/shaxzodeshonov" },
    {
      label: "LinkedIn",
      handle: "in/shaxzodeshonov",
      href: "https://www.linkedin.com/in/shaxzodeshonov/",
    },
    { label: "Telegram", handle: "@shaxzd_e", href: "https://t.me/shaxzd_e" },
    { label: "X", handle: "@shaxzod_e", href: "https://x.com/shaxzod_e" },
    { label: "Email", handle: "es.shaxzod@gmail.com", href: "mailto:es.shaxzod@gmail.com" },
    // NEED: Upwork profile URL once it's live.
    // Instagram (@shaxzd_e) and WhatsApp are omitted deliberately — personal
    // channels tend to weaken a hiring page. Add them back if you disagree.
  ],
} as const;

/**
 * The hero headline, one array entry per line.
 * Keep it to three lines of ~14 characters — the type scale in globals.css is
 * tuned so that width never wraps, down to a 320px screen.
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
  "JWT auth",
  "C++",
  "Qt",
  "FastAPI",
  "Docker",
  "SQLite",
  "Vite",
  "ONNX Runtime",
  "Vitest",
] as const;

export const manifesto = {
  label: "Approach",
  heading: "Four years on the front,\none on the back.",
  body: [
    "I taught myself frontend first — four years of React and TypeScript, long enough to stop being impressed by clever code and start caring whether the thing loads. The last year I've spent going down the stack, because you cannot make an interface honest if you don't know what the server is actually doing.",
    "Right now I'm a second-year Computer Science student at Inha University in Tashkent, and before that I built for the web at the IT Center, IT Park. Most of what I know came from shipping something, breaking it, and having to fix it while somebody was using it.",
  ],
  annotations: [
    { at: "surface", note: "React · TypeScript · Next.js — four years" },
    { at: "core", note: "Node · Express · PostgreSQL · Prisma · JWT — one year" },
    { at: "systems", note: "C++ · Qt · Python — coursework and side projects" },
  ],
} as const;

export type ProjectMetric = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export type Project = {
  index: string;
  name: string;
  /** NEED: confirm the year on each of these. */
  year: string;
  role: string;
  summary: string;
  detail: string;
  stack: string[];
  /**
   * Only genuinely verifiable figures belong here — the ones below are taken
   * from each project's own README. Leave the array empty rather than
   * inventing numbers; the metrics row hides itself when it's empty.
   */
  metrics: ProjectMetric[];
  /**
   * Live deployment first, source second. Every URL below was checked against
   * the GitHub API and fetched for a 200 — note that oop-pearl.vercel.app,
   * which the content doc listed, is dead; collegeoop.vercel.app is the live
   * one. Re-check these if you redeploy anything.
   */
  links: { label: string; href: string }[];
  accent: "signal" | "blueprint";
};

export const projects: Project[] = [
  {
    index: "1",
    name: "thngstbuy",
    year: "2026",
    role: "Solo — frontend, API, database",
    summary: "A shared list of things you're thinking about buying.",
    detail:
      "Every item holds a price and three notes — which model, where, and why — so the list argues with you a little before you spend. There are no accounts: landing on the site mints a list and the URL becomes the credential, 60 bits of entropy in an alphabet that drops i, l, o and u so a link survives being read aloud. Writes are field-level PATCHes, so two people editing different fields of the same item don't overwrite each other.",
    stack: ["React 19", "TypeScript", "Express 5", "SQLite", "Vite", "Vitest"],
    metrics: [
      { value: 60, suffix: " bits", label: "Link entropy" },
      { value: 0, label: "Accounts required" },
      { value: 32, label: "Symbol ID alphabet" },
    ],
    links: [
      { label: "Live site", href: "https://thngstbuy.vercel.app" },
      { label: "Source", href: "https://github.com/shaxzodeshonov/thngstbuy" },
    ],
    accent: "signal",
  },
  {
    index: "2",
    name: "removebg",
    year: "2026",
    role: "Solo — model serving, API, frontend",
    summary: "Studio-quality background removal that never leaves your machine.",
    detail:
      "BiRefNet running through ONNX Runtime behind a FastAPI service, with a Next.js front end that posts an image and gets a transparent PNG back. No API keys and no per-image cost. The Docker build bakes the 214 MB model into the backend image so containers start without network access, and the service warms the model before it reports healthy rather than making the first user pay for the cold start.",
    stack: ["FastAPI", "Python", "ONNX Runtime", "BiRefNet", "Next.js", "Docker"],
    metrics: [
      { value: 214, suffix: " MB", label: "Model baked into image" },
      { value: 20, suffix: "s", label: "Warm-up before healthy" },
      { value: 0, label: "Bytes leaving your machine" },
    ],
    // No hosted demo by design — the whole point is that it runs on your
    // own machine.
    links: [{ label: "Source", href: "https://github.com/shaxzodeshonov/removebg" }],
    accent: "blueprint",
  },
  {
    index: "3",
    name: "MarketNexus",
    year: "2025",
    role: "Team lead — architecture and review",
    summary: "A desktop marketplace, written in C++ because the course said so.",
    detail:
      "A Qt Widgets application with separate customer and admin roles, a cart, a dashboard and registration — modelled as a proper class hierarchy rather than a pile of window callbacks, which is the entire point of an OOP course. I led the team, which mostly meant deciding where the boundaries went and reading everyone else's pull requests.",
    stack: ["C++17", "Qt 6", "CMake", "OOP"],
    // NEED: team size, and anything the course graded it on.
    metrics: [],
    // Desktop application, so there is nothing to deploy.
    links: [{ label: "Source", href: "https://github.com/shaxzodeshonov/marketnexus" }],
    accent: "signal",
  },
  {
    index: "4",
    name: "OOP Mastery",
    year: "2025",
    role: "Solo — design and build",
    summary: "Learn C++ object-orientation by running it, not reading about it.",
    detail:
      "An interactive platform for the concepts that took me longest to internalise — inheritance, polymorphism, and why encapsulation stops mattering the moment you make everything public. Built while I was learning the same material myself, which is the only reason it explains the parts that are actually confusing.",
    stack: ["Next.js", "TypeScript", "C++"],
    // NEED: anything measurable — lessons, users, topics covered.
    metrics: [],
    links: [
      { label: "Live site", href: "https://collegeoop.vercel.app" },
      { label: "Source", href: "https://github.com/shaxzodeshonov/collegeOOP" },
    ],
    accent: "blueprint",
  },
];

export const signal = {
  label: "Signal",
  heading: "Where I'm at.",
  /**
   * Shown only while the heatmap is falling back to sample data — i.e. when
   * GITHUB_TOKEN is unset or invalid. Set the token and both this note and the
   * "sample data" flag on the grid disappear by themselves.
   */
  note: "Sample data: set GITHUB_TOKEN (scope read:user) to show your real contribution graph. See README.",
  stats: [
    { value: 4, label: "Years writing frontend", suffix: "" },
    { value: 1, label: "Year writing backend", suffix: "+" },
    { value: 2, label: "Year of CS at Inha", suffix: "nd" },
    { derived: "projects" as const, value: 0, label: "Projects in this list", suffix: "" },
  ],
} as const;

export const offHours = {
  label: "Off-hours",
  heading: "What I do when\nnobody's paying me.",
  items: [
    {
      title: "Music",
      body: "On for most of the working day. It turns out the albums I know by heart are the ones I can actually concentrate through — anything new and I end up listening instead of working.",
      meta: "Always on",
    },
    {
      title: "Cinema",
      body: "The thing I like about a well-made film is the same thing I like about well-made software: somebody made a hundred small decisions you're not supposed to notice, and you don't.",
      meta: "Mostly at night",
    },
    {
      title: "Table tennis",
      body: "Fast enough that thinking gets in the way. It's the one thing I do where the answer has to arrive before I've finished working it out, which is a useful counterweight to a job that rewards the opposite.",
      meta: "Whenever there's a table",
    },
  ],
} as const;

export const contact = {
  label: "Contact",
  heading: "Let's talk.",
  body: "I'm looking for a full-stack role on a team that cares about craft — internship or junior, remote or here in Tashkent. If that's yours, tell me what you're building.",
} as const;
