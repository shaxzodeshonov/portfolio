import Counter from "@/components/ui/Counter";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { projects, type Project } from "@/content/site";

const ACCENT = {
  signal: {
    text: "text-signal",
    border: "group-hover:border-signal/50",
    rule: "bg-signal",
  },
  blueprint: {
    text: "text-blueprint",
    border: "group-hover:border-blueprint/50",
    rule: "bg-blueprint",
  },
} as const;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const accent = ACCENT[project.accent];
  // Alternate the emphasis column so four stacked cards don't read as a table.
  const flipped = index % 2 === 1;

  return (
    <Reveal
      as="article"
      className={`group relative border-t border-line pt-8 transition-colors duration-500 sm:pt-10 ${accent.border}`}
      y={40}
    >
      {/* header row ------------------------------------------------------- */}
      <div className="flex items-baseline justify-between gap-4">
        <span className={`font-mono text-[11px] tracking-[0.2em] ${accent.text}`}>
          {project.index}
        </span>
        <span className="label">{project.year}</span>
      </div>

      <div
        className={`mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12 ${
          flipped ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* name + summary */}
        <div className="lg:col-span-6">
          <h3 className="display text-[clamp(2.5rem,7vw,5.5rem)] text-bone">
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noreferrer noopener"
              className="group/name inline-flex items-start gap-3 transition-colors hover:text-signal"
            >
              {project.name}
              <span
                aria-hidden="true"
                className="mt-[0.35em] text-[0.3em] text-dim transition-all duration-300 group-hover/name:-translate-y-0.5 group-hover/name:translate-x-0.5 group-hover/name:text-signal"
              >
                ↗
              </span>
              <span className="sr-only"> — {project.links[0].label}</span>
            </a>
          </h3>
          <p className="mt-4 max-w-[36ch] text-[length:var(--text-lede)] leading-[1.4] text-bone/85">
            {project.summary}
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            {project.role}
          </p>
        </div>

        {/* detail + stack */}
        <div className="lg:col-span-6 lg:pt-3">
          <p className="max-w-prose leading-[1.7] text-muted">{project.detail}</p>

          <ul className="mt-7 flex flex-wrap gap-x-2 gap-y-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:border-line/80 group-hover:text-bone/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* metrics ---------------------------------------------------------- */}
      {/* Hidden entirely when a project has no verifiable figures, rather
          than padding the row out with invented ones. */}
      {project.metrics.length > 0 ? (
        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-3">
          {project.metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-void py-6 sm:px-6 sm:first:pl-0"
            >
              <dt className="label">{metric.label}</dt>
              <dd className="mt-2 font-mono text-[clamp(1.75rem,3.6vw,2.75rem)] leading-none tracking-tight text-bone">
                <Counter
                  value={metric.value}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-10 border-t border-line" />
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className={`hidden h-px w-0 transition-all duration-700 group-hover:w-24 sm:block ${accent.rule}`} />

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
          {project.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group/link -my-3 inline-flex min-h-11 items-center gap-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-bone"
              >
                <span className="sr-only">{project.name}: </span>
                {link.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/link:translate-x-1"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Work() {
  return (
    <section id="work" className="relative border-t border-line py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHead
          label="03 / Selected work"
          heading={"Four things I built\nand actually finished."}
          aside={`${projects.length} projects`}
          className="max-w-5xl"
        />

        <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
          {projects.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
