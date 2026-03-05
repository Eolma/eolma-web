"use client";

import Link from "next/link";
import type { AuctionResponse } from "@/types/auction";
import { AUCTION_STATUS_LABELS } from "@/types/auction";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

interface AuctionCardProps {
  auction: AuctionResponse;
}

/** 경매 상태 -> Badge variant 매핑 */
const STATUS_BADGE_VARIANT: Record<string, "success" | "primary" | "error" | "warning" | "neutral"> = {
  ACTIVE: "success",
  COMPLETED: "primary",
  FAILED: "error",
  PENDING: "warning",
};

export function AuctionCard({ auction }: AuctionCardProps) {
  const isActive = auction.status === "ACTIVE";

  return (
    <Link href={`/auctions/${auction.id}`} className="block group">
      <Card interactive className="h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-primary flex-1 mr-2">
            {auction.title}
          </h3>
          <Badge variant={STATUS_BADGE_VARIANT[auction.status] || "neutral"}>
            {AUCTION_STATUS_LABELS[auction.status] || auction.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">현재가</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(auction.currentPrice)}
            </span>
          </div>

          {auction.instantPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">즉시 구매가</span>
              <span className="text-sm text-text-primary">{formatPrice(auction.instantPrice)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">입찰 수</span>
            <span className="text-sm text-text-primary">{auction.bidCount}회</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">{isActive ? "마감" : "종료"}</span>
            <span className="text-sm text-text-primary">{formatDateTime(auction.endAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
