"use client";

import type { ConnectionStatus } from "@/lib/websocket/useAuctionSocket";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
}

const statusConfig: Record<ConnectionStatus, { color: string; pulse: boolean; label: string }> = {
  connected: { color: "bg-success", pulse: false, label: "연결됨" },
  connecting: { color: "bg-warning", pulse: true, label: "연결 중..." },
  reconnecting: { color: "bg-warning", pulse: true, label: "재연결 중..." },
  failed: { color: "bg-error", pulse: false, label: "연결 실패" },
};

export function ConnectionIndicator({ status, onReconnect }: ConnectionIndicatorProps) {
  const config = statusConfig[status];

  if (status === "connected") return null;

  return (
    <div className="flex items-center gap-2 bg-bg-secondary px-3 py-2 rounded-lg text-sm">
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.color}`} />
      </span>
      <span className="text-text-secondary">{config.label}</span>
      {status === "failed" && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-auto text-primary text-sm font-medium hover:underline"
        >
          재연결
        </button>
      )}
    </div>
  );
}
