"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ApiException } from "@/lib/api/client";
import type { AccountLinkInfo, AuthProvider } from "@/types/user";

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  LOCAL: "이메일/비밀번호",
  GOOGLE: "Google",
  KAKAO: "카카오",
};

interface AccountLinkModalProps {
  linkInfo: AccountLinkInfo;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountLinkModal({ linkInfo, onSuccess, onCancel }: AccountLinkModalProps) {
  const linkAccount = useAuthStore((s) => s.linkAccount);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const existingMethods = linkInfo.existingProviders
    .map((p) => PROVIDER_LABELS[p])
    .join(", ");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await linkAccount(linkInfo.linkToken, linkInfo.hasPassword ? password : undefined);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.detail);
      } else {
        setError("계정 연결에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onCancel} title="기존 계정 연결">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-text-secondary">
          <p>
            <span className="font-medium text-text-primary">{linkInfo.email}</span>
            은(는) 이미{" "}
            <span className="font-medium text-primary">{existingMethods}</span>
            (으)로 가입되어 있습니다.
          </p>
          <p className="mt-2">기존 계정에 소셜 로그인을 연결하시겠습니까?</p>
        </div>

        {error && (
          <div className="bg-error-light text-error-text text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {linkInfo.hasPassword && (
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="기존 계정 비밀번호를 입력하세요"
            required
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            취소
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            연결하기
          </Button>
        </div>
      </form>
    </Modal>
  );
}
