import { BoardState, Move, Piece, PieceType, Position, Side, FormationType } from '../types/janggi';

export const PIECE_VALUES: Record<PieceType, number> = {
  chariot: 13,
  cannon: 7,
  horse: 5,
  elephant: 3,
  guard: 3,
  soldier: 2,
  king: 0,
};

export const HAN_KOMI = 1.5;

export function createEmptyBoard(): BoardState {
  const board: BoardState = [];
  for (let r = 0; r < 10; r++) {
    board.push(new Array(9).fill(null));
  }
  return board;
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

export function isInsidePalace(r: number, c: number, side?: Side): boolean {
  if (c < 3 || c > 5) return false;
  if (side === 'han') return r >= 0 && r <= 2;
  if (side === 'cho') return r >= 7 && r <= 9;
  return (r >= 0 && r <= 2) || (r >= 7 && r <= 9);
}

// Palace diagonals
// Han: (0,3)-(2,5) with center (1,4); (0,5)-(2,3) with center (1,4)
// Cho: (7,3)-(9,5) with center (8,4); (7,5)-(9,3) with center (8,4)
export function getPalaceDiagonalNeighbors(r: number, c: number): Position[] {
  // Center positions
  if (r === 1 && c === 4) {
    return [
      { r: 0, c: 3 },
      { r: 0, c: 5 },
      { r: 2, c: 3 },
      { r: 2, c: 5 },
    ];
  }
  if (r === 8 && c === 4) {
    return [
      { r: 7, c: 3 },
      { r: 7, c: 5 },
      { r: 9, c: 3 },
      { r: 9, c: 5 },
    ];
  }

  // Han corners
  if (r === 0 && c === 3) return [{ r: 1, c: 4 }];
  if (r === 0 && c === 5) return [{ r: 1, c: 4 }];
  if (r === 2 && c === 3) return [{ r: 1, c: 4 }];
  if (r === 2 && c === 5) return [{ r: 1, c: 4 }];

  // Cho corners
  if (r === 7 && c === 3) return [{ r: 8, c: 4 }];
  if (r === 7 && c === 5) return [{ r: 8, c: 4 }];
  if (r === 9 && c === 3) return [{ r: 8, c: 4 }];
  if (r === 9 && c === 5) return [{ r: 8, c: 4 }];

  return [];
}

export function getPieceLabel(type: PieceType, side: Side): string {
  switch (type) {
    case 'king':
      return side === 'cho' ? '楚' : '漢';
    case 'guard':
      return '士';
    case 'chariot':
      return '車';
    case 'cannon':
      return '包';
    case 'horse':
      return '馬';
    case 'elephant':
      return '象';
    case 'soldier':
      return side === 'cho' ? '卒' : '兵';
  }
}

export function getInitialBoard(
  choFormation: FormationType = 'gwima',
  hanFormation: FormationType = 'gwima'
): BoardState {
  const b = createEmptyBoard();

  let idCounter = 1;
  const p = (side: Side, type: PieceType): Piece => ({
    id: `${side}-${type}-${idCounter++}`,
    side,
    type,
    label: getPieceLabel(type, side),
  });

  // Helper for formation slots [col 1, 2, 6, 7]
  // 'gwima' (귀마): 마, 상, 상, 마
  // 'wonangma' (원앙마): 마, 상, 마, 상
  // 'yanggwima' (양귀마): 상, 마, 마, 상
  // 'matsang' (맞상): 상, 마, 상, 마
  const getFormationPattern = (f: FormationType): PieceType[] => {
    switch (f) {
      case 'gwima':
        return ['horse', 'elephant', 'elephant', 'horse'];
      case 'wonangma':
        return ['horse', 'elephant', 'horse', 'elephant'];
      case 'yanggwima':
        return ['elephant', 'horse', 'horse', 'elephant'];
      case 'matsang':
        return ['elephant', 'horse', 'elephant', 'horse'];
    }
  };

  // Han Setup (Top, Red)
  const hanP = getFormationPattern(hanFormation);
  b[0][0] = p('han', 'chariot');
  b[0][1] = p('han', hanP[0]);
  b[0][2] = p('han', hanP[1]);
  b[0][3] = p('han', 'guard');
  b[0][5] = p('han', 'guard');
  b[0][6] = p('han', hanP[2]);
  b[0][7] = p('han', hanP[3]);
  b[0][8] = p('han', 'chariot');
  b[1][4] = p('han', 'king');
  b[2][1] = p('han', 'cannon');
  b[2][7] = p('han', 'cannon');
  for (let c = 0; c < 9; c += 2) {
    b[3][c] = p('han', 'soldier');
  }

  // Cho Setup (Bottom, Blue/Green)
  const choP = getFormationPattern(choFormation);
  b[9][0] = p('cho', 'chariot');
  b[9][1] = p('cho', choP[0]);
  b[9][2] = p('cho', choP[1]);
  b[9][3] = p('cho', 'guard');
  b[9][5] = p('cho', 'guard');
  b[9][6] = p('cho', choP[2]);
  b[9][7] = p('cho', choP[3]);
  b[9][8] = p('cho', 'chariot');
  b[8][4] = p('cho', 'king');
  b[7][1] = p('cho', 'cannon');
  b[7][7] = p('cho', 'cannon');
  for (let c = 0; c < 9; c += 2) {
    b[6][c] = p('cho', 'soldier');
  }

  return b;
}

// Pseudo-legal moves for a piece at (r, c)
export function getPseudoLegalMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: Position[] = [];
  const side = piece.side;

  const isOpponentOrEmpty = (nr: number, nc: number) => {
    if (nr < 0 || nr >= 10 || nc < 0 || nc >= 9) return false;
    const dest = board[nr][nc];
    return !dest || dest.side !== side;
  };

  switch (piece.type) {
    case 'king':
    case 'guard': {
      // Must stay in own palace
      const deltas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInsidePalace(nr, nc, side) && isOpponentOrEmpty(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      }
      // Palace diagonal steps
      const diagNeighbors = getPalaceDiagonalNeighbors(r, c);
      for (const pos of diagNeighbors) {
        if (isInsidePalace(pos.r, pos.c, side) && isOpponentOrEmpty(pos.r, pos.c)) {
          moves.push(pos);
        }
      }
      break;
    }

    case 'soldier': {
      // Cho moves forward (up: -1), left, right
      // Han moves forward (down: +1), left, right
      const fwd = side === 'cho' ? -1 : 1;
      const candidates = [
        { r: r + fwd, c },
        { r, c: c - 1 },
        { r, c: c + 1 },
      ];

      for (const pos of candidates) {
        if (isOpponentOrEmpty(pos.r, pos.c)) {
          moves.push(pos);
        }
      }

      // Inside opponent palace diagonal forward steps
      const oppPalaceSide: Side = side === 'cho' ? 'han' : 'cho';
      if (isInsidePalace(r, c, oppPalaceSide)) {
        const diagNeighbors = getPalaceDiagonalNeighbors(r, c);
        for (const pos of diagNeighbors) {
          // Only forward or across center in opponent palace
          if (side === 'cho' && pos.r < r) {
            if (isOpponentOrEmpty(pos.r, pos.c)) moves.push(pos);
          } else if (side === 'han' && pos.r > r) {
            if (isOpponentOrEmpty(pos.r, pos.c)) moves.push(pos);
          }
        }
      }
      break;
    }

    case 'chariot': {
      // 4 orthogonal rays
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
          const dest = board[nr][nc];
          if (!dest) {
            moves.push({ r: nr, c: nc });
          } else {
            if (dest.side !== side) moves.push({ r: nr, c: nc });
            break;
          }
          nr += dr;
          nc += dc;
        }
      }

      // Palace diagonal sliding
      // Check if chariot is in a palace (either Han or Cho)
      const checkPalaceDiagonals = (palaceSide: Side) => {
        if (isInsidePalace(r, c, palaceSide)) {
          const center = palaceSide === 'han' ? { r: 1, c: 4 } : { r: 8, c: 4 };
          // If at center, can slide to all 4 corners
          if (r === center.r && c === center.c) {
            const corners = getPalaceDiagonalNeighbors(r, c);
            for (const cr of corners) {
              if (isOpponentOrEmpty(cr.r, cr.c)) moves.push(cr);
            }
          } else {
            // At a corner
            const diagList = getPalaceDiagonalNeighbors(r, c);
            if (diagList.length > 0 && diagList[0].r === center.r && diagList[0].c === center.c) {
              // Can move to center
              const centerPiece = board[center.r][center.c];
              if (!centerPiece) {
                moves.push(center);
                // Can also continue through center to opposite corner
                const oppR = center.r + (center.r - r);
                const oppC = center.c + (center.c - c);
                if (isOpponentOrEmpty(oppR, oppC)) {
                  moves.push({ r: oppR, c: oppC });
                }
              } else if (centerPiece.side !== side) {
                moves.push(center);
              }
            }
          }
        }
      };

      checkPalaceDiagonals('han');
      checkPalaceDiagonals('cho');
      break;
    }

    case 'cannon': {
      // 4 orthogonal rays: MUST jump over exactly 1 piece (not a cannon), cannot capture a cannon
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        let jumped = false;

        while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
          const dest = board[nr][nc];
          if (!jumped) {
            if (dest) {
              if (dest.type === 'cannon') {
                // Cannot jump over a cannon!
                break;
              }
              jumped = true; // Screen found!
            }
          } else {
            // Already jumped over 1 screen
            if (!dest) {
              moves.push({ r: nr, c: nc });
            } else {
              // Found landing piece
              if (dest.side !== side && dest.type !== 'cannon') {
                moves.push({ r: nr, c: nc });
              }
              break; // Cannon can only jump 1 piece
            }
          }
          nr += dr;
          nc += dc;
        }
      }

      // Palace diagonal jump
      const checkPalaceCannon = (palaceSide: Side) => {
        if (isInsidePalace(r, c, palaceSide)) {
          const center = palaceSide === 'han' ? { r: 1, c: 4 } : { r: 8, c: 4 };
          // If at a corner, and center has a piece (not cannon), can jump to opposite corner
          const diagList = getPalaceDiagonalNeighbors(r, c);
          if (diagList.length > 0 && diagList[0].r === center.r && diagList[0].c === center.c) {
            const centerPiece = board[center.r][center.c];
            if (centerPiece && centerPiece.type !== 'cannon') {
              const oppR = center.r + (center.r - r);
              const oppC = center.c + (center.c - c);
              const oppPiece = board[oppR][oppC];
              if (!oppPiece || (oppPiece.side !== side && oppPiece.type !== 'cannon')) {
                moves.push({ r: oppR, c: oppC });
              }
            }
          }
        }
      };

      checkPalaceCannon('han');
      checkPalaceCannon('cho');
      break;
    }

    case 'horse': {
      // 8 L-steps. 1 orthogonal + 1 diagonal outward.
      // Orthogonal step must be empty (멱)
      const horseDirs = [
        { ortho: [-1, 0], diags: [[-2, -1], [-2, 1]] }, // Up
        { ortho: [1, 0], diags: [[2, -1], [2, 1]] },     // Down
        { ortho: [0, -1], diags: [[-1, -2], [1, -2]] }, // Left
        { ortho: [0, 1], diags: [[-1, 2], [1, 2]] },     // Right
      ];

      for (const h of horseDirs) {
        const mr = r + h.ortho[0];
        const mc = c + h.ortho[1];
        if (mr >= 0 && mr < 10 && mc >= 0 && mc < 9 && !board[mr][mc]) {
          // Orthogonal step is empty (멱 안 막힘)
          for (const d of h.diags) {
            const dr = r + d[0];
            const dc = c + d[1];
            if (isOpponentOrEmpty(dr, dc)) {
              moves.push({ r: dr, c: dc });
            }
          }
        }
      }
      break;
    }

    case 'elephant': {
      // 8 directions. 1 orthogonal + 2 diagonal outward (用 shape).
      // Both the orthogonal step and the 1st diagonal step must be empty!
      const elephantDirs = [
        // Up
        {
          step1: [-1, 0],
          branches: [
            { step2: [-2, -1], dest: [-3, -2] },
            { step2: [-2, 1], dest: [-3, 2] },
          ],
        },
        // Down
        {
          step1: [1, 0],
          branches: [
            { step2: [2, -1], dest: [3, -2] },
            { step2: [2, 1], dest: [3, 2] },
          ],
        },
        // Left
        {
          step1: [0, -1],
          branches: [
            { step2: [-1, -2], dest: [-2, -3] },
            { step2: [1, -2], dest: [2, -3] },
          ],
        },
        // Right
        {
          step1: [0, 1],
          branches: [
            { step2: [-1, 2], dest: [-2, 3] },
            { step2: [1, 2], dest: [2, 3] },
          ],
        },
      ];

      for (const e of elephantDirs) {
        const s1r = r + e.step1[0];
        const s1c = c + e.step1[1];
        if (s1r >= 0 && s1r < 10 && s1c >= 0 && s1c < 9 && !board[s1r][s1c]) {
          // 1st step empty
          for (const br of e.branches) {
            const s2r = r + br.step2[0];
            const s2c = c + br.step2[1];
            if (s2r >= 0 && s2r < 10 && s2c >= 0 && s2c < 9 && !board[s2r][s2c]) {
              // 2nd step empty
              const dr = r + br.dest[0];
              const dc = c + br.dest[1];
              if (isOpponentOrEmpty(dr, dc)) {
                moves.push({ r: dr, c: dc });
              }
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

export function findKing(board: BoardState, side: Side): Position | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.side === side) {
        return { r, c };
      }
    }
  }
  return null;
}

// Check if King of given side is currently under check (장군)
export function isKingInCheck(board: BoardState, side: Side): boolean {
  const kingPos = findKing(board, side);
  if (!kingPos) return true; // Captured / lost

  const oppSide: Side = side === 'cho' ? 'han' : 'cho';

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.side === oppSide) {
        const attacks = getPseudoLegalMoves(board, r, c);
        if (attacks.some((a) => a.r === kingPos.r && a.c === kingPos.c)) {
          return true;
        }
      }
    }
  }

  return false;
}

// Get fully legal moves (moves that do not leave own King in check)
export function getLegalMoves(board: BoardState, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudo = getPseudoLegalMoves(board, r, c);
  const legal: Position[] = [];

  for (const to of pseudo) {
    // Simulate move
    const captured = board[to.r][to.c];
    board[to.r][to.c] = piece;
    board[r][c] = null;

    const inCheck = isKingInCheck(board, piece.side);

    // Revert
    board[r][c] = piece;
    board[to.r][to.c] = captured;

    if (!inCheck) {
      legal.push(to);
    }
  }

  return legal;
}

// Get all legal moves for a player
export function getAllLegalMoves(board: BoardState, side: Side): Move[] {
  const allMoves: Move[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.side === side) {
        const targets = getLegalMoves(board, r, c);
        for (const to of targets) {
          allMoves.push({
            from: { r, c },
            to,
            piece,
            captured: board[to.r][to.c],
          });
        }
      }
    }
  }
  return allMoves;
}

// Calculate total material score
export function calculateScores(board: BoardState): { cho: number; han: number } {
  let cho = 0;
  let han = HAN_KOMI; // Han gets 1.5 komi

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p) {
        const val = PIECE_VALUES[p.type];
        if (p.side === 'cho') cho += val;
        else han += val;
      }
    }
  }

  return { cho: Math.round(cho * 10) / 10, han: Math.round(han * 10) / 10 };
}

// Generate traditional Korean Janggi notation (e.g. 72車92, 13馬25)
export function generateNotation(move: Move): string {
  const pieceName = move.piece.label;
  const fromStr = `${move.from.c + 1}${10 - move.from.r}`;
  const toStr = `${move.to.c + 1}${10 - move.to.r}`;
  const cap = move.captured ? 'x' : '';
  return `${fromStr}${pieceName}${cap}${toStr}`;
}
