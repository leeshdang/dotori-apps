import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Flag,
  HelpCircle,
  Copy,
  Check,
  Award,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { BoardTheme, GameState, RankLevel } from '../types/chess';
import { RANK_LEVELS } from '../utils/aiEngine';
import { evaluatePosition } from '../utils/chessEngine';

interface AIMatchPanelProps {
  gameState: GameState;
  selectedLevel: RankLevel;
  onSelectLevel: (lvl: RankLevel) => void;
  onUndoMove: () => void;
  onResign: () => void;
  onShowHint: () => void;
  coachHint: string | null;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  onShowCertificate: () => void;
  playerColor: 'w' | 'b';
}

export const AIMatchPanel: React.FC<AIMatchPanelProps> = ({
  gameState,
  selectedLevel,
  onSelectLevel,
  onUndoMove,
  onResign,
  onShowHint,
  coachHint,
  boardTheme,
  setBoardTheme,
  isFlipped,
  setIsFlipped,
  onShowCertificate,
  playerColor,
}) => {
  const [copiedPgn, setCopiedPgn] = useState(false);
  const moveListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll move history to bottom when new move is added
  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [gameState.moveHistory.length]);

  // Compute evaluation score for white vs black
  const evalScore = evaluatePosition(gameState.board);
  const evalNormalized = Math.max(-1000, Math.min(1000, evalScore));
  const whitePercent = 50 + (evalNormalized / 1000) * 45; // 5% to 95%

  const isGameOver = gameState.isCheckmate || gameState.isDraw || gameState.isStalemate;
  const isPlayerWon = isGameOver && gameState.isCheckmate && gameState.winner === playerColor;

  const handleCopyPGN = () => {
    let pgn = '';
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = gameState.moveHistory[i]?.san || '';
      const blackMove = gameState.moveHistory[i + 1]?.san || '';
      pgn += `${moveNum}. ${whiteMove} ${blackMove} `.trim() + ' ';
    }
    navigator.clipboard.writeText(pgn.trim());
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-2.5 sm:space-y-3.5">
      {/* 5-Tier AI Rating Level Selector */}
      <div className="glass-card p-3 rounded-2xl border border-white/15">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-300">AI 급수 대국 상대</span>
          <span className="text-[11px] font-mono text-pink-400 font-semibold">
            ELO {selectedLevel.ratingMin}~{selectedLevel.ratingMax}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {RANK_LEVELS.map(lvl => {
            const isSelected = lvl.id === selectedLevel.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer text-center ${
                  isSelected
                    ? `bg-gradient-to-b ${lvl.badgeColor} text-white font-bold shadow-lg scale-105`
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                }`}
                title={lvl.description}
              >
                <span className="text-base sm:text-lg mb-0.5">{lvl.avatar}</span>
                <span className="text-[10px] sm:text-[11px] font-bold truncate max-w-full">
                  {lvl.id === 5 ? '마스터' : `${19 - lvl.id * 3}급`}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-gray-300 leading-snug">
          <span className="font-bold text-white">[{selectedLevel.title}]</span>: {selectedLevel.description}
        </p>
      </div>

      {/* Real-time Evaluation Bar */}
      <div className="glass-card p-3 rounded-2xl border border-white/15">
        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
          <span className="flex items-center gap-1.5 text-gray-100 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-sm" /> 백 (White)
          </span>
          <span className="font-bold text-amber-300">
            {evalScore > 0 ? `+${(evalScore / 100).toFixed(1)}` : (evalScore / 100).toFixed(1)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-300 font-bold">
            흑 (Black) <span className="w-2.5 h-2.5 rounded-full bg-gray-900 border border-gray-500 inline-block" />
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 rounded-full bg-gray-950 border border-white/15 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-gray-200 to-white transition-all duration-300"
            style={{ width: `${whitePercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-gray-700 to-gray-900 transition-all duration-300"
            style={{ width: `${100 - whitePercent}%` }}
          />
        </div>
      </div>

      {/* Check / Game-Over Alerts */}
      {gameState.isCheck && !isGameOver && (
        <div className="p-2.5 rounded-xl bg-rose-500/25 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-md">
          <span>⚠️ {gameState.turn === 'w' ? '백' : '흑'} 킹에게 체크(Check)!</span>
        </div>
      )}

      {isGameOver && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-indigo-500/25 border border-pink-500/50 text-center animate-fade-in shadow-xl">
          <p className="text-base font-black text-white mb-1">
            {gameState.isCheckmate
              ? `외통수! ${gameState.winner === 'w' ? '백(White)' : '흑(Black)'} 승리!`
              : `무승부 (${gameState.drawReason})`}
          </p>
          <p className="text-xs text-gray-200 mb-3">
            {gameState.isCheckmate
              ? gameState.winner === playerColor
                ? '축하합니다! AI를 꺾고 빛나는 승리를 거두었습니다!'
                : '아쉽게 패배했습니다. 다시 도전하여 복수하세요!'
              : '치열한 접전 끝에 무승부로 끝났습니다.'}
          </p>

          {isPlayerWon && (
            <button
              onClick={onShowCertificate}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition cursor-pointer"
            >
              <Award size={16} />
              <span>🏆 도토리 체스 공인 급수증 발급받기</span>
            </button>
          )}
        </div>
      )}

      {/* AI Coach Hint Box */}
      {coachHint && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs animate-fade-in shadow-md">
          <p className="leading-relaxed">{coachHint}</p>
        </div>
      )}

      {/* Board Controls (Themes & Flip) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Palette size={14} className="text-gray-300" />
          <select
            value={boardTheme}
            onChange={e => setBoardTheme(e.target.value as BoardTheme)}
            className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-gray-100 font-semibold cursor-pointer focus:outline-none"
          >
            <option value="royal-wood" className="bg-gray-900 text-white">황실 우드 (Royal Wood)</option>
            <option value="neo-cyber" className="bg-gray-900 text-white">네오 사이버 (Neo Cyber)</option>
            <option value="tournament-ivory" className="bg-gray-900 text-white">토너먼트 (Tournament)</option>
            <option value="studio-bright" className="bg-gray-900 text-white">스튜디오 브라이트 (고대비 / High Contrast)</option>
          </select>
        </div>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs text-gray-200 font-medium transition cursor-pointer"
          title="판 뒤집기"
        >
          <RefreshCw size={12} />
          <span>보드 회전</span>
        </button>
      </div>

      {/* Action Buttons: Hint, Undo, Resign */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowHint}
          disabled={isGameOver}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <HelpCircle size={14} />
          <span>코치 힌트</span>
        </button>

        <button
          onClick={onUndoMove}
          disabled={gameState.moveHistory.length === 0 || isGameOver}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-gray-100 rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>무르기</span>
        </button>

        <button
          onClick={onResign}
          disabled={isGameOver}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/25 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-sm"
        >
          <Flag size={14} />
          <span>기권</span>
        </button>
      </div>

      {/* Algebraic Move Notation List (PGN Record) */}
      <div className="flex-1 flex flex-col glass-card p-3 rounded-2xl border border-white/15 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-200">실시간 기보 (Move History)</span>
            {gameState.moveHistory.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                {gameState.moveHistory.length}수 진행
              </span>
            )}
          </div>
          <button
            onClick={handleCopyPGN}
            className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white transition cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10"
          >
            {copiedPgn ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedPgn ? '복사됨' : '기보 복사'}</span>
          </button>
        </div>

        <div
          ref={moveListRef}
          className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs space-y-1 pr-1"
        >
          {gameState.moveHistory.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic text-center py-6">
              아직 착수된 수가 없습니다.
            </p>
          ) : (
            Array.from({ length: Math.ceil(gameState.moveHistory.length / 2) }).map((_, idx) => {
              const moveNum = idx + 1;
              const whiteMove = gameState.moveHistory[idx * 2]?.san;
              const blackMove = gameState.moveHistory[idx * 2 + 1]?.san;
              const isWhiteLast = gameState.moveHistory.length === idx * 2 + 1;
              const isBlackLast = gameState.moveHistory.length === idx * 2 + 2;

              return (
                <div
                  key={idx}
                  className={`flex items-center py-1.5 px-2 rounded-lg transition ${
                    isWhiteLast || isBlackLast
                      ? 'bg-amber-400/20 border border-amber-400/50 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="w-8 text-gray-400 font-bold">{moveNum}.</span>

                  {/* White Move */}
                  <span
                    className={`flex-1 font-semibold rounded px-1.5 py-0.5 transition ${
                      isWhiteLast
                        ? 'bg-yellow-300 text-black font-black shadow-sm flex items-center justify-between ring-2 ring-yellow-400'
                        : 'text-gray-100'
                    }`}
                  >
                    <span>{whiteMove}</span>
                    {isWhiteLast && <span className="inline-block w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                  </span>

                  {/* Black Move */}
                  <span
                    className={`flex-1 font-semibold rounded px-1.5 py-0.5 transition ${
                      isBlackLast
                        ? 'bg-yellow-300 text-black font-black shadow-sm flex items-center justify-between ring-2 ring-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span>{blackMove || ''}</span>
                    {isBlackLast && <span className="inline-block w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
