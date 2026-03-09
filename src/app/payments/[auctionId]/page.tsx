"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { PaymentWidget } from "@/components/payment/PaymentWidget";
import type { PaymentResponse } from "@/types/payment";
import { getPaymentByAuction } from "@/lib/api/payments";
import { cancelInstantBuy, heartbeatInstantBuy } from "@/lib/api/auctions";
import { formatPrice, formatDateTime } from "@/lib/utils/format";

const HEARTBEAT_INTERVAL = 15000;

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const auctionId = Number(params.auctionId);
  const isInstantBuy = payment?.paymentType === "INSTANT_BUY";

  useEffect(() => {
    async function fetchPayment() {
      try {
        const data = await getPaymentByAuction(auctionId);
        if (data.status !== "PENDING") {
          router.push(`/payments/complete?orderId=${data.tossOrderId}`);
          return;
        }
        setPayment(data);

        // deadlineAt 기반 카운트다운 시작
        const deadline = new Date(data.deadlineAt).getTime();
        const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setRemainingSeconds(remaining);
      } catch {
        // 결제 정보 조회 실패 시 즉시구매 예약 해제
        cancelInstantBuy(auctionId).catch(() => {});
        setError("결제 정보를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [auctionId, router]);

  // 즉시구매 전용: 예약 heartbeat (15초마다 TTL 갱신)
  useEffect(() => {
    if (!payment || payment.paymentType !== "INSTANT_BUY") return;
    const interval = setInterval(async () => {
      const alive = await heartbeatInstantBuy(auctionId);
      if (!alive) {
        clearInterval(interval);
        router.push(`/auctions/${auctionId}`);
      }
    }, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [payment, auctionId, router]);

  // 카운트다운 타이머
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/auctions/${auctionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelInstantBuy(auctionId);
      router.push(`/auctions/${auctionId}`);
    } catch {
      setCancelling(false);
    }
  }

  if (loading) return <Loading />;

  if (error || !payment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary">{error || "결제 정보를 찾을 수 없습니다."}</p>
      </div>
    );
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = isInstantBuy ? remainingSeconds <= 60 : remainingSeconds <= 3600;

  return (
    <div data-theme-override="light" className="max-w-lg mx-auto px-4 py-8 bg-bg rounded-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">결제</h1>

      {/* 카운트다운 타이머 */}
      <Card className={`mb-6 text-center ${isUrgent ? "border-error bg-error-light" : "border-warning bg-warning-light"}`}>
        <p className="text-sm text-text-secondary mb-1">결제 남은 시간</p>
        <p className={`text-3xl font-bold tabular-nums ${isUrgent ? "text-error-text" : "text-warning-text"}`}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {isInstantBuy
            ? "시간 내에 결제하지 않으면 즉시구매가 취소됩니다"
            : "결제 기한이 지나면 낙찰이 취소될 수 있습니다"}
        </p>
      </Card>

      <Card className="mb-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">주문번호</span>
            <span className="font-mono text-text-primary">{payment.tossOrderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">결제 금액</span>
            <span className="text-lg font-bold text-primary">{formatPrice(payment.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">결제 기한</span>
            <span className="text-text-primary">{formatDateTime(payment.deadlineAt)}</span>
          </div>
        </div>
      </Card>

      <PaymentWidget
        orderId={payment.tossOrderId}
        amount={payment.amount}
        orderName={`얼마 경매 #${payment.auctionId}`}
        buyerId={payment.buyerId}
      />

      {isInstantBuy && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-text-secondary"
          >
            {cancelling ? "취소 중..." : "즉시구매 취소"}
          </Button>
        </div>
      )}
    </div>
  );
}
