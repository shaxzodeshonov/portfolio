import type { MetadataRoute } from "next";

import { getSiteUrl, isPreviewDeployment } from "@/lib/site-url";

/**
 * Served at /robots.txt.
 *
 * Two jobs, and the second is the one that matters:
 *
 *   1. Point every crawler at the sitemap.
 *   2. Keep preview deploys out of the index. A branch deploy that gets
 *      crawled is a byte-identical copy of the site on a different hostname —
 *      Google picks one of the two to rank and it is not always the one you
 *      own. `noindex` in the meta tag (see layout.tsx) is the real enforcement;
 *      this is the belt to that pair of braces.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  if (isPreviewDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The contact endpoint is a POST handler. Nothing to index, and a
        // crawler hitting it just burns the rate limiter.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    // Declares which hostname is the real one. Yandex reads this directive and
    // Yandex is a meaningful share of search in Uzbekistan; Google ignores it
    // and uses the canonical tag instead, which is also set.
    host: base,
  };
}
