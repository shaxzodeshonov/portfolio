import type { ReactNode } from "react";

import Reveal from "./Reveal";
import SectionMarker from "./SectionMarker";

/**
 * The repeated header block: a marker, the section name, a ruled line, and
 * an optional note on the right, then the display heading.
 *
 * `\n` in `heading` becomes a hard line break.
 */
export default function SectionHead({
  index,
  label,
  heading,
  aside,
  className = "",
}: {
  /** Shown only on hover — see SectionMarker. */
  index: string;
  label: string;
  heading: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    // `data-section-anchor` is what in-page links actually scroll to — see
    // SmoothScroll. Without it they land on the section's padded top edge and
    // the heading sits halfway down the viewport.
    <div className={className} data-section-anchor>
      <Reveal className="flex items-center gap-3">
        <SectionMarker index={index} />
        <span className="label whitespace-nowrap !text-bone">{label}</span>
        <span className="measure-rule flex-1" />
        {/* Supplementary annotation only. Below `sm` there isn't room for it
            beside the label and the rule. */}
        {aside ? (
          <span className="editorial hidden whitespace-nowrap text-[0.95rem] text-muted sm:inline">
            {aside}
          </span>
        ) : null}
      </Reveal>

      <Reveal
        as="h2"
        className="display mt-7 text-[length:var(--text-section)] text-bone"
      >
        {heading.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Reveal>
    </div>
  );
}
