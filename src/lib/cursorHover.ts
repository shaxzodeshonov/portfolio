// Single global hover flag: the page has exactly one cursor label, and
// letting hoverable rows/tiles write to it directly (instead of through
// context/state) keeps the rAF loop in CursorLabel free of re-renders.
export const cursorHover = { on: false }
