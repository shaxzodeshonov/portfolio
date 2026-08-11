/**
 * Engine verification. Run with:  npm run verify:chess
 *
 * Checks the move generator against known positions, then confirms every
 * bundled puzzle really does have a mate in one and that the position isn't
 * already over before you touch it.
 */

import {
  allLegalMoves,
  applyMove,
  inCheck,
  isCheckmate,
  isStalemate,
  legalMovesFrom,
  parseFen,
  squareName,
  toSan,
  type Color,
} from "../src/lib/chess/engine.ts";
import { puzzles } from "../src/lib/chess/puzzles.ts";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  const mark = ok ? "[32mPASS[0m" : "[31mFAIL[0m";
  console.log(`  ${mark}  ${label}`);
  if (!ok) console.log(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function squareIndex(name: string): number {
  const file = "abcdefgh".indexOf(name[0]);
  const rankIndex = 8 - Number(name[1]);
  return rankIndex * 8 + file;
}

/** Total legal moves at depth 1 — the standard smoke test for a generator. */
function countMoves(fen: string): number {
  const { board, turn } = parseFen(fen);
  return allLegalMoves(board, turn).length;
}

console.log("\nCoordinates");
check("index 0 is a8", squareName(0), "a8");
check("index 63 is h1", squareName(63), "h1");
check("index 28 is e5", squareName(28), "e5");

console.log("\nMove generation");
// The starting position has 20 legal moves. Castling is not generated, and
// none is legal here anyway, so the count is unaffected.
check(
  "start position has 20 moves",
  countMoves("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
  20
);
check("lone king in the corner has 3 moves", countMoves("7k/8/8/8/8/8/8/K7 w - - 0 1"), 3);
check(
  "knight in the centre has 8 moves",
  legalMovesFrom(parseFen("7k/8/8/4N3/8/8/8/K7 w - - 0 1").board, squareIndex("e5")).length,
  8
);
check(
  "pinned rook may only move along the pin",
  // Black rook e8 pins the white rook on e3 against the white king on e1.
  // Legal: e2, e4, e5, e6, e7, and capturing on e8. Never sideways.
  legalMovesFrom(parseFen("4r2k/8/8/8/8/4R3/8/4K3 w - - 0 1").board, squareIndex("e3")).length,
  6
);
check(
  "a piece that cannot answer check has no moves",
  // White king e1 is in check from h1 along the back rank; the e3 rook can
  // reach neither f1 nor g1 to block, so it is frozen.
  legalMovesFrom(parseFen("4k3/8/8/8/8/4R3/8/4K2r w - - 0 1").board, squareIndex("e3")).length,
  0
);

console.log("\nPromotion");
{
  const { board } = parseFen("8/4P2k/8/8/8/8/8/K7 w - - 0 1");
  const moves = legalMovesFrom(board, squareIndex("e7"));
  check("pawn on the 7th generates 4 promotions", moves.length, 4);
  check(
    "promotion pieces are Q R B N",
    moves.map((m) => m.promotion).sort(),
    ["b", "n", "q", "r"]
  );
}

console.log("\nCheck, mate and stalemate");
check(
  "fool's mate is checkmate",
  isCheckmate(
    parseFen("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3").board,
    "w"
  ),
  true
);
check(
  "classic stalemate is stalemate, not mate",
  (() => {
    const { board } = parseFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    return [isStalemate(board, "b"), isCheckmate(board, "b"), inCheck(board, "b")];
  })(),
  [true, false, false]
);

console.log("\nPuzzles");
for (const puzzle of puzzles) {
  const { board, turn } = parseFen(puzzle.fen);
  const them: Color = turn === "w" ? "b" : "w";

  const alreadyOver = isCheckmate(board, them) || inCheck(board, them);
  check(`${puzzle.id}: not already check/mate`, alreadyOver, false);

  const solutions = allLegalMoves(board, turn).filter((move) =>
    isCheckmate(applyMove(board, move), them)
  );

  const ok = solutions.length >= 1;
  if (!ok) failures++;
  console.log(
    `  ${ok ? "[32mPASS[0m" : "[31mFAIL[0m"}  ${puzzle.id}: ` +
      `${solutions.length} mating move(s) — ${solutions.map((m) => toSan(board, m)).join(", ") || "none"}`
  );
}

console.log(
  failures === 0
    ? "\n[32mAll engine checks passed.[0m\n"
    : `\n[31m${failures} check(s) failed.[0m\n`
);

process.exit(failures === 0 ? 0 : 1);
