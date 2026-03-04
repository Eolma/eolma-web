"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { PaymentWidget } from "@/components/payment/PaymentWidget";
import type { PaymentResponse } from "@/types/payment";
import { getPaymentByAuction } from "@/lib/api/payments";
import { formatPrice, formatDateTime } from "@/lib/utils/format";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auctionId = Number(params.auctionId);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const data = await getPaymentByAuction(auctionId);
        if (data.status !== "PENDING") {
          router.push(`/payments/complete?orderId=${data.tossOrderId}`);
          return;
        }
        setPayment(data);
      } catch {
        setError("결제 정보를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [auctionId, router]);

  if (loading) return <Loading />;

  if (error || !payment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{error || "결제 정보를 찾을 수 없습니다."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">결제</h1>

      <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">주문번호</span>
          <span className="font-mono text-gray-700">{payment.tossOrderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">결제 금액</span>
          <span className="text-lg font-bold text-indigo-600">{formatPrice(payment.amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">결제 기한</span>
          <span className="text-gray-700">{formatDateTime(payment.deadlineAt)}</span>
        </div>
      </div>

      <PaymentWidget
        orderId={payment.tossOrderId}
        amount={payment.amount}
        orderName={`얼마 경매 #${payment.auctionId}`}
      />
    </div>
  );
}
