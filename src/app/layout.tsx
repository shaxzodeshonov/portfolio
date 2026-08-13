import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { identity, seo } from "@/content/site";
import { getSiteUrl, isPreviewDeployment } from "@/lib/site-url";
import "./globals.css";

/*
 * Geist Sans carries everything; Geist Mono is reserved for figures, chess
 * notation, board coordinates and the clock — never for nav or section
 * labels, where tracked-out uppercase mono is the single biggest tell of a
 * templated developer portfolio.
 *
 * Both ship inside the `geist` package, so nothing is fetched at build time.
 * That matters: `next/font/google` downloads during the build and already
 * failed one here with `EAI_AGAIN fonts.gstatic.com`.
 */

/*
 * The <title> is the single heaviest on-page ranking signal for a name query,
 * and this one is built to be exactly that: the name first, unadorned, then
 * the role. No site-name suffix, no separator noise — Google rewrites titles
 * it judges to be padded, and the rewrite is always worse than the original.
 */
const title = `${identity.name} — ${identity.role}`;

/*
 * Preview deploys must never be indexed. Two of them ranking alongside the
 * real domain is a duplicate-content split, and the .vercel.app hostname will
 * sometimes win, which is the worst of both outcomes.
 */
const indexable = !isPreviewDeployment();

export const metadata: Metadata = {
  // Must be absolute, or the og:image URL resolves against nothing and every
  // scraper silently drops the preview. It also anchors `alternates.canonical`
  // below — a canonical pointing at the wrong origin is worse than none.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: `%s — ${identity.name}`,
  },
  description: seo.description,
  keywords: [...seo.keywords],
  authors: [{ name: identity.name, url: getSiteUrl() }],
  creator: identity.name,
  publisher: identity.name,
  applicationName: identity.name,
  category: "technology",
  alternates: { canonical: "/" },
  // The image itself comes from app/opengraph-image.tsx — Next injects the
  // og:image, dimensions and type tags from that file automatically.
  openGraph: {
    type: "profile",
    firstName: "Shaxzod",
    lastName: "Eshonov",
    username: "shaxzodeshonov",
    siteName: identity.name,
    title,
    description: seo.description,
    url: "/",
    locale: "en_US",
  },
  // Without summary_large_image, X renders a small square thumbnail instead
  // of the full-width card.
  twitter: {
    card: "summary_large_image",
    title,
    description: seo.description,
    creator: "@shaxzod_e",
    site: "@shaxzod_e",
  },
  // Stops iOS Safari turning the phone number and address in the schema into
  // auto-styled links that fight the design.
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
      "max-image-preview": "large",
      // Let Google use the whole snippet and full video previews rather than
      // truncating to its default. Costs nothing, occasionally wins the click.
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Omitted entirely when the env var is unset — an empty content="" here can
  // fail Search Console's check rather than merely being ignored.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-void text-bone antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-signal focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-void"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
