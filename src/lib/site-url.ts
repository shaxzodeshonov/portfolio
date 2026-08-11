/**
 * The absolute base URL for this deployment.
 *
 * Open Graph and Twitter Card images must be absolute URLs — a relative path
 * is silently ignored by every scraper — so `metadataBase` has to be right or
 * link previews break everywhere.
 *
 * Resolution order, most explicit first:
 *   1. NEXT_PUBLIC_SITE_URL     — set this once you have a custom domain.
 *   2. Vercel's production URL  — stable across deploys, so previews on X and
 *                                 Telegram keep working after a redeploy.
 *   3. Vercel's per-deploy URL  — correct for branch and preview deploys.
 *   4. localhost                — development.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "http://localhost:3000";
}
