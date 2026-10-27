import React, { useEffect } from 'react';
import { Award, X, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import versionData from '../version.json';

interface RankCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankName: string;
  playerName?: string;
}

export const RankCertificateModal: React.FC<RankCertificateModalProps> = ({
  isOpen,
  onClose,
  rankName,
  playerName = '체스 수련자',
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-[#1b1915] via-[#14120e] to-[#0a0a0f] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Certificate Golden Border Frame */}
        <div className="border border-amber-500/30 rounded-2xl p-6 relative">
          {/* Header Emblem */}
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 p-[2px] shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-[#17140e] rounded-[14px] flex items-center justify-center text-3xl">
              🌰
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wider mb-1 font-serif">
            도토리 체스 공인 급수증
          </h2>
          <p className="text-[11px] text-amber-200/70 tracking-widest uppercase font-mono mb-4">
            Official Certificate of Chess Proficiency
          </p>

          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto mb-4" />

          {/* Player Name */}
          <p className="text-sm text-gray-300 mb-1">수여자 성명</p>
          <p className="text-lg font-bold text-white mb-4">
            {playerName} 님
          </p>

          {/* Achieved Rank Badge */}
          <div className="inline-block px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 mb-4 shadow-inner">
            <span className="text-xs text-amber-200 block mb-0.5">공인 공인 급수</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
              {rankName}
            </span>
          </div>

          <p className="text-xs text-amber-100/80 leading-relaxed mb-6 px-2">
            위 사람은 도토리 체스 러닝(Dotori Chess Learning)의 공식 교육 퀘스트와
            AI 급수 판정 대국에서 뛰어난 체스 전술과 수읽기 실력을 입증하였으므로 본 급수증을 수여합니다.
          </p>

          {/* Footer Seals */}
          <div className="flex items-center justify-between text-left border-t border-amber-500/20 pt-4 px-2">
            <div>
              <p className="text-[10px] text-gray-400">발급 일자</p>
              <p className="text-xs font-semibold text-gray-200 font-mono">{todayStr}</p>
              <p className="text-[9px] text-gray-500 font-mono">DCL-REG: {versionData?.version || 'DCL-2026'}</p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Sparkles size={14} />
                <span>도토리 툴즈 위원회</span>
              </div>
              <p className="text-[10px] text-gray-400">Dotori Tools Chess Academy</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-sm rounded-xl shadow-lg transition cursor-pointer"
        >
          확인 및 보관하기
        </button>
      </div>
    </div>
  );
};
