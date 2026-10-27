import React from 'react';
import { Info, X, ExternalLink, Shield, Mail } from 'lucide-react';
import versionData from '../version.json';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenTerms,
}) => {
  if (!isOpen) return null;

  const currentVersion = versionData?.version || 'DCL-20261021_2120';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-[#12131D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Master Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl p-[2px] bg-gradient-to-tr from-pink-500 via-indigo-500 to-sky-400 shadow-xl shadow-pink-500/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-[#0E0F18] rounded-[22px] flex items-center justify-center overflow-hidden">
            <img src="./master-icon.png" alt="Dotori Master Icon" className="w-12 h-12 object-contain" />
          </div>
        </div>

        <h2 className="text-xl font-black bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent mb-1">
          Dotori Chess Learning
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          도토리 체스 학습 게임 & AI 급수 판정 엔진
        </p>

        {/* Version Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono text-xs font-bold mb-4">
          <span>Version:</span>
          <span>v{currentVersion}</span>
        </div>

        {/* Features Summary */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-left text-gray-300 space-y-2 mb-4 leading-relaxed">
          <p className="flex items-start gap-2">
            <span className="text-pink-400 font-bold shrink-0">🎯</span>
            <span><strong>10대 기초 퀘스트</strong>: 폰의 전진/프로모션부터 캐슬링, 앙파상, 체크메이트까지 완전 정복</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold shrink-0">⚔️</span>
            <span><strong>6대 고급 전술 마스터</strong>: 로열 포크, 절대 핀, 스큐어, 디스커버드 어택, 백랭크, 스모더드 메이트</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">🤖</span>
            <span><strong>5단계 AI 급수 대국</strong>: 18급 새싹부터 마스터까지 Minimax & PST 수읽기 엔진 및 실시간 AI 코치 힌트</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-yellow-400 font-bold shrink-0">🏆</span>
            <span><strong>공인 체스 급수증</strong>: AI 대국 승리 시 수여되는 정식 공인 급수증 발급</span>
          </p>
        </div>

        {/* Developer Contact (Mandatory from dotori-menu_instruction.md) */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-300 font-medium mb-4">
          <Mail size={14} className="text-pink-400" />
          <span>개발자 : </span>
          <span className="font-mono text-pink-300 select-all font-semibold">leeshdang@gmail.com</span>
        </div>

        {/* Links & Close */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenTerms();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl transition cursor-pointer"
          >
            <Shield size={14} className="text-emerald-400" />
            <span>이용 약관 및 저작권 고지 확인</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
