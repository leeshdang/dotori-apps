import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Info,
  Scale,
  Sparkles,
  Bug,
  Power,
  Globe,
  Heart,
  Mail,
  Palette,
  Check,
} from 'lucide-react';
import { Language, PieceTheme } from '../types/janggi';
import { translations } from '../i18n/translations';

interface HeaderProps {
  appVersion: string;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  statusText: string;
  isThinking: boolean;
  onOpenTermsNotice: () => void;
  onResetProgress: () => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenPieceThemeModal?: () => void;
}

const DOTORI_FAMILY_APPS = [
  { name: 'Dotori VR 이미지 뷰어', tag: 'DVIV', desc: 'VR 전용 고화질 이미지 뷰어' },
  { name: 'Dotori 이미지 뷰어', tag: 'DIV', desc: '초고속 데스크톱/웹 이미지 뷰어' },
  { name: 'Dotori 4k downloader', tag: 'D4kD', desc: '4K 미디어 다운로더' },
  { name: 'Dotori QR maker', tag: 'DQM', desc: '스마트 QR 코드 제작기' },
  { name: 'Dotori Go-Learning', tag: 'DGL', desc: '초보자 바둑 학습 & AI 대국' },
  { name: 'Dotori Screen Recorder', tag: 'DSR', desc: '화면 녹화 & 캡처 도구' },
  { name: 'Dotori mp3 player', tag: 'DMP', desc: '미니멀 오디오 플레이어' },
  { name: 'Dotori Video Editor', tag: 'DVE', desc: '숏폼 비디오 에디터' },
  { name: 'Dotori Meme Maker', tag: 'DMM', desc: '트렌디 짤/밈 제작기' },
  { name: 'Dotori Flow', tag: 'DF', desc: '이슈 관리 & 칸반 트래커' },
  { name: 'Dotori Janggi Learning', tag: 'DJL', desc: '장기 기초 퀘스트 · 고급 전술 · AI 급수 판정', current: true },
];

const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh', label: '中文', flag: '🇨🇳', nativeName: '简体中文' },
];

export const Header: React.FC<HeaderProps> = ({
  appVersion,
  isPhoneFrame,
  setIsPhoneFrame,
  isMuted,
  setIsMuted,
  statusText,
  isThinking,
  onOpenTermsNotice,
  onResetProgress,
  lang,
  onSelectLanguage,
  onOpenPieceThemeModal,
}) => {
  const t = translations[lang] || translations.ko;

  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showFamilyApps, setShowFamilyApps] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowFamilyApps(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCloseApp = () => {
    setMenuOpen(false);
    if (window.confirm('프로그램을 종료하시겠습니까?')) {
      if ((window as any).electronAPI?.close) {
        (window as any).electronAPI.close();
      } else {
        window.close();
      }
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-[#0E0F18]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between select-none z-30 shrink-0">
        {/* Left Branding Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setShowFamilyApps(false);
              }}
              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl transition text-white hidden lg:flex items-center justify-center cursor-pointer shadow-sm hover:border-white/20"
              aria-label={t.menu}
            >
              {menuOpen ? <X className="w-5 h-5 text-pink-400" /> : <Menu className="w-5 h-5 text-gray-200" />}
            </button>

            {/* Dropdown Menu - Standard Dotori 6 Mandatory Items + i18n & Piece Selection */}
            {menuOpen && (
              <div className="absolute left-0 mt-2.5 w-68 z-50 bg-[#12131d]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-150 divide-y divide-white/10">
                {/* Piece Design Selector Shortcut */}
                {onOpenPieceThemeModal && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenPieceThemeModal();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 text-pink-300 hover:text-pink-200 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-pink-400" />
                      <span className="font-semibold">{t.selectPieceTheme}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                      체스형 포함
                    </span>
                  </button>
                )}

                {/* 1. dotoritools.com 링크 */}
                <a
                  href="https://dotoritools.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/10 text-gray-200 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">dotoritools.com</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                </a>

                {/* 2. celebmypet.com 링크 */}
                <a
                  href="https://celebmypet.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/10 text-gray-200 hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">celebmypet.com</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                </a>

                {/* 3. 이용 약관 및 저작권 고지 */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTermsNotice();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/10 text-left text-amber-300 hover:text-amber-200 transition cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">{t.terms}</span>
                </button>

                {/* 4. 버그 리포팅 - https://dotori-flow.vercel.app/ */}
                <a
                  href="https://dotori-flow.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/10 text-sky-300 hover:text-sky-200 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bug className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t.bugReport}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                </a>

                {/* 5. About - 버전 정보 표시 / 개발자 : leeshdang@gmail.com */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowAbout(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 text-left text-gray-200 hover:text-white transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <span className="font-medium">{t.about}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v{appVersion}
                  </span>
                </button>

                {/* 6. 프로그램 닫기 */}
                <button
                  onClick={handleCloseApp}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-rose-500/20 text-left text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <Power className="w-4 h-4 text-rose-400" />
                  <span className="font-medium">{t.closeApp}</span>
                </button>

                {/* Supplementary Features: Family Apps & Reset Progress */}
                <div className="bg-black/20 p-2 space-y-1">
                  <button
                    onClick={() => setShowFamilyApps(!showFamilyApps)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      Dotori Family Apps
                    </span>
                    <span className="text-[10px] text-gray-500">{showFamilyApps ? '접기' : '더보기'}</span>
                  </button>

                  {showFamilyApps && (
                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pl-1 pr-1 py-1">
                      {DOTORI_FAMILY_APPS.map((app) => (
                        <div
                          key={app.tag}
                          className={`flex items-center justify-between px-2 py-1 rounded text-[11px] ${
                            app.current
                              ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30'
                              : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{app.name}</span>
                          <span className="font-mono text-[9px] px-1 rounded bg-white/10 text-gray-400">
                            {app.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.confirm('학습 진도 및 대국 기록을 초기화하시겠습니까?')) {
                        onResetProgress();
                      }
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-rose-300 hover:bg-white/5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-gray-400" />
                    <span>{t.resetProgress}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Master Icon Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-pink-500 via-indigo-500 to-sky-500 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] sm:rounded-[14px] flex items-center justify-center p-1 sm:p-1.5">
                <img src="./icon.png" alt="Dotori Master Icon" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* App Title & Version Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-indigo-200 to-sky-300 whitespace-nowrap">
                  {t.appTitle}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0 hidden sm:inline-block">
                  {t.dotoriTag}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden md:inline-block">
                  v{appVersion}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls Area */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Piece Theme Modal Trigger Button */}
          {onOpenPieceThemeModal && (
            <button
              onClick={onOpenPieceThemeModal}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title={t.selectPieceTheme}
            >
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden lg:inline">{t.pieceTheme}</span>
            </button>
          )}

          {/* Language Selector Dropdown (KO / EN / JA / ZH) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title={t.language}
            >
              <span className="text-sm leading-none">{currentLangObj.flag}</span>
              <span className="font-mono uppercase text-[11px]">{currentLangObj.code}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 z-50 bg-[#12131d]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider border-b border-white/10 mb-1">
                  {t.selectLanguage}
                </div>
                {LANGUAGES.map((l) => {
                  const isSelected = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Smartphone Frame View Toggle (Dotori Signature Feature) */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer active:scale-95 ${
              isPhoneFrame
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
            title={isPhoneFrame ? t.monitorView : t.phoneView}
          >
            {isPhoneFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">폰 모드 ON</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden md:inline">스튜디오 뷰</span>
              </>
            )}
          </button>

          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 px-3.5 py-1 text-xs text-gray-300">
            <span className={`w-2 h-2 rounded-full ${isThinking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{isThinking ? t.aiThinking : statusText}</span>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#141420] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl text-gray-200">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center p-1.5">
                  <img src="./icon.png" alt="Dotori Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{t.appTitle}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 font-mono font-bold">
                    {appVersion}
                  </span>
                  <span className="text-xs text-gray-400">Dotori Tools Family</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed border-t border-b border-white/10 py-4 my-4">
              <p>
                <strong>DJL</strong>은 장기를 처음 배우는 입문자부터 유단자를 꿈꾸는 분들을 위한 올인원 한국 장기 학습 &amp; AI 급수 판정 애플리케이션입니다.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400">
                <li><span className="text-gray-200 font-medium">기초 교육 퀘스트</span>: 장기판과 기물 행마, 멱의 원리, 장군과 외통수 완벽 체득</li>
                <li><span className="text-gray-200 font-medium">고급 전술 마스터</span>: 멱 차단, 양차 합세, 핀 전술, 기물 가치 교환, 쌍포장 콤보</li>
                <li><span className="text-gray-200 font-medium">AI 급수 판정 대국</span>: 18급부터 초단까지 맞춤형 AI 대국을 통한 실시간 공인 급수 측정</li>
                <li><span className="text-gray-200 font-medium">리얼 장기판 사운드</span>: 착수음, 타격 포획음, 장군 경고음, 승리 축하 팡파르 탑재</li>
              </ul>

              <div className="pt-2 flex items-center justify-between text-[11px] bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                <span className="text-gray-400">개발자 문의</span>
                <a
                  href="mailto:leeshdang@gmail.com"
                  className="text-pink-300 hover:text-pink-200 font-mono flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  leeshdang@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <button
                onClick={() => {
                  setShowAbout(false);
                  onOpenTermsNotice();
                }}
                className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                {t.terms}
              </button>
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
