import { BoardState, Piece } from '../src/types/janggi.ts';
import { createEmptyBoard, getPieceLabel, isKingInCheck, getPseudoLegalMoves } from '../src/utils/janggiEngine.ts';

const p = (side: 'cho' | 'han', type: any, id: string): Piece => ({
  id,
  side,
  type,
  label: getPieceLabel(type, side),
});

const b = createEmptyBoard();
b[9][4] = p('cho', 'king', 'c-k-1');
b[1][4] = p('han', 'king', 'h-k-1');
b[2][4] = p('cho', 'soldier', 'c-s-center');

console.log('Attacks of Cho soldier at (2, 4):', getPseudoLegalMoves(b, 2, 4));
console.log('Is Han king at (1, 4) in check?', isKingInCheck(b, 'han'));
