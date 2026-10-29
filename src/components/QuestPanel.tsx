import React from 'react';
import { Translations } from '../i18n/translations';
import { Quest } from '../types/janggi';
import { CheckCircle2, ChevronRight, HelpCircle, Sparkles, Award, RotateCcw } from 'lucide-react';

interface QuestPanelProps {
  t?: Translations;
  quests: Quest[];
  currentQuest: Quest;
  clearedQuestIds: string[];
  currentStepIndex: number;
  questFeedback: { success: boolean; msg: string } | null;
  onSelectQuest: (quest: Quest) => void;
  onResetQuest: () => void;
  onNextQuest: () => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  quests,
  currentQuest,
  clearedQuestIds,
  currentStepIndex,
  questFeedback,
  onSelectQuest,
  onResetQuest,
  onNextQuest,
  t,
}) => {
  const isCurrentCleared = clearedQuestIds.includes(currentQuest.id);
  const currentStep = currentQuest.steps[currentStepIndex] || currentQuest.steps[0];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Interactive Guidance Banner */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-indigo-500/15 to-pink-500/15 border border-pink-500/30 flex items-center justify-between text-xs text-pink-300 font-bold shadow-sm">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          {t?.questMissionBanner || "상단 장기판에서 기물을 직접 터치하여 미션을 수행하세요!"}
        </span>
      </div>
      {/* Active Quest Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {currentQuest.badge}
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{currentQuest.acornReward} 도토리
            </span>
          </div>

          <button
            onClick={onResetQuest}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
            title="퀘스트 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t?.questRetry || "다시하기"}</span>
          </button>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-white">{currentQuest.title}</h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
            {currentQuest.description}
          </p>
        </div>

        {/* Quest Objective Box */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
          <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {t?.questObjectiveTitle || "퀘스트 목표 (MISSION)"}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white">
            {currentQuest.objective}
          </p>
          <p className="text-[11px] text-indigo-200/80 mt-1">
            👉 {currentStep.instruction}
          </p>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/5">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
              ✨ 장기판의 황금 가이드 화살표를 확인하세요
            </span>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-gray-400">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p><span className="text-amber-300 font-semibold">{t?.questTipPrefix || "도토리 꿀팁:"}</span> {currentQuest.tip}</p>
        </div>

        {/* Dynamic Feedback Box */}
        {questFeedback && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in duration-150 ${
              questFeedback.success
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{questFeedback.msg}</span>
            </div>

            {questFeedback.success && (
              <button
                onClick={onNextQuest}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/30"
              >
                <span>다음 관문</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quest Roadmap List */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-bold">{t?.questRoadmap || "기초 교육 퀘스트 로드맵"}</span>
          <span>{clearedQuestIds.length} / {quests.length} 완료</span>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {quests.map((q, idx) => {
            const isSelected = q.id === currentQuest.id;
            const isCleared = clearedQuestIds.includes(q.id);

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuest(q)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border-pink-500/50 shadow-md'
                    : isCleared
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    : 'bg-black/30 border-white/5 hover:bg-white/5 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCleared
                        ? 'bg-emerald-500 text-black'
                        : isSelected
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {isCleared ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : isCleared ? 'text-gray-200' : 'text-gray-400'}`}>
                      {q.title}
                    </div>
                    <div className="text-[10px] text-gray-500">{q.badge}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {isCleared && <span className="text-emerald-400 font-bold text-[11px]">클리어</span>}
                  <span className="text-[11px] text-amber-400/90 font-mono">+{q.acornReward}🌰</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isSelected ? 'rotate-90 text-pink-400' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
