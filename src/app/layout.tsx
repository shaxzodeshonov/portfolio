import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { identity } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";
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

const title = `${identity.name} — ${identity.role}`;

export const metadata: Metadata = {
  // Must be absolute, or the og:image URL resolves against nothing and every
  // scraper silently drops the preview.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: `%s — ${identity.name}`,
  },
  description: identity.tagline,
  keywords: [
    "full-stack engineer",
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Tashkent",
  ],
  authors: [{ name: identity.name }],
  creator: identity.name,
  alternates: { canonical: "/" },
  // The image itself comes from app/opengraph-image.tsx — Next injects the
  // og:image, dimensions and type tags from that file automatically.
  openGraph: {
    type: "website",
    siteName: identity.name,
    title,
    description: identity.tagline,
    url: "/",
    locale: "en_US",
  },
  // Without summary_large_image, X renders a small square thumbnail instead
  // of the full-width card.
  twitter: {
    card: "summary_large_image",
    title,
    description: identity.tagline,
    creator: "@shaxzod_e",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
