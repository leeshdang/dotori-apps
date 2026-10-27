import React from 'react';
import { Award, CheckCircle, ShieldCheck, Trophy, User, Sparkles } from 'lucide-react';

interface ProfilePanelProps {
  acorns: number;
  completedQuests: number[];
  completedTactics: number[];
  matchStats: { wins: number; losses: number; draws: number };
  highestRank: string;
  onOpenCertificate: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  acorns,
  completedQuests,
  completedTactics,
  matchStats,
  highestRank,
  onOpenCertificate,
}) => {
  const totalMatches = matchStats.wins + matchStats.losses + matchStats.draws;
  const winRate = totalMatches > 0 ? ((matchStats.wins / totalMatches) * 100).toFixed(0) : '0';

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* User Summary Card */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-[2px] mb-3 shadow-lg shadow-pink-500/25">
          <div className="w-full h-full bg-[#12131D] rounded-[14px] flex items-center justify-center text-3xl">
            ♟️
          </div>
        </div>

        <h2 className="text-lg font-black text-white mb-0.5">도토리 체스 마스터 도전자</h2>
        <p className="text-xs text-pink-400 font-bold mb-3 font-mono">
          공인 판정 급수: {highestRank}
        </p>

        {/* Acorn Coin Balance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm font-mono shadow-sm">
          <span>🌰 보유 도토리:</span>
          <span>{acorns.toLocaleString()} 개</span>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-pink-400 mb-1">
            <Trophy size={16} />
            <span className="text-xs font-bold">기초 퀘스트</span>
          </div>
          <p className="text-xl font-black text-white font-mono">
            {completedQuests.length} <span className="text-xs text-gray-400 font-normal">/ 10</span>
          </p>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
              style={{ width: `${(completedQuests.length / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Sparkles size={16} />
            <span className="text-xs font-bold">고급 전술 마스터</span>
          </div>
          <p className="text-xl font-black text-white font-mono">
            {completedTactics.length} <span className="text-xs text-gray-400 font-normal">/ 6</span>
          </p>
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${(completedTactics.length / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Match Records */}
      <div className="glass-card p-4 rounded-2xl border border-white/10">
        <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>AI 공식 대국 전적</span>
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-400 mb-0.5">전체</p>
            <p className="text-sm font-bold text-white font-mono">{totalMatches}전</p>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-emerald-400 mb-0.5">승리</p>
            <p className="text-sm font-bold text-emerald-300 font-mono">{matchStats.wins}승</p>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-rose-400 mb-0.5">패배</p>
            <p className="text-sm font-bold text-rose-300 font-mono">{matchStats.losses}패</p>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-amber-400 mb-0.5">승률</p>
            <p className="text-sm font-bold text-amber-300 font-mono">{winRate}%</p>
          </div>
        </div>
      </div>

      {/* Certificate Button */}
      <button
        onClick={onOpenCertificate}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition cursor-pointer"
      >
        <Award size={18} />
        <span>🏆 도토리 체스 공인 급수증 확인하기</span>
      </button>
    </div>
  );
};
