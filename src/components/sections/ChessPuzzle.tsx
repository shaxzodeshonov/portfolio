"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import {
  allLegalMoves,
  applyMove,
  describePiece,
  fileOf,
  findKing,
  GLYPH,
  inCheck,
  isCheckmate,
  isLightSquare,
  legalMovesFrom,
  parseFen,
  rankIndexOf,
  squareName,
  toSan,
  type Board,
  type Color,
  type Move,
} from "@/lib/chess/engine";
import { puzzles } from "@/lib/chess/puzzles";

type Status = "idle" | "solved" | "wrong" | "revealed";

const FILE_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"];
/** Rank indices, 0 (rank 8) at the top — the array order the engine uses. */
const ranks = [0, 1, 2, 3, 4, 5, 6, 7];

export default function ChessPuzzle() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = puzzles[puzzleIndex];

  const initial = useMemo(() => parseFen(puzzle.fen), [puzzle.fen]);
  const [board, setBoard] = useState<Board>(initial.board);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [focusSquare, setFocusSquare] = useState(() => findKing(initial.board, initial.turn));

  const squareRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const revertTimer = useRef<number | null>(null);
  const shouldFocus = useRef(false);

  const mover: Color = initial.turn;
  const opponent: Color = mover === "w" ? "b" : "w";

  const resetTo = useCallback(
    (index: number) => {
      if (revertTimer.current) window.clearTimeout(revertTimer.current);
      const fresh = parseFen(puzzles[index].fen);
      setBoard(fresh.board);
      setSelected(null);
      setStatus("idle");
      setMessage("");
      setLastMove(null);
      setAttempts(0);
      setShowHint(false);
      setFocusSquare(findKing(fresh.board, fresh.turn));
    },
    []
  );

  useEffect(() => {
    resetTo(puzzleIndex);
  }, [puzzleIndex, resetTo]);

  useEffect(
    () => () => {
      if (revertTimer.current) window.clearTimeout(revertTimer.current);
    },
    []
  );

  // Only steal focus when the move came from the keyboard, so clicking around
  // doesn't yank focus rings onto squares a mouse user never asked for.
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    squareRefs.current[focusSquare]?.focus();
  }, [focusSquare]);

  const solved = status === "solved";
  const frozen = solved || status === "revealed" || status === "wrong";

  const legalTargets = useMemo(() => {
    if (selected === null || frozen) return new Map<number, Move>();
    const map = new Map<number, Move>();
    for (const move of legalMovesFrom(board, selected)) {
      // Under-promotion never matters in a mate-in-one, so the first move to
      // a square wins and promotions collapse to the queen.
      if (!map.has(move.to)) map.set(move.to, move);
    }
    return map;
  }, [board, selected, frozen]);

  const checkedKing = useMemo(() => {
    const w = inCheck(board, "w") ? findKing(board, "w") : -1;
    const b = inCheck(board, "b") ? findKing(board, "b") : -1;
    return w >= 0 ? w : b;
  }, [board]);

  const playMove = useCallback(
    (move: Move) => {
      const san = toSan(board, move);
      const next = applyMove(board, move);
      const mate = isCheckmate(next, opponent);

      setBoard(next);
      setLastMove(move);
      setSelected(null);

      if (mate) {
        setStatus("solved");
        setMessage(`${san} — checkmate. Nothing legal left for black.`);
        return;
      }

      setStatus("wrong");
      setAttempts((n) => n + 1);
      setMessage(
        inCheck(next, opponent)
          ? `${san} is check, but black still has a legal reply.`
          : `${san} doesn't end it — black is not even in check.`
      );

      // Let the move sit on the board long enough to read, then take it back.
      revertTimer.current = window.setTimeout(() => {
        setBoard(parseFen(puzzle.fen).board);
        setLastMove(null);
        setStatus("idle");
      }, 1400);
    },
    [board, opponent, puzzle.fen]
  );

  const handleSquare = useCallback(
    (index: number) => {
      if (frozen) return;

      const target = legalTargets.get(index);
      if (target) {
        playMove(target);
        return;
      }

      const piece = board[index];
      if (piece && piece.color === mover) {
        setSelected((current) => (current === index ? null : index));
        return;
      }
      setSelected(null);
    },
    [board, frozen, legalTargets, mover, playMove]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const deltas: Record<string, number> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowUp: -8,
        ArrowDown: 8,
      };

      if (event.key in deltas) {
        event.preventDefault();
        const file = fileOf(index);
        const delta = deltas[event.key];
        // Block the wrap-around that plain index arithmetic would allow at
        // the a- and h-files.
        if (delta === 1 && file === 7) return;
        if (delta === -1 && file === 0) return;
        const next = index + delta;
        if (next < 0 || next > 63) return;
        shouldFocus.current = true;
        setFocusSquare(next);
        return;
      }

      if (event.key === "Escape" && selected !== null) {
        event.preventDefault();
        setSelected(null);
      }
    },
    [selected]
  );

  const revealSolution = useCallback(() => {
    const fresh = parseFen(puzzle.fen);
    const mating = allLegalMoves(fresh.board, fresh.turn).filter((move) =>
      isCheckmate(applyMove(fresh.board, move), opponent)
    );
    if (mating.length === 0) return;

    if (revertTimer.current) window.clearTimeout(revertTimer.current);
    const move = mating[0];
    setBoard(applyMove(fresh.board, move));
    setLastMove(move);
    setSelected(null);
    setStatus("revealed");
    setMessage(`${toSan(fresh.board, move)} — ${puzzle.pattern.toLowerCase()} mate.`);
  }, [opponent, puzzle.fen, puzzle.pattern]);

  return (
    <section id="chess" className="relative border-t border-line py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHead
          label="04 / Interlude"
          heading="Mate in one."
          aside={puzzle.source}
          className="max-w-4xl"
        />

        {/* Column one is sized to the board exactly. Letting it be a free
            fraction left ~380px of dead air between the board and the copy. */}
        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* ---------------------------------------------------------- board */}
          <Reveal className="mx-auto w-full max-w-[36rem] lg:mx-0">
            <div className="relative">
              <div
                className={`flex aspect-square w-full flex-col overflow-hidden rounded-sm border transition-colors duration-500 ${
                  solved ? "border-signal/60" : "border-line"
                }`}
                role="grid"
                aria-label={`Chess puzzle: ${puzzle.pattern}. ${
                  mover === "w" ? "White" : "Black"
                } to play and mate in one.`}
              >
                {/* A grid needs rows between it and its cells, so the board is
                    eight row elements rather than sixty-four loose squares. */}
                {ranks.map((rank) => (
                  <div
                    key={rank}
                    role="row"
                    aria-rowindex={rank + 1}
                    className="grid flex-1 grid-cols-8"
                  >
                    {board.slice(rank * 8, rank * 8 + 8).map((piece, fileIndex) => {
                  const index = rank * 8 + fileIndex;
                  const light = isLightSquare(index);
                  const isSelected = selected === index;
                  const isTarget = legalTargets.has(index);
                  const isLastFrom = lastMove?.from === index;
                  const isLastTo = lastMove?.to === index;
                  const isChecked = checkedKing === index;
                  const selectable = !frozen && piece?.color === mover;

                  return (
                    <button
                      key={index}
                      ref={(el) => {
                        squareRefs.current[index] = el;
                      }}
                      type="button"
                      role="gridcell"
                      aria-colindex={fileIndex + 1}
                      tabIndex={focusSquare === index ? 0 : -1}
                      onFocus={() => setFocusSquare(index)}
                      onClick={() => handleSquare(index)}
                      onKeyDown={(e) => onKeyDown(e, index)}
                      aria-label={`${squareName(index)}${
                        piece ? `, ${describePiece(piece)}` : ", empty"
                      }${isTarget ? ", legal move" : ""}`}
                      aria-selected={isSelected}
                      disabled={frozen && !piece}
                      className={[
                        "group relative flex items-center justify-center transition-colors duration-200",
                        light ? "bg-[#1d232c]" : "bg-[#11151b]",
                        isLastFrom || isLastTo ? "!bg-[#1d2a26]" : "",
                        isSelected ? "!bg-signal/20" : "",
                        isChecked ? "!bg-[#3a1d1d]" : "",
                        selectable ? "cursor-pointer" : "",
                        frozen ? "" : "hover:brightness-125",
                      ].join(" ")}
                    >
                      {/* file/rank guides along the two outer edges */}
                      {fileOf(index) === 0 ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-[3px] top-[2px] font-mono text-[8px] text-dim sm:text-[9px]"
                        >
                          {8 - rankIndexOf(index)}
                        </span>
                      ) : null}
                      {rankIndexOf(index) === 7 ? (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-[1px] right-[3px] font-mono text-[8px] text-dim sm:text-[9px]"
                        >
                          {FILE_LABELS[fileOf(index)]}
                        </span>
                      ) : null}

                      {piece ? (
                        <span
                          aria-hidden="true"
                          /* The two sides differ by FILL, not by outline. A
                             near-black piece on a near-black board has to be
                             outlined to be seen at all, and an outlined dark
                             piece reads lighter than the solid white one —
                             exactly backwards. Mid-slate sits clearly below
                             the bone white and clearly above the squares, and
                             both sides share a dark rim to stay crisp. */
                          className={`chess-glyph select-none text-[7.6vw] transition-transform duration-200 sm:text-[clamp(1.8rem,3.7vw,3rem)] ${
                            piece.color === "w"
                              ? "text-[#f7f4ee] [-webkit-text-stroke:1px_rgba(8,9,11,0.55)] [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]"
                              : "text-[#6d7686] [-webkit-text-stroke:1px_rgba(8,9,11,0.8)] [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]"
                          } ${isSelected ? "scale-110" : ""}`}
                        >
                          {GLYPH[piece.type]}
                        </span>
                      ) : null}

                      {isTarget ? (
                        <span
                          aria-hidden="true"
                          className={
                            piece
                              ? "absolute inset-1 rounded-full border-2 border-signal/70"
                              : "absolute h-[18%] w-[18%] rounded-full bg-signal/70"
                          }
                        />
                      ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {solved ? (
                <div className="pointer-events-none absolute -inset-2 rounded-md border border-signal/25" />
              ) : null}
            </div>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
              Click a piece, then a square · arrow keys to move focus, enter to select
            </p>
          </Reveal>

          {/* ----------------------------------------------------------- side */}
          <Reveal className="flex max-w-[34rem] flex-col justify-center" delay={0.1}>
            <p className="label">
              Puzzle {puzzleIndex + 1} of {puzzles.length} · {puzzle.pattern}
            </p>

            <p className="mt-5 text-[length:var(--text-lede)] leading-[1.45] text-bone">
              White to play.{" "}
              <span className="editorial text-signal">One move ends it.</span>
            </p>

            <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
              A real move generator sits behind this — legality, pins, checks and
              mate detection all computed in the browser. Illegal moves are not
              offered, and the board decides whether you won by asking whether
              black has a legal reply, not by comparing against a stored answer.
            </p>

            {/* Status is the live region: one place, so nothing double-announces. */}
            <div
              role="status"
              aria-live="polite"
              className="mt-6 min-h-[4.5rem] border-l-2 pl-4 transition-colors duration-300"
              style={{
                borderColor: solved
                  ? "var(--color-signal)"
                  : status === "wrong"
                    ? "#7a3b3b"
                    : "var(--color-line)",
              }}
            >
              {message ? (
                <p
                  className={`font-mono text-sm leading-relaxed ${
                    solved ? "text-signal" : status === "wrong" ? "text-[#d98b8b]" : "text-blueprint"
                  }`}
                >
                  {message}
                </p>
              ) : (
                <p className="font-mono text-sm text-dim">
                  Awaiting your move
                  <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-dim" />
                </p>
              )}

              {showHint && !solved && status !== "revealed" ? (
                <p className="mt-2 text-sm italic text-muted">{puzzle.hint}</p>
              ) : null}

              {attempts >= 2 && !showHint && !solved && status !== "revealed" ? (
                <p className="mt-2 text-xs text-dim">
                  Two tries in. There&rsquo;s a hint below if you want it.
                </p>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                disabled={showHint || solved || status === "revealed"}
                className="inline-flex h-11 items-center rounded-full border border-line px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-blueprint hover:text-blueprint disabled:cursor-not-allowed disabled:border-line/50 disabled:text-dim"
              >
                Hint
              </button>

              <button
                type="button"
                onClick={revealSolution}
                disabled={solved || status === "revealed"}
                className="inline-flex h-11 items-center rounded-full border border-line px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone disabled:cursor-not-allowed disabled:border-line/50 disabled:text-dim"
              >
                Show solution
              </button>

              <button
                type="button"
                onClick={() =>
                  solved || status === "revealed"
                    ? setPuzzleIndex((i) => (i + 1) % puzzles.length)
                    : resetTo(puzzleIndex)
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-bone px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-void transition-colors hover:bg-signal"
              >
                {solved || status === "revealed" ? "Next puzzle" : "Reset"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
