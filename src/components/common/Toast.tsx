"use client";

import { useToastStore } from "@/lib/store/useToastStore";
import { AnimatePresence, motion } from "framer-motion";

/** 토스트 타입별 스타일 */
const typeStyles: Record<string, string> = {
  success: "bg-success-light text-success-text border-success",
  error: "bg-error-light text-error-text border-error",
  warning: "bg-warning-light text-warning-text border-warning",
  info: "bg-info-light text-info-text border-info",
};

/** 토스트 타입별 아이콘 SVG path */
const typeIcons: Record<string, string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const SWIPE_THRESHOLD = 80;

/** 전역 토스트 컨테이너 - layout.tsx에 배치 */
export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col-reverse gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 200, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 500) {
                removeToast(toast.id);
              }
            }}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3
              rounded-lg border shadow-md cursor-grab active:cursor-grabbing
              ${typeStyles[toast.type]}
            `}
          >
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[toast.type]} />
            </svg>
            <p className="text-sm flex-1">{toast.message}</p>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="shrink-0 text-sm font-medium underline underline-offset-2"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-current opacity-50 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
