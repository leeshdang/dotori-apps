import React, { useState } from 'react';
import { ShieldCheck, Scale, CheckCircle2, X } from 'lucide-react';

interface TermsNoticeModalProps {
  isOpen: boolean;
  isFirstLaunch: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export const TERMS_NOTICE_TEXT = `[이용 약관 및 저작권 고지]

Dotoritools의 모든 앱은 그 어떤 사용자 개인정보도 수집하거나 저장하지 않습니다.
파일 외부 유출, 사용 통계(usage data) 수집, 백도어, 악성코드 및 앱 본연의 기능과 무관한 코드가 전혀 포함되어 있지 않으며, 광고/스폰서 유도, 타 프로그램 설치 유도, 라이선스 침해 등 사용자에게 불이익을 주는 요소를 일체 배제합니다.

앱 사용 과정에서 필수로 요구되는 네트워크 및 저장소 접근은 앱의 정상적인 기능 수행을 위한 최소한의 권한만을 사용합니다.

앱 제작자는 저작권이 있는 콘텐츠의 무단 도용, 복제, 배포, 공유를 엄격히 금지하며, 그러한 행위에 대해 어떠한 책임도 지지 않습니다.

사용자는 본 앱을 이용함에 있어 관련 법령 및 콘텐츠 제공자의 서비스 약관을 준수해야 합니다.
앱의 오용으로 인해 발생하는 법적 문제, 손해, 분쟁 등에 대한 책임은 사용자 본인에게 있습니다.`;

export const TermsNoticeModal: React.FC<TermsNoticeModalProps> = ({
  isOpen,
  isFirstLaunch,
  onAgree,
  onClose,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={isFirstLaunch ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#12131d] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-pink-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  이용 약관 및 저작권 고지
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  필수 고지
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFirstLaunch
                  ? '앱을 시작하기 전 아래 고지 전문을 반드시 확인해 주세요.'
                  : 'Dotori Tools 공식 이용 약관 및 저작권 정책'}
              </p>
            </div>
          </div>

          {!isFirstLaunch && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-gray-300 leading-relaxed font-normal space-y-4 custom-scrollbar">
          <div className="whitespace-pre-line text-gray-200 select-text">
            {TERMS_NOTICE_TEXT}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="font-semibold">저작권 준수 의무 및 사용자 면책 안내</span>
            </div>
            <p>
              타인의 저작권 및 지식재산권을 침해하는 행위는 엄격히 금지되며, 관련 법적 책임은 사용자에게 귀속됩니다.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">개인정보 및 이용 기록 100% 미수집 보장</span>
            </div>
            <p>
              본 앱은 외부 서버로 개인정보나 사용 로그를 일체 전송하지 않는 안전한 무료 로컬 도구입니다.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3">
          {isFirstLaunch ? (
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-black/50 border-white/20 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-200 font-medium">
                  위 이용 약관 및 저작권 고지 전문을 모두 확인하였으며 이에 동의합니다.
                </span>
              </label>

              <button
                disabled={!isChecked}
                onClick={onAgree}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isChecked
                    ? 'bg-gradient-to-r from-pink-500 via-indigo-500 to-sky-500 text-white hover:opacity-95 cursor-pointer active:scale-[0.99] shadow-pink-500/25'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>동의하고 시작하기</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
