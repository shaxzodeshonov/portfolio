import { identity } from "@/content/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">Elsewhere</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-8">
              {identity.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="group inline-flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-bone"
                  >
                    {social.label}
                    <span
                      aria-hidden="true"
                      className="text-dim transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-signal"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-[0.85rem] text-dim">
              © {year} {identity.name}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted md:ml-auto">
              Built with Next.js, GSAP and Three.js. Designed in the browser.
            </p>
          </div>
        </div>

        <div className="measure-rule mt-12" />

        <p className="editorial mt-4 text-[0.95rem] text-dim">
          fig. 08 — end of document
        </p>
      </div>
    </footer>
  );
}
