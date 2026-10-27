import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Language } from '../types/chess';
import { translations } from '../i18n/translations';
import {
  Menu,
  X,
  ExternalLink,
  Shield,
  Bug,
  Info,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react';
import versionData from '../version.json';

interface HeaderProps {
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  isMobileView: boolean;
  setIsMobileView: (val: boolean) => void;
  isMuted: boolean;
  toggleMute: () => void;
  onOpenTerms: () => void;
  onOpenAbout: () => void;
  onResetProgress: () => void;
  onNewGame: () => void;
  aiThinking: boolean;
  acorns: number;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileView,
  setIsMobileView,
  isMuted,
  toggleMute,
  onOpenTerms,
  onOpenAbout,
  onResetProgress,
  onNewGame,
  aiThinking,
  acorns,
  lang,
  onSelectLanguage,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentVersion = versionData?.version || 'DCL-20261021_2120';
  const t = translations[lang] || translations.ko;
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: 'ko', label: '한국어', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'ja', label: '日本語', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'zh', label: '中文', flag: '🇨🇳', nativeName: '简体中文' },
  ];
  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleExitApp = () => {
    if (window.confirm(t.exitConfirm)) {
      window.close();
    }
  };

  return (
    <header className="relative z-40 bg-[#090A10]/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
      {/* Left: Hamburger + Master Icon + Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer text-gray-200 hover:text-white"
            title="메뉴 열기"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Hamburger Dropdown Menu (Strictly adhering to dotori-menu_instruction.md) */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-[#12131D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-sm">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-gray-400">도토리 툴즈 패밀리 메뉴</p>
                  <p className="text-sm font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    Dotori Chess Learning
                  </p>
                </div>

                {/* 1. dotoritools.com */}
                <a
                  href="https://dotoritools.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/10 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span className="font-medium">dotoritools.com</span>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>

                {/* 2. celebmypet.com */}
                <a
                  href="https://celebmypet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/10 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-medium">celebmypet.com</span>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>

                {/* 3. 이용 약관 및 저작권 고지 */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTerms();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/10 rounded-xl transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-emerald-400" />
                    <span className="font-medium">이용 약관 및 저작권 고지</span>
                  </div>
                </button>

                {/* 4. 버그 리포팅 */}
                <a
                  href="https://dotori-flow.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/10 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Bug size={16} className="text-rose-400" />
                    <span className="font-medium">버그 리포팅 (Dotori Flow)</span>
                  </div>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>

                {/* 5. About (앱 정보) */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAbout();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/10 rounded-xl transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Info size={16} className="text-sky-400" />
                    <span className="font-medium">About (앱 정보)</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{currentVersion}</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                {/* Extra: 진도 초기화 */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onResetProgress();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-amber-400 hover:bg-amber-500/10 rounded-xl transition cursor-pointer text-left"
                >
                  <RotateCcw size={16} />
                  <span className="font-medium">학습 진도 초기화</span>
                </button>

                {/* 6. 프로그램 닫기 */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleExitApp();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer text-left"
                >
                  <Power size={16} />
                  <span className="font-medium">프로그램 닫기</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Master Icon Badge */}
        <div className="w-9 h-9 rounded-xl p-[1.5px] bg-gradient-to-tr from-pink-500 via-indigo-500 to-sky-400 shadow-lg shadow-pink-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0E0F18] rounded-[10px] flex items-center justify-center overflow-hidden">
            <img src="./master-icon.png" alt="Dotori Master Icon" className="w-6 h-6 object-contain" />
          </div>
        </div>

        {/* App Title & Version Badges */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent">
              Dotori Chess Learning
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-pink-500/20 text-pink-400 border border-pink-500/30">
              DCL
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v{currentVersion}
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-gray-400">
            초보자 기초 퀘스트부터 마스터 전술 및 AI 급수 공인 대국까지
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Acorn Coins Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
          <span className="text-base">🌰</span>
          <span className="font-bold text-xs sm:text-sm text-amber-300 font-mono">{acorns}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition text-gray-300 hover:text-white cursor-pointer"
          title={isMuted ? '소리 켜기' : '소리 끄기'}
        >
          {isMuted ? <VolumeX size={17} className="text-red-400" /> : <Volume2 size={17} className="text-emerald-400" />}
        </button>

        {/* Smartphone Simulation View Toggle (Dotori Signature Feature) */}
        <button
          onClick={() => setIsMobileView(!isMobileView)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
            isMobileView
              ? 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 border-pink-500/40 text-pink-300'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
          }`}
          title="스마트폰 화면 시뮬레이션 토글"
        >
          {isMobileView ? <Smartphone size={15} /> : <Monitor size={15} />}
          <span>{isMobileView ? '모바일 뷰' : '와이드 뷰'}</span>
        </button>

        {/* AI Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
          <span
            className={`w-2 h-2 rounded-full ${
              aiThinking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] font-medium">
            {aiThinking ? 'AI 수읽기 중...' : '엔진 준비 완료'}
          </span>
        </div>

                {/* Language Selector (ko, en, ja, zh) */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
            title={t.language}
          >
            <span className="text-sm leading-none">{currentLangObj.flag}</span>
            <span className="hidden sm:inline text-[11px] font-semibold text-gray-300">
              {currentLangObj.code.toUpperCase()}
            </span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 z-50 bg-[#12131D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-1 text-xs divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t.selectLanguage}
              </div>
              <div className="py-1">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onSelectLanguage(item.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-pink-500/15 transition cursor-pointer ${lang === item.code ? "text-pink-400 font-bold bg-pink-500/10" : "text-gray-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.flag}</span>
                      <span>{item.nativeName}</span>
                    </div>
                    {lang === item.code && <span className="text-pink-400 text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Game CTA */}
        <button
          onClick={onNewGame}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-500/20 transition cursor-pointer"
        >
          <Sparkles size={14} />
          <span>새 대국</span>
        </button>
      </div>
    </header>
  );
};
