import Cursor from "@/components/layout/Cursor";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import ScrollRail from "@/components/layout/ScrollRail";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ChessPuzzle from "@/components/sections/ChessPuzzle";
import Contact from "@/components/sections/Contact";
import Intro from "@/components/sections/Intro";
import Manifesto from "@/components/sections/Manifesto";
import OffHours from "@/components/sections/OffHours";
import Signal from "@/components/sections/Signal";
import Ticker from "@/components/sections/Ticker";
import Work from "@/components/sections/Work";
import { identity, projects, seo, stack } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Structured data — cheap, and it is what search engines actually read.
 *
 * This is a single @graph rather than three loose <script> blocks, so the
 * nodes can reference each other by @id. That cross-linking is the point:
 * it tells Google that the Person, the WebSite and this Page are three facets
 * of one entity instead of three unrelated things that happen to share a
 * hostname. An entity Google is confident about is one it will show a
 * knowledge panel for.
 *
 * Ranking for a personal name is an entity-resolution problem, not a keyword
 * problem. The two properties that do the work:
 *
 *   `alternateName` — every romanisation of the name, so a search for
 *      "Shohzod Eshonov" and one for "Shakhzod Eshonov" resolve to the same
 *      person instead of two strangers. This is the sanctioned channel for
 *      that claim. The equivalent trick in the page body — hidden text
 *      listing the spellings — is a spam-policy violation and risks a manual
 *      action. Keep the variants here and nowhere else.
 *
 *   `sameAs` — the GitHub/LinkedIn/X/Telegram profiles. Google corroborates
 *      the name against those, and each one that links *back* here closes the
 *      loop. The backlinks are the half that lives outside this repo, and
 *      they matter more than anything in this file.
 */
function StructuredData() {
  const base = getSiteUrl();

  const personId = `${base}/#person`;
  const siteId = `${base}/#website`;
  const pageId = `${base}/#webpage`;

  const profiles = identity.socials
    .filter((s) => s.href.startsWith("http"))
    .map((s) => s.href);

  const graph = [
    {
      "@type": "Person",
      "@id": personId,
      name: identity.name,
      alternateName: [...identity.nameVariants],
      givenName: "Shaxzod",
      familyName: "Eshonov",
      jobTitle: identity.role,
      description: seo.description,
      url: base,
      mainEntityOfPage: { "@id": pageId },
      email: `mailto:${identity.email}`,
      nationality: { "@type": "Country", name: "Uzbekistan" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tashkent",
        addressCountry: "UZ",
      },
      homeLocation: {
        "@type": "Place",
        name: "Tashkent, Uzbekistan",
      },
      // Currently enrolled, so `alumniOf` alone would be wrong. Both are
      // stated: affiliation for the present, alumniOf for the relationship
      // Google already understands.
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: "Inha University in Tashkent",
        url: "https://inha.uz",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Inha University in Tashkent",
        url: "https://inha.uz",
      },
      knowsAbout: [...stack],
      knowsLanguage: [
        { "@type": "Language", name: "Uzbek", alternateName: "uz" },
        { "@type": "Language", name: "English", alternateName: "en" },
        { "@type": "Language", name: "Russian", alternateName: "ru" },
      ],
      seeks: identity.availability.open
        ? {
            "@type": "Demand",
            name: identity.availability.detail,
          }
        : undefined,
      sameAs: profiles,
    },

    {
      "@type": "WebSite",
      "@id": siteId,
      url: base,
      name: identity.name,
      description: seo.description,
      inLanguage: "en",
      publisher: { "@id": personId },
      // No SearchAction: there is no site search. Declaring one that doesn't
      // exist gets the whole block distrusted.
    },

    {
      // ProfilePage, not WebPage. Google documents ProfilePage specifically
      // for "a page about one person", which is what this is, and treats the
      // mainEntity as authoritative for that person.
      "@type": "ProfilePage",
      "@id": pageId,
      url: base,
      name: `${identity.name} — ${identity.role}`,
      description: seo.description,
      isPartOf: { "@id": siteId },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      inLanguage: "en",
    },

    ...projects.map((project) => ({
      "@type": "SoftwareSourceCode",
      "@id": `${base}/#project-${project.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: project.name,
      description: project.summary,
      abstract: project.detail,
      url: project.links[0]?.href,
      codeRepository: project.links.find((l) => l.label === "Source")?.href,
      programmingLanguage: project.stack,
      author: { "@id": personId },
      creator: { "@id": personId },
      dateCreated: project.year,
      isPartOf: { "@id": pageId },
    })),
  ];

  const data = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify drops the `undefined` branches above rather than
      // emitting nulls, which validators flag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />

      <SmoothScroll />
      <Cursor />
      <ScrollRail />
      <Nav />

      <main id="main">
        <Intro />
        <Ticker />
        <Manifesto />
        <Work />
        <ChessPuzzle />
        <Signal />
        <OffHours />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
