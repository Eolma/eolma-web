"use client";

import { ReactNode, useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // 열린 상태에서 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-overlay" onClick={onClose} />

      {/* 시트 본체 */}
      <div
        className={`
          relative w-full bg-bg-elevated
          md:max-w-md md:rounded-xl md:mx-4
          rounded-t-2xl
          max-h-[85vh] overflow-y-auto
          animate-[slideUp_0.25s_ease-out]
        `}
      >
        {/* 드래그 핸들 (모바일) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border-hover" />
        </div>

        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
