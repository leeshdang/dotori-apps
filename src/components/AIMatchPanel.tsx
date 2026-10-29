import React, { useState } from 'react';
import { AIRankTier, FormationType, Move, Side } from '../types/janggi';
import { AI_RANK_TIERS } from '../utils/aiEngine';
import {
  Lightbulb,
  RotateCcw,
  Flag,
  Play,
  Swords,
  ChevronDown,
  Sparkles,
  Award,
  Home,
  FastForward,
} from 'lucide-react';

interface AIMatchPanelProps {
  currentTier: AIRankTier;
  onChangeTier: (tier: AIRankTier) => void;
  playerSide: Side;
  onChangePlayerSide: (side: Side) => void;
  choFormation: FormationType;
  onChangeChoFormation: (f: FormationType) => void;
  hanFormation: FormationType;
  onChangeHanFormation: (f: FormationType) => void;
  isPlaying: boolean;
  onStartMatch: () => void;
  onUndoMove: () => void;
  onResign: () => void;
  onAskHint: () => void;
  onPassTurn?: () => void;
  hintAdvice: string | null;
  moveHistory: Move[];
  isThinking: boolean;
  userRatingGrade: string;
  onGoHome?: () => void;
}

export const AIMatchPanel: React.FC<AIMatchPanelProps> = ({
  currentTier,
  onChangeTier,
  playerSide,
  onChangePlayerSide,
  choFormation,
  onChangeChoFormation,
  hanFormation,
  onChangeHanFormation,
  isPlaying,
  onStartMatch,
  onUndoMove,
  onResign,
  onAskHint,
  hintAdvice,
  moveHistory,
  isThinking,
  userRatingGrade,
  onGoHome,
  onPassTurn,
}) => {
  const [showFormationSettings, setShowFormationSettings] = useState(false);
  const tierInfo = AI_RANK_TIERS[currentTier];

  const formations: { value: FormationType; label: string; desc: string; pieces: string[] }[] = [
    { value: 'matsang', label: '맞상 (상마상마)', desc: '상대와 마주보며 빠른 공격을 노리는 포진', pieces: ['象', '馬', '象', '馬'] },
    { value: 'yanggwima', label: '양귀마 (상마마상)', desc: '중앙을 마로 장악하고 양 날개를 상으로 견제', pieces: ['象', '馬', '馬', '象'] },
    { value: 'wonangma', label: '원앙마 (마상마상)', desc: '두 마가 원앙처럼 서로를 지키는 철벽 수비', pieces: ['馬', '象', '馬', '象'] },
    { value: 'gwima', label: '귀마 (마상상마)', desc: '가장 널리 쓰이는 표준 공격·수비 균형 포진', pieces: ['馬', '象', '象', '馬'] },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Current Match / AI Setup Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-xl">
        {/* Tier Selector & Grade badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{tierInfo.icon}</span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{tierInfo.gradeName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {tierInfo.evalStyle}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{tierInfo.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-400">나의 공인 급수</div>
            <div className="text-sm font-black text-pink-400 font-mono">{userRatingGrade}</div>
          </div>
        </div>

        {/* AI Tier Level Selector Pills */}
        {!isPlaying && (
          <div className="space-y-2 pt-1 border-t border-white/10">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              도전할 AI 급수 단계
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(AI_RANK_TIERS) as AIRankTier[]).map((t) => {
                const info = AI_RANK_TIERS[t];
                const active = t === currentTier;
                return (
                  <button
                    key={t}
                    onClick={() => onChangeTier(t)}
                    className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border ${
                      active
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 border-pink-400 text-white font-black shadow-lg shadow-pink-500/25 scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs">{info.icon}</div>
                    <div className="text-[10px] font-bold mt-0.5">{info.shortGrade}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Country (Side) Selector */}
        {!isPlaying && (
          <div className="space-y-2 pt-1 border-t border-white/10">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              나라 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangePlayerSide('cho')}
                className={`py-2 px-3 rounded-xl transition cursor-pointer border flex items-center justify-center gap-2 ${
                  playerSide === 'cho'
                    ? 'bg-gradient-to-r from-emerald-600/30 to-sky-600/30 border-emerald-400 text-white font-bold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600/80 text-white text-xs font-serif font-black flex items-center justify-center shadow-sm">
                  楚
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-300">초나라 (선수)</div>
                  <div className="text-[9px] text-gray-400">파랑/초록 · 먼저 두기</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangePlayerSide('han')}
                className={`py-2 px-3 rounded-xl transition cursor-pointer border flex items-center justify-center gap-2 ${
                  playerSide === 'han'
                    ? 'bg-gradient-to-r from-rose-600/30 to-amber-600/30 border-rose-400 text-white font-bold shadow-md shadow-rose-500/20 ring-1 ring-rose-400/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-rose-600/80 text-white text-xs font-serif font-black flex items-center justify-center shadow-sm">
                  漢
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-rose-300">한나라 (후수)</div>
                  <div className="text-[9px] text-gray-400">빨강 · 덤 1.5점</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Visual Formation Selector (상차림 선택 - 2x2 카드 그리드) */}
        {!isPlaying && (
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>상차림 선택 (마·상 위치)</span>
              </label>

              {/* Toggle target: My formation vs AI formation */}
              <div className="flex items-center gap-1 p-0.5 bg-black/60 rounded-lg border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowFormationSettings(false)}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    !showFormationSettings
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  내 상차림
                </button>
                <button
                  type="button"
                  onClick={() => setShowFormationSettings(true)}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    showFormationSettings
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  AI 상차림
                </button>
              </div>
            </div>

            {/* Target indicator banner */}
            <div className="text-[11px] text-gray-300 px-2 py-1 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
              <span>
                {!showFormationSettings ? (
                  <strong className="text-emerald-300">나의 상차림 설정</strong>
                ) : (
                  <strong className="text-rose-300">상대(AI) 상차림 설정</strong>
                )}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                현재:{' '}
                {!showFormationSettings
                  ? playerSide === 'cho'
                    ? formations.find((f) => f.value === choFormation)?.label
                    : formations.find((f) => f.value === hanFormation)?.label
                  : playerSide === 'cho'
                  ? formations.find((f) => f.value === hanFormation)?.label
                  : formations.find((f) => f.value === choFormation)?.label}
              </span>
            </div>

            {/* 2x2 Formation Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              {formations.map((f) => {
                const currentSelected = !showFormationSettings
                  ? playerSide === 'cho'
                    ? choFormation
                    : hanFormation
                  : playerSide === 'cho'
                  ? hanFormation
                  : choFormation;
                const isSelected = currentSelected === f.value;

                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      if (!showFormationSettings) {
                        if (playerSide === 'cho') onChangeChoFormation(f.value);
                        else onChangeHanFormation(f.value);
                      } else {
                        if (playerSide === 'cho') onChangeHanFormation(f.value);
                        else onChangeChoFormation(f.value);
                      }
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/50'
                        : 'bg-[#141522] border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {/* Visual 4 Pieces Row */}
                    <div className="flex items-center justify-center gap-1.5 py-1 bg-black/40 rounded-lg border border-white/5">
                      {f.pieces.map((char, pIdx) => (
                        <div
                          key={pIdx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black font-calligraphy shadow-sm select-none ${
                            char === '象'
                              ? 'bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950'
                              : 'bg-gradient-to-br from-emerald-300 to-teal-600 text-white'
                          }`}
                        >
                          {char}
                        </div>
                      ))}
                    </div>

                    {/* Formation Title & Desc */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-emerald-300' : 'text-gray-200'}`}>
                          {f.label}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Match Action Buttons */}
        <div className="pt-2">
          {!isPlaying ? (
            <div className="space-y-2">
              <button
                onClick={onStartMatch}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{tierInfo.shortGrade} AI와 급수 측정 대국 시작</span>
              </button>

              {moveHistory.length > 0 && onGoHome && (
                <button
                  onClick={onGoHome}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Home className="w-3.5 h-3.5 text-gray-400" />
                  <span>처음 화면(기초 퀘스트)으로 돌아가기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={onAskHint}
                disabled={isThinking}
                className="py-2 px-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                title="AI 코치의 힌트 받기"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">힌트</span>
              </button>

              <button
                onClick={onPassTurn}
                disabled={isThinking}
                className="py-2 px-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-40 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                title="한 수 쉬기 (차례를 AI에게 넘김)"
              >
                <FastForward className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">한수쉼</span>
              </button>

              <button
                onClick={onUndoMove}
                disabled={moveHistory.length < 2 || isThinking}
                className="py-2 px-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-gray-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                title="한 수 무르기"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">무르기</span>
              </button>

              <button
                onClick={onResign}
                disabled={isThinking}
                className="py-2 px-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                title="대국 기권"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">기권</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Hint Advice Box */}
        {hintAdvice && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1 animate-in fade-in duration-150">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <Lightbulb className="w-3.5 h-3.5" />
              도토리 AI 코치 추천수 해설
            </div>
            <p className="leading-relaxed">{hintAdvice}</p>
          </div>
        )}
      </div>

      {/* Move History / Notation Log */}
      <div className="flex-1 glass-panel rounded-2xl p-4 border border-white/10 space-y-2 flex flex-col min-h-[180px]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold flex items-center gap-1.5 text-gray-200">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            실시간 대국 기보 (총 {moveHistory.length}수)
          </span>
          {isThinking && (
            <span className="text-amber-400 animate-pulse text-[11px] font-bold">
              AI 수읽기 중...
            </span>
          )}
        </div>

        <div className="flex-1 bg-black/40 rounded-xl p-2.5 overflow-y-auto custom-scrollbar border border-white/5 space-y-1 text-xs font-mono">
          {moveHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              대국이 시작되면 착수 기보가 기록됩니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {moveHistory.map((m, idx) => {
                const turnNumber = Math.floor(idx / 2) + 1;
                const isCho = idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1 rounded ${
                      idx === moveHistory.length - 1 ? 'bg-pink-500/20 text-pink-300 font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500 font-sans text-[10px]">
                      {isCho ? `${turnNumber}. 楚` : '漢'}
                    </span>
                    <span>{m.notation || `${m.from.c}${m.from.r}→${m.to.c}${m.to.r}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
