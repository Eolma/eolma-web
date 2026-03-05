"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useToastStore } from "@/lib/store/useToastStore";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const addToast = useToastStore((s) => s.addToast);

  async function handleShare() {
    const shareUrl = url ?? window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // 사용자 취소 등 무시
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      addToast("info", "링크가 복사되었습니다");
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleShare} aria-label="공유하기">
      <Share2 className="w-4 h-4" />
    </Button>
  );
}
