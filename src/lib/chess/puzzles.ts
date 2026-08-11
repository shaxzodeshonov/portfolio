/**
 * Three mate-in-one positions, each a different classical pattern.
 *
 * Nothing here hard-codes the answer. The board component asks the engine
 * whether the move you played is checkmate, so any legal mating move is
 * accepted and the "reveal" button derives the solution by search.
 *
 * All three are reachable without castling or en passant, which is what makes
 * the trimmed-down engine safe to referee them.
 */

export interface Puzzle {
  id: string;
  /** Side to move is always the one solving. */
  fen: string;
  pattern: string;
  hint: string;
  source: string;
}

export const puzzles: Puzzle[] = [
  {
    id: "back-rank",
    fen: "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    pattern: "Back rank",
    hint: "The pawns in front of the king are not protecting it. They are trapping it.",
    source: "The first mate everybody loses to",
  },
  {
    id: "scholars",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    pattern: "Contact mate",
    hint: "One square is defended only by the king, and you have two pieces aimed at it.",
    source: "Scholar's mate, move four",
  },
  {
    id: "smothered",
    fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
    pattern: "Smothered",
    hint: "Every escape square is already occupied — by black's own pieces.",
    source: "The knight's private joke",
  },
];
