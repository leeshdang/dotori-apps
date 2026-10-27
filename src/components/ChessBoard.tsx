import React, { useState } from 'react';
import {
  BoardState,
  BoardTheme,
  ChessPiece,
  Move,
  PieceColor,
  PieceType,
  Position,
} from '../types/chess';
import { isWithinBoard } from '../utils/chessEngine';

interface ChessBoardProps {
  board: BoardState;
  selectedPos: Position | null;
  legalMoves: Move[];
  lastMove: Move | null;
  isCheck: boolean;
  kingPosInCheck: Position | null;
  isFlipped?: boolean;
  theme?: BoardTheme;
  interactive?: boolean;
  onSquareClick: (pos: Position) => void;
  pendingPromotion: { from: Position; to: Position } | null;
  onSelectPromotion: (promo: PieceType) => void;
  coachWarning?: { message: string; timestamp: number; threatenedKingPos?: Position } | null;
}

// Ultra-sharp SVG rendering for chess pieces
export const ChessPieceIcon: React.FC<{
  type: PieceType;
  color: PieceColor;
  className?: string;
}> = ({ type, color, className = 'w-10 h-10' }) => {
  const isWhite = color === 'w';

  // Gradient IDs for SVG
  const fillGrad = isWhite ? 'url(#whitePieceGrad)' : 'url(#blackPieceGrad)';
  // High-contrast stroke: dark slate for white piece, crisp bright silver for black piece
  const strokeColor = isWhite ? '#1e293b' : '#f8fafc';
  const highlightColor = isWhite ? '#ffffff' : '#cbd5e1';

  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] transition-transform duration-150 hover:scale-105 select-none pointer-events-none`}
    >
      <defs>
        <linearGradient id="whitePieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="blackPieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>

      {/* PAWN */}
      {type === 'p' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
          {isWhite && <path d="M12 39.5c0-4 4-8 10.5-8.5" fill="none" stroke={highlightColor} strokeWidth="1" />}
        </g>
      )}

      {/* KNIGHT */}
      {type === 'n' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,6.5 17.5,6.5 C 17.5,6.5 21.5,7 22,10 z" />
          <circle cx="15" cy="14" r="1.5" fill={isWhite ? '#0f172a' : '#f8fafc'} />
        </g>
      )}

      {/* BISHOP */}
      {type === 'b' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
          <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
          <path d="M 25 8 A 2.5 2.5 0 1 1 20 8 A 2.5 2.5 0 1 1 25 8 z" />
          <path d="M 17.5,26 L 27.5,26" fill="none" />
          <path d="M 22.5,10 L 22.5,14 M 20.5,12 L 24.5,12" fill="none" strokeWidth="1.2" />
        </g>
      )}

      {/* ROOK */}
      {type === 'r' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
          <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
          <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z" />
          <path d="M 34,14 L 31,17 L 14,17 L 11,14 z" />
          <path d="M 14,17 L 14,29.5 L 31,29.5 L 31,17 z" />
          <path d="M 14,29.5 L 11,32 L 34,32 L 31,29.5 z" />
          <path d="M 12,35.5 L 33,35.5" fill="none" />
        </g>
      )}

      {/* QUEEN */}
      {type === 'q' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.5 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.5 L 14,25 L 6.5,13.5 z" />
          <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11,36 9,36 9,39 L 36,39 C 36,39 34,36 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="14" cy="9" r="2" />
          <circle cx="22.5" cy="8" r="2" />
          <circle cx="31" cy="9" r="2" />
          <circle cx="39" cy="12" r="2" />
        </g>
      )}

      {/* KING */}
      {type === 'k' && (
        <g stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fillGrad}>
          {/* Royal Cross */}
          <path d="M 22.5,11.5 L 22.5,4.5 M 20,7 L 25,7" fill="none" strokeWidth="2" stroke={strokeColor} />
          <path d="M 22.5,10 C 22.5,10 27,11.5 29.5,15 C 31,17 31,21.5 31,21.5 L 14,21.5 C 14,21.5 14,17 15.5,15 C 18,11.5 22.5,10 22.5,10 z" />
          <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,37 36,36 36,34 C 36,32 34.5,31.5 33.5,30 C 32.5,28 32.5,28 33.5,26.5 C 34.5,25 34.5,23.5 33.5,22.5 C 32.5,21.5 28,21.5 22.5,21.5 C 17,21.5 12.5,21.5 11.5,22.5 C 10.5,23.5 10.5,25 11.5,26.5 C 12.5,28 12.5,28 11.5,30 C 10.5,31.5 9,32 9,34 C 9,36 11.5,37 11.5,37 z" />
          <circle cx="22.5" cy="15.5" r="2" fill={isWhite ? '#f59e0b' : '#dc2626'} />
        </g>
      )}
    </svg>
  );
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedPos,
  legalMoves,
  lastMove,
  isCheck,
  kingPosInCheck,
  isFlipped = false,
  theme = 'royal-wood',
  interactive = true,
  onSquareClick,
  pendingPromotion,
  onSelectPromotion,
  coachWarning,
}) => {
  const [shaking, setShaking] = useState(false);

  React.useEffect(() => {
    if (coachWarning?.timestamp) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 450);
      return () => clearTimeout(t);
    }
  }, [coachWarning?.timestamp]);

  // Theme square colors
  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;

    if (theme === 'royal-wood') {
      return isLight ? 'bg-[#fbf3e6] text-[#78350f]' : 'bg-[#b4713c] text-[#fef3c7]';
    } else if (theme === 'neo-cyber') {
      return isLight
        ? 'bg-[#2a3a54] text-cyan-200 border border-cyan-400/20'
        : 'bg-[#131b2c] text-cyan-400 border border-indigo-500/20';
    } else if (theme === 'studio-bright') {
      return isLight ? 'bg-[#ffffff] text-slate-800' : 'bg-[#94a3b8] text-white';
    } else {
      // tournament-ivory
      return isLight ? 'bg-[#f0d9b5] text-[#2d4d35]' : 'bg-[#487856] text-[#f0d9b5]';
    }
  };

  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Coach Warning Banner */}
      {coachWarning && (
        <div className="mb-2 z-30 max-w-[95%] animate-fade-in flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white text-xs sm:text-sm font-extrabold rounded-full shadow-xl shadow-rose-500/40 border border-white/40 backdrop-blur-md">
          <span className="text-base shrink-0">📢</span>
          <span className="leading-tight drop-shadow-sm line-clamp-2">{coachWarning.message}</span>
        </div>
      )}

      {/* Board Outer Container */}
      <div
        className={`relative p-2.5 sm:p-3 rounded-2xl shadow-2xl transition-all duration-300 ${shaking ? 'animate-shake' : ''} ${
          theme === 'royal-wood'
            ? 'bg-gradient-to-br from-[#5c3317] via-[#45220c] to-[#2c1406] border-2 border-[#a15e2e]/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
            : theme === 'neo-cyber'
            ? 'bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#030712] border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.35)]'
            : theme === 'studio-bright'
            ? 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1e293b] border-2 border-slate-300/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-br from-[#273d2d] via-[#1a281e] to-[#0e1610] border-2 border-[#5a936a]/60 shadow-2xl'
        }`}
      >
        {/* 8x8 Board Grid - Always square, never squashed, adaptively responsive */}
        <div className="grid grid-cols-8 grid-rows-8 w-[min(88vw,calc(46vh-30px),380px)] h-[min(88vw,calc(46vh-30px),380px)] sm:w-[min(80vw,calc(50vh-20px),440px)] sm:h-[min(80vw,calc(50vh-20px),440px)] lg:w-[460px] lg:h-[460px] xl:w-[500px] xl:h-[500px] aspect-square rounded-lg overflow-hidden border border-black/30 shrink-0">
          {rows.map(r =>
            cols.map(c => {
              const piece = board[r][c];
              const isSelected = selectedPos?.row === r && selectedPos?.col === c;
              const isLegal = legalMoves.some(m => m.to.row === r && m.to.col === c);
              const targetMove = legalMoves.find(m => m.to.row === r && m.to.col === c);
              const isCapture = Boolean(targetMove?.captured || targetMove?.isEnPassant);

              const isLastMoveFrom = lastMove?.from.row === r && lastMove?.from.col === c;
              const isLastMoveTo = lastMove?.to.row === r && lastMove?.to.col === c;
              const isKingChecked = kingPosInCheck?.row === r && kingPosInCheck?.col === c;
              const isThreatenedKing = coachWarning?.threatenedKingPos?.row === r && coachWarning?.threatenedKingPos?.col === c;

              // Rank and File labels for borders
              const showFileLabel = isFlipped ? r === 0 : r === 7;
              const showRankLabel = isFlipped ? c === 7 : c === 0;
              const fileChar = String.fromCharCode('a'.charCodeAt(0) + c);
              const rankNum = 8 - r;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => interactive && onSquareClick({ row: r, col: c })}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${getSquareColor(
                    r,
                    c
                  )} ${
                    isSelected
                      ? '!bg-amber-400/40 ring-4 ring-amber-400 ring-inset z-10'
                      : ''
                  } ${
                    isLastMoveFrom
                      ? '!bg-amber-400/45 ring-2 ring-dashed ring-amber-400 ring-inset shadow-[inset_0_0_12px_rgba(251,191,36,0.6)]'
                      : ''
                  } ${
                    isLastMoveTo
                      ? '!bg-yellow-300/80 ring-4 ring-yellow-400 ring-inset shadow-[0_0_24px_rgba(250,204,21,0.95),inset_0_0_16px_rgba(254,240,138,0.9)] z-10'
                      : ''
                  } ${
                    isKingChecked || isThreatenedKing
                      ? '!bg-rose-600/60 ring-4 ring-rose-500 ring-inset animate-pulse z-15'
                      : ''
                  }`}
                >
                  {/* Rank / File Coordinate Labels */}
                  {showRankLabel && (
                    <span className="absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold font-mono opacity-80 pointer-events-none">
                      {rankNum}
                    </span>
                  )}
                  {showFileLabel && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold font-mono opacity-80 pointer-events-none">
                      {fileChar}
                    </span>
                  )}

                  {/* Arrival beacon dot on destination square */}
                  {isLastMoveTo && (
                    <>
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 ring-2 ring-white shadow-[0_0_8px_rgba(250,204,21,1)] animate-ping pointer-events-none z-10" />
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 ring-1 ring-black/40 pointer-events-none z-10" />
                    </>
                  )}
                  {/* Departure marker on origin square */}
                  {isLastMoveFrom && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold text-amber-300 pointer-events-none bg-black/60 px-1 py-0.2 rounded border border-amber-400/50 z-10">
                      START
                    </span>
                  )}
                  {(isKingChecked || isThreatenedKing) && (
                    <span className="absolute -top-1 -right-1 text-xs animate-bounce pointer-events-none z-20">
                      👑⚠️
                    </span>
                  )}

                  {/* Chess Piece */}
                  {piece && (
                    <ChessPieceIcon
                      type={piece.type}
                      color={piece.color}
                      className="w-4/5 h-4/5 z-0"
                    />
                  )}

                  {/* Legal Move Indicator */}
                  {isLegal && !isCapture && (
                    <div className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.8)] pointer-events-none z-10 animate-scale" />
                  )}

                  {/* Capture Target Indicator */}
                  {isLegal && isCapture && (
                    <div className="absolute inset-1 rounded-full border-2 sm:border-3 border-rose-500 bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.6)] pointer-events-none z-10 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#12131D] border border-white/20 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
              폰 승급 (Pawn Promotion)
            </h3>
            <p className="text-xs text-gray-300 mb-6">
              승급할 기물을 선택하세요:
            </p>

            <div className="grid grid-cols-4 gap-3">
              {[
                { type: 'q' as PieceType, name: '퀸 (Queen)', pts: '9점' },
                { type: 'r' as PieceType, name: '룩 (Rook)', pts: '5점' },
                { type: 'b' as PieceType, name: '비숍 (Bishop)', pts: '3점' },
                { type: 'n' as PieceType, name: '나이트 (Knight)', pts: '3점' },
              ].map(promo => (
                <button
                  key={promo.type}
                  onClick={() => onSelectPromotion(promo.type)}
                  className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-gradient-to-b hover:from-pink-500/20 hover:to-indigo-500/20 border border-white/10 hover:border-pink-500/50 rounded-2xl transition-all cursor-pointer group hover:scale-105"
                >
                  <ChessPieceIcon
                    type={promo.type}
                    color="w"
                    className="w-12 h-12 mb-1 group-hover:scale-110 transition"
                  />
                  <span className="text-xs font-bold text-white">{promo.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-gray-400">{promo.pts}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
