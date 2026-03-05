"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-8">회원가입</h1>
        <RegisterForm />
        <p className="text-center text-sm text-text-secondary mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
