import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { offHours } from "@/content/site";

export default function OffHours() {
  return (
    <section id="off-hours" className="relative border-t border-line py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHead
          label={offHours.label}
          heading={offHours.heading}
          aside="fig. 06"
          className="max-w-4xl"
        />

        <Reveal
          as="ul"
          className="mt-12 grid gap-px overflow-hidden border-y border-line bg-line sm:mt-16 lg:grid-cols-3"
          stagger={0.1}
        >
          {offHours.items.map((item, i) => (
            <li
              key={item.title}
              className="group relative flex flex-col bg-void px-0 py-8 sm:px-7 sm:py-10 lg:first:pl-0"
            >
              <span className="font-mono text-[11px] tracking-[0.2em] text-dim">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-5 text-2xl tracking-tight text-bone sm:text-[1.75rem]">
                {item.title}
              </h3>

              <p className="mt-4 flex-1 leading-[1.7] text-muted">{item.body}</p>

              <p className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                <span className="h-px w-5 bg-signal/50 transition-all duration-500 group-hover:w-9" />
                {item.meta}
              </p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
