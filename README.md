# Portfolio — "Dark Blueprint"

A single-page developer portfolio. Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP · Three.js.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run preview  # build, then serve the production output
npm run verify   # typecheck + lint + chess engine + GitHub parser tests
```

> `next dev` and `next build` share the `.next` directory. Stop the dev server
> before building, or just use `npm run preview`, which handles it.

---

## Make it yours

**Almost everything lives in one file: [`src/content/site.ts`](src/content/site.ts).** Name, tagline, projects, metrics, stats, section copy, social links. Change it there and the whole page follows.

Two constraints worth knowing before you edit:

- **Hero lines** (`heroLines`) — keep to three lines of ~14 characters. The type scale in `globals.css` is tuned so that width never wraps, down to a 320px screen. Longer lines will wrap and push the hero past the fold.
- **Project metrics** — `value` is a number, so `99.95` renders as `99.95%` and `2.1` as `2.1M`. Decimal precision is read from the number itself.

> The projects, metrics, and stats shipped here are **realistic placeholders**. Replace them with real work before you send this to anyone.

### Other things you'll probably want to change

| What | Where |
|---|---|
| Colours, type scale, spacing | `src/app/globals.css` (`@theme` block) |
| Chess puzzles | `src/lib/chess/puzzles.ts` |
| Contribution heatmap data | `src/lib/stats.ts` |
| Site metadata / OG tags | `src/app/layout.tsx` |
| Where the contact form sends | `src/app/api/contact/route.ts` |

---

## The contact form works

`POST /api/contact` validates with Zod, rate-limits per IP (3/minute), and traps bots with a honeypot field. Right now it **logs to the server console** instead of emailing. To actually send mail, add a provider in `src/app/api/contact/route.ts` where the `TODO` is:

```ts
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({ from, to, subject: `Portfolio — ${name}`, text: message });
```

The rate limiter is in-memory, which is fine on a single instance and useless behind an autoscaler. Move it to Redis if you ever run more than one.

---

## The chess puzzle is real

`src/lib/chess/engine.ts` is a genuine move generator: sliding pieces, pawn pushes and captures, promotion, and full legality filtering (you can't leave your own king in check). The board decides whether you won by asking *"does black have a legal reply?"* — not by comparing against a stored answer, so any legal mating move is accepted.

Castling and en passant are deliberately **not** implemented. The three bundled puzzles are chosen so their absence can't change the result, and `npm run verify:chess` asserts that each position has at least one mate in one and isn't already over.

```bash
npm run verify:chess
```

---

## Performance and accessibility notes

These weren't afterthoughts, so don't undo them by accident:

- **Three.js is desktop-only.** The lattice is dynamically imported and gated behind `min-width: 768px`, a WebGL capability probe, and `prefers-reduced-motion`. Mobile gets a static gradient with the same composition, so the layout never shifts between them. It is code-split out of the initial bundle.
- **Reduced motion is a real path, not a token gesture.** Lenis smooth scroll, the preloader, the custom cursor, magnetic buttons, marquees, and all GSAP reveals are disabled. Verified by rendering the whole page under `prefers-reduced-motion: reduce`.
- **The chess board is fully keyboard-operable** — roving tabindex, arrow keys that don't wrap at the a/h files, Enter to select, Escape to deselect, and a single `aria-live` region so moves aren't double-announced.
- **Reveal animations hide in CSS, not JS.** If JavaScript fails, `.motion-off` / the reduced-motion query force everything visible rather than leaving a blank page.
- Every interactive target is at least 24×24 (most are 44px). Board squares are ~42px, bounded by the board itself.
- Verified with headless Chrome at 320 / 375 / 768 / 1440, with and without reduced motion: no horizontal scroll, no console errors, no undersized targets.

---

## The contribution graph is real (once you give it a token)

The Signal section renders your actual GitHub contribution calendar. GitHub's
REST API doesn't expose it — only GraphQL does, and that requires auth even for
public data — so it needs a token:

1. Go to <https://github.com/settings/tokens> → **Generate new token (classic)**.
2. Tick **`read:user`**. Nothing else. Set an expiry you're happy to renew.
3. Locally: copy `.env.example` to `.env.local` and paste the token into `GITHUB_TOKEN`.
4. In production: add the same variable in your host's dashboard.

Without a token nothing breaks — the grid falls back to seeded placeholder data
and openly labels itself *"sample data"*, so you can't accidentally ship fake
numbers as real ones. A bad or expired token behaves the same way, and the fetch
is wrapped so it can never fail a build. Data is cached for an hour.

---

## Deploy

### 1. Put the code on GitHub

You need a repo first. Create an **empty** one at <https://github.com/new> —
no README, no .gitignore, no licence, or the first push will conflict. Then:

```bash
git remote add origin https://github.com/shaxzodeshonov/<repo-name>.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Sign in at <https://vercel.com> with GitHub.
2. **Add New → Project**, import the repo. Next.js is detected automatically —
   leave the build settings alone.
3. Before the first deploy, open **Environment Variables** and add
   `GITHUB_TOKEN`. Add `RESEND_API_KEY` too if you've wired up email.
4. Deploy. Every push to `main` redeploys; pull requests get preview URLs.

If you add the token *after* the first deploy, redeploy for it to take effect —
env vars are read at build time.

### 3. Afterwards

- Point `shxzd.dev` at it in Vercel → Settings → Domains, and set the
  `www` variant to **redirect** rather than serve — two hostnames serving the
  same page splits the ranking signal.
- Add the live URL to your GitHub profile, LinkedIn, X and CV. This is not
  housekeeping; see [Search](#search) — it is the highest-leverage thing you
  can do for ranking on your own name.
- Verify the domain in Search Console and submit the sitemap.

---

## Link previews

Paste the URL into X, Telegram, LinkedIn, Slack, WhatsApp or iMessage and it
unfurls into a card. That's **Open Graph** (`og:*` tags) plus **Twitter Cards**.

The image is generated at build time by `src/app/opengraph-image.tsx` — 1200×630,
drawn in the site's own palette with the real Geist fonts, and built from
`src/content/site.ts`, so it can never drift from the rest of the page. Next
injects `og:image`, `twitter:image` and the dimension tags automatically.

The one thing that breaks previews is a wrong base URL: the image must be an
**absolute** URL, and scrapers silently drop the card if it isn't. That's
handled in `src/lib/site-url.ts`, which prefers `NEXT_PUBLIC_SITE_URL`, then
the canonical domain in production, then Vercel's per-deploy URL, then
localhost. It works with no configuration.

To check it after deploying:

- X — <https://cards-dev.twitter.com/validator>
- Facebook / general OG — <https://developers.facebook.com/tools/debug/>
- LinkedIn — <https://www.linkedin.com/post-inspector/>
- Telegram — message [@WebpageBot](https://t.me/WebpageBot) to refresh its cache

Scrapers cache aggressively. If you change the image, use those tools to force
a refresh or the old card will keep appearing for days.

---

## Search

The goal is ranking first for **"Shaxzod Eshonov"** and its other spellings.
That is an *entity* problem, not a keyword problem: Google has to become
confident that a particular person exists, that these profiles are all his, and
that this domain is his home page. Everything below serves that.

### What the code does

| Where | What |
| --- | --- |
| `src/lib/site-url.ts` | Pins the canonical origin to `https://shxzd.dev`. Preview deploys resolve to themselves so they never compete with it. |
| `src/app/layout.tsx` | Title leads with the name. Meta description leads with the name. `og:type` is `profile`. Preview deploys get `noindex`. |
| `src/app/robots.ts` | Points crawlers at the sitemap; blocks `/api/`; blocks previews entirely. |
| `src/app/sitemap.ts` | One URL. Exists mainly so Search Console has something to submit. |
| `src/app/page.tsx` | A schema.org `@graph`: `Person` + `WebSite` + `ProfilePage` + one `SoftwareSourceCode` per project, cross-linked by `@id`. |
| `src/content/site.ts` | `identity.nameVariants` and the `seo` block. Edit copy here, not in the components. |

### Name variants

Uzbek names have no single romanisation — Shaxzod / Shohzod / Shakhzod /
Shahzod, Эшонов / Eshonov / Eshanov — and Google treats those as unrelated
strings by default, which splits the traffic for one person four ways.

`identity.nameVariants` feeds schema.org `alternateName`, which is the
sanctioned way to say "these are all me".

> **Do not put the variants in the page body.** Hidden or repeated
> name text in the DOM is keyword stuffing under Google's spam policies and
> risks a manual action, which is far more expensive than the traffic it wins.
> The schema is the whole mechanism. It is invisible on purpose.

### The half that isn't code

On-page work is necessary and not sufficient. For a name query, the ranking is
mostly decided by corroboration from elsewhere. In rough order of impact:

1. **Verify the domain in [Search Console](https://search.google.com/search-console)**
   and submit `https://shxzd.dev/sitemap.xml`. Prefer DNS verification over the
   HTML tag — it covers subdomains and survives redeploys. Until this is done
   the site may take weeks to be crawled at all.
2. **Link back from every profile in `identity.socials`.** GitHub bio website
   field, LinkedIn *Contact info → Website*, X profile URL, Telegram bio. Each
   backlink closes the `sameAs` loop and is the single highest-leverage action
   in this list. Do all four.
3. **Use one spelling as primary everywhere.** `Shaxzod Eshonov` — same string
   on GitHub, LinkedIn, X, university pages, conference lists, everything.
   Consistency is what lets Google merge the variants; the schema only helps if
   there is a dominant form to merge *into*.
4. **Add a real photograph.** The same face on this site, GitHub, LinkedIn and
   X is strong entity evidence and is what a knowledge panel displays. There is
   no `Person.image` in the schema right now precisely because there is no
   photo to point at — add one and wire it up.
5. **Get mentioned on domains you don't own.** Inha University pages, a
   conference or hackathon listing, a dev.to or Habr post, an open-source
   contribution credited by name. A handful of these outweighs any further
   on-page tuning.

### Checking your work

- Structured data — <https://validator.schema.org> and
  [Rich Results Test](https://search.google.com/test/rich-results)
- Indexing status — Search Console → *URL Inspection*
- What Google actually stored — search `site:shxzd.dev`

Expect **4–12 weeks** on a new domain before the name query settles. Ranking
for your own name is usually easy once Google knows the entity exists; getting
it to notice a brand-new site with no inbound links is the slow part, and
step 2 above is what shortens it.
