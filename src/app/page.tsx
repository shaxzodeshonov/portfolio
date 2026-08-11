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
import { identity, projects } from "@/content/site";

/** Structured data — cheap, and it is what search engines actually read. */
function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    jobTitle: identity.role,
    description: identity.tagline,
    email: `mailto:${identity.email}`,
    knowsAbout: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Prisma"],
    sameAs: identity.socials
      .filter((s) => s.href.startsWith("http"))
      .map((s) => s.href),
    hasOccupation: projects.map((p) => ({ "@type": "CreativeWork", name: p.name })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <PersonJsonLd />

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
