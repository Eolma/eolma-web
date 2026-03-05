"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ApiException } from "@/lib/api/client";

export default function SetNicknamePage() {
  const router = useRouter();
  const { isAuthenticated, setNickname } = useAuthStore();
  const [nickname, setNicknameValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 인증되지 않은 상태면 로그인으로
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (nickname.trim().length < 2) {
      setError("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      await setNickname(nickname.trim());
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.detail);
      } else {
        setError("닉네임 설정에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-2">닉네임 설정</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          서비스에서 사용할 닉네임을 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <Input
            label="닉네임"
            type="text"
            value={nickname}
            onChange={(e) => setNicknameValue(e.target.value)}
            placeholder="닉네임을 입력하세요"
            required
            minLength={2}
            maxLength={20}
          />
          <Button type="submit" loading={loading} className="w-full">
            시작하기
          </Button>
        </form>
      </div>
    </div>
  );
}
