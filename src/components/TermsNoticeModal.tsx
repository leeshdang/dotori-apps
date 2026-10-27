import React from 'react';
import { Shield, Check, X } from 'lucide-react';

interface TermsNoticeModalProps {
  isOpen: boolean;
  onAgree: () => void;
  isMandatoryFirstLaunch: boolean;
  onClose?: () => void;
}

export const TermsNoticeModal: React.FC<TermsNoticeModalProps> = ({
  isOpen,
  onAgree,
  isMandatoryFirstLaunch,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={isMandatoryFirstLaunch ? undefined : onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#12131D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {!isMandatoryFirstLaunch && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Shield size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">이용 약관 및 저작권 고지</h2>
            <p className="text-xs text-gray-400">Dotori Tools Family Standard Terms</p>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto custom-scrollbar bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed space-y-3 mb-6 select-text">
          <p className="font-semibold text-pink-300">
            [이용 약관 및 저작권 고지]
          </p>
          <p>
            Dotoritools의 모든 앱은 그 어떤 사용자 개인정보도 수집하거나 저장하지 않습니다.
            파일 외부 유출, 사용 통계(usage data) 수집, 백도어, 악성코드 및 앱 본연의 기능과 무관한 코드가 전혀 포함되어 있지 않으며, 광고/스폰서 유도, 타 프로그램 설치 유도, 라이선스 침해 등 사용자에게 불이익을 주는 요소를 일체 배제합니다.
          </p>
          <p>
            앱 사용 과정에서 필수로 요구되는 네트워크 및 저장소 접근은 앱의 정상적인 기능 수행을 위한 최소한의 권한만을 사용합니다.
          </p>
          <p>
            앱 제작자는 저작권이 있는 콘텐츠의 무단 도용, 복제, 배포, 공유를 엄격히 금지하며, 그러한 행위에 대해 어떠한 책임도 지지 않습니다.
          </p>
          <p>
            사용자는 본 앱을 이용함에 있어 관련 법령 및 콘텐츠 제공자의 서비스 약관을 준수해야 합니다.
            앱의 오용으로 인해 발생하는 법적 문제, 손해, 분쟁 등에 대한 책임은 사용자 본인에게 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isMandatoryFirstLaunch ? (
            <button
              onClick={onAgree}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 via-indigo-600 to-sky-500 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-pink-500/20 transition cursor-pointer"
            >
              <Check size={18} />
              <span>동의하고 시작하기</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-2xl transition cursor-pointer"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
