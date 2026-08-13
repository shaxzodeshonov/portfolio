import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

/**
 * Served at /sitemap.xml.
 *
 * A single-page site does not strictly need a sitemap — Google will find one
 * URL without help. It is here because Search Console's "submit a sitemap"
 * flow is the fastest way to get a brand-new domain crawled, which is the
 * actual bottleneck for a site nobody links to yet.
 *
 * The in-page anchors (#work, #contact) are deliberately NOT listed. Fragments
 * are not separate URLs; listing them makes the sitemap look padded and Google
 * discards them anyway.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return [
    {
      url: base,
      // Build time. Honest, and it moves whenever the content actually does,
      // which is exactly what lastModified is supposed to mean. Faking a fresh
      // date on every crawl is a well-known way to get the field ignored.
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
