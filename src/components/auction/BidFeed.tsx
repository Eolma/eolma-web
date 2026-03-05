"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/utils/format";

export interface BidFeedItem {
  id: string;
  amount: number;
  timestamp: number;
}

interface BidFeedProps {
  items: BidFeedItem[];
}

export function BidFeed({ items }: BidFeedProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 pointer-events-none max-w-xs">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-bg/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-md"
          >
            <p className="text-sm text-text-primary">
              <span className="text-text-secondary">누군가</span>{" "}
              <span className="font-bold text-primary">{formatPrice(item.amount)}</span>
              <span className="text-text-secondary">에 입찰</span>
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
