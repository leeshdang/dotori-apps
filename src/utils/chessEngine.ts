import {
  BoardState,
  CastlingRights,
  ChessPiece,
  GameState,
  Language,
  Move,
  PieceColor,
  PieceType,
  Position,
} from '../types/chess';

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables for positional evaluation (from White's perspective, row 0 = rank 8, row 7 = rank 1)
const PST_PAWN = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PST_KNIGHT = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const PST_BISHOP = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const PST_ROOK = [
  [0, 0, 0, 5, 5, 0, 0, 0],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PST_QUEEN = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const PST_KING_MIDDLE = [
  [20, 30, 10, 0, 0, 10, 30, 20],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
];

export function isWithinBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function posToAlgebraic(pos: Position): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const rank = 8 - pos.row;
  return `${file}${rank}`;
}

export function algebraicToPos(alg: string): Position {
  const col = alg.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(alg[1], 10);
  return { row, col };
}

export function createPiece(type: PieceType, color: PieceColor, idSuffix?: string): ChessPiece {
  return {
    id: `${color}_${type}_${idSuffix || Math.random().toString(36).substring(2, 7)}`,
    type,
    color,
    hasMoved: false,
  };
}

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black major pieces (rank 8 -> row 0)
  board[0][0] = createPiece('r', 'b', 'r1');
  board[0][1] = createPiece('n', 'b', 'n1');
  board[0][2] = createPiece('b', 'b', 'b1');
  board[0][3] = createPiece('q', 'b', 'q');
  board[0][4] = createPiece('k', 'b', 'k');
  board[0][5] = createPiece('b', 'b', 'b2');
  board[0][6] = createPiece('n', 'b', 'n2');
  board[0][7] = createPiece('r', 'b', 'r2');

  // Black pawns (rank 7 -> row 1)
  for (let c = 0; c < 8; c++) {
    board[1][c] = createPiece('p', 'b', `p${c}`);
  }

  // White pawns (rank 2 -> row 6)
  for (let c = 0; c < 8; c++) {
    board[6][c] = createPiece('p', 'w', `p${c}`);
  }

  // White major pieces (rank 1 -> row 7)
  board[7][0] = createPiece('r', 'w', 'r1');
  board[7][1] = createPiece('n', 'w', 'n1');
  board[7][2] = createPiece('b', 'w', 'b1');
  board[7][3] = createPiece('q', 'w', 'q');
  board[7][4] = createPiece('k', 'w', 'k');
  board[7][5] = createPiece('b', 'w', 'b2');
  board[7][6] = createPiece('n', 'w', 'n2');
  board[7][7] = createPiece('r', 'w', 'r2');

  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'w',
    castlingRights: {
      w: { kingside: true, queenside: true },
      b: { kingside: true, queenside: true },
    },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    winner: null,
    moveHistory: [],
    capturedWhite: [],
    capturedBlack: [],
  };
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function findKing(board: BoardState, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isSquareAttacked(board: BoardState, pos: Position, byColor: PieceColor): boolean {
  // 1. Attacked by pawns
  const pawnDir = byColor === 'w' ? 1 : -1; // White pawn attacks towards row - 1, so attacker is at pos.row + 1
  const attackerRow = pos.row + pawnDir;
  if (attackerRow >= 0 && attackerRow < 8) {
    for (const dCol of [-1, 1]) {
      const attackerCol = pos.col + dCol;
      if (attackerCol >= 0 && attackerCol < 8) {
        const p = board[attackerRow][attackerCol];
        if (p && p.type === 'p' && p.color === byColor) return true;
      }
    }
  }

  // 2. Attacked by knights
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightDeltas) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (isWithinBoard(r, c)) {
      const p = board[r][c];
      if (p && p.type === 'n' && p.color === byColor) return true;
    }
  }

  // 3. Attacked by King (1 step)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (isWithinBoard(r, c)) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === byColor) return true;
      }
    }
  }

  // 4. Straight rays (Rooks, Queens)
  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straightDirs) {
    let r = pos.row + dr;
    let c = pos.col + dc;
    while (isWithinBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break; // Blocked
      }
      r += dr;
      c += dc;
    }
  }

  // 5. Diagonal rays (Bishops, Queens)
  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagDirs) {
    let r = pos.row + dr;
    let c = pos.col + dc;
    while (isWithinBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break; // Blocked
      }
      r += dr;
      c += dc;
    }
  }

  return false;
}

export function isKingInCheck(board: BoardState, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingPos, enemyColor);
}

export function getPseudoLegalMoves(
  board: BoardState,
  from: Position,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): Move[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Move[] = [];
  const color = piece.color;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  // --- PAWN ---
  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;

    // 1 step forward
    const nextR = from.row + dir;
    if (isWithinBoard(nextR, from.col) && !board[nextR][from.col]) {
      if (nextR === promoRow) {
        // Promotions
        for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
          moves.push({ from, to: { row: nextR, col: from.col }, piece, promotion: promo });
        }
      } else {
        moves.push({ from, to: { row: nextR, col: from.col }, piece });
        // 2 steps forward from start
        const doubleR = from.row + 2 * dir;
        if (from.row === startRow && !board[doubleR][from.col]) {
          moves.push({ from, to: { row: doubleR, col: from.col }, piece });
        }
      }
    }

    // Diagonal captures
    for (const dCol of [-1, 1]) {
      const capC = from.col + dCol;
      if (isWithinBoard(nextR, capC)) {
        const target = board[nextR][capC];
        if (target && target.color === enemyColor) {
          if (nextR === promoRow) {
            for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
              moves.push({ from, to: { row: nextR, col: capC }, piece, captured: target, promotion: promo });
            }
          } else {
            moves.push({ from, to: { row: nextR, col: capC }, piece, captured: target });
          }
        } else if (
          enPassantTarget &&
          enPassantTarget.row === nextR &&
          enPassantTarget.col === capC
        ) {
          // En Passant
          const epVictim = board[from.row][capC];
          if (epVictim && epVictim.type === 'p' && epVictim.color === enemyColor) {
            moves.push({
              from,
              to: { row: nextR, col: capC },
              piece,
              captured: epVictim,
              isEnPassant: true,
            });
          }
        }
      }
    }
  }

  // --- KNIGHT ---
  else if (piece.type === 'n') {
    const deltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of deltas) {
      const r = from.row + dr;
      const c = from.col + dc;
      if (isWithinBoard(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ from, to: { row: r, col: c }, piece });
        } else if (target.color === enemyColor) {
          moves.push({ from, to: { row: r, col: c }, piece, captured: target });
        }
      }
    }
  }

  // --- BISHOP, ROOK, QUEEN (Sliding Pieces) ---
  else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
    const dirs: number[][] = [];
    if (piece.type === 'b' || piece.type === 'q') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (piece.type === 'r' || piece.type === 'q') {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }

    for (const [dr, dc] of dirs) {
      let r = from.row + dr;
      let c = from.col + dc;
      while (isWithinBoard(r, c)) {
        const target = board[r][c];
        if (!target) {
          moves.push({ from, to: { row: r, col: c }, piece });
        } else {
          if (target.color === enemyColor) {
            moves.push({ from, to: { row: r, col: c }, piece, captured: target });
          }
          break; // Blocked
        }
        r += dr;
        c += dc;
      }
    }
  }

  // --- KING ---
  else if (piece.type === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = from.row + dr;
        const c = from.col + dc;
        if (isWithinBoard(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ from, to: { row: r, col: c }, piece });
          } else if (target.color === enemyColor) {
            moves.push({ from, to: { row: r, col: c }, piece, captured: target });
          }
        }
      }
    }

    // Castling
    const rights = castlingRights[color];
    const r = color === 'w' ? 7 : 0;
    if (from.row === r && from.col === 4) {
      // 1. Kingside (O-O): king from e to g (col 4 -> 6), rook at h (col 7)
      if (rights.kingside && !board[r][5] && !board[r][6]) {
        const rook = board[r][7];
        if (rook && rook.type === 'r' && rook.color === color) {
          // Check that king does not pass through or land on check
          if (
            !isSquareAttacked(board, { row: r, col: 4 }, enemyColor) &&
            !isSquareAttacked(board, { row: r, col: 5 }, enemyColor) &&
            !isSquareAttacked(board, { row: r, col: 6 }, enemyColor)
          ) {
            moves.push({
              from,
              to: { row: r, col: 6 },
              piece,
              isCastling: 'kingside',
            });
          }
        }
      }

      // 2. Queenside (O-O-O): king from e to c (col 4 -> 2), rook at a (col 0)
      if (rights.queenside && !board[r][1] && !board[r][2] && !board[r][3]) {
        const rook = board[r][0];
        if (rook && rook.type === 'r' && rook.color === color) {
          if (
            !isSquareAttacked(board, { row: r, col: 4 }, enemyColor) &&
            !isSquareAttacked(board, { row: r, col: 3 }, enemyColor) &&
            !isSquareAttacked(board, { row: r, col: 2 }, enemyColor)
          ) {
            moves.push({
              from,
              to: { row: r, col: 2 },
              piece,
              isCastling: 'queenside',
            });
          }
        }
      }
    }
  }

  return moves;
}

export function executeMoveOnBoard(board: BoardState, move: Move): BoardState {
  const nextBoard = cloneBoard(board);
  const p = { ...move.piece, hasMoved: true };

  // En Passant
  if (move.isEnPassant) {
    const enemyPawnRow = move.from.row;
    nextBoard[enemyPawnRow][move.to.col] = null;
  }

  // Castling
  if (move.isCastling === 'kingside') {
    const r = move.from.row;
    // Move rook from col 7 to col 5
    const rook = nextBoard[r][7];
    if (rook) {
      nextBoard[r][5] = { ...rook, hasMoved: true };
      nextBoard[r][7] = null;
    }
  } else if (move.isCastling === 'queenside') {
    const r = move.from.row;
    // Move rook from col 0 to col 3
    const rook = nextBoard[r][0];
    if (rook) {
      nextBoard[r][3] = { ...rook, hasMoved: true };
      nextBoard[r][0] = null;
    }
  }

  // Move the piece
  if (move.promotion) {
    nextBoard[move.to.row][move.to.col] = {
      id: `${p.color}_${move.promotion}_${Math.random().toString(36).substring(2, 6)}`,
      type: move.promotion,
      color: p.color,
      hasMoved: true,
    };
  } else {
    nextBoard[move.to.row][move.to.col] = p;
  }
  nextBoard[move.from.row][move.from.col] = null;

  return nextBoard;
}

export function getLegalMovesForPosition(gameState: GameState, pos: Position): Move[] {
  const piece = gameState.board[pos.row][pos.col];
  if (!piece || piece.color !== gameState.turn) return [];

  const pseudoMoves = getPseudoLegalMoves(
    gameState.board,
    pos,
    gameState.castlingRights,
    gameState.enPassantTarget
  );

  return pseudoMoves.filter(m => {
    const simBoard = executeMoveOnBoard(gameState.board, m);
    return !isKingInCheck(simBoard, gameState.turn);
  });
}

export function getAllLegalMoves(gameState: GameState, color?: PieceColor): Move[] {
  const c = color || gameState.turn;
  const legalMoves: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let col = 0; col < 8; col++) {
      const p = gameState.board[r][col];
      if (p && p.color === c) {
        const moves = getPseudoLegalMoves(
          gameState.board,
          { row: r, col },
          gameState.castlingRights,
          gameState.enPassantTarget
        );
        for (const m of moves) {
          const simBoard = executeMoveOnBoard(gameState.board, m);
          if (!isKingInCheck(simBoard, c)) {
            legalMoves.push(m);
          }
        }
      }
    }
  }

  return legalMoves;
}

export function toAlgebraicNotation(gameState: GameState, move: Move, nextBoard: BoardState): string {
  if (move.isCastling === 'kingside') return 'O-O';
  if (move.isCastling === 'queenside') return 'O-O-O';

  const isCapture = Boolean(move.captured || move.isEnPassant);
  const toAlg = posToAlgebraic(move.to);
  let san = '';

  if (move.piece.type === 'p') {
    if (isCapture) {
      san = `${posToAlgebraic(move.from)[0]}x${toAlg}`;
    } else {
      san = toAlg;
    }
    if (move.promotion) {
      san += `=${move.promotion.toUpperCase()}`;
    }
  } else {
    const pieceChar = move.piece.type.toUpperCase();
    san = `${pieceChar}${isCapture ? 'x' : ''}${toAlg}`;
  }

  const enemyColor: PieceColor = gameState.turn === 'w' ? 'b' : 'w';
  const inCheck = isKingInCheck(nextBoard, enemyColor);

  if (inCheck) {
    // Check if checkmate
    const dummyState: GameState = {
      ...gameState,
      board: nextBoard,
      turn: enemyColor,
    };
    const enemyMoves = getAllLegalMoves(dummyState, enemyColor);
    if (enemyMoves.length === 0) {
      san += '#';
    } else {
      san += '+';
    }
  }

  return san;
}

export function makeMove(gameState: GameState, move: Move): GameState {
  const nextBoard = executeMoveOnBoard(gameState.board, move);
  const nextTurn: PieceColor = gameState.turn === 'w' ? 'b' : 'w';

  // Update castling rights
  const nextRights: CastlingRights = {
    w: { ...gameState.castlingRights.w },
    b: { ...gameState.castlingRights.b },
  };

  if (move.piece.type === 'k') {
    nextRights[gameState.turn].kingside = false;
    nextRights[gameState.turn].queenside = false;
  }
  if (move.piece.type === 'r') {
    if (move.from.row === 7 && move.from.col === 7) nextRights.w.kingside = false;
    if (move.from.row === 7 && move.from.col === 0) nextRights.w.queenside = false;
    if (move.from.row === 0 && move.from.col === 7) nextRights.b.kingside = false;
    if (move.from.row === 0 && move.from.col === 0) nextRights.b.queenside = false;
  }
  // If enemy rook was captured
  if (move.captured && move.captured.type === 'r') {
    if (move.to.row === 7 && move.to.col === 7) nextRights.w.kingside = false;
    if (move.to.row === 7 && move.to.col === 0) nextRights.w.queenside = false;
    if (move.to.row === 0 && move.to.col === 7) nextRights.b.kingside = false;
    if (move.to.row === 0 && move.to.col === 0) nextRights.b.queenside = false;
  }

  // Update En Passant target
  let nextEnPassant: Position | null = null;
  if (move.piece.type === 'p' && Math.abs(move.to.row - move.from.row) === 2) {
    nextEnPassant = {
      row: (move.from.row + move.to.row) / 2,
      col: move.from.col,
    };
  }

  // Halfmove clock & fullmove number
  const isPawnOrCap = move.piece.type === 'p' || move.captured || move.isEnPassant;
  const nextHalfmoveClock = isPawnOrCap ? 0 : gameState.halfmoveClock + 1;
  const nextFullmoveNumber = gameState.turn === 'b' ? gameState.fullmoveNumber + 1 : gameState.fullmoveNumber;

  // Captured pieces lists
  const nextCapturedWhite = [...gameState.capturedWhite];
  const nextCapturedBlack = [...gameState.capturedBlack];
  if (move.captured) {
    if (move.captured.color === 'w') nextCapturedWhite.push(move.captured);
    else nextCapturedBlack.push(move.captured);
  }

  const san = toAlgebraicNotation(gameState, move, nextBoard);
  const recordedMove: Move = {
    ...move,
    san,
    prevCastlingRights: gameState.castlingRights,
    prevEnPassant: gameState.enPassantTarget,
    prevHalfmoveClock: gameState.halfmoveClock,
  };

  const isCheck = isKingInCheck(nextBoard, nextTurn);

  // Check Game Endings
  const candidateNextState: GameState = {
    board: nextBoard,
    turn: nextTurn,
    castlingRights: nextRights,
    enPassantTarget: nextEnPassant,
    halfmoveClock: nextHalfmoveClock,
    fullmoveNumber: nextFullmoveNumber,
    isCheck,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    moveHistory: [...gameState.moveHistory, recordedMove],
    capturedWhite: nextCapturedWhite,
    capturedBlack: nextCapturedBlack,
  };

  const nextLegalMoves = getAllLegalMoves(candidateNextState, nextTurn);

  if (nextLegalMoves.length === 0) {
    if (isCheck) {
      candidateNextState.isCheckmate = true;
      candidateNextState.winner = gameState.turn; // Moving player won
    } else {
      candidateNextState.isStalemate = true;
      candidateNextState.isDraw = true;
      candidateNextState.drawReason = '스테일메이트 (Stalemate - 움직일 수 있는 기물이 없음)';
    }
  } else if (nextHalfmoveClock >= 100) {
    candidateNextState.isDraw = true;
    candidateNextState.drawReason = '50수 규칙 (50-move rule)';
  } else if (hasInsufficientMaterial(nextBoard)) {
    candidateNextState.isDraw = true;
    candidateNextState.drawReason = '기물 부족 (Insufficient material)';
  }

  return candidateNextState;
}

export function hasInsufficientMaterial(board: BoardState): boolean {
  const pieces: ChessPiece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) pieces.push(board[r][c]!);
    }
  }

  // King vs King
  if (pieces.length === 2) return true;

  // King + Minor vs King
  if (pieces.length === 3) {
    return pieces.some(p => p.type === 'b' || p.type === 'n');
  }

  // King + Bishop vs King + Bishop of same color squares
  if (pieces.length === 4) {
    const bishops = pieces.filter(p => p.type === 'b');
    if (bishops.length === 2 && pieces.filter(p => p.type === 'k').length === 2) {
      // Find square color of both bishops
      let col1 = -1;
      let col2 = -1;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'b') {
            const sqColor = (r + c) % 2;
            if (col1 === -1) col1 = sqColor;
            else col2 = sqColor;
          }
        }
      }
      return col1 === col2;
    }
  }

  return false;
}

export function evaluatePosition(board: BoardState): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type];
      let pstVal = 0;

      // Flip PST table for Black pieces
      const pRow = piece.color === 'w' ? r : 7 - r;
      const pCol = c;

      switch (piece.type) {
        case 'p':
          pstVal = PST_PAWN[pRow][pCol];
          break;
        case 'n':
          pstVal = PST_KNIGHT[pRow][pCol];
          break;
        case 'b':
          pstVal = PST_BISHOP[pRow][pCol];
          break;
        case 'r':
          pstVal = PST_ROOK[pRow][pCol];
          break;
        case 'q':
          pstVal = PST_QUEEN[pRow][pCol];
          break;
        case 'k':
          pstVal = PST_KING_MIDDLE[pRow][pCol];
          break;
      }

      const totalPieceVal = baseVal + pstVal;
      score += piece.color === 'w' ? totalPieceVal : -totalPieceVal;
    }
  }

  return score;
}

export function generateFEN(gameState: GameState): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const p = gameState.board[r][c];
      if (!p) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const char = p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
        rowStr += char;
      }
    }
    if (emptyCount > 0) rowStr += emptyCount;
    rows.push(rowStr);
  }

  const turnStr = gameState.turn;
  let castling = '';
  if (gameState.castlingRights.w.kingside) castling += 'K';
  if (gameState.castlingRights.w.queenside) castling += 'Q';
  if (gameState.castlingRights.b.kingside) castling += 'k';
  if (gameState.castlingRights.b.queenside) castling += 'q';
  if (!castling) castling = '-';

  const ep = gameState.enPassantTarget ? posToAlgebraic(gameState.enPassantTarget) : '-';

  return `${rows.join('/')} ${turnStr} ${castling} ${ep} ${gameState.halfmoveClock} ${gameState.fullmoveNumber}`;
}

export interface MoveValidationExplanation {
  allowed: boolean;
  reason?: 'in_check' | 'pinned' | 'king_into_check' | 'king_adjacent' | 'blocked' | 'invalid_path';
  message: string;
  threatenedKingPos?: Position;
}

export function getPieceNameByLang(type: PieceType, lang: Language = 'ko'): string {
  const map: Record<PieceType, Record<Language, string>> = {
    p: { ko: '폰', en: 'Pawn', ja: 'ポーン', zh: '兵(卒)' },
    n: { ko: '나이트', en: 'Knight', ja: 'ナイト', zh: '马' },
    b: { ko: '비숍', en: 'Bishop', ja: 'ビショップ', zh: '象' },
    r: { ko: '룩', en: 'Rook', ja: 'ルーク', zh: '车' },
    q: { ko: '퀸', en: 'Queen', ja: 'クイーン', zh: '后' },
    k: { ko: '킹', en: 'King', ja: 'キング', zh: '王' },
  };
  return map[type]?.[lang] || map[type]?.ko;
}

export function validateMoveAttempt(
  gameState: GameState,
  from: Position,
  to?: Position,
  lang: Language = 'ko'
): MoveValidationExplanation {
  const piece = gameState.board[from.row][from.col];
  if (!piece) {
    return { allowed: false, message: '' };
  }

  const kingPos = findKing(gameState.board, piece.color);

  // If destination square is provided
  if (to) {
    const legalMoves = getLegalMovesForPosition(gameState, from);
    const isLegal = legalMoves.some(m => m.to.row === to.row && m.to.col === to.col);
    if (isLegal) {
      return { allowed: true, message: '' };
    }

    // Check if it is pseudo-legal (geometrically valid for this piece, but rejected due to King safety)
    const pseudoMoves = getPseudoLegalMoves(
      gameState.board,
      from,
      gameState.castlingRights,
      gameState.enPassantTarget
    );
    const isPseudo = pseudoMoves.some(m => m.to.row === to.row && m.to.col === to.col);

    if (isPseudo) {
      if (piece.type === 'k') {
        // King moving
        const enemyKing = findKing(gameState.board, piece.color === 'w' ? 'b' : 'w');
        if (enemyKing && Math.abs(enemyKing.row - to.row) <= 1 && Math.abs(enemyKing.col - to.col) <= 1) {
          const msgs: Record<Language, string> = {
            ko: '⚠️ 체스 규칙상 양쪽 킹(왕)은 서로 맞닿을 수 없습니다! 👑🚫',
            en: '⚠️ Kings cannot stand adjacent to each other in Chess! 👑🚫',
            ja: '⚠️ チェスの規則上、両方のキングは隣接できません！ 👑🚫',
            zh: '⚠️ 国际象棋规则禁止双方王相邻！ 👑🚫',
          };
          return { allowed: false, reason: 'king_adjacent', message: msgs[lang], threatenedKingPos: to };
        }

        const msgs: Record<Language, string> = {
          ko: '⚠️ 그 칸으로 움직이면 킹이 공격(체크)을 받게 됩니다! 안전한 칸으로 피하세요. 👑🚫',
          en: '⚠️ Moving there puts your King in check! Choose a safe square. 👑🚫',
          ja: '⚠️ そのマスに移動するとキングがチェックされます！ 安全なマスへ移動してください。 👑🚫',
          zh: '⚠️ 移动到该格会让王受到攻击(将军)！ 请选择安全的格子。 👑🚫',
        };
        return { allowed: false, reason: 'king_into_check', message: msgs[lang], threatenedKingPos: to };
      }

      // Non-king piece
      if (gameState.isCheck) {
        const msgs: Record<Language, string> = {
          ko: '⚠️ 현재 킹이 체크(Check) 상태입니다! 킹을 피하거나 공격로를 막는 수만 둘 수 있어요. 👑🛡️',
          en: '⚠️ Your King is currently in Check! You must defend or escape. 👑🛡️',
          ja: '⚠️ 現在キングがチェックされています！ チェックを防ぐ手を指してください。 👑🛡️',
          zh: '⚠️ 当前王处于被将军状态！ 必须防守或避开将军。 👑🛡️',
        };
        return { allowed: false, reason: 'in_check', message: msgs[lang], threatenedKingPos: kingPos || undefined };
      } else {
        const msgs: Record<Language, string> = {
          ko: '⚠️ 그쪽으로 움직이면 뒤의 킹이 상대 기물에 노출(체크)되어 움직일 수 없어요! (절대 핀) 👑⚠️',
          en: '⚠️ Moving this piece exposes your King to check! (Absolute Pin) 👑⚠️',
          ja: '⚠️ その駒を動かすと後ろのキングがチェックされます！ (絶対ピン) 👑⚠️',
          zh: '⚠️ 移动该棋子会使后面的王暴露于将军之下！ (绝对牵制) 👑⚠️',
        };
        return { allowed: false, reason: 'pinned', message: msgs[lang], threatenedKingPos: kingPos || undefined };
      }
    } else {
      const pName = getPieceNameByLang(piece.type, lang);
      const msgs: Record<Language, string> = {
        ko: `⚠️ ${pName}은(는) 그 칸으로 이동할 수 없는 행마법입니다.`,
        en: `⚠️ The ${pName} cannot move to that square according to chess rules.`,
        ja: `⚠️ ${pName}はそのマスには移動できない動きです。`,
        zh: `⚠️ ${pName}不能移动到该格子。`,
      };
      return { allowed: false, reason: 'invalid_path', message: msgs[lang] };
    }
  }

  // Destination square was NOT provided (user clicked a piece that has 0 legal moves)
  const legalMoves = getLegalMovesForPosition(gameState, from);
  if (legalMoves.length === 0) {
    const pseudoMoves = getPseudoLegalMoves(
      gameState.board,
      from,
      gameState.castlingRights,
      gameState.enPassantTarget
    );

    if (pseudoMoves.length > 0) {
      if (gameState.isCheck) {
        const msgs: Record<Language, string> = {
          ko: '⚠️ 현재 킹이 체크(Check) 상태입니다! 이 말로는 체크를 풀 수 없어 움직일 수 없습니다. 👑🛡️',
          en: '⚠️ King is in check! This piece cannot block or resolve the check. 👑🛡️',
          ja: '⚠️ 現在キングがチェックされています！ この駒では解除できません。 👑🛡️',
          zh: '⚠️ 王处于被将军状态！ 该棋子无法解除将军。 👑🛡️',
        };
        return { allowed: false, reason: 'in_check', message: msgs[lang], threatenedKingPos: kingPos || undefined };
      } else {
        const msgs: Record<Language, string> = {
          ko: '⚠️ 이 말을 움직이면 킹이 상대 기물에 노출(체크)되어 움직일 수 없습니다! (절대 핀) 👑🛡️',
          en: '⚠️ This piece is pinned to your King! Moving it would expose your King to check. 👑🛡️',
          ja: '⚠️ この駒を動かすとキングがチェックされるため動かせません！ (絶対ピン) 👑🛡️',
          zh: '⚠️ 移动该棋子会使王受到将军，处于绝对牵制状态！ 👑🛡️',
        };
        return { allowed: false, reason: 'pinned', message: msgs[lang], threatenedKingPos: kingPos || undefined };
      }
    } else {
      const msgs: Record<Language, string> = {
        ko: '⚠️ 다른 기물에 가로막혀 있거나 이동할 수 있는 빈 칸이 없습니다. 🛑',
        en: '⚠️ This piece is blocked and currently has no available squares. 🛑',
        ja: '⚠️ 他の駒に塞がれており、移動できるマスがありません。 🛑',
        zh: '⚠️ 该棋子被阻挡，暂无可行格子。 🛑',
      };
      return { allowed: false, reason: 'blocked', message: msgs[lang] };
    }
  }

  return { allowed: true, message: '' };
}
