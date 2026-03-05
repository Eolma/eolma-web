"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { AnimatePresence, motion } from "framer-motion";

export function NetworkBanner() {
  const status = useNetworkStatus();

  const isVisible = status === "offline" || status === "recovered";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-0 left-0 right-0 z-[110] text-center text-sm font-medium py-2 ${
            status === "offline"
              ? "bg-error text-white"
              : "bg-success text-white"
          }`}
        >
          {status === "offline"
            ? "인터넷 연결이 끊어졌습니다"
            : "연결이 복구되었습니다"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
