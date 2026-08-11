import type { ReactNode } from "react";

import Reveal from "./Reveal";

/**
 * The repeated header block: a mono index label on a ruled line, then a
 * display heading. `\n` in `heading` becomes a hard line break.
 */
export default function SectionHead({
  label,
  heading,
  aside,
  className = "",
}: {
  label: string;
  heading: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal className="flex items-center gap-4">
        <span className="label whitespace-nowrap">{label}</span>
        <span className="measure-rule flex-1" />
        {/* Supplementary annotation only. Below `sm` there isn't room for it
            beside the label and the rule, and nowrap would clip it mid-word. */}
        {aside ? (
          <span className="label hidden whitespace-nowrap sm:inline">{aside}</span>
        ) : null}
      </Reveal>

      <Reveal as="h2" className="display mt-8 text-[length:var(--text-section)] text-bone">
        {heading.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Reveal>
    </div>
  );
}
