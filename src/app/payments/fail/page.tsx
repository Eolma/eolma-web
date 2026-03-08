"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { XCircle } from "lucide-react";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-error" />
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">결제 실패</h1>
      <p className="text-text-secondary mb-6">
        {message || "결제 처리 중 문제가 발생했습니다."}
      </p>

      {code && (
        <Card className="mb-8 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">오류 코드</span>
              <span className="font-mono text-text-primary">{code}</span>
            </div>
            {orderId && (
              <div className="flex justify-between">
                <span className="text-text-secondary">주문번호</span>
                <span className="font-mono text-text-primary">{orderId}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={() => window.history.back()} className="w-full">
          다시 시도
        </Button>
        <Link href="/">
          <Button variant="secondary" className="w-full">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense>
      <PaymentFailContent />
    </Suspense>
  );
}
