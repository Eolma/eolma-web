"use client";

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { confirmPayment } from "@/lib/api/payments";
import { useRouter } from "next/navigation";
import { ApiException } from "@/lib/api/client";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const CUSTOMER_KEY = "eolma_customer";

interface PaymentWidgetProps {
  orderId: string;
  amount: number;
  orderName: string;
}

export function PaymentWidget({ orderId, amount, orderName }: PaymentWidgetProps) {
  const router = useRouter();
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function initWidget() {
      try {
        const widget = await loadPaymentWidget(CLIENT_KEY, CUSTOMER_KEY);
        paymentWidgetRef.current = widget;
        widget.renderPaymentMethods("#payment-method", { value: amount });
      } catch {
        setError("결제 위젯을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    initWidget();
  }, [amount]);

  async function handlePayment() {
    const widget = paymentWidgetRef.current;
    if (!widget) return;

    setPaying(true);
    setError("");

    try {
      const result = await widget.requestPayment({
        orderId,
        orderName,
      });

      if (result && "paymentKey" in result) {
        await confirmPayment({
          paymentKey: result.paymentKey,
          orderId: result.orderId,
          amount,
        });
        router.push(`/payments/complete?orderId=${orderId}`);
      }
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.detail);
      } else if (err instanceof Error && err.message !== "USER_CANCEL") {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <Loading text="결제 위젯 로딩 중..." />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-error-light text-error-text text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div id="payment-method" />
      <Button onClick={handlePayment} loading={paying} className="w-full" size="lg">
        결제하기
      </Button>
    </div>
  );
}
