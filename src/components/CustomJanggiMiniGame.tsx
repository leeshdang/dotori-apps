import React, { useState, useRef, useEffect } from 'react';
import { BoardState, Move, Piece, PieceType, Position, Side, AIRankTier, PieceTheme, Language } from '../types/janggi';
import {
  createEmptyBoard,
  cloneBoard,
  getLegalMoves,
  isKingInCheck,
  getAllLegalMoves,
  generateNotation,
  getInitialBoard,
} from '../utils/janggiEngine';
import { getBestAIMove, AI_RANK_TIERS } from '../utils/aiEngine';
import { sound } from '../utils/soundEffects';
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  Play,
  Swords,
  Undo2,
  Lightbulb,
  Flag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CustomJanggiMiniGameProps {
  pieceTheme?: PieceTheme;
  lang?: Language;
  userAcorns?: number;
  onEarnAcorns?: (amount: number) => void;
}

interface PieceStock {
  type: PieceType;
  label: string;
  total: number;
  name: string;
}

const INITIAL_STOCKS: PieceStock[] = [
  { type: 'chariot', label: '車', total: 2, name: '차(車)' },
  { type: 'cannon', label: '包', total: 2, name: '포(包)' },
  { type: 'horse', label: '馬', total: 2, name: '마(馬)' },
  { type: 'elephant', label: '象', total: 2, name: '상(象)' },
  { type: 'guard', label: '士', total: 2, name: '사(士)' },
  { type: 'soldier', label: '卒', total: 5, name: '졸(卒)' },
];

export const CustomJanggiMiniGame: React.FC<CustomJanggiMiniGameProps> = ({
  lang = 'ko',
  onEarnAcorns,
}) => {
  const [phase, setPhase] = useState<'placement' | 'playing'>('placement');
  const [aiTier, setAiTier] = useState<AIRankTier>('18k');

  // Placement state
  const [selectedStockType, setSelectedStockType] = useState<PieceType>('chariot');
  const [placedBoard, setPlacedBoard] = useState<BoardState>(() => {
    const b = createEmptyBoard();
    b[8][4] = { id: 'cho-king', side: 'cho', type: 'king', label: '楚' };
    return b;
  });

  // Gameplay state
  const [gameBoard, setGameBoard] = useState<BoardState>(() => createEmptyBoard());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [turn, setTurn] = useState<Side>('cho');
  const [isThinking, setIsThinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('원하는 기물을 선택하여 내 진영에 자유롭게 배치하세요.');
  const [hintMove, setHintMove] = useState<{ from: Position; to: Position } | null>(null);
  const [gameHistory, setGameHistory] = useState<BoardState[]>([]);
  const [matchResult, setMatchResult] = useState<'win' | 'loss' | null>(null);

  // Compute remaining pieces in storage
  const getRemainingCount = (type: PieceType): number => {
    const stock = INITIAL_STOCKS.find((s) => s.type === type);
    if (!stock) return 0;
    let placed = 0;
    for (let r = 5; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = placedBoard[r][c];
        if (p && p.side === 'cho' && p.type === type) placed++;
      }
    }
    return Math.max(0, stock.total - placed);
  };

  const totalPlacedCount = INITIAL_STOCKS.reduce((acc, s) => {
    return acc + (s.total - getRemainingCount(s.type));
  }, 0);
  const isPlacementComplete = totalPlacedCount === 15;

  // Reset placement to empty (King only)
  const handleResetPlacement = () => {
    const b = createEmptyBoard();
    b[8][4] = { id: 'cho-king', side: 'cho', type: 'king', label: '楚' };
    setPlacedBoard(b);
    setStatusMessage('장(楚)을 제외한 모든 기물이 회수되었습니다. 자유롭게 배치해보세요.');
    sound.playPlace();
  };

  // Preset: standard placement
  const handleStandardPlacement = () => {
    const standard = getInitialBoard('gwima', 'gwima');
    const b = createEmptyBoard();
    for (let r = 5; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        b[r][c] = standard[r][c];
      }
    }
    setPlacedBoard(b);
    setStatusMessage('표준 정규 포진(귀마)으로 채워졌습니다. 원하는 대로 수정할 수 있습니다.');
    sound.playPlace();
  };

  // Random automatic placement
  const handleRandomPlacement = () => {
    const b = createEmptyBoard();
    b[8][4] = { id: 'cho-king', side: 'cho', type: 'king', label: '楚' };

    // Available slots: row 5..9, col 0..8 excluding (8,4)
    const availableSlots: Position[] = [];
    for (let r = 5; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (r === 8 && c === 4) continue;
        availableSlots.push({ r, c });
      }
    }

    // Shuffle slots
    for (let i = availableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }

    let slotIdx = 0;
    let idCounter = 1;
    INITIAL_STOCKS.forEach((stock) => {
      for (let i = 0; i < stock.total; i++) {
        if (slotIdx < availableSlots.length) {
          const { r, c } = availableSlots[slotIdx++];
          b[r][c] = {
            id: `cho-${stock.type}-${idCounter++}`,
            side: 'cho',
            type: stock.type,
            label: stock.label,
          };
        }
      }
    });

    setPlacedBoard(b);
    setStatusMessage('기상천외한 랜덤 배치가 완료되었습니다! 대국을 시작해보세요.');
    sound.playPlace();
  };

  // Placement click handler
  const handleCellClickPlacement = (r: number, c: number) => {
    // Only allowed in player's territory: row 5..9
    if (r < 5) {
      setStatusMessage('상대방 진영(1~5선)에는 말을 놓을 수 없습니다. 내 진영(6~10선)에 배치하세요.');
      return;
    }

    // King cannot be replaced
    if (r === 8 && c === 4) {
      setStatusMessage('왕(楚)은 본궁 중심에 든든하게 자리하고 있습니다.');
      return;
    }

    const currentPiece = placedBoard[r][c];

    // If there is already a piece placed, remove/retrieve it
    if (currentPiece) {
      const newB = cloneBoard(placedBoard);
      newB[r][c] = null;
      setPlacedBoard(newB);
      setSelectedStockType(currentPiece.type);
      setStatusMessage(`${currentPiece.label} 말을 보관함으로 회수했습니다.`);
      sound.playPlace();
      return;
    }

    // Place selected stock piece if available
    const remaining = getRemainingCount(selectedStockType);
    if (remaining <= 0) {
      setStatusMessage(`보관함에 남은 ${selectedStockType} 말이 없습니다. 다른 말을 선택하세요.`);
      return;
    }

    const stock = INITIAL_STOCKS.find((s) => s.type === selectedStockType);
    if (!stock) return;

    const newB = cloneBoard(placedBoard);
    newB[r][c] = {
      id: `cho-${stock.type}-${Date.now()}-${r}-${c}`,
      side: 'cho',
      type: stock.type,
      label: stock.label,
    };
    setPlacedBoard(newB);
    sound.playPlace();

    // Auto-advance to next available stock piece if this one is exhausted
    if (remaining - 1 <= 0) {
      const nextAvailable = INITIAL_STOCKS.find((s) => {
        if (s.type === selectedStockType) return false;
        let pCount = 0;
        for (let row = 5; row < 10; row++) {
          for (let col = 0; col < 9; col++) {
            const p = newB[row][col];
            if (p && p.side === 'cho' && p.type === s.type) pCount++;
          }
        }
        return s.total - pCount > 0;
      });
      if (nextAvailable) setSelectedStockType(nextAvailable.type);
    }
  };

  // Start match with custom board!
  const handleStartCustomMatch = () => {
    if (!isPlacementComplete) {
      setStatusMessage(`말 15개를 모두 배치해야 대국을 시작할 수 있습니다. (현재 ${totalPlacedCount}/15)`);
      return;
    }

    // Generate opponent Han standard board (row 0..4)
    const standard = getInitialBoard('gwima', 'gwima');
    const combinedBoard = createEmptyBoard();

    // Copy Han pieces from standard
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        combinedBoard[r][c] = standard[r][c];
      }
    }

    // Copy custom Cho pieces (row 5..9)
    for (let r = 5; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        combinedBoard[r][c] = placedBoard[r][c];
      }
    }

    setGameBoard(combinedBoard);
    setPhase('playing');
    setTurn('cho');
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setHintMove(null);
    setGameHistory([cloneBoard(combinedBoard)]);
    setMatchResult(null);
    setStatusMessage('내맘대로 장기 대국 시작! (초 선수 - 나의 차례)');
    sound.playSuccess();
  };

  // Gameplay cell click
  const handleCellClickGameplay = (r: number, c: number) => {
    if (isThinking || matchResult) return;

    const clickedPiece = gameBoard[r][c];

    // If already selected, check if valid move
    if (selectedPos) {
      const isMoveTarget = validMoves.some((m) => m.r === r && m.c === c);
      if (isMoveTarget) {
        const from = selectedPos;
        const to = { r, c };
        const movingPiece = gameBoard[from.r][from.c];
        if (!movingPiece) return;

        const captured = gameBoard[to.r][to.c];
        const newB = cloneBoard(gameBoard);
        newB[to.r][to.c] = movingPiece;
        newB[from.r][from.c] = null;

        if (captured) sound.playCapture();
        else sound.playPlace();

        const moveObj: Move = {
          from,
          to,
          piece: movingPiece,
          captured,
          notation: generateNotation({ from, to, piece: movingPiece, captured }),
        };

        setGameBoard(newB);
        setSelectedPos(null);
        setValidMoves([]);
        setLastMove(moveObj);
        setHintMove(null);
        setGameHistory((prev) => [...prev, cloneBoard(newB)]);

        // Check if captured enemy King -> Player wins!
        if (captured && captured.type === 'king') {
          setMatchResult('win');
          sound.playSuccess();
          onEarnAcorns?.(40);
          setStatusMessage('상대 궁(漢)을 생포하여 승리했습니다! 🎉 (+40 도토리)');
          return;
        }

        // Switch turn to Han (AI)
        setTurn('han');
        setStatusMessage('AI가 다음 수를 계산하고 있습니다...');
        setIsThinking(true);

        setTimeout(() => {
          const { move: aiMove } = getBestAIMove(newB, 'han', aiTier);
          setIsThinking(false);

          if (!aiMove) {
            setMatchResult('win');
            sound.playSuccess();
            onEarnAcorns?.(40);
            setStatusMessage('AI가 둘 수 있는 수가 없어 외통으로 승리했습니다! 🎉');
            return;
          }

          const aiNewB = cloneBoard(newB);
          const aiCaptured = aiNewB[aiMove.to.r][aiMove.to.c];
          aiNewB[aiMove.to.r][aiMove.to.c] = aiNewB[aiMove.from.r][aiMove.from.c];
          aiNewB[aiMove.from.r][aiMove.from.c] = null;

          if (aiCaptured) sound.playCapture();
          else sound.playPlace();

          const aiMoveObj: Move = {
            ...aiMove,
            notation: generateNotation(aiMove),
          };

          setGameBoard(aiNewB);
          setLastMove(aiMoveObj);
          setTurn('cho');
          setGameHistory((prev) => [...prev, cloneBoard(aiNewB)]);

          if (aiCaptured && aiCaptured.type === 'king') {
            setMatchResult('loss');
            sound.playDefeat();
            setStatusMessage('나의 궁(楚)이 잡혀 패배했습니다.');
            return;
          }

          setStatusMessage('AI의 수가 완료되었습니다. (나의 차례)');
        }, 500);

        return;
      }
    }

    // Select own piece
    if (clickedPiece && clickedPiece.side === turn && turn === 'cho') {
      setSelectedPos({ r, c });
      const moves = getLegalMoves(gameBoard, r, c);
      setValidMoves(moves);
      sound.playPlace();
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  // Undo move in gameplay
  const handleUndoMove = () => {
    if (gameHistory.length < 3 || isThinking || matchResult) return;
    const prevB = gameHistory[gameHistory.length - 3];
    setGameBoard(cloneBoard(prevB));
    setGameHistory((prev) => prev.slice(0, -2));
    setSelectedPos(null);
    setValidMoves([]);
    setLastMove(null);
    setTurn('cho');
    setStatusMessage('한 수를 무르고 내 차례로 돌아왔습니다.');
    sound.playPlace();
  };

  // AI Hint
  const handleAskHint = () => {
    if (isThinking || turn !== 'cho' || matchResult) return;
    const { move: best } = getBestAIMove(gameBoard, 'cho', '1d');
    if (best) {
      setHintMove({ from: best.from, to: best.to });
      setStatusMessage(`AI 코치 힌트: ${gameBoard[best.from.r][best.from.c]?.label} 말을 이동해보세요.`);
      sound.playPlace();
    }
  };

  const pointsX = [6, 17, 28, 39, 50, 61, 72, 83, 94];
  const pointsY = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Interactive Board View */}
      <div className="flex-1 flex flex-col items-center">
        {/* Top Status Banner */}
        <div className="w-full flex items-center justify-between px-3.5 py-2 mb-2 rounded-xl bg-black/40 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
            <span className="font-bold text-gray-200">{statusMessage}</span>
          </div>
          {phase === 'placement' && (
            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-pink-300">
              <span>배치 진행:</span>
              <span className={`px-1.5 py-0.5 rounded ${isPlacementComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-pink-500/20'}`}>
                {totalPlacedCount} / 15
              </span>
            </div>
          )}
        </div>

        {/* Board Canvas / Interactive Area */}
        <div className="relative w-full max-w-[460px] aspect-[9/10] rounded-2xl p-2.5 shadow-2xl overflow-hidden select-none janggi-board-wood border border-amber-900/40">
          {/* SVG Board Lines */}
          <svg viewBox="0 0 900 1000" className="absolute inset-0 w-full h-full pointer-events-none p-2.5">
            <rect x="54" y="50" width="792" height="900" fill="none" stroke="#5a3312" strokeWidth="4" />
            <rect x="50" y="46" width="800" height="908" fill="none" stroke="#3d210b" strokeWidth="1.5" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
              <line key={`h-${r}`} x1="54" y1={50 + r * 100} x2="846" y2={50 + r * 100} stroke="#6b3d17" strokeWidth="2" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
              <line key={`v-${c}`} x1={54 + c * 99} y1="50" x2={54 + c * 99} y2="950" stroke="#6b3d17" strokeWidth="2" />
            ))}
            {/* Palaces */}
            <line x1={54 + 3 * 99} y1={50} x2={54 + 5 * 99} y2={50 + 200} stroke="#6b3d17" strokeWidth="2.5" />
            <line x1={54 + 5 * 99} y1={50} x2={54 + 3 * 99} y2={50 + 200} stroke="#6b3d17" strokeWidth="2.5" />
            <line x1={54 + 3 * 99} y1={50 + 700} x2={54 + 5 * 99} y2={50 + 900} stroke="#6b3d17" strokeWidth="2.5" />
            <line x1={54 + 5 * 99} y1={50 + 700} x2={54 + 3 * 99} y2={50 + 900} stroke="#6b3d17" strokeWidth="2.5" />

            {/* Placement Mode: Highlight allowed user territory (Row 5..9) */}
            {phase === 'placement' && (
              <rect x="54" y={50 + 500} width="792" height="400" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="2" strokeDasharray="8 6" />
            )}
          </svg>

          {/* Grid Intersections */}
          <div className="relative w-full h-full">
            {(phase === 'placement' ? placedBoard : gameBoard).map((row, r) =>
              row.map((piece, c) => {
                const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                const isValidTarget = validMoves.some((m) => m.r === r && m.c === c);
                const isLast = lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c));
                const isHint = hintMove && ((hintMove.from.r === r && hintMove.from.c === c) || (hintMove.to.r === r && hintMove.to.c === c));
                const isAllowedPlacementSlot = phase === 'placement' && r >= 5 && !(r === 8 && c === 4);

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{ left: `${pointsX[c]}%`, top: `${pointsY[r]}%` }}
                    onClick={() => {
                      if (phase === 'placement') handleCellClickPlacement(r, c);
                      else handleCellClickGameplay(r, c);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95 group z-10 ${isAllowedPlacementSlot && !piece ? 'hover:scale-125' : ''
                      }`}
                  >
                    {/* Placement guide dot on empty allowed slots */}
                    {isAllowedPlacementSlot && !piece && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/40 group-hover:bg-emerald-400 border border-emerald-300/60 shadow-sm transition-all" />
                    )}

                    {/* Move Highlights */}
                    {isLast && <div className="absolute inset-0 rounded-full border-2 border-indigo-400/80 bg-indigo-500/15 animate-pulse" />}
                    {isHint && <div className="absolute -inset-1 rounded-full border-2 border-pink-400 bg-pink-500/20 animate-ping" />}
                    {isSelected && <div className="absolute -inset-1.5 rounded-full border-2 border-amber-300 bg-amber-400/30 shadow-md shadow-amber-400/50" />}
                    {isValidTarget && !piece && <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse" />}
                    {isValidTarget && piece && <div className="absolute -inset-1 rounded-full border-2 border-rose-500 bg-rose-500/30 animate-pulse" />}

                    {/* Clean Round Piece Token */}
                    {piece && (
                      <div
                        className={`rounded-full flex items-center justify-center select-none shadow-sm transition-all ${piece.type === 'king'
                            ? 'w-[31px] sm:w-[37px] h-[31px] sm:h-[37px] text-[13.5px] sm:text-[15.5px] font-black'
                            : ['chariot', 'cannon', 'horse', 'elephant'].includes(piece.type)
                              ? 'w-[27px] sm:w-[32px] h-[27px] sm:h-[32px] text-xs sm:text-[13.5px] font-bold'
                              : 'w-[23px] sm:w-[28px] h-[23px] sm:h-[28px] text-[11px] sm:text-xs font-bold'
                          } ${piece.side === 'cho' ? 'piece-wood-cho' : 'piece-wood-han'}`}
                      >
                        <span className="piece-char font-calligraphy font-black tracking-tight scale-100">
                          {piece.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Sidebar / Tray */}
      <div className="w-full lg:w-[360px] flex flex-col space-y-3 shrink-0">
        {phase === 'placement' ? (
          /* PLACEMENT TRAY & CONTROLS */
          <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-black text-white">내맘대로 기물 보관함</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-bold">
                15개 자유 배치
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              보관함에서 말을 선택한 후, 아래 내 진영(초록 점선) 원하는 교차점을 터치하여 배치하세요.
              (놓인 말을 다시 누르면 보관함으로 회수됩니다)
            </p>

            {/* Piece Storage Tray (6 types) */}
            <div className="grid grid-cols-3 gap-2">
              {INITIAL_STOCKS.map((stock) => {
                const remaining = getRemainingCount(stock.type);
                const isSelected = selectedStockType === stock.type;

                return (
                  <button
                    key={stock.type}
                    type="button"
                    onClick={() => setSelectedStockType(stock.type)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${isSelected
                        ? 'bg-gradient-to-b from-pink-500/20 to-indigo-500/20 border-pink-400 ring-2 ring-pink-500/30 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full piece-wood-cho flex items-center justify-center text-sm font-calligraphy font-black shadow-sm">
                      {stock.label}
                    </div>
                    <div className="text-[11px] font-bold text-gray-200">{stock.name}</div>
                    <div className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${remaining > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-500'}`}>
                      남음 {remaining}개
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Automation Tools */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                배치 도우미
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleRandomPlacement}
                  className="py-2 px-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 font-bold flex flex-col items-center gap-1 transition cursor-pointer active:scale-95"
                  title="내 진영에 기상천외한 랜덤 배치"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-300" />
                  <span>랜덤 배치</span>
                </button>

                <button
                  type="button"
                  onClick={handleStandardPlacement}
                  className="py-2 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold flex flex-col items-center gap-1 transition cursor-pointer active:scale-95"
                  title="기본 정규 포진 채우기"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>정규 배치</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPlacement}
                  className="py-2 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold flex flex-col items-center gap-1 transition cursor-pointer active:scale-95"
                  title="궁만 남기고 모두 비우기"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>전체 비우기</span>
                </button>
              </div>
            </div>

            {/* Start Match Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartCustomMatch}
                disabled={!isPlacementComplete}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${isPlacementComplete
                    ? 'bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500 text-white shadow-pink-500/25 hover:opacity-95 active:scale-98 animate-pulse'
                    : 'bg-white/10 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
              >
                <Swords className="w-4 h-4" />
                <span>
                  {isPlacementComplete
                    ? '⚔️ 이 포진으로 AI 대국 시작!'
                    : `말을 모두 배치하세요 (${totalPlacedCount}/15)`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* GAMEPLAY CONTROLS */
          <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">내맘대로 장기 실전 대국</h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${turn === 'cho' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {turn === 'cho' ? '초(나) 차례' : '한(AI) 차례'}
              </span>
            </div>

            {/* Match Result Banner */}
            {matchResult && (
              <div className={`p-3 rounded-xl border text-center font-bold text-xs ${matchResult === 'win'
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-400 text-rose-200'
                }`}>
                {matchResult === 'win' ? '🎉 축하합니다! 승리하셨습니다!' : '패배했습니다. 다시 도전해보세요!'}
              </div>
            )}

            {/* In-game Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUndoMove}
                disabled={gameHistory.length < 3 || isThinking || !!matchResult}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>무르기</span>
              </button>

              <button
                type="button"
                onClick={handleAskHint}
                disabled={isThinking || turn !== 'cho' || !!matchResult}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>AI 힌트</span>
              </button>
            </div>

            {/* Return to Placement Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPhase('placement')}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>새로운 포진 배치하러 가기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
