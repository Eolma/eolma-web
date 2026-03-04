"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/common/Button";

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료</h1>
      <p className="text-gray-500 mb-2">결제가 성공적으로 처리되었습니다.</p>
      {orderId && (
        <p className="text-sm text-gray-400 mb-8">주문번호: {orderId}</p>
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
