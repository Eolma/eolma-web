"use client";

import { formatRemainingTime } from "@/lib/utils/format";

interface AuctionTimerProps {
  remainingSeconds: number;
}

export function AuctionTimer({ remainingSeconds }: AuctionTimerProps) {
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 300;
  const isEnded = remainingSeconds <= 0;

  return (
    <div className={`text-center p-4 rounded-xl ${
      isEnded
        ? "bg-bg-tertiary"
        : isUrgent
          ? "bg-error-light border border-error"
          : "bg-primary-light border border-primary"
    }`}>
      <p className="text-xs text-text-secondary mb-1">남은 시간</p>
      <p className={`text-3xl font-mono font-bold ${
        isEnded
          ? "text-text-tertiary"
          : isUrgent
            ? "text-error"
            : "text-primary"
      }`}>
        {formatRemainingTime(remainingSeconds)}
      </p>
    </div>
  );
}
