"use client";

import Link from "next/link";
import type { AuctionResponse } from "@/types/auction";
import { AUCTION_STATUS_LABELS } from "@/types/auction";
import { formatPrice, formatDateTime } from "@/lib/utils/format";

interface AuctionCardProps {
  auction: AuctionResponse;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const isActive = auction.status === "ACTIVE";

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-indigo-100 text-indigo-700",
    FAILED: "bg-red-100 text-red-600",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Link href={`/auctions/${auction.id}`} className="block group">
      <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 flex-1 mr-2">
            {auction.title}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusColor[auction.status] || "bg-gray-100"}`}>
            {AUCTION_STATUS_LABELS[auction.status] || auction.status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">현재가</span>
            <span className="text-lg font-bold text-indigo-600">
              {formatPrice(auction.currentPrice)}
            </span>
          </div>

          {auction.instantPrice && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">즉시 구매가</span>
              <span className="text-sm text-gray-700">{formatPrice(auction.instantPrice)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">입찰 수</span>
            <span className="text-sm text-gray-700">{auction.bidCount}회</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{isActive ? "마감" : "종료"}</span>
            <span className="text-sm text-gray-700">{formatDateTime(auction.endAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
