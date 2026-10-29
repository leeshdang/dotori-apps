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
b[0][3] = p('han', 'guard', 'h-g-1');
b[0][5] = p('han', 'guard', 'h-g-2');
b[1][4] = p('han', 'soldier', 'h-s-1'); // Bridge in front of King
b[3][2] = p('cho', 'soldier', 'c-s-1'); // Bridge on row 3
b[3][4] = p('cho', 'cannon', 'c-c-front'); // Front cannon
b[6][4] = p('cho', 'cannon', 'c-c-back');  // Back cannon

// Step 1: Front cannon jumps over (3, 2) to (3, 0)
const cMoves = getLegalMoves(b, 3, 4);
console.log('Front cannon moves:', cMoves.filter(m => m.r === 3));
b[3][0] = b[3][4];
b[3][4] = null;

// Is Han in check from Back Cannon?
console.log('Han in check after Step 1?', isKingInCheck(b, 'han'));

// Han response: Han soldier at (1, 4) steps left to (1, 3) to break the bridge!
const sMoves = getLegalMoves(b, 1, 4);
console.log('Han soldier moves:', sMoves);
b[1][3] = b[1][4];
b[1][4] = null;

console.log('Han in check after Han moves soldier?', isKingInCheck(b, 'han'));

// Step 2: Now Front Cannon at (3, 0) uses (3, 2) to jump to (3, 3)?
// Or Cho Back Cannon at (6, 4) jumps over (9, 4)?
// Or Cho Front Cannon at (3, 0) jumps over (3, 2) to (3, 4) again!
// When Front Cannon returns to (3, 4): with Soldier at (1, 3), inside palace:
// From (3, 3) or (2, 3), diagonal line into (0, 5)!
