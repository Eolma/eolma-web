"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const DRAG_CLOSE_THRESHOLD = 150;
const VELOCITY_CLOSE_THRESHOLD = 500;

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

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD || info.velocity.y > VELOCITY_CLOSE_THRESHOLD) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
          initial="closed"
          animate="open"
          exit="closed"
        >
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-overlay"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* 시트 본체 */}
          <motion.div
            className={`
              relative w-full bg-bg-elevated
              md:max-w-md md:rounded-xl md:mx-4
              rounded-t-2xl
              max-h-[85vh] overflow-y-auto
            `}
            variants={{ open: { y: 0 }, closed: { y: "100%" } }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ touchAction: "none" }}
          >
            {/* 드래그 핸들 (모바일) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
