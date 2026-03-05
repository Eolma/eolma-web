"use client";

import type { BidHistoryResponse } from "@/types/auction";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";
import { Card } from "@/components/common/Card";

interface BidHistoryProps {
  bids: BidHistoryResponse[];
}

export function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-text-secondary">
        아직 입찰 기록이 없습니다.
      </div>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-primary mb-3">입찰 이력</h3>
      <div className="divide-y divide-border">
        {bids.map((bid) => (
          <div key={bid.id} className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm text-text-secondary">입찰자 #{bid.bidderId}</span>
              {bid.status === "REJECTED" && (
                <span className="ml-2 text-xs text-error">거절</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{formatPrice(bid.amount)}</p>
              <p className="text-xs text-text-tertiary">{formatRelativeTime(bid.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
