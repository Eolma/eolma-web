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
        ? "bg-gray-100"
        : isUrgent
          ? "bg-red-50 border border-red-200"
          : "bg-indigo-50 border border-indigo-200"
    }`}>
      <p className="text-xs text-gray-500 mb-1">남은 시간</p>
      <p className={`text-3xl font-mono font-bold ${
        isEnded
          ? "text-gray-400"
          : isUrgent
            ? "text-red-600"
            : "text-indigo-600"
      }`}>
        {formatRemainingTime(remainingSeconds)}
      </p>
    </div>
  );
}
