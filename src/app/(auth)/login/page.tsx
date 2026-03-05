"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-8">로그인</h1>
        {registered && (
          <div className="bg-success-light text-success-text text-sm px-4 py-3 rounded-lg mb-4">
            회원가입이 완료되었습니다. 로그인해주세요.
          </div>
        )}
        <LoginForm />
        <p className="text-center text-sm text-text-secondary mt-6">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
