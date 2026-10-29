import React from 'react';
import { X, Check, Sparkles, Palette } from 'lucide-react';
import { PieceTheme, Language } from '../types/janggi';
import { translations } from '../i18n/translations';

interface PieceThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: PieceTheme;
  onSelectTheme: (theme: PieceTheme) => void;
  lang: Language;
}

export const PieceThemeModal: React.FC<PieceThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang] || translations.ko;

  const themes: {
    id: PieceTheme;
    name: string;
    badge: string;
    desc: string;
    preview: {
      type: string;
      label: string;
      chessSymbol: string;
    }[];
  }[] = [
    {
      id: 'chess-classic',
      name: t.themeChessClassic,
      badge: '추천 NEW',
      desc: t.themeChessClassicDesc,
      preview: [
        { type: 'king', label: '楚', chessSymbol: '♚' },
        { type: 'chariot', label: '車', chessSymbol: '♜' },
        { type: 'cannon', label: '包', chessSymbol: '砲' },
        { type: 'horse', label: '馬', chessSymbol: '♞' },
        { type: 'soldier', label: '卒', chessSymbol: '♟' },
      ],
    },
    {
      id: 'chess-modern',
      name: t.themeChessModern,
      badge: '인기 NEW',
      desc: t.themeChessModernDesc,
      preview: [
        { type: 'king', label: '漢', chessSymbol: '♔' },
        { type: 'chariot', label: '車', chessSymbol: '♖' },
        { type: 'cannon', label: '包', chessSymbol: '☵' },
        { type: 'horse', label: '馬', chessSymbol: '♘' },
        { type: 'soldier', label: '兵', chessSymbol: '♙' },
      ],
    },
    {
      id: 'wood',
      name: t.themeWood,
      badge: '정통',
      desc: t.themeWoodDesc,
      preview: [
        { type: 'king', label: '楚', chessSymbol: '楚' },
        { type: 'chariot', label: '車', chessSymbol: '車' },
        { type: 'cannon', label: '包', chessSymbol: '包' },
        { type: 'horse', label: '馬', chessSymbol: '馬' },
        { type: 'soldier', label: '卒', chessSymbol: '卒' },
      ],
    },
    {
      id: 'crystal',
      name: t.themeCrystal,
      badge: '사이버',
      desc: t.themeCrystalDesc,
      preview: [
        { type: 'king', label: '漢', chessSymbol: '漢' },
        { type: 'chariot', label: '車', chessSymbol: '車' },
        { type: 'cannon', label: '包', chessSymbol: '包' },
        { type: 'horse', label: '馬', chessSymbol: '馬' },
        { type: 'soldier', label: '兵', chessSymbol: '兵' },
      ],
    },
    {
      id: 'modern',
      name: t.themeModern,
      badge: '미니멀',
      desc: t.themeModernDesc,
      preview: [
        { type: 'king', label: '楚', chessSymbol: '楚' },
        { type: 'chariot', label: '車', chessSymbol: '車' },
        { type: 'cannon', label: '包', chessSymbol: '包' },
        { type: 'horse', label: '馬', chessSymbol: '馬' },
        { type: 'soldier', label: '卒', chessSymbol: '卒' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-[#12131D] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <div className="w-full h-full bg-[#14141E] rounded-[14px] flex items-center justify-center text-pink-400">
                <Palette size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{t.selectPieceTheme}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  5 Styles
                </span>
              </h2>
              <p className="text-xs text-gray-400">원하시는 감성의 기물 스타일을 선택하세요.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Theme List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-3">
          {themes.map(th => {
            const isSelected = th.id === currentTheme;
            return (
              <div
                key={th.id}
                onClick={() => {
                  onSelectTheme(th.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/15 via-indigo-500/15 to-transparent border-pink-500/60 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/40'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{th.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        th.id.startsWith('chess')
                          ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/40'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {th.badge}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs font-bold text-pink-400 font-mono">
                      <Check size={16} />
                      <span>적용 중</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-3">{th.desc}</p>

                {/* Live Piece Previews */}
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5 overflow-x-auto">
                  {th.preview.map((p, idx) => {
                    const isCho = idx % 2 === 0;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center shrink-0 w-12 sm:w-14 py-1"
                      >
                        {/* Token Preview */}
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-105 border-0 ${
                            th.id === 'chess-classic'
                              ? isCho
                                ? 'bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-900 text-white shadow-sky-500/25'
                                : 'bg-gradient-to-br from-rose-400 via-red-600 to-rose-950 text-white shadow-rose-500/25'
                              : th.id === 'chess-modern'
                              ? isCho
                                ? 'bg-slate-900 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                                : 'bg-zinc-950 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                              : th.id === 'wood'
                              ? isCho
                                ? 'bg-[#d8a462] text-[#0d4f29] font-serif font-black shadow-sm'
                                : 'bg-[#d8a462] text-[#851616] font-serif font-black shadow-sm'
                              : th.id === 'crystal'
                              ? isCho
                                ? 'bg-cyan-600 text-white shadow-cyan-500/25'
                                : 'bg-rose-600 text-white shadow-rose-500/25'
                              : isCho
                              ? 'bg-slate-100 text-blue-900 shadow-sm'
                              : 'bg-zinc-800 text-amber-300 shadow-sm'
                          }`}
                        >
                          <span className="select-none leading-none scale-110">{p.chessSymbol}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 font-mono">
                          {p.type === 'king'
                            ? '궁(王)'
                            : p.type === 'chariot'
                            ? '차(車)'
                            : p.type === 'cannon'
                            ? '포(包)'
                            : p.type === 'horse'
                            ? '마(馬)'
                            : '졸(兵)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};