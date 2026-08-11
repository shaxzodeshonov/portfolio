# Bundled fonts

**Instrument Serif** — Regular and Italic, latin subset.

Licensed under the [SIL Open Font License 1.1](https://openfontlicense.org/),
which permits bundling and redistribution. Source:
<https://fonts.google.com/specimen/Instrument+Serif>.

These are committed on purpose. `next/font/google` fetches fonts at **build**
time, so every production deploy would depend on `fonts.gstatic.com` being
reachable — a transient DNS failure there broke a build during development
(`EAI_AGAIN fonts.gstatic.com`). Self-hosting makes builds deterministic.

Geist Sans and Geist Mono come from the `geist` npm package and are already
local, so they never had this problem.

To update: download the latin-subset `.woff2` files from Google Fonts and
replace these, keeping the filenames — `src/app/layout.tsx` references them by
path.
