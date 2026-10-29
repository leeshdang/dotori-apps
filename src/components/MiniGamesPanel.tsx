import React, { useState } from 'react';
import { CustomJanggiMiniGame } from './CustomJanggiMiniGame';
import { AlkagiMiniGame } from './AlkagiMiniGame';
import { PieceTheme, Language } from '../types/janggi';
import { Sparkles, Gamepad2, Target, Dices } from 'lucide-react';

interface MiniGamesPanelProps {
  pieceTheme?: PieceTheme;
  lang?: Language;
  userAcorns?: number;
  onEarnAcorns?: (amount: number) => void;
}

export const MiniGamesPanel: React.FC<MiniGamesPanelProps> = ({
  pieceTheme = 'wood',
  lang = 'ko',
  userAcorns = 0,
  onEarnAcorns,
}) => {
  const [activeMiniGame, setActiveMiniGame] = useState<'custom' | 'alkagi'>('custom');

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Mini Game Selector Sub-Tabs */}
      <div className="flex items-center justify-between p-1 bg-black/50 border border-white/10 rounded-2xl shrink-0">
        <div className="grid grid-cols-2 gap-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveMiniGame('custom')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMiniGame === 'custom'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md shadow-pink-500/20 ring-1 ring-pink-400/50'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Dices className="w-4 h-4 text-pink-300" />
            <span>내맘대로 장기 (자유 포진)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMiniGame('alkagi')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMiniGame === 'alkagi'
                ? 'bg-gradient-to-r from-emerald-500 to-sky-600 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-300" />
            <span>장기알 까기 (당구 물리 대전)</span>
          </button>
        </div>
      </div>

      {/* Mini Game Content View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeMiniGame === 'custom' ? (
          <CustomJanggiMiniGame
            pieceTheme={pieceTheme}
            lang={lang}
            userAcorns={userAcorns}
            onEarnAcorns={onEarnAcorns}
          />
        ) : (
          <AlkagiMiniGame onEarnAcorns={onEarnAcorns} />
        )}
      </div>
    </div>
  );
};

