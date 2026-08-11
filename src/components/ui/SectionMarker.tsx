/**
 * A bullet that turns into the section's number while that section is hovered.
 *
 * The number is the kind of detail that reads as systematic when it's always
 * on and as craft when you have to go looking for it. Both states are stacked
 * in a fixed-width slot so the swap can't nudge the label sideways.
 *
 * Decorative: the number is announced nowhere, because the section already has
 * a heading that says what it is.
 */
export default function SectionMarker({
  index,
  className = "",
}: {
  index: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-4 w-6 shrink-0 items-center justify-start ${className}`}
    >
      <span className="absolute left-0 text-signal transition-opacity duration-300 ease-out group-hover/section:opacity-0">
        •
      </span>
      <span className="numeric absolute left-0 text-[0.8em] leading-none text-signal opacity-0 transition-opacity duration-300 ease-out group-hover/section:opacity-100">
        {index}
      </span>
    </span>
  );
}
