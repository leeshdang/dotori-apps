import React from 'react';
import { TacticPuzzle } from '../types/janggi';
import { Target, Zap, RotateCcw, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';

interface TacticsPanelProps {
  tactics: TacticPuzzle[];
  currentTactic: TacticPuzzle;
  clearedTacticIds: string[];
  currentStepIndex: number;
  tacticFeedback: { success: boolean; msg: string } | null;
  onSelectTactic: (tactic: TacticPuzzle) => void;
  onResetTactic: () => void;
  onNextTactic: () => void;
}

export const TacticsPanel: React.FC<TacticsPanelProps> = ({
  tactics,
  currentTactic,
  clearedTacticIds,
  currentStepIndex,
  tacticFeedback,
  onSelectTactic,
  onResetTactic,
  onNextTactic,
}) => {
  const currentStep = currentTactic.steps[currentStepIndex] || currentTactic.steps[0];
  const isCleared = clearedTacticIds.includes(currentTactic.id);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Active Tactic Masterclass Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {currentTactic.level} 전술
            </span>
            <span className="text-xs text-pink-300 font-semibold">
              #{currentTactic.category}
            </span>
          </div>

          <button
            onClick={onResetTactic}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
            title="처음부터 다시 시도"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>재시도</span>
          </button>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-white">{currentTactic.title}</h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
            {currentTactic.summary}
          </p>
        </div>

        {/* Big-Picture Strategy Concept (큰 그림 전략 원리) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/50 via-[#18192a] to-pink-950/30 border border-white/15 space-y-1.5 shadow-inner">
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            빅픽처 전략 해설 (BIG-PICTURE HUNTING STRATEGY)
          </div>
          <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-normal">
            {currentTactic.strategicConcept}
          </p>
        </div>

        {/* Current Tactical Step Action */}
        <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/30 space-y-1">
          <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-pink-400" />
            실전 수순 (STEP {currentStepIndex + 1} / {currentTactic.steps.length})
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white">
            {currentStep.instruction}
          </p>
        </div>

        {/* Dynamic Feedback Box */}
        {tacticFeedback && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in duration-150 ${
              tacticFeedback.success
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{tacticFeedback.msg}</span>
            </div>

            {tacticFeedback.success && (
              <button
                onClick={onNextTactic}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/30"
              >
                <span>다음 전술</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Advanced Tactics Library List */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-bold">고급 전술 마스터 코스</span>
          <span>{clearedTacticIds.length} / {tactics.length} 마스터</span>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {tactics.map((tac, idx) => {
            const isSelected = tac.id === currentTactic.id;
            const isTacCleared = clearedTacticIds.includes(tac.id);

            return (
              <button
                key={tac.id}
                onClick={() => onSelectTactic(tac)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border-indigo-500/50 shadow-md'
                    : isTacCleared
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                    : 'bg-black/30 border-white/5 hover:bg-white/5 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isTacCleared
                        ? 'bg-emerald-500 text-black'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {isTacCleared ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : isTacCleared ? 'text-gray-200' : 'text-gray-400'}`}>
                      {tac.title}
                    </div>
                    <div className="text-[10px] text-gray-500">{tac.category} · {tac.level}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  {isTacCleared && <span className="text-emerald-400 font-bold text-[11px]">완료</span>}
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isSelected ? 'rotate-90 text-indigo-400' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
