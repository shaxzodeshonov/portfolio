import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { manifesto } from "@/content/site";

export default function Manifesto() {
  return (
    <section
      id="approach"
      className="group/section relative border-t border-line py-20 sm:py-28 lg:py-36"
    >
      <div className="blueprint-grid-fine pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_50%,black,transparent)]" />

      <div className="relative shell">
        <SectionHead
          index="2"
          label={manifesto.label}
          heading={manifesto.heading}
          aside="how I got here"
          className="max-w-5xl"
        />

        <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="space-y-6 lg:col-span-7" stagger={0.12}>
            {manifesto.body.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[length:var(--text-lede)] leading-[1.5] text-bone"
                    : "max-w-prose leading-[1.7] text-muted"
                }
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          {/* Layer callouts — the drafting annotation that gives the section
              its blueprint character. */}
          <Reveal className="lg:col-span-5 lg:pt-2" delay={0.15}>
            <p className="label">Where the work sits</p>
            <ol className="mt-6 space-y-0">
              {manifesto.annotations.map((annotation, i) => (
                <li
                  key={annotation.at}
                  className="group relative grid grid-cols-[3.5rem_1fr] gap-4 border-t border-line py-5 last:border-b"
                >
                  <span className="numeric text-[0.8rem] text-signal">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[0.95rem] font-medium text-bone">
                      {annotation.at}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {annotation.note}
                    </p>
                  </div>
                  <span className="absolute -left-3 top-1/2 hidden h-px w-2 bg-line lg:block" />
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
