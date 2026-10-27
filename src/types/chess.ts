export type Language = 'ko' | 'en' | 'ja' | 'zh';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Position {
  row: number; // 0 to 7 (0 is rank 8 for Black, 7 is rank 1 for White)
  col: number; // 0 to 7 (0 is file a, 7 is file h)
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export type BoardState = (ChessPiece | null)[][];

export interface CastlingRights {
  w: { kingside: boolean; queenside: boolean };
  b: { kingside: boolean; queenside: boolean };
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  captured?: ChessPiece | null;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
  san?: string; // Standard Algebraic Notation (e.g., e4, Nf3, O-O, exd5, Qxh7#)
  prevCastlingRights?: CastlingRights;
  prevEnPassant?: Position | null;
  prevHalfmoveClock?: number;
}

export interface GameState {
  board: BoardState;
  turn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: string;
  winner?: PieceColor | null;
  moveHistory: Move[];
  capturedWhite: ChessPiece[]; // Pieces captured by Black (White pieces)
  capturedBlack: ChessPiece[]; // Pieces captured by White (Black pieces)
}

export interface RankLevel {
  id: number;
  rankName: string;
  title: string;
  ratingMin: number;
  ratingMax: number;
  description: string;
  depth: number;
  badgeColor: string;
  avatar: string;
}

export interface BeginnerQuest {
  id: number;
  gate: string;
  title: string;
  concept: string;
  tip: string;
  rewardAcorns: number;
  initialBoard: BoardState;
  turn: PieceColor;
  targetMove: {
    from: Position;
    to: Position;
    promotion?: PieceType;
  };
  explanationOnClear: string;
}

export interface AdvancedTactic {
  id: number;
  number: string;
  title: string;
  technique: string;
  bigPicture: string;
  concept: string;
  tip: string;
  rewardAcorns: number;
  initialBoard: BoardState;
  turn: PieceColor;
  solutionMoves: {
    from: Position;
    to: Position;
    promotion?: PieceType;
  }[];
  opponentReplies: {
    from: Position;
    to: Position;
    promotion?: PieceType;
  }[];
  explanationOnClear: string;
}

export type BoardTheme = 'royal-wood' | 'neo-cyber' | 'tournament-ivory' | 'studio-bright';
