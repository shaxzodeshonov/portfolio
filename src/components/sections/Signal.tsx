import Counter from "@/components/ui/Counter";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { identity, projects, signal } from "@/content/site";
import { getContributions, type ContributionData } from "@/lib/github";

const LEVEL_STYLE = [
  "bg-line/60",
  "bg-signal/25",
  "bg-signal/45",
  "bg-signal/70",
  "bg-signal",
] as const;

function ContributionGrid({ data }: { data: ContributionData }) {
  const { weeks: grid, total, source } = data;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="label">
          Commit activity · 12 months
          {source === "placeholder" ? (
            <span className="ml-2 text-[#d98b8b]">· sample data</span>
          ) : null}
        </p>
        <p className="label">
          <span className="text-bone">{total.toLocaleString("en-US")}</span> total
        </p>
      </div>

      {/* Cells flex to fill the available width up to a sensible cap, and
          fall back to horizontal scroll on screens too narrow for 53 weeks
          rather than shrinking them into invisibility. */}
      <div className="mt-5 -mx-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        <div
          className="flex min-w-[46rem] max-w-5xl gap-[3px]"
          role="img"
          aria-label={`Contribution heatmap: ${total.toLocaleString("en-US")} commits over the past year.`}
        >
          {grid.map((week, w) => (
            <div key={w} className="flex flex-1 flex-col gap-[3px]">
              {week.map((day, d) => (
                <span
                  key={d}
                  className={`aspect-square w-full rounded-[2px] ${LEVEL_STYLE[day.level]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="label">Less</span>
        {LEVEL_STYLE.map((style, i) => (
          <span key={i} className={`h-[11px] w-[11px] rounded-[2px] ${style}`} />
        ))}
        <span className="label">More</span>
      </div>
    </div>
  );
}

export default async function Signal() {
  // Real data when GITHUB_TOKEN is set, the seeded placeholder otherwise —
  // never a hard failure, so a missing or expired token can't break the build.
  const githubHandle =
    identity.socials.find((s) => s.label === "GitHub")?.handle.replace("@", "") ??
    "shaxzodeshonov";
  const contributions = await getContributions(githubHandle);

  return (
    <section
      id="signal"
      className="group/section relative border-t border-line py-20 sm:py-28 lg:py-36"
    >
      <div className="shell">
        <SectionHead
          index="5"
          label={signal.label}
          heading={signal.heading}
          aside="the receipts"
          className="max-w-4xl"
        />

        <Reveal className="mt-12 sm:mt-16">
          <ContributionGrid data={contributions} />
        </Reveal>

        <Reveal
          as="dl"
          className="mt-14 grid grid-cols-2 gap-px overflow-hidden border-y border-line bg-line sm:mt-20 lg:grid-cols-4"
          stagger={0.09}
        >
          {signal.stats.map((stat) => (
            <div key={stat.label} className="bg-void px-4 py-8 sm:px-6 sm:py-10">
              <dd className="numeric text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-tight text-bone">
                <Counter
                  value={
                    "derived" in stat && stat.derived === "projects"
                      ? projects.length
                      : stat.value
                  }
                  suffix={stat.suffix}
                />
              </dd>
              <dt className="label mt-3 block">{stat.label}</dt>
            </div>
          ))}
        </Reveal>

        {/* Only warn when the grid is not real. Once GITHUB_TOKEN is set the
            caveat disappears on its own. */}
        {contributions.source === "placeholder" ? (
          <p className="mt-6 text-[0.8rem] leading-relaxed text-dim">
            {signal.note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
