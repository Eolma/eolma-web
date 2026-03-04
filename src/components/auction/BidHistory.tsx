"use client";

import type { BidHistoryResponse } from "@/types/auction";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";

interface BidHistoryProps {
  bids: BidHistoryResponse[];
}

export function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        아직 입찰 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">입찰 이력</h3>
      <div className="divide-y divide-gray-100">
        {bids.map((bid) => (
          <div key={bid.id} className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm text-gray-600">입찰자 #{bid.bidderId}</span>
              {bid.status === "REJECTED" && (
                <span className="ml-2 text-xs text-red-500">거절</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatPrice(bid.amount)}</p>
              <p className="text-xs text-gray-400">{formatRelativeTime(bid.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
