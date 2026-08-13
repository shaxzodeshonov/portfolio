/**
 * The absolute base URL for this deployment.
 *
 * Open Graph and Twitter Card images must be absolute URLs — a relative path
 * is silently ignored by every scraper — so `metadataBase` has to be right or
 * link previews break everywhere. The canonical tag has the same requirement
 * for a different reason: point it at the wrong origin and Google indexes the
 * wrong hostname, which for a name query is the difference between ranking and
 * not existing.
 *
 * Resolution order, most explicit first:
 *   1. NEXT_PUBLIC_SITE_URL     — escape hatch; overrides everything.
 *   2. CANONICAL_ORIGIN         — the real domain, in production.
 *   3. Vercel's per-deploy URL  — branch and preview deploys, which resolve to
 *                                 themselves so a preview never claims to be
 *                                 the canonical site.
 *   4. localhost                — development.
 */

/**
 * The one hostname this site is indexed under. Everything else — the
 * .vercel.app deploy URLs, any www. variant — should redirect here, or the
 * ranking signal for "Shaxzod Eshonov" gets split across two hostnames that
 * Google treats as separate sites.
 */
export const CANONICAL_ORIGIN = "https://shxzd.dev";

/**
 * True on a Vercel preview/branch deploy. Those get `noindex` (see
 * app/robots.ts) so they can never outrank or duplicate the real domain.
 */
export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV === "preview";
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production") return CANONICAL_ORIGIN;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  if (process.env.NODE_ENV === "production") return CANONICAL_ORIGIN;

  return "http://localhost:3000";
}
