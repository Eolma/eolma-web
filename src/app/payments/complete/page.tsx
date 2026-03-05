"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";
import { CheckCircle } from "lucide-react";

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

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
