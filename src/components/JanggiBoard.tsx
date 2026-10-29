import React, { useState } from 'react';
import { BoardState, Move, Piece, Position, Side, PieceTheme, Language } from '../types/janggi';
import { calculateScores } from '../utils/janggiEngine';
import { translations } from '../i18n/translations';
import { PieceThemeModal } from './PieceThemeModal';
import { Palette, Sparkles, ChevronRight, SlidersHorizontal, Clock } from 'lucide-react';

interface JanggiBoardProps {
  board: BoardState;
  selectedPos: Position | null;
  validMoves: Position[];
  lastMove: Move | null;
  turn: Side;
  playerSide: Side;
  isInCheck: boolean;
  onSelectPos: (pos: Position) => void;
  hintMove?: Move | null;
  pieceTheme?: PieceTheme;
  onChangePieceTheme?: (theme: PieceTheme) => void;
  lang?: Language;
  timerSeconds?: number;
  isTimerActive?: boolean;
  guideMove?: { from: Position; to: Position } | null;
}

export const JanggiBoard: React.FC<JanggiBoardProps> = ({
  board,
  selectedPos,
  validMoves,
  lastMove,
  turn,
  playerSide,
  isInCheck,
  onSelectPos,
  hintMove,
  pieceTheme: externalTheme,
  onChangePieceTheme,
  lang = 'ko',
  timerSeconds = 30,
  isTimerActive = false,
  guideMove = null,
}) => {
  const t = translations[lang] || translations.ko;

  const [internalTheme, setInternalTheme] = useState<PieceTheme>(() => {
    const saved = localStorage.getItem('djl_piece_theme') as PieceTheme;
    if (saved && ['chess-classic', 'chess-modern', 'wood', 'crystal', 'modern'].includes(saved)) {
      return saved;
    }
    return 'chess-classic';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const activeTheme = externalTheme || internalTheme;

  const handleSelectTheme = (newTheme: PieceTheme) => {
    setInternalTheme(newTheme);
    localStorage.setItem('djl_piece_theme', newTheme);
    onChangePieceTheme?.(newTheme);
  };

  const scores = calculateScores(board);

  // Determine captured pieces
  const getCapturedPieces = () => {
    const initialCounts: Record<string, number> = {
      king: 1,
      chariot: 2,
      cannon: 2,
      horse: 2,
      elephant: 2,
      guard: 2,
      soldier: 5,
    };

    const currentCho: Record<string, number> = {};
    const currentHan: Record<string, number> = {};

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (p) {
          if (p.side === 'cho') currentCho[p.type] = (currentCho[p.type] || 0) + 1;
          else currentHan[p.type] = (currentHan[p.type] || 0) + 1;
        }
      }
    }

    const capturedCho: string[] = [];
    const capturedHan: string[] = [];

    Object.keys(initialCounts).forEach((type) => {
      const lostCho = Math.max(0, initialCounts[type] - (currentCho[type] || 0));
      const lostHan = Math.max(0, initialCounts[type] - (currentHan[type] || 0));
      for (let i = 0; i < lostCho; i++) capturedCho.push(type);
      for (let i = 0; i < lostHan; i++) capturedHan.push(type);
    });

    return { capturedCho, capturedHan };
  };

  const { capturedCho, capturedHan } = getCapturedPieces();

  // Grid coordinates: width 9 points, height 10 points
  const pointsX = [6, 17, 28, 39, 50, 61, 72, 83, 94]; // Percentage %
  const pointsY = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]; // Percentage %

  // Check if a piece is the King in check
  const isKingCheckPos = (p: Piece | null) => {
    if (!isInCheck || !p || p.type !== 'king') return false;
    return p.side === turn;
  };

  // Get Chess Symbol & Hanja for a piece
  const getChessPieceData = (p: Piece) => {
    switch (p.type) {
      case 'king':
        return { symbol: '♚', hanja: p.label };
      case 'chariot':
        return { symbol: '♜', hanja: '車' };
      case 'cannon':
        return { symbol: '砲', hanja: p.label };
      case 'horse':
        return { symbol: '♞', hanja: '馬' };
      case 'elephant':
        return { symbol: '♝', hanja: '象' };
      case 'guard':
        return { symbol: '🛡', hanja: '士' };
      case 'soldier':
        return { symbol: '♟', hanja: p.label };
      default:
        return { symbol: p.label, hanja: p.label };
    }
  };

  // Render authentic Korean Janggi piece token
  const renderPieceToken = (p: Piece) => {
    // Sizing: +15% scaled up from compact size for optimal visibility & spacing
    // King (궁): 31px (sm: 37px)
    // Major pieces (차, 포, 마, 상): 27px (sm: 32px)
    // Soldiers & Guards (졸, 병, 사): 23px (sm: 28px)
    let sizeStyle = 'w-[23px] sm:w-[28px] h-[23px] sm:h-[28px] text-[11px] sm:text-xs font-bold';
    if (p.type === 'king') {
      sizeStyle = 'w-[31px] sm:w-[37px] h-[31px] sm:h-[37px] text-[13.5px] sm:text-[15.5px] font-black';
    } else if (['chariot', 'cannon', 'horse', 'elephant'].includes(p.type)) {
      sizeStyle = 'w-[27px] sm:w-[32px] h-[27px] sm:h-[32px] text-xs sm:text-[13.5px] font-bold';
    }

    // THEME 4: Classic Royal Chess (클래식 로열 체스)
    if (activeTheme === 'chess-classic') {
      const { symbol, hanja } = getChessPieceData(p);
      return (
        <div
          className={`relative ${sizeStyle} rounded-full flex items-center justify-center transition-all duration-200 select-none border-0 shadow-sm ${p.side === 'cho' ? 'piece-chess-classic-cho' : 'piece-chess-classic-han'
            }`}
        >
          {/* Main Chess Symbol */}
          <span className="piece-char select-none leading-none scale-100">
            {symbol}
          </span>

          {/* Subscript Hanja for quick clarity */}
          {p.type !== 'cannon' && (
            <span className="absolute bottom-0 right-0 text-[6.5px] font-mono leading-none opacity-80 text-white font-bold pointer-events-none">
              {hanja}
            </span>
          )}
        </div>
      );
    }

    // THEME 5: Neo Modern Chess (네오 모던 체스)
    if (activeTheme === 'chess-modern') {
      const { symbol, hanja } = getChessPieceData(p);
      return (
        <div
          className={`relative ${sizeStyle} rounded-full flex items-center justify-center transition-all duration-200 select-none border-0 shadow-sm ${p.side === 'cho' ? 'piece-chess-modern-cho' : 'piece-chess-modern-han'
            }`}
        >
          <span className="piece-char font-mono select-none leading-none scale-105">
            {symbol}
          </span>

          {/* Subscript Hanja badge */}
          {p.type !== 'cannon' && (
            <span className="absolute bottom-0 right-0 text-[6.5px] font-mono leading-none opacity-80 text-white font-bold pointer-events-none">
              {hanja}
            </span>
          )}
        </div>
      );
    }

    // THEME 1: 왕실 전통 목각 (Classic Royal Wood)
    if (activeTheme === 'wood') {
      return (
        <div
          className={`relative ${sizeStyle} rounded-full flex items-center justify-center transition-all duration-200 select-none border-0 shadow-sm ${p.side === 'cho' ? 'piece-wood-cho' : 'piece-wood-han'
            }`}
        >
          <span className="piece-char font-calligraphy font-black tracking-tight scale-100">
            {p.label}
          </span>
        </div>
      );
    }

    // THEME 2: 네오 사이버 크리스탈 (Neo Cyber Crystal)
    if (activeTheme === 'crystal') {
      return (
        <div
          className={`relative ${sizeStyle} rounded-full flex items-center justify-center transition-all duration-200 select-none border-0 shadow-sm ${p.side === 'cho' ? 'piece-crystal-cho' : 'piece-crystal-han'
            }`}
        >
          <span className="piece-char font-calligraphy font-black tracking-tight scale-100">
            {p.label}
          </span>
        </div>
      );
    }

    // THEME 3: 프리미엄 흑백 옥석 (Modern Ivory & Obsidian)
    return (
      <div
        className={`relative ${sizeStyle} rounded-full flex items-center justify-center transition-all duration-200 select-none border-0 shadow-sm ${p.side === 'cho' ? 'piece-modern-cho' : 'piece-modern-han'
          }`}
      >
        <span className="piece-char font-calligraphy font-black tracking-tight scale-100">
          {p.label}
        </span>
      </div>
    );
  };

  const getThemeDisplayName = (themeId: PieceTheme) => {
    switch (themeId) {
      case 'chess-classic':
        return t.themeChessClassic;
      case 'chess-modern':
        return t.themeChessModern;
      case 'wood':
        return t.themeWood;
      case 'crystal':
        return t.themeCrystal;
      case 'modern':
        return t.themeModern;
      default:
        return '기물';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[540px] mx-auto">
      {/* Piece Theme Switcher Bar */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-2 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>{t.pieceTheme}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium hidden sm:inline-block">
            {getThemeDisplayName(activeTheme)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick theme buttons for popular styles */}
          <div className="flex items-center gap-1 p-0.5 bg-black/60 rounded-xl border border-white/10">
            <button
              onClick={() => handleSelectTheme('chess-classic')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${activeTheme === 'chess-classic'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md border border-sky-300/50 scale-105'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              title="클래식 체스 스타일: 킹, 룩, 나이트, 비숍, 폰 디자인"
            >
              <span>♚</span>
              <span className="hidden sm:inline">로열 체스</span>
            </button>
            <button
              onClick={() => handleSelectTheme('chess-modern')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${activeTheme === 'chess-modern'
                  ? 'bg-gradient-to-r from-cyan-600 to-amber-600 text-white shadow-md border border-cyan-300/50 scale-105'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              title="네오 모던 체스: 미래지향 네온 체스말"
            >
              <span>♜</span>
              <span className="hidden sm:inline">네오 체스</span>
            </button>
            <button
              onClick={() => handleSelectTheme('wood')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${activeTheme === 'wood'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 shadow-md border border-amber-400/50 scale-105'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              title="왕실 전통 목각: 팔각 목각패"
            >
              <span>🪵</span>
              <span className="hidden sm:inline">전통 목각</span>
            </button>
          </div>

          {/* Full Theme Selection Modal Trigger Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
            title="기물 스타일 전체 보기 및 상세 선택"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px]">전체 선택</span>
          </button>
        </div>
      </div>

      {/* Top Player Info (Han / AI) */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center font-bold text-rose-400 text-xs">
            漢
          </div>
          <div>
            <div className="font-semibold text-gray-200 flex items-center gap-1.5">
              <span>{t.hanCountry}</span>
              {playerSide === 'han' && <span className="text-[10px] bg-pink-500/30 text-pink-300 px-1 rounded">나</span>}
            </div>
            <div className="text-[10px] text-gray-400">덤 1.5점 포함 · {scores.han}{t.points}</div>
          </div>
        </div>

        {/* Captured Cho Pieces */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[180px]">
          {capturedCho.map((tPiece, idx) => (
            <span key={idx} className="text-[11px] px-1 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 font-bold font-calligraphy">
              {tPiece === 'chariot' ? '車' : tPiece === 'cannon' ? '包' : tPiece === 'horse' ? '馬' : tPiece === 'elephant' ? '象' : tPiece === 'guard' ? '士' : '卒'}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {isTimerActive && turn === 'han' && (
            <div
              className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs flex items-center gap-1 border ${
                timerSeconds <= 10
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse shadow-sm shadow-rose-500/30'
                  : 'bg-black/50 text-amber-300 border-amber-400/30'
              }`}
            >
              <Clock className={`w-3 h-3 ${timerSeconds <= 10 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              <span>{timerSeconds}s</span>
            </div>
          )}
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${turn === 'han' ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-gray-400'}`}>
            {turn === 'han' ? t.turnHan : '대기'}
          </div>
        </div>
      </div>

      {/* 30-Second Turn Timer Progress Bar */}
      {isTimerActive && (
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden mb-1.5 border border-white/10 shadow-inner">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timerSeconds <= 10
                ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse'
                : 'bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500'
            }`}
            style={{ width: `${(timerSeconds / 30) * 100}%` }}
          />
        </div>
      )}

      {/* Interactive Board Container */}
      <div className="relative w-full aspect-[9/10] rounded-2xl p-2.5 shadow-2xl overflow-hidden select-none janggi-board-wood border border-amber-900/40">
        {/* SVG Board Lines & Palaces */}
        <svg viewBox="0 0 900 1000" className="absolute inset-0 w-full h-full pointer-events-none p-2.5">
          {/* Border lines */}
          <rect x="54" y="50" width="792" height="900" fill="none" stroke="#5a3312" strokeWidth="4" />
          <rect x="50" y="46" width="800" height="908" fill="none" stroke="#3d210b" strokeWidth="1.5" />

          {/* Horizontal Grid lines (10 rows) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
            <line
              key={`h-${r}`}
              x1="54"
              y1={50 + r * 100}
              x2="846"
              y2={50 + r * 100}
              stroke="#6b3d17"
              strokeWidth="2"
            />
          ))}

          {/* Vertical Grid lines (9 columns) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
            <line
              key={`v-${c}`}
              x1={54 + c * 99}
              y1="50"
              x2={54 + c * 99}
              y2="950"
              stroke="#6b3d17"
              strokeWidth="2"
            />
          ))}

          {/* Han Palace Diagonals (X marks top palace: row 0..2, col 3..5) */}
          <line x1={54 + 3 * 99} y1={50 + 0 * 100} x2={54 + 5 * 99} y2={50 + 2 * 100} stroke="#6b3d17" strokeWidth="2.5" />
          <line x1={54 + 5 * 99} y1={50 + 0 * 100} x2={54 + 3 * 99} y2={50 + 2 * 100} stroke="#6b3d17" strokeWidth="2.5" />

          {/* Cho Palace Diagonals (X marks bottom palace: row 7..9, col 3..5) */}
          <line x1={54 + 3 * 99} y1={50 + 7 * 100} x2={54 + 5 * 99} y2={50 + 9 * 100} stroke="#6b3d17" strokeWidth="2.5" />
          <line x1={54 + 5 * 99} y1={50 + 7 * 100} x2={54 + 3 * 99} y2={50 + 9 * 100} stroke="#6b3d17" strokeWidth="2.5" />

          {/* Han / Cho Palace center circles */}
          <circle cx={54 + 4 * 99} cy={50 + 1 * 100} r="5" fill="#6b3d17" />
          <circle cx={54 + 4 * 99} cy={50 + 8 * 100} r="5" fill="#6b3d17" />

          {/* Quest & Tactic Guide Arrow */}
          {guideMove && (
            <g className="pointer-events-none">
              <defs>
                <marker
                  id="guide-arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 1, 8 4, 0 7" fill="#f59e0b" />
                </marker>
                <filter id="guide-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <line
                x1={54 + guideMove.from.c * 99}
                y1={50 + guideMove.from.r * 100}
                x2={54 + guideMove.to.c * 99}
                y2={50 + guideMove.to.r * 100}
                stroke="#fbbf24"
                strokeWidth="5"
                strokeDasharray="8 6"
                strokeLinecap="round"
                opacity="0.95"
                filter="url(#guide-glow)"
                markerEnd="url(#guide-arrowhead)"
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* 10 x 9 Clickable Intersection Points */}
        <div className="relative w-full h-full">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isSelected = selectedPos?.r === r && selectedPos?.c === c;
              const isValidTarget = validMoves.some((m) => m.r === r && m.c === c);
              const isLastMoveFrom = lastMove?.from.r === r && lastMove?.from.c === c;
              const isLastMoveTo = lastMove?.to.r === r && lastMove?.to.c === c;
              const isHintFrom = hintMove?.from.r === r && hintMove?.from.c === c;
              const isHintTo = hintMove?.to.r === r && hintMove?.to.c === c;
              const kingCheck = isKingCheckPos(piece);

              const leftPercent = pointsX[c];
              const topPercent = pointsY[r];

              return (
                <div
                  key={`${r}-${c}`}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  onClick={() => onSelectPos({ r, c })}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-9 sm:w-11 h-9 sm:h-11 flex items-center justify-center cursor-pointer transition-transform active:scale-95 group z-10"
                >
                  {/* Last Move Ring Highlight */}
                  {(isLastMoveFrom || isLastMoveTo) && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400/80 bg-indigo-500/15 animate-pulse pointer-events-none" />
                  )}

                  {/* AI Hint Marker */}
                  {(isHintFrom || isHintTo) && (
                    <div className="absolute -inset-1 rounded-full border-2 border-pink-400 bg-pink-500/20 animate-ping pointer-events-none" />
                  )}

                  {/* Selected Piece Highlight */}
                  {isSelected && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-amber-300 bg-amber-400/30 shadow-lg shadow-amber-400/50 animate-pulse pointer-events-none z-20" />
                  )}

                  {/* Valid Move Indicator (Dot for empty space) */}
                  {isValidTarget && !piece && (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse pointer-events-none" />
                  )}

                  {/* Valid Capture Target (Red pulsing ring on enemy piece) */}
                  {isValidTarget && piece && (
                    <div className="absolute -inset-1 rounded-full border-2 border-rose-500 bg-rose-500/30 animate-pulse pointer-events-none z-20" />
                  )}

                  {/* King Check Alert Glow */}
                  {kingCheck && (
                    <div className="absolute -inset-2 rounded-full border-2 border-rose-600 bg-rose-600/40 animate-ping pointer-events-none z-20" />
                  )}

                  {/* Quest / Tactic Guide: Start Square */}
                  {guideMove && guideMove.from.r === r && guideMove.from.c === c && (
                    <>
                      <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 bg-emerald-400/25 animate-ping pointer-events-none z-20" />
                      <div className="absolute -inset-1 rounded-full border-2 border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-400/50 pointer-events-none z-20" />
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-black font-black text-[9px] shadow-md shadow-emerald-500/50 animate-bounce whitespace-nowrap z-30 pointer-events-none">
                        이 말 터치
                      </span>
                    </>
                  )}

                  {/* Quest / Tactic Guide: Target Destination Square */}
                  {guideMove && guideMove.to.r === r && guideMove.to.c === c && (
                    <>
                      <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-400 bg-amber-400/20 animate-spin pointer-events-none z-20" style={{ animationDuration: '6s' }} />
                      <div className="absolute inset-0 rounded-full border-2 border-amber-400 bg-amber-400/30 shadow-lg shadow-amber-400/50 flex items-center justify-center pointer-events-none z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
                      </div>
                      <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[9px] shadow-md shadow-amber-400/50 whitespace-nowrap z-30 pointer-events-none">
                        여기 착수
                      </span>
                    </>
                  )}

                  {/* Piece Token */}
                  {piece && renderPieceToken(piece)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Player Info (Cho / Human) */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mt-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs">
            楚
          </div>
          <div>
            <div className="font-semibold text-gray-200 flex items-center gap-1.5">
              <span>{t.choCountry}</span>
              {playerSide === 'cho' && <span className="text-[10px] bg-pink-500/30 text-pink-300 px-1 rounded">나</span>}
            </div>
            <div className="text-[10px] text-gray-400">선수 · {scores.cho}{t.points}</div>
          </div>
        </div>

        {/* Captured Han Pieces */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[180px]">
          {capturedHan.map((tPiece, idx) => (
            <span key={idx} className="text-[11px] px-1 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 font-bold font-calligraphy">
              {tPiece === 'chariot' ? '車' : tPiece === 'cannon' ? '包' : tPiece === 'horse' ? '馬' : tPiece === 'elephant' ? '象' : tPiece === 'guard' ? '士' : '兵'}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {isTimerActive && turn === 'cho' && (
            <div
              className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs flex items-center gap-1 border ${
                timerSeconds <= 10
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/60 animate-pulse shadow-sm shadow-rose-500/30'
                  : 'bg-black/50 text-amber-300 border-amber-400/30'
              }`}
            >
              <Clock className={`w-3 h-3 ${timerSeconds <= 10 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              <span>{timerSeconds}s</span>
            </div>
          )}
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${turn === 'cho' ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/5 text-gray-400'}`}>
            {turn === 'cho' ? t.turnCho : '대기'}
          </div>
        </div>
      </div>

      {/* Piece Theme Selection Modal */}
      <PieceThemeModal
        isOpen={isThemeModalOpen}
        currentTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        onClose={() => setIsThemeModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
