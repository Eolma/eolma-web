"use client";

import Link from "next/link";
import type { AuctionResponse } from "@/types/auction";
import { AUCTION_STATUS_LABELS } from "@/types/auction";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { AnimatedPrice } from "@/components/common/AnimatedPrice";

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
      <Card variant="flat" interactive className="h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-primary flex-1 mr-2">
            {auction.title}
          </h3>
          <Badge variant={STATUS_BADGE_VARIANT[auction.status] || "neutral"}>
            {AUCTION_STATUS_LABELS[auction.status] || auction.status}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-text-tertiary">현재가</span>
            <AnimatedPrice value={auction.currentPrice} className="text-xl font-extrabold text-accent tabular-nums" />
          </div>

          {auction.instantPrice && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-text-tertiary">즉시 구매가</span>
              <span className="text-sm text-text-secondary tabular-nums">{formatPrice(auction.instantPrice)}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-text-tertiary">
            <span>입찰 {auction.bidCount}회</span>
            <span>{isActive ? "마감" : "종료"} {formatDateTime(auction.endAt)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
