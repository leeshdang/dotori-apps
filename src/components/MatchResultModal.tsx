import React from 'react';
import { Flag, Home, RotateCcw, Swords, Trophy, X, ShieldAlert } from 'lucide-react';

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: 'win' | 'loss' | 'draw';
  reason: string; // '기권' | '외통수' | etc.
  opponentTierName: string;
  turns: number;
  onGoHome: () => void;
  onRematch: () => void;
  hasNextTier?: boolean;
  onNextTier?: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  onClose,
  result,
  reason,
  opponentTierName,
  turns,
  onGoHome,
  onRematch,
  hasNextTier,
  onNextTier,
}) => {
  if (!isOpen) return null;

  const isResign = reason === '기권';
  const isWin = result === 'win';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-md w-full bg-gradient-to-b from-[#161726] to-[#0d0e17] border-2 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden ${isWin
            ? 'border-emerald-500/50 shadow-emerald-500/20'
            : isResign
              ? 'border-rose-500/50 shadow-rose-500/20'
              : 'border-amber-500/50 shadow-amber-500/20'
          }`}
      >
        {/* Close 'X' */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emblem */}
        <div
          className={`w-18 h-18 rounded-full p-1 flex items-center justify-center shadow-xl mb-4 ${isWin
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/30'
              : isResign
                ? 'bg-gradient-to-tr from-rose-600 to-amber-600 shadow-rose-500/30'
                : 'bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-indigo-500/30'
            }`}
        >
          <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center">
            {isWin ? (
              <Trophy className="w-9 h-9 text-emerald-400" />
            ) : isResign ? (
              <Flag className="w-9 h-9 text-rose-400" />
            ) : (
              <ShieldAlert className="w-9 h-9 text-amber-400" />
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 mb-5">
          <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
            DOTORI JANGGI AI MATCH
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isWin
              ? '대국 승리!'
              : isResign
                ? '대국 기권'
                : '대국 종료 (패배)'}
          </h2>
          <p className="text-xs text-gray-400 px-2">
            {isWin
              ? `${reason}로 승리를 거두었습니다! 축하합니다.`
              : isResign
                ? '대국을 기권하여 패배 처리되었습니다. 다음 대국에서 승리를 노려보세요!'
                : `${reason}로 패배하였습니다. 다음 기회에 다시 도전해보세요!`}
          </p>
        </div>

        {/* Match Statistics Card */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-gray-400">대국 상대</span>
            <span className="text-gray-200 font-bold">{opponentTierName}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-gray-400">진행 수수</span>
            <span className="text-gray-200 font-bold font-mono">{turns}수</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-gray-400">최종 결과</span>
            <span
              className={`font-black ${isWin ? 'text-emerald-400' : isResign ? 'text-rose-400' : 'text-amber-400'
                }`}
            >
              {isWin ? '승리 (승급)' : isResign ? '기권 패' : '외통수 패'}
            </span>
          </div>
        </div>

        {/* Action Buttons: 1. 대국 로비로, 2. 확인 (다음 급수 도전 or 다시 도전) */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            type="button"
            onClick={onGoHome}
            className="sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>대국 로비로</span>
          </button>

          {isWin && hasNextTier && onNextTier ? (
            <button
              type="button"
              onClick={onNextTier}
              className="sm:w-2/3 py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              <Swords className="w-4 h-4" />
              <span>확인 (다음 급수 즉시 대국 시작)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRematch}
              className="sm:w-2/3 py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 도전하기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
