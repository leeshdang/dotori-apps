import { AIRankInfo, AIRankTier, BoardState, Move, Side } from '../types/janggi';
import {
  calculateScores,
  cloneBoard,
  getAllLegalMoves,
  isKingInCheck,
  PIECE_VALUES,
} from './janggiEngine';

export const AI_RANK_TIERS: Record<AIRankTier, AIRankInfo> = {
  '18k': {
    tier: '18k',
    gradeName: '18급 ~ 15급 (새싹 도토리)',
    shortGrade: '18급',
    icon: '🌱',
    description: '장기 기초 걸음마 단계. 기물 행마와 간단한 공격을 연습하기에 좋습니다.',
    depth: 1,
    blunderRate: 0.35,
    evalStyle: '기초 행마 위주',
  },
  '14k': {
    tier: '14k',
    gradeName: '14급 ~ 10급 (길잡이 다람쥐)',
    shortGrade: '12급',
    icon: '🐿️',
    description: '기본 규칙을 숙지하고 상대 실수를 놓치지 않는 초급 수준입니다.',
    depth: 2,
    blunderRate: 0.15,
    evalStyle: '기물 보호 및 단순 포획',
  },
  '9k': {
    tier: '9k',
    gradeName: '9급 ~ 5급 (숲속 여우)',
    shortGrade: '7급',
    icon: '🦊',
    description: '포진 정비, 기물 가치 교환, 멱 활용을 적극적으로 구사하는 중급 실력자입니다.',
    depth: 2,
    blunderRate: 0.04,
    evalStyle: '기물 점수 균형 및 진형 안정',
  },
  '4k': {
    tier: '4k',
    gradeName: '4급 ~ 1급 (용맹 호랑이)',
    shortGrade: '2급',
    icon: '🐯',
    description: '양차 합세, 포 연계 공격, 궁성 압박 등 수준 높은 전술을 구사하는 상급자입니다.',
    depth: 3,
    blunderRate: 0.0,
    evalStyle: '전술적 협공 및 궁성 압박',
  },
  '1d': {
    tier: '1d',
    gradeName: '초단 (도토리 명인)',
    shortGrade: '초단',
    icon: '👑',
    description: '수읽기가 깊고 외통수 길목을 한 치의 오차 없이 파고드는 최강의 도토리 장기 명인입니다.',
    depth: 3,
    blunderRate: 0.0,
    evalStyle: '심층 탐색 및 외통수 결정타',
  },
};

// Evaluate board for the AI side
export function evaluateBoard(board: BoardState, side: Side): number {
  const oppSide: Side = side === 'cho' ? 'han' : 'cho';
  const scores = calculateScores(board);

  // Material evaluation scaled to centipawns
  let evalScore = (scores[side] - scores[oppSide]) * 100;

  // Mobility and positional bonuses
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (!p) continue;

      const isMyPiece = p.side === side;
      const factor = isMyPiece ? 1 : -1;

      // 1. Chariot: open column and palace intrusion bonus
      if (p.type === 'chariot') {
        if (p.side === 'cho' && r <= 3) evalScore += factor * 35; // invaded enemy camp
        if (p.side === 'han' && r >= 6) evalScore += factor * 35;
      }

      // 2. Cannon: centralization bonus
      if (p.type === 'cannon') {
        if (c >= 2 && c <= 6) evalScore += factor * 20;
      }

      // 3. Soldier advancement
      if (p.type === 'soldier') {
        if (p.side === 'cho') {
          evalScore += factor * (9 - r) * 6;
        } else {
          evalScore += factor * r * 6;
        }
      }

      // 4. King safety: check penalty
      if (p.type === 'king') {
        if (isKingInCheck(board, p.side)) {
          evalScore -= factor * 70;
        }
      }
    }
  }

  return evalScore;
}

// Minimax with alpha-beta pruning
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiSide: Side
): number {
  const currentSide: Side = isMaximizing ? aiSide : aiSide === 'cho' ? 'han' : 'cho';
  const moves = getAllLegalMoves(board, currentSide);

  // Terminal conditions: checkmate or max depth
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      if (isKingInCheck(board, currentSide)) {
        // Checkmate! Loss for currentSide
        return isMaximizing ? -99999 : 99999;
      }
      return 0; // Stalemate
    }
    return evaluateBoard(board, aiSide);
  }

  // Move ordering: evaluate captures first for faster alpha-beta cutoff
  moves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured.type] : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured.type] : 0;
    return valB - valA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const bCopy = cloneBoard(board);
      bCopy[move.to.r][move.to.c] = bCopy[move.from.r][move.from.c];
      bCopy[move.from.r][move.from.c] = null;

      const evalVal = minimax(bCopy, depth - 1, alpha, beta, false, aiSide);
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break; // Pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const bCopy = cloneBoard(board);
      bCopy[move.to.r][move.to.c] = bCopy[move.from.r][move.from.c];
      bCopy[move.from.r][move.from.c] = null;

      const evalVal = minimax(bCopy, depth - 1, alpha, beta, true, aiSide);
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break; // Pruning
    }
    return minEval;
  }
}

// Find best move for AI
export function getBestAIMove(
  board: BoardState,
  aiSide: Side,
  tier: AIRankTier
): { move: Move | null; score: number } {
  const info = AI_RANK_TIERS[tier] || AI_RANK_TIERS['14k'];
  const moves = getAllLegalMoves(board, aiSide);

  if (moves.length === 0) {
    return { move: null, score: -99999 };
  }

  // Blunder simulation for beginner tiers
  if (info.blunderRate > 0 && Math.random() < info.blunderRate) {
    // Pick a random legal move or non-optimal move
    const randomIndex = Math.floor(Math.random() * moves.length);
    return { move: moves[randomIndex], score: 0 };
  }

  let bestMove: Move = moves[0];
  let bestScore = -Infinity;

  // Move ordering: captures first
  moves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured.type] : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured.type] : 0;
    return valB - valA;
  });

  const searchDepth = info.depth;

  for (const move of moves) {
    const bCopy = cloneBoard(board);
    bCopy[move.to.r][move.to.c] = bCopy[move.from.r][move.from.c];
    bCopy[move.from.r][move.from.c] = null;

    // Direct checkmate search bonus
    const oppSide: Side = aiSide === 'cho' ? 'han' : 'cho';
    const oppMoves = getAllLegalMoves(bCopy, oppSide);
    if (oppMoves.length === 0 && isKingInCheck(bCopy, oppSide)) {
      // Immediate win!
      return { move, score: 99999 };
    }

    const moveScore = minimax(bCopy, searchDepth - 1, -Infinity, Infinity, false, aiSide);

    // Add tiny random tie-breaker so AI varies moves
    const tieBreaker = (Math.random() - 0.5) * 5;
    const finalScore = moveScore + tieBreaker;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMove = move;
    }
  }

  return { move: bestMove, score: Math.round(bestScore) };
}

// Educational hint generator for players
export function getEducationalHint(
  board: BoardState,
  playerSide: Side
): { move: Move; advice: string } | null {
  const { move } = getBestAIMove(board, playerSide, '1d');
  if (!move) return null;

  let advice = '';
  const pieceName = move.piece.label;

  if (move.captured) {
    advice = `상대의 ${move.captured.label}(을)를 ${pieceName}(으)로 잡아 기물 이득(${PIECE_VALUES[move.captured.type]}점)을 취하세요!`;
  } else if (move.piece.type === 'chariot') {
    advice = `차(車)를 진출시켜 활로를 열고 적 진영을 강하게 압박하는 좋은 수입니다.`;
  } else if (move.piece.type === 'cannon') {
    advice = `포(包)를 배치하여 상대의 길목을 차단하거나 협공 다리를 마련하세요.`;
  } else if (move.piece.type === 'horse') {
    advice = `마(馬)의 멱이 트인 길로 기동하여 중앙 및 측면 공격 지원 거점을 잡으세요.`;
  } else if (move.piece.type === 'soldier') {
    advice = `졸(병)을 전진하거나 당겨서 상대 기물의 진출을 견제하고 형태를 안정시킵니다.`;
  } else {
    advice = `${pieceName}(을)를 기동하여 진영의 안정과 균형을 다지세요.`;
  }

  return { move, advice };
}
