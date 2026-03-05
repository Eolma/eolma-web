"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";
import { formatPrice } from "@/lib/utils/format";

const AUTO_SLIDE_INTERVAL = 4000;

export function HeroCarousel() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    async function fetchHot() {
      try {
        const data = await getAuctions({ status: "ACTIVE", size: 5 });
        const sorted = [...data.content].sort((a, b) => b.bidCount - a.bidCount);
        setAuctions(sorted.slice(0, 5));
      } catch {
        // ignore
      }
    }
    fetchHot();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (auctions.length === 0) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(((index % auctions.length) + auctions.length) % auctions.length);
    },
    [auctions.length, currentIndex],
  );

  // 자동 슬라이드
  useEffect(() => {
    if (auctions.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % auctions.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [auctions.length]);

  if (auctions.length === 0) return null;

  const auction = auctions[currentIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-bg-tertiary">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goTo(currentIndex + 1);
            else if (info.offset.x > 60) goTo(currentIndex - 1);
          }}
          className="px-6 py-8 md:py-10 cursor-grab active:cursor-grabbing select-none"
        >
          <p className="text-xs text-text-tertiary mb-1 uppercase tracking-wider">HOT</p>
          <h3 className="text-lg md:text-xl font-bold text-text-primary truncate">{auction.title}</h3>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl md:text-3xl font-extrabold text-primary tabular-nums">
              {formatPrice(auction.currentPrice)}
            </span>
            <span className="text-sm text-text-tertiary">
              입찰 {auction.bidCount}회
            </span>
          </div>
          <Link
            href={`/auctions/${auction.id}`}
            className="inline-block mt-4 px-4 py-2 bg-primary text-text-on-primary text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            입찰하기
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicator */}
      {auctions.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {auctions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? "bg-primary" : "bg-text-tertiary/30"
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
