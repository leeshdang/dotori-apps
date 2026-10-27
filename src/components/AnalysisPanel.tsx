import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Sliders, Play, Trash2 } from 'lucide-react';
import { GameState } from '../types/chess';
import { evaluatePosition, generateFEN } from '../utils/chessEngine';

interface AnalysisPanelProps {
  gameState: GameState;
  onResetBoard: () => void;
  onClearBoard: () => void;
  onLoadFEN: (fen: string) => void;
  onCoachHint: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  gameState,
  onResetBoard,
  onClearBoard,
  onLoadFEN,
  onCoachHint,
}) => {
  const [fenInput, setFenInput] = useState('');
  const [copiedFEN, setCopiedFEN] = useState(false);

  const currentFEN = generateFEN(gameState);
  const evalScore = evaluatePosition(gameState.board);

  const handleCopyFEN = () => {
    navigator.clipboard.writeText(currentFEN);
    setCopiedFEN(true);
    setTimeout(() => setCopiedFEN(false), 2000);
  };

  const handleApplyFEN = () => {
    if (fenInput.trim()) {
      onLoadFEN(fenInput.trim());
      setFenInput('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Analysis Overview Card */}
      <div className="glass-card p-4 rounded-2xl border border-white/10">
        <h2 className="text-base font-black text-white mb-1 flex items-center gap-2">
          <Sliders size={16} className="text-indigo-400" />
          <span>자유 분석실 (Position Analysis)</span>
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed mb-3">
          자유롭게 기물을 움직여 특정 오프닝이나 엔드게임 포지션을 탐구하고, AI 평가치를 실시간으로 분석할 수 있습니다.
        </p>

        {/* AI Evaluation */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400">포지션 평가치 (Eval):</span>
          <span className="font-mono text-sm font-bold text-amber-300">
            {evalScore > 0 ? `+${(evalScore / 100).toFixed(2)} (백 우세)` : evalScore < 0 ? `${(evalScore / 100).toFixed(2)} (흑 우세)` : '0.00 (균형)'}
          </span>
        </div>
      </div>

      {/* FEN Management */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300">현재 포지션 FEN</span>
          <button
            onClick={handleCopyFEN}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition cursor-pointer"
          >
            {copiedFEN ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedFEN ? '복사됨' : 'FEN 복사'}</span>
          </button>
        </div>

        <input
          type="text"
          readOnly
          value={currentFEN}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-400 truncate select-all focus:outline-none"
        />

        {/* FEN Load */}
        <div className="pt-2 border-t border-white/10">
          <label className="block text-xs font-bold text-gray-300 mb-1.5">
            외부 FEN 불러오기
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              value={fenInput}
              onChange={e => setFenInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleApplyFEN}
              className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              불러오기
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCoachHint}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border border-pink-500/30 hover:border-pink-500/50 text-pink-300 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          <Play size={14} />
          <span>최적수 추천 (AI Engine)</span>
        </button>

        <button
          onClick={onResetBoard}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>초기 배치로 리셋</span>
        </button>
      </div>
    </div>
  );
};
