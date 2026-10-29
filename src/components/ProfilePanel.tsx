import React from 'react';
import { UserProfile } from '../types/janggi';
import { Award, Sparkles, BookOpen, Swords, Trophy, CheckCircle2 } from 'lucide-react';

interface ProfilePanelProps {
  profile: UserProfile;
  totalQuests: number;
  totalTactics: number;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  profile,
  totalQuests,
  totalTactics,
}) => {
  const questPercent = Math.round((profile.clearedQuests.length / totalQuests) * 100);
  const tacticPercent = Math.round((profile.clearedTactics.length / totalTactics) * 100);

  const totalMatches = profile.matchHistory.length;
  const wins = profile.matchHistory.filter((m) => m.result === 'win').length;
  const losses = profile.matchHistory.filter((m) => m.result === 'loss').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Official Rank Card */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-gray-400">현재 공인 도토리 급수</div>
              <div className="text-base sm:text-xl md:text-2xl font-black text-white font-serif tracking-tight truncate">
                {profile.ratingGrade}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[11px] text-gray-400">보유 도토리</div>
            <div className="text-base sm:text-lg font-black text-amber-400 flex items-center justify-end gap-1 whitespace-nowrap">
              <Sparkles className="w-4 h-4" />
              <span>{profile.acorns}개</span>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
          <div>
            <div className="flex justify-between text-gray-300 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                기초 교육 퀘스트 달성도
              </span>
              <span>{profile.clearedQuests.length} / {totalQuests} ({questPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500 rounded-full"
                style={{ width: `${questPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-gray-300 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                고급 전술 마스터 달성도
              </span>
              <span>{profile.clearedTactics.length} / {totalTactics} ({tacticPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500 rounded-full"
                style={{ width: `${tacticPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Match Stats Box */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3 shadow-xl">
        <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
          <Swords className="w-4 h-4 text-pink-400" />
          <span>AI 공식 대국 통계</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-gray-400">총 전적</div>
            <div className="text-sm font-black text-white">{totalMatches}전</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-emerald-400">승리</div>
            <div className="text-sm font-black text-emerald-400">{wins}승</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-rose-400">패배</div>
            <div className="text-sm font-black text-rose-400">{losses}패</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-amber-400">승률</div>
            <div className="text-sm font-black text-amber-400">{winRate}%</div>
          </div>
        </div>
      </div>

      {/* Recent Match Log */}
      <div className="flex-1 glass-panel rounded-2xl p-4 border border-white/10 space-y-2 flex flex-col min-h-[160px]">
        <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>최근 대국 기록</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 text-xs">
          {profile.matchHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              아직 진행된 공식 대국 기록이 없습니다.
            </div>
          ) : (
            profile.matchHistory.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5"
              >
                <div>
                  <div className="font-bold text-gray-200">
                    상대: {m.opponentTier} AI ({m.turns}수)
                  </div>
                  <div className="text-[10px] text-gray-500">{m.date}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[11px] ${
                      m.result === 'win'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {m.result === 'win' ? '승리' : '패배'}
                  </span>
                  {m.awardedGrade && (
                    <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                      → {m.awardedGrade} 승급
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
