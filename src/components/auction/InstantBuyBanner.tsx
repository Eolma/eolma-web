"use client";

import { useState, useEffect } from "react";
import type { InstantBuyReservation } from "@/lib/websocket/useAuctionSocket";

interface InstantBuyBannerProps {
  reservation: InstantBuyReservation;
}

export function InstantBuyBanner({ reservation }: InstantBuyBannerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const expiresAt = new Date(reservation.expiresAt).getTime();

    function updateRemaining() {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    }

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [reservation.expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="bg-warning-light border border-warning rounded-lg p-4 text-center">
      <p className="text-sm font-medium text-warning-text mb-1">
        다른 사용자가 즉시구매를 진행 중입니다
      </p>
      <p className="text-2xl font-bold text-warning-text tabular-nums">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      <p className="text-xs text-warning-text mt-1">
        결제가 완료되지 않으면 경매가 재개됩니다
      </p>
    </div>
  );
}
