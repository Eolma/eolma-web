"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

interface PaymentWidgetProps {
  orderId: string;
  amount: number;
  orderName: string;
  buyerId: number;
}

export function PaymentWidget({ orderId, amount, orderName, buyerId }: PaymentWidgetProps) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initWidget() {
      try {
        const customerKey = `eolma_${buyerId}`;
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        if (cancelled) return;

        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: amount });
        if (cancelled) return;

        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);

        if (!cancelled) {
          widgetsRef.current = widgets;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Payment widget init failed:", err);
          setError("결제 위젯을 불러오는데 실패했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initWidget();

    return () => {
      cancelled = true;
      widgetsRef.current = null;
      // 위젯이 렌더링한 내부 DOM 정리
      const methodEl = document.getElementById("payment-method");
      const agreementEl = document.getElementById("agreement");
      if (methodEl) methodEl.innerHTML = "";
      if (agreementEl) agreementEl.innerHTML = "";
    };
  }, [amount, buyerId]);

  async function handlePayment() {
    const widgets = widgetsRef.current;
    if (!widgets) return;

    setPaying(true);
    setError("");

    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payments/complete?orderId=${orderId}`,
        failUrl: `${window.location.origin}/payments/fail`,
      });
    } catch (err) {
      if (err instanceof Error && err.message !== "USER_CANCEL") {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
      setPaying(false);
    }
  }

  return (
    <div className="space-y-4">
      {loading && <Loading text="결제 위젯 로딩 중..." />}
      {error && (
        <div className="bg-error-light text-error-text text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div className={`rounded-xl overflow-hidden ${loading ? "hidden" : ""}`}>
        <div id="payment-method" />
      </div>
      <div className={`rounded-xl overflow-hidden ${loading ? "hidden" : ""}`}>
        <div id="agreement" />
      </div>
      {!loading && (
        <Button onClick={handlePayment} loading={paying} className="w-full" size="lg">
          결제하기
        </Button>
      )}
    </div>
  );
}
