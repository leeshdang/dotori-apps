export type Side = 'cho' | 'han'; // 초(楚 - Blue/Green, First) | 한(漢 - Red, Second)

export type PieceType = 'king' | 'guard' | 'horse' | 'elephant' | 'chariot' | 'cannon' | 'soldier';

export type PieceTheme = 'chess-classic' | 'chess-modern' | 'wood' | 'crystal' | 'modern';
export type Language = 'ko' | 'en' | 'ja' | 'zh';

export interface Position {
  r: number; // 0..9 (Row)
  c: number; // 0..8 (Column)
}

export interface Piece {
  id: string;
  side: Side;
  type: PieceType;
  label: string; // 한자 표기 (楚, 漢, 車, 包, 馬, 象, 士, 卒, 兵)
}

export type FormationType = 'gwima' | 'wonangma' | 'yanggwima' | 'matsang';

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  notation?: string;
  isCheck?: boolean;
}

export type BoardState = (Piece | null)[][];

export interface QuestStep {
  instruction: string;
  expectedMove?: { from: Position; to: Position };
  autoOpponentMove?: { from: Position; to: Position };
  feedbackSuccess: string;
  feedbackFail: string;
}

export interface Quest {
  id: string;
  title: string;
  badge: string;
  category: 'basics' | 'pieces' | 'rules';
  description: string;
  acornReward: number;
  initialBoard: BoardState;
  turn: Side;
  objective: string;
  tip: string;
  steps: QuestStep[];
}

export interface TacticPuzzle {
  id: string;
  title: string;
  level: string; // '중급' | '고급' | '마스터'
  category: string;
  summary: string;
  strategicConcept: string; // 큰 그림 전략 설명
  initialBoard: BoardState;
  turn: Side;
  steps: {
    instruction: string;
    expectedMove: { from: Position; to: Position };
    opponentResponse?: { from: Position; to: Position; commentary: string };
    explanation: string;
  }[];
}

export type AIRankTier = '18k' | '14k' | '9k' | '4k' | '1d';

export interface AIRankInfo {
  tier: AIRankTier;
  gradeName: string; // 예: "18급 (새싹 도토리)"
  shortGrade: string; // "18급"
  icon: string;
  description: string;
  depth: number;
  blunderRate: number;
  evalStyle: string;
}

export interface UserProfile {
  ratingTier: AIRankTier;
  ratingGrade: string; // "18급"
  ratingPoints: number; // 0 ~ 1000+
  acorns: number;
  clearedQuests: string[];
  clearedTactics: string[];
  matchHistory: {
    id: string;
    date: string;
    opponentTier: AIRankTier;
    result: 'win' | 'loss' | 'draw';
    turns: number;
    scoreDiff: number;
    awardedGrade?: string;
  }[];
}
