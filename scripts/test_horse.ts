import { BoardState, Piece, Quest, TacticPuzzle } from '../src/types/janggi.ts';
import { createEmptyBoard, getPieceLabel, getLegalMoves, cloneBoard, isKingInCheck } from '../src/utils/janggiEngine.ts';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

// Test Double Check (양수겸장)
// Cho Chariot at (0, 0)
// Cho Horse at (2, 2)
// Han King at (0, 4)
// Han Guard at (0, 3) -> blocks Chariot (0, 0) from checking King (0, 4) directly!
// But if Guard is at (0, 5), and row 0 is open from (0, 0) to (0, 4)...
// Wait: Discovered Check:
// Cho Chariot at (0, 0).
// Cho Horse at (0, 2) (sitting right on row 0, masking Chariot!).
// When Horse jumps from (0, 2):
// Orthogonal step: (1, 2) (down, empty).
// Diagonal step: (2, 3) (diag down-right).
// From (2, 3), Horse attacks (0, 4)? No.
// Let's check Horse moves from (0, 2):
// Orthogonal right: (0, 3) (empty). Diag up-right is off-board. Diag down-right is (1, 4).
// From (1, 4), Horse attacks:
// 1 step up (0, 4)? No, horse does 1 orthogonal + 1 diagonal!
// In Janggi, Horse from (1, 2):
// 1 step right to (1, 3) (empty), 1 step diag up-right to (0, 4)! YES! Horse at (1, 2) checks King at (0, 4)!
// Where does Horse come from to land on (1, 2)?
// From (3, 1): 1 step up to (2, 1) (empty), 1 step diag up-right to (1, 2)!
// What if Cho Chariot was at (3, 0)?
// Or what if Cho Cannon is the discovered check?
// Let's test a board:
const b = createEmptyBoard();
b[9][4] = p('cho', 'king', 'c-k-1');
b[0][4] = p('han', 'king', 'h-k-1');
b[0][3] = p('han', 'guard', 'h-g-1');
b[0][5] = p('han', 'guard', 'h-g-2');
b[2][4] = p('cho', 'horse', 'c-h-1'); // Blocks column 4
b[5][4] = p('cho', 'chariot', 'c-r-1'); // Chariot on column 4
// Let's see what legal moves Cho Horse at (2, 4) has:
// Execute move from (2, 4) to (1, 2)
b[1][2] = b[2][4];
b[2][4] = null;

const inCheck = isKingInCheck(b, 'han');
const hanLegalMoves = [];
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 9; c++) {
    const piece = b[r][c];
    if (piece && piece.side === 'han') {
      hanLegalMoves.push(...getLegalMoves(b, r, c));
    }
  }
}

console.log('Han in check?', inCheck);
console.log('Han legal moves remaining:', hanLegalMoves.length);

