# Portfolio — "Dark Blueprint"

A single-page developer portfolio. Next.js 15 (App Router) · TypeScript · Tailwind v4 · GSAP · Three.js.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run verify  # typecheck + lint + chess engine tests
```

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

## Deploy

Push to GitHub and import on Vercel — no configuration needed. Add `RESEND_API_KEY` (or your provider's equivalent) once you wire up email.
