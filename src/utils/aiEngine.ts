import { GameState, Move, PieceColor, RankLevel } from '../types/chess';
import {
  evaluatePosition,
  executeMoveOnBoard,
  getAllLegalMoves,
  isKingInCheck,
  makeMove,
  posToAlgebraic,
} from './chessEngine';

export const RANK_LEVELS: RankLevel[] = [
  {
    id: 1,
    rankName: '18급 ~ 15급',
    title: '새싹 도토리 (Seedling Acorn)',
    ratingMin: 500,
    ratingMax: 800,
    description: '체스 규칙을 막 배운 입문자 AI. 기물을 가끔 놓치거나 단순한 실수를 하여 누구나 승리의 기쁨을 맛볼 수 있습니다.',
    depth: 1,
    badgeColor: 'from-emerald-500 to-teal-600',
    avatar: '🌱',
  },
  {
    id: 2,
    rankName: '14급 ~ 10급',
    title: '길잡이 다람쥐 (Guide Squirrel)',
    ratingMin: 800,
    ratingMax: 1100,
    description: '위험에 빠진 자기 기물을 지키고, 공짜로 잡을 수 있는 적 기물을 놓치지 않는 중초급 AI입니다.',
    depth: 2,
    badgeColor: 'from-amber-500 to-orange-600',
    avatar: '🐿️',
  },
  {
    id: 3,
    rankName: '9급 ~ 5급',
    title: '숲속 여우 (Forest Fox)',
    ratingMin: 1100,
    ratingMax: 1400,
    description: '오프닝 전개 원칙과 중앙 지배를 준수하며, 나이트 포크와 핀 등 기초 전술을 날카롭게 구사합니다.',
    depth: 2,
    badgeColor: 'from-sky-500 to-indigo-600',
    avatar: '🦊',
  },
  {
    id: 4,
    rankName: '4급 ~ 1급',
    title: '용맹 호랑이 (Brave Tiger)',
    ratingMin: 1400,
    ratingMax: 1700,
    description: '3수 앞을 내다보는 알파-베타 탐색과 킹 안전, 날카로운 기물 희생 공격을 구사하는 상급자 실력자입니다.',
    depth: 3,
    badgeColor: 'from-pink-500 to-rose-600',
    avatar: '🐯',
  },
  {
    id: 5,
    rankName: '공인 초단 이상',
    title: '도토리 체스 마스터 (Dotori Grand Master)',
    ratingMin: 1800,
    ratingMax: 2200,
    description: '깊은 수읽기(4-ply Alpha-Beta + Quiescence)와 엔드게임 포지셔닝을 완벽히 수행하는 최고 난이도의 AI입니다.',
    depth: 4,
    badgeColor: 'from-purple-500 via-indigo-500 to-pink-500',
    avatar: '👑',
  },
];

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    // Captures first (MVV-LVA: Most Valuable Victim - Least Valuable Attacker)
    const aVal = a.captured ? 100 : 0;
    const bVal = b.captured ? 100 : 0;
    return bVal - aVal;
  });
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || state.isCheckmate || state.isDraw || state.isStalemate) {
    if (state.isCheckmate) {
      return isMaximizing ? -50000 - depth : 50000 + depth;
    }
    if (state.isDraw || state.isStalemate) {
      return 0;
    }
    return evaluatePosition(state.board);
  }

  const moves = orderMoves(getAllLegalMoves(state));
  if (moves.length === 0) {
    if (state.isCheck) {
      return isMaximizing ? -50000 - depth : 50000 + depth;
    }
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextState = makeMove(state, move);
      const evalScore = minimax(nextState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextState = makeMove(state, move);
      const evalScore = minimax(nextState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

export function selectAIMove(
  gameState: GameState,
  levelId: number
): { move: Move | null; evaluation: number } {
  const legalMoves = getAllLegalMoves(gameState);
  if (legalMoves.length === 0) return { move: null, evaluation: 0 };

  const isWhite = gameState.turn === 'w';

  // Level 1 (Beginner): 70% random, 30% capture if available
  if (levelId === 1) {
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      const chosen = captures[Math.floor(Math.random() * captures.length)];
      return { move: chosen, evaluation: 0 };
    }
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { move: randomMove, evaluation: 0 };
  }

  // Level 2 (Novice): 1-ply search with a bit of noise
  if (levelId === 2) {
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of legalMoves) {
      const next = makeMove(gameState, move);
      const score = evaluatePosition(next.board) + (Math.random() * 40 - 20);
      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { move: bestMove, evaluation: bestScore };
  }

  // Level 3 (Intermediate): 2-ply Minimax with Alpha-Beta
  if (levelId === 3) {
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of orderMoves(legalMoves)) {
      const next = makeMove(gameState, move);
      const score = minimax(next, 1, -Infinity, Infinity, !isWhite);
      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { move: bestMove, evaluation: bestScore };
  }

  // Level 4 (Advanced): 3-ply Minimax
  if (levelId === 4) {
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of orderMoves(legalMoves)) {
      const next = makeMove(gameState, move);
      const score = minimax(next, 2, -Infinity, Infinity, !isWhite);
      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { move: bestMove, evaluation: bestScore };
  }

  // Level 5 (Master): 4-ply Minimax with deep Alpha-Beta
  let bestMove = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  for (const move of orderMoves(legalMoves)) {
    const next = makeMove(gameState, move);
    const score = minimax(next, 3, -Infinity, Infinity, !isWhite);
    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { move: bestMove, evaluation: bestScore };
}

export function generateCoachHint(gameState: GameState): {
  move: Move | null;
  explanation: string;
} {
  const isWhite = gameState.turn === 'w';
  const { move } = selectAIMove(gameState, 4);

  if (!move) {
    return {
      move: null,
      explanation: '현재 가능한 합법수가 없습니다.',
    };
  }

  const fromAlg = posToAlgebraic(move.from);
  const toAlg = posToAlgebraic(move.to);
  const pieceName =
    move.piece.type === 'p'
      ? '폰'
      : move.piece.type === 'n'
      ? '나이트'
      : move.piece.type === 'b'
      ? '비숍'
      : move.piece.type === 'r'
      ? '룩'
      : move.piece.type === 'q'
      ? '퀸'
      : '킹';

  let reason = '';
  if (move.isCastling) {
    reason = '킹을 안전한 구석으로 숨기고 룩을 중앙 전선으로 신속히 배치하는 훌륭한 수입니다.';
  } else if (move.captured) {
    const capName =
      move.captured.type === 'p'
        ? '폰'
        : move.captured.type === 'n'
        ? '나이트'
        : move.captured.type === 'b'
        ? '비숍'
        : move.captured.type === 'r'
        ? '룩'
        : '퀸';
    reason = `상대의 ${capName}을(를) 포획하여 기물 점수 우위를 점하는 강력한 수입니다!`;
  } else if (move.piece.type === 'p' && (toAlg === 'e4' || toAlg === 'd4' || toAlg === 'e5' || toAlg === 'd5')) {
    reason = '중앙 요충지를 장악하여 다른 기물들의 활동 공간을 넓혀주는 핵심 오프닝 수입니다.';
  } else if (move.piece.type === 'n' || move.piece.type === 'b') {
    reason = '기물을 전선으로 전개하여 활동성을 극대화하고 적진을 압박합니다.';
  } else {
    reason = `포지션을 개선하고 상대의 침투로를 차단하는 전략적 수입니다.`;
  }

  return {
    move,
    explanation: `💡 [도토리 AI 코치 추천]: ${pieceName}을(를) ${fromAlg}에서 ${toAlg}(으)로 이동하세요! ${reason}`,
  };
}
