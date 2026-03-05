"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

/** FAB을 숨겨야 하는 경로 패턴 */
const HIDDEN_PATTERNS = [
  /^\/auctions\/\d+/, // 경매 상세 (모바일 입찰 바와 z-index 충돌)
  /^\/products\/new/, // 이미 등록 페이지에 있을 때
];

/**
 * 상품 등록 플로팅 액션 버튼.
 * 스크롤 방향에 따라 확장/축소되며, 특정 페이지에서는 숨김 처리된다.
 */
export function FloatingActionButton() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  // 스크롤 방향 감지
  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > lastScrollY + 5) {
        setExpanded(false); // 아래로 스크롤 -> 축소
      } else if (currentY < lastScrollY - 5) {
        setExpanded(true); // 위로 스크롤 -> 확장
      }
      lastScrollY = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 특정 페이지에서 숨김
  const hidden = HIDDEN_PATTERNS.some((p) => p.test(pathname));
  if (hidden) return null;

  return (
    <Link href="/products/new" className="md:hidden">
      <motion.div
        layout
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-primary text-white rounded-full shadow-lg active:scale-95 transition-transform"
        style={{ padding: expanded ? "12px 20px" : "12px" }}
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-sm font-semibold whitespace-nowrap"
          >
            등록
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}
