"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/utils/format";

interface AnimatedPriceProps {
  value: number;
  className?: string;
}

export function AnimatedPrice({ value, className = "" }: AnimatedPriceProps) {
  const formatted = formatPrice(value);
  const prevValueRef = useRef(value);
  const direction = value >= prevValueRef.current ? -1 : 1; // -1: 위로 올라감 (증가), 1: 아래로 내려감 (감소)

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  // 각 문자를 개별 슬롯으로 분리
  const chars = formatted.split("");

  return (
    <span className={`inline-flex overflow-hidden ${className}`} aria-label={formatted}>
      {chars.map((char, i) => {
        const isDigit = /\d/.test(char);
        if (!isDigit) {
          // 쉼표, '원' 등은 정적 렌더링
          return (
            <span key={`static-${i}-${char}`} className="inline-block">
              {char}
            </span>
          );
        }
        return (
          <span key={`slot-${i}`} className="inline-block relative" style={{ width: "0.6em" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${i}-${char}-${value}`}
                className="inline-block"
                initial={{ y: `${direction * -100}%`, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: `${direction * 100}%`, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
