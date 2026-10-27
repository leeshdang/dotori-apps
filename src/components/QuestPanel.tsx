import React from 'react';
import {
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Award,
} from 'lucide-react';
import { BeginnerQuest } from '../types/chess';
import { BEGINNER_QUESTS } from '../data/beginnerQuests';

interface QuestPanelProps {
  currentQuest: BeginnerQuest;
  completedQuests: number[];
  onSelectQuest: (quest: BeginnerQuest) => void;
  onResetQuest: () => void;
  onShowHint: () => void;
  isCleared: boolean;
  onNextQuest: () => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  currentQuest,
  completedQuests,
  onSelectQuest,
  onResetQuest,
  onShowHint,
  isCleared,
  onNextQuest,
}) => {
  const currentIndex = BEGINNER_QUESTS.findIndex(q => q.id === currentQuest.id);
  const hasNext = currentIndex < BEGINNER_QUESTS.length - 1;

  return (
    <div className="flex flex-col h-full space-y-2.5 sm:space-y-3.5">
      {/* Header Info */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {currentQuest.gate}
            </span>
            <span className="text-xs text-gray-400">
              진행도 {completedQuests.length} / {BEGINNER_QUESTS.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 text-xs font-bold font-mono">
            <span>🌰 +{currentQuest.rewardAcorns} 도토리</span>
          </div>
        </div>

        <h2 className="text-lg font-black text-white mb-2">
          {currentQuest.title}
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          {currentQuest.concept}
        </p>

        {/* Quest Mission Banner */}
        <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-indigo-400" />
            <span>퀘스트 미션:</span>
          </p>
          <p className="text-xs text-gray-200">
            {currentQuest.tip}
          </p>
        </div>

        {/* Clear Celebration Alert */}
        {isCleared && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <CheckCircle size={18} className="text-emerald-400" />
              <span>미션 클리어 성공! (+{currentQuest.rewardAcorns} 🌰)</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed mb-3">
              {currentQuest.explanationOnClear}
            </p>
            {hasNext && (
              <button
                onClick={onNextQuest}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                <span>다음 관문으로 도전</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowHint}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition cursor-pointer"
        >
          <HelpCircle size={15} className="text-amber-400" />
          <span>도토리 힌트</span>
        </button>
        <button
          onClick={onResetQuest}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition cursor-pointer"
        >
          <RotateCcw size={15} className="text-indigo-400" />
          <span>다시 시도</span>
        </button>
      </div>

      {/* 10 Gates Navigation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar glass-card p-3 rounded-2xl border border-white/10 space-y-2">
        <p className="text-xs font-bold text-gray-400 px-1 mb-1">
          10대 기초 퀘스트 목록
        </p>
        {BEGINNER_QUESTS.map(q => {
          const isSelected = q.id === currentQuest.id;
          const isDone = completedQuests.includes(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuest(q)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/40 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {isDone ? (
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[9px] text-gray-400 font-mono shrink-0">
                    {q.id}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-pink-400 font-bold">{q.gate}</span>
                    <span className="text-xs font-semibold truncate">{q.title}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-500 shrink-0 ml-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
