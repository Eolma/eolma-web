"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AuctionCountdownProps {
  remainingSeconds: number;
}

export function AuctionCountdown({ remainingSeconds }: AuctionCountdownProps) {
  const showCountdown = remainingSeconds <= 5 && remainingSeconds > 0;
  const showComplete = remainingSeconds === 0;

  // remainingSeconds === 0이 되는 순간에만 "낙찰!" 표시 (1회)
  // 하지만 0은 경매 종료 후 계속 유지되므로, 부모에서 제어
  if (!showCountdown && !showComplete) return null;

  return (
    <AnimatePresence mode="wait">
      {showCountdown && (
        <motion.div
          key={`countdown-${remainingSeconds}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.span
            className="text-[120px] font-black text-white drop-shadow-lg tabular-nums"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {remainingSeconds}
          </motion.span>
        </motion.div>
      )}
      {showComplete && (
        <motion.div
          key="countdown-done"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-[80px] font-black text-primary drop-shadow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            낙찰!
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
