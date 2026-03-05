"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import { AuctionTimer } from "@/components/auction/AuctionTimer";
import { BidPanel } from "@/components/auction/BidPanel";
import { BidHistory } from "@/components/auction/BidHistory";
import type { AuctionResponse, BidHistoryResponse, BidResultMessage } from "@/types/auction";
import { AUCTION_STATUS_LABELS } from "@/types/auction";
import { getAuction, getBidHistory } from "@/lib/api/auctions";
import { useAuctionSocket } from "@/lib/websocket/useAuctionSocket";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";
import Link from "next/link";

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [bids, setBids] = useState<BidHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const id = Number(params.id);

  useEffect(() => {
    async function fetchData() {
      try {
        const [auctionData, bidData] = await Promise.all([
          getAuction(id),
          getBidHistory(id),
        ]);
        setAuction(auctionData);
        setBids(bidData);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const initialRemainingSeconds = useMemo(() => {
    if (!auction) return 0;
    const endTime = new Date(auction.endAt).getTime();
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return remaining;
  }, [auction]);

  const isActive = auction?.status === "ACTIVE";

  const {
    currentPrice,
    bidCount,
    remainingSeconds,
    isConnected,
    lastMessage,
    placeBid,
  } = useAuctionSocket(
    id,
    auction?.currentPrice ?? 0,
    auction?.bidCount ?? 0,
    initialRemainingSeconds,
  );

  const lastBidResult = useMemo(() => {
    if (!lastMessage || lastMessage.type !== "BID_RESULT") return null;
    const msg = lastMessage as BidResultMessage;
    return { status: msg.status };
  }, [lastMessage]);

  // 입찰 성공 시 입찰 이력 자동 갱신
  useEffect(() => {
    if (lastBidResult?.status === "ACCEPTED") {
      getBidHistory(id).then(setBids).catch(() => {});
    }
  }, [lastBidResult, id]);

  if (loading || !auction) return <Loading />;

  const isWinner = auction.winnerId === user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          경매 목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 상품 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {AUCTION_STATUS_LABELS[auction.status]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">시작가</span>
              <p className="font-medium">{formatPrice(auction.startingPrice)}</p>
            </div>
            {auction.instantPrice && (
              <div>
                <span className="text-gray-500">즉시 구매가</span>
                <p className="font-medium">{formatPrice(auction.instantPrice)}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">최소 입찰 단위</span>
              <p className="font-medium">{formatPrice(auction.minBidUnit)}</p>
            </div>
            <div>
              <span className="text-gray-500">마감 시간</span>
              <p className="font-medium">{formatDateTime(auction.endAt)}</p>
            </div>
          </div>

          {auction.status === "COMPLETED" && auction.winningPrice && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-indigo-700 font-medium">
                낙찰가: {formatPrice(auction.winningPrice)}
              </p>
              {isWinner && (
                <div className="mt-2">
                  <p className="text-sm text-indigo-600 mb-2">축하합니다! 낙찰되었습니다.</p>
                  <Button size="sm" onClick={() => router.push(`/payments/${auction.id}`)}>
                    결제하기
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 상품 상세 링크 */}
          <div>
            <Link
              href={`/products/${auction.productId}`}
              className="text-sm text-indigo-600 hover:underline"
            >
              상품 상세 보기
            </Link>
          </div>

          {/* 입찰 이력 */}
          <BidHistory bids={bids} />
        </div>

        {/* 오른쪽: 입찰 패널 */}
        <div className="space-y-4">
          <AuctionTimer remainingSeconds={remainingSeconds} />
          <BidPanel
            currentPrice={currentPrice}
            minBidUnit={auction.minBidUnit}
            instantPrice={auction.instantPrice}
            bidCount={bidCount}
            isActive={isActive && remainingSeconds > 0}
            isConnected={isConnected}
            onBid={placeBid}
            lastBidResult={lastBidResult}
          />
        </div>
      </div>
    </div>
  );
}
