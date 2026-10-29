import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Home, Sparkles, Swords, X } from 'lucide-react';

interface RankCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: string;
  opponentTierName: string;
  turns: number;
  acornsEarned: number;
  onGoHome: () => void;
  onNextTier: () => void;
  hasNextTier?: boolean;
}

export const RankCertificateModal: React.FC<RankCertificateModalProps> = ({
  isOpen,
  onClose,
  grade,
  opponentTierName,
  turns,
  acornsEarned,
  onGoHome,
  onNextTier,
  hasNextTier = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire victory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#6366f1', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-gradient-to-b from-[#161726] to-[#0d0e17] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden glow-pink"
      >
        {/* Decorative corner stars */}
        <div className="absolute top-4 left-4 text-amber-400 opacity-60">✦</div>
        <div className="absolute top-4 right-12 text-amber-400 opacity-60">✦</div>
        <div className="absolute bottom-4 left-4 text-amber-400 opacity-60">✦</div>
        <div className="absolute bottom-4 right-4 text-amber-400 opacity-60">✦</div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Emblem */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-600 p-1 flex items-center justify-center shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
          <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <div className="space-y-1 mb-5">
          <div className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
            DOTORI JANGGI LEARNING CERTIFICATE
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            도토리 장기 공인 급수증
          </h2>
          <p className="text-xs text-gray-400">
            {opponentTierName}과의 치열한 대국에서 완벽한 승리를 거두었습니다!
          </p>
        </div>

        {/* Big Certified Grade Badge */}
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 mb-5 space-y-2">
          <div className="text-xs text-gray-400">인증 획득 급수</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-sky-300 font-serif tracking-wide">
            {grade}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-300 pt-2 border-t border-white/10">
            <span>총 {turns}수 승리</span>
            <span>·</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{acornsEarned} 도토리 수여
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400 space-y-1 mb-6">
          <p>귀하는 빼어난 수읽기와 정교한 전술로 상기 급수의 기력을 공인받았으므로 본 증서를 수여합니다.</p>
          <p className="text-[11px] text-gray-500 font-mono pt-1">{todayStr} · Dotori Tools Official</p>
        </div>

        {/* Action Buttons: 1. 대국 로비로, 2. 확인 (다음 급수 즉시 대국) */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            type="button"
            onClick={onGoHome}
            className="sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>대국 로비로</span>
          </button>

          <button
            type="button"
            onClick={onNextTier}
            className="sm:w-2/3 py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
          >
            <Swords className="w-4 h-4" />
            <span>{hasNextTier ? '확인 (다음 급수 즉시 대국 시작)' : '확인 (다시 도전하기)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
