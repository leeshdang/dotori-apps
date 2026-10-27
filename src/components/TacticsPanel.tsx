import React from 'react';
import {
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Flame,
  Target,
} from 'lucide-react';
import { AdvancedTactic } from '../types/chess';
import { ADVANCED_TACTICS } from '../data/advancedTactics';

interface TacticsPanelProps {
  currentTactic: AdvancedTactic;
  completedTactics: number[];
  onSelectTactic: (tactic: AdvancedTactic) => void;
  onResetTactic: () => void;
  onShowHint: () => void;
  isCleared: boolean;
  onNextTactic: () => void;
  stepIndex: number;
}

export const TacticsPanel: React.FC<TacticsPanelProps> = ({
  currentTactic,
  completedTactics,
  onSelectTactic,
  onResetTactic,
  onShowHint,
  isCleared,
  onNextTactic,
  stepIndex,
}) => {
  const currentIndex = ADVANCED_TACTICS.findIndex(t => t.id === currentTactic.id);
  const hasNext = currentIndex < ADVANCED_TACTICS.length - 1;

  return (
    <div className="flex flex-col h-full space-y-2.5 sm:space-y-3.5">
      {/* Tactic Info Header */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentTactic.number}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentTactic.technique}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-300 text-xs font-bold font-mono">
            <span>🌰 +{currentTactic.rewardAcorns} 도토리</span>
          </div>
        </div>

        <h2 className="text-lg font-black text-white mb-2">
          {currentTactic.title}
        </h2>

        {/* Big Picture Strategy Section */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1">
            <Flame size={14} className="text-pink-400" />
            <span>빅픽처 전략 가이드 (Big-Picture Strategy):</span>
          </div>
          <p className="text-xs text-purple-100/90 leading-relaxed">
            {currentTactic.bigPicture}
          </p>
        </div>

        {/* Tactical Mission Tip */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
            <Target size={14} className="text-indigo-400" />
            <span>착수 목표 (수순 {stepIndex + 1}/{currentTactic.solutionMoves.length}):</span>
          </p>
          <p className="text-xs text-gray-200">
            {currentTactic.tip}
          </p>
        </div>

        {/* Cleared Success Box */}
        {isCleared && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <CheckCircle size={18} className="text-emerald-400" />
              <span>전술 마스터 성공! (+{currentTactic.rewardAcorns} 🌰)</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed mb-3">
              {currentTactic.explanationOnClear}
            </p>
            {hasNext && (
              <button
                onClick={onNextTactic}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                <span>다음 전술로 도전</span>
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
          <span>전술 힌트</span>
        </button>
        <button
          onClick={onResetTactic}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition cursor-pointer"
        >
          <RotateCcw size={15} className="text-indigo-400" />
          <span>처음부터</span>
        </button>
      </div>

      {/* Tactics Navigation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar glass-card p-3 rounded-2xl border border-white/10 space-y-2">
        <p className="text-xs font-bold text-gray-400 px-1 mb-1">
          6대 고급 전술 마스터클래스
        </p>
        {ADVANCED_TACTICS.map(t => {
          const isSelected = t.id === currentTactic.id;
          const isDone = completedTactics.includes(t.id);

          return (
            <button
              key={t.id}
              onClick={() => onSelectTactic(t)}
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
                    {t.id}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-indigo-400 font-bold">{t.number}</span>
                    <span className="text-xs font-semibold truncate">{t.title}</span>
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
