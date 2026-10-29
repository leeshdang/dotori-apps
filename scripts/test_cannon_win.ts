import { BoardState, Piece } from '../src/types/janggi.ts';
import { createEmptyBoard, getPieceLabel, getLegalMoves, cloneBoard, isKingInCheck } from '../src/utils/janggiEngine.ts';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

const b = createEmptyBoard();
b[9][4] = p('cho', 'king', 'c-k-1');
b[0][4] = p('han', 'king', 'h-k-1');
b[0][3] = p('han', 'guard', 'h-g-1'); // Bridge for horizontal Cannon
b[0][5] = p('han', 'guard', 'h-g-2'); // Blocks right
b[2][4] = p('cho', 'soldier', 'c-s-center'); // Cho soldier controls (1, 4) and serves as bridge for vertical Cannon!
b[5][4] = p('cho', 'cannon', 'c-c-vert'); // Vertical Cannon covering column 4
b[2][0] = p('cho', 'cannon', 'c-c-horiz'); // Ready to move to (0, 0) or (0, 1) to strike

// Cho moves Cannon from (2, 0) up to (0, 0) over a bridge?
// Wait, can Cannon (2, 0) move to (0, 0) if (1, 0) has a bridge?
b[1][0] = p('cho', 'soldier', 'c-s-bridge');

const moves = getLegalMoves(b, 2, 0);
console.log('Cannon (2, 0) moves:', moves);

// Execute move: Cannon jumps over (1, 0) to (0, 0)
b[0][0] = b[2][0];
b[2][0] = null;

// Now on row 0: Cannon at (0, 0) -> bridge (0, 3) Han Guard -> Han King at (0, 4)!
console.log('Han in check after Cannon moves to (0, 0)?', isKingInCheck(b, 'han'));

const hanMoves = [];
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 9; c++) {
    const piece = b[r][c];
    if (piece && piece.side === 'han') {
      hanMoves.push(...getLegalMoves(b, r, c));
    }
  }
}
console.log('Han legal moves remaining:', hanMoves);
