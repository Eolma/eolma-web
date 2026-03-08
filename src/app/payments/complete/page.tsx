"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { CheckCircle, XCircle } from "lucide-react";
import { confirmPayment } from "@/lib/api/payments";

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function confirm() {
      if (!paymentKey || !orderId || !amount) {
        // paymentKey가 없으면 이미 confirm된 상태 (이전 플로우에서 온 경우)
        if (orderId && !paymentKey) {
          setStatus("success");
          return;
        }
        setStatus("error");
        setErrorMessage("결제 정보가 올바르지 않습니다.");
        return;
      }

      try {
        await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage("결제 승인에 실패했습니다. 고객센터에 문의해주세요.");
      }
    }

    confirm();
  }, [paymentKey, orderId, amount]);

  if (status === "loading") {
    return <Loading text="결제 승인 중..." />;
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">결제 실패</h1>
        <p className="text-text-secondary mb-8">{errorMessage}</p>
        <Link href="/">
          <Button className="w-full">홈으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">결제 완료</h1>
      <p className="text-text-secondary mb-2">결제가 성공적으로 처리되었습니다.</p>
      {orderId && (
        <p className="text-sm text-text-tertiary mb-8">주문번호: {orderId}</p>
      )}

      <div className="flex flex-col gap-3">
        <Link href="/mypage">
          <Button className="w-full">마이페이지</Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" className="w-full">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense>
      <PaymentCompleteContent />
    </Suspense>
  );
}
