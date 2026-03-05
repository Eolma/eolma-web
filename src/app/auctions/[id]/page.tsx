"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { BottomSheet } from "@/components/common/BottomSheet";
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

/** 경매 상태 -> Badge variant 매핑 */
const STATUS_BADGE_VARIANT: Record<string, "success" | "primary" | "error" | "warning" | "neutral"> = {
  ACTIVE: "success",
  COMPLETED: "primary",
  FAILED: "error",
  PENDING: "warning",
};

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [bids, setBids] = useState<BidHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBidSheetOpen, setIsBidSheetOpen] = useState(false);

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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 뒤로가기 링크 */}
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          경매 목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 상품 정보 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 제목 + 상태 뱃지 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={STATUS_BADGE_VARIANT[auction.status] || "neutral"}>
                {AUCTION_STATUS_LABELS[auction.status]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{auction.title}</h1>
          </div>

          {/* 경매 상세 정보 그리드 */}
          <Card>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">시작가</span>
                <p className="font-medium text-text-primary">{formatPrice(auction.startingPrice)}</p>
              </div>
              {auction.instantPrice && (
                <div>
                  <span className="text-text-secondary">즉시 구매가</span>
                  <p className="font-medium text-text-primary">{formatPrice(auction.instantPrice)}</p>
                </div>
              )}
              <div>
                <span className="text-text-secondary">최소 입찰 단위</span>
                <p className="font-medium text-text-primary">{formatPrice(auction.minBidUnit)}</p>
              </div>
              <div>
                <span className="text-text-secondary">마감 시간</span>
                <p className="font-medium text-text-primary">{formatDateTime(auction.endAt)}</p>
              </div>
            </div>
          </Card>

          {/* 낙찰 안내 */}
          {auction.status === "COMPLETED" && auction.winningPrice && (
            <Card className="bg-primary-light border-primary">
              <p className="text-sm text-primary font-medium">
                낙찰가: {formatPrice(auction.winningPrice)}
              </p>
              {isWinner && (
                <div className="mt-2">
                  <p className="text-sm text-primary mb-2">축하합니다! 낙찰되었습니다.</p>
                  <Button size="sm" onClick={() => router.push(`/payments/${auction.id}`)}>
                    결제하기
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* 상품 상세 링크 */}
          <div>
            <Link
              href={`/products/${auction.productId}`}
              className="text-sm text-primary hover:underline"
            >
              상품 상세 보기
            </Link>
          </div>

          {/* 입찰 이력 */}
          <BidHistory bids={bids} />
        </div>

        {/* 오른쪽: 입찰 패널 (데스크톱) */}
        <div className="hidden lg:block space-y-4">
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

      {/* 모바일 하단 고정 입찰 버튼 */}
      {isActive && remainingSeconds > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-bg border-t border-border lg:hidden z-40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-text-secondary">현재가</p>
              <p className="text-lg font-bold text-primary">{formatPrice(currentPrice)}</p>
            </div>
            <AuctionTimer remainingSeconds={remainingSeconds} />
          </div>
          <Button className="w-full" onClick={() => setIsBidSheetOpen(true)}>
            입찰하기
          </Button>
        </div>
      )}

      {/* 모바일 BottomSheet 입찰 패널 */}
      <BottomSheet
        isOpen={isBidSheetOpen}
        onClose={() => setIsBidSheetOpen(false)}
        title="입찰하기"
      >
        <BidPanel
          currentPrice={currentPrice}
          minBidUnit={auction.minBidUnit}
          instantPrice={auction.instantPrice}
          bidCount={bidCount}
          isActive={isActive && remainingSeconds > 0}
          isConnected={isConnected}
          onBid={(amount) => {
            placeBid(amount);
          }}
          lastBidResult={lastBidResult}
        />
      </BottomSheet>
    </div>
  );
}
