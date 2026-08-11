/**
 * A small, correct chess move generator.
 *
 * Scope: everything needed to referee a mate-in-one puzzle honestly — sliding
 * pieces, pawn pushes and captures, promotion, and full legality filtering
 * (you may not leave your own king in check). Castling and en passant are
 * deliberately absent; the bundled puzzles never need them, and the positions
 * are chosen so their absence cannot change the result.
 *
 * Board layout: a flat 64-entry array. Index 0 is a8, index 63 is h1 — the
 * same order FEN is written in, so parsing is a straight walk.
 */

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface Piece {
  type: PieceType;
  color: Color;
}

export type Board = (Piece | null)[];

export interface Move {
  from: number;
  to: number;
  promotion?: PieceType;
}

const FILES = "abcdefgh";

type Vec = readonly [number, number]; // [fileDelta, rankIndexDelta]

const KNIGHT_VECS: readonly Vec[] = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2],
];

const KING_VECS: readonly Vec[] = [
  [0, 1], [1, 1], [1, 0], [1, -1],
  [0, -1], [-1, -1], [-1, 0], [-1, 1],
];

const ROOK_VECS: readonly Vec[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP_VECS: readonly Vec[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

/* -------------------------------------------------------------------------
   Coordinates
   ------------------------------------------------------------------------- */

export const fileOf = (i: number) => i % 8;
/** 0 is rank 8, 7 is rank 1 — matches the array order, not chess notation. */
export const rankIndexOf = (i: number) => (i / 8) | 0;
const at = (file: number, rankIndex: number) => rankIndex * 8 + file;
const onBoard = (file: number, rankIndex: number) =>
  file >= 0 && file < 8 && rankIndex >= 0 && rankIndex < 8;

export function squareName(i: number): string {
  return `${FILES[fileOf(i)]}${8 - rankIndexOf(i)}`;
}

/** Light square when file and rank indices share parity. */
export const isLightSquare = (i: number) =>
  (fileOf(i) + rankIndexOf(i)) % 2 === 0;

const opposite = (c: Color): Color => (c === "w" ? "b" : "w");

/* -------------------------------------------------------------------------
   FEN
   ------------------------------------------------------------------------- */

export function parseFen(fen: string): { board: Board; turn: Color } {
  const [placement, turnField = "w"] = fen.trim().split(/\s+/);
  const board: Board = new Array(64).fill(null);

  let index = 0;
  for (const ch of placement) {
    if (ch === "/") continue;
    if (ch >= "1" && ch <= "8") {
      index += Number(ch);
      continue;
    }
    const color: Color = ch === ch.toUpperCase() ? "w" : "b";
    board[index] = { type: ch.toLowerCase() as PieceType, color };
    index++;
  }

  if (index !== 64) {
    throw new Error(`Invalid FEN placement, described ${index} squares: ${fen}`);
  }

  return { board, turn: turnField === "b" ? "b" : "w" };
}

/* -------------------------------------------------------------------------
   Attack detection
   ------------------------------------------------------------------------- */

/** Would a piece of `by` standing anywhere on the board capture `target`? */
export function isAttacked(board: Board, target: number, by: Color): boolean {
  const tf = fileOf(target);
  const tr = rankIndexOf(target);

  // Pawns. A white pawn sits one rank *below* (higher rank index) what it
  // attacks; a black pawn sits one rank above.
  const pawnRank = by === "w" ? tr + 1 : tr - 1;
  for (const df of [-1, 1]) {
    const f = tf + df;
    if (!onBoard(f, pawnRank)) continue;
    const p = board[at(f, pawnRank)];
    if (p && p.color === by && p.type === "p") return true;
  }

  for (const [df, dr] of KNIGHT_VECS) {
    const f = tf + df;
    const r = tr + dr;
    if (!onBoard(f, r)) continue;
    const p = board[at(f, r)];
    if (p && p.color === by && p.type === "n") return true;
  }

  for (const [df, dr] of KING_VECS) {
    const f = tf + df;
    const r = tr + dr;
    if (!onBoard(f, r)) continue;
    const p = board[at(f, r)];
    if (p && p.color === by && p.type === "k") return true;
  }

  const rays: [readonly Vec[], PieceType][] = [
    [ROOK_VECS, "r"],
    [BISHOP_VECS, "b"],
  ];

  for (const [vecs, sliderType] of rays) {
    for (const [df, dr] of vecs) {
      let f = tf + df;
      let r = tr + dr;
      while (onBoard(f, r)) {
        const p = board[at(f, r)];
        if (p) {
          if (p.color === by && (p.type === sliderType || p.type === "q")) {
            return true;
          }
          break; // Blocked — nothing further along this ray can reach.
        }
        f += df;
        r += dr;
      }
    }
  }

  return false;
}

export function findKing(board: Board, color: Color): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === "k" && p.color === color) return i;
  }
  return -1;
}

export function inCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  return king >= 0 && isAttacked(board, king, opposite(color));
}

/* -------------------------------------------------------------------------
   Move generation
   ------------------------------------------------------------------------- */

const PROMOTION_PIECES: PieceType[] = ["q", "r", "b", "n"];

function pseudoMovesFrom(board: Board, from: number): Move[] {
  const piece = board[from];
  if (!piece) return [];

  const moves: Move[] = [];
  const f = fileOf(from);
  const r = rankIndexOf(from);

  const push = (file: number, rankIndex: number) => {
    if (!onBoard(file, rankIndex)) return;
    const to = at(file, rankIndex);
    const occupant = board[to];
    if (occupant && occupant.color === piece.color) return;
    moves.push({ from, to });
  };

  const slide = (vecs: readonly Vec[]) => {
    for (const [df, dr] of vecs) {
      let file = f + df;
      let rank = r + dr;
      while (onBoard(file, rank)) {
        const to = at(file, rank);
        const occupant = board[to];
        if (occupant) {
          if (occupant.color !== piece.color) moves.push({ from, to });
          break;
        }
        moves.push({ from, to });
        file += df;
        rank += dr;
      }
    }
  };

  switch (piece.type) {
    case "p": {
      const dir = piece.color === "w" ? -1 : 1;
      const startRank = piece.color === "w" ? 6 : 1;
      const lastRank = piece.color === "w" ? 0 : 7;

      const oneAhead = r + dir;
      if (onBoard(f, oneAhead) && !board[at(f, oneAhead)]) {
        if (oneAhead === lastRank) {
          for (const promotion of PROMOTION_PIECES) {
            moves.push({ from, to: at(f, oneAhead), promotion });
          }
        } else {
          moves.push({ from, to: at(f, oneAhead) });
        }

        const twoAhead = r + dir * 2;
        if (r === startRank && onBoard(f, twoAhead) && !board[at(f, twoAhead)]) {
          moves.push({ from, to: at(f, twoAhead) });
        }
      }

      for (const df of [-1, 1]) {
        const file = f + df;
        if (!onBoard(file, oneAhead)) continue;
        const to = at(file, oneAhead);
        const occupant = board[to];
        if (!occupant || occupant.color === piece.color) continue;
        if (oneAhead === lastRank) {
          for (const promotion of PROMOTION_PIECES) moves.push({ from, to, promotion });
        } else {
          moves.push({ from, to });
        }
      }
      break;
    }
    case "n":
      for (const [df, dr] of KNIGHT_VECS) push(f + df, r + dr);
      break;
    case "k":
      for (const [df, dr] of KING_VECS) push(f + df, r + dr);
      break;
    case "b":
      slide(BISHOP_VECS);
      break;
    case "r":
      slide(ROOK_VECS);
      break;
    case "q":
      slide(BISHOP_VECS);
      slide(ROOK_VECS);
      break;
  }

  return moves;
}

export function applyMove(board: Board, move: Move): Board {
  const next = board.slice();
  const piece = next[move.from];
  if (!piece) return next;

  next[move.from] = null;
  next[move.to] = move.promotion
    ? { type: move.promotion, color: piece.color }
    : piece;

  return next;
}

/** Pseudo-legal moves minus any that leave the mover's own king in check. */
export function legalMovesFrom(board: Board, from: number): Move[] {
  const piece = board[from];
  if (!piece) return [];
  return pseudoMovesFrom(board, from).filter(
    (move) => !inCheck(applyMove(board, move), piece.color)
  );
}

export function allLegalMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece && piece.color === color) moves.push(...legalMovesFrom(board, i));
  }
  return moves;
}

export function isCheckmate(board: Board, color: Color): boolean {
  return inCheck(board, color) && allLegalMoves(board, color).length === 0;
}

export function isStalemate(board: Board, color: Color): boolean {
  return !inCheck(board, color) && allLegalMoves(board, color).length === 0;
}

/* -------------------------------------------------------------------------
   Notation
   ------------------------------------------------------------------------- */

const SAN_LETTER: Record<PieceType, string> = {
  p: "",
  n: "N",
  b: "B",
  r: "R",
  q: "Q",
  k: "K",
};

/**
 * Standard algebraic notation for a move in the given position, including
 * the disambiguation file/rank when two identical pieces could both reach the
 * target square. Castling is not represented because it is not generated.
 */
export function toSan(board: Board, move: Move): string {
  const piece = board[move.from];
  if (!piece) return "";

  const captured = Boolean(board[move.to]);
  const target = squareName(move.to);
  let notation = "";

  if (piece.type === "p") {
    notation = captured ? `${FILES[fileOf(move.from)]}x${target}` : target;
  } else {
    const rivals = [];
    for (let i = 0; i < 64; i++) {
      if (i === move.from) continue;
      const other = board[i];
      if (!other || other.color !== piece.color || other.type !== piece.type) continue;
      if (legalMovesFrom(board, i).some((m) => m.to === move.to)) rivals.push(i);
    }

    let disambiguator = "";
    if (rivals.length > 0) {
      const sameFile = rivals.some((i) => fileOf(i) === fileOf(move.from));
      const sameRank = rivals.some((i) => rankIndexOf(i) === rankIndexOf(move.from));
      if (!sameFile) disambiguator = FILES[fileOf(move.from)];
      else if (!sameRank) disambiguator = String(8 - rankIndexOf(move.from));
      else disambiguator = squareName(move.from);
    }

    notation = `${SAN_LETTER[piece.type]}${disambiguator}${captured ? "x" : ""}${target}`;
  }

  if (move.promotion) notation += `=${SAN_LETTER[move.promotion]}`;

  const after = applyMove(board, move);
  const them = opposite(piece.color);
  if (isCheckmate(after, them)) notation += "#";
  else if (inCheck(after, them)) notation += "+";

  return notation;
}

/* -------------------------------------------------------------------------
   Display
   ------------------------------------------------------------------------- */

/**
 * Solid Unicode glyphs for both sides. Using the "black" set for white too
 * and colouring it in CSS keeps the two sides optically identical in weight —
 * the outline glyphs render far too light on a dark board.
 */
export const GLYPH: Record<PieceType, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const PIECE_NAME: Record<PieceType, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export function describePiece(piece: Piece): string {
  return `${piece.color === "w" ? "White" : "Black"} ${PIECE_NAME[piece.type]}`;
}
