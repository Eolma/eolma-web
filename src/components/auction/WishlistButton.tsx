"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

interface WishlistButtonProps {
  auctionId: number;
  className?: string;
}

export function WishlistButton({ auctionId, className = "" }: WishlistButtonProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(auctionId));

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(auctionId);
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 1.3 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={`p-1.5 rounded-full ${className}`}
      aria-label={isWishlisted ? "찜 해제" : "찜하기"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isWishlisted
            ? "fill-error text-error"
            : "fill-none text-text-tertiary hover:text-error"
        }`}
      />
    </motion.button>
  );
}
