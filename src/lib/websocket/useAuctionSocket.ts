"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { AuctionWebSocketMessage } from "@/types/auction";
import { getAccessToken } from "../utils/token";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface UseAuctionSocketReturn {
  currentPrice: number;
  bidCount: number;
  remainingSeconds: number;
  isConnected: boolean;
  lastMessage: AuctionWebSocketMessage | null;
  placeBid: (amount: number) => void;
}

export function useAuctionSocket(
  auctionId: number,
  initialPrice: number,
  initialBidCount: number,
  initialRemainingSeconds: number,
): UseAuctionSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<AuctionWebSocketMessage | null>(null);

  // API 데이터 로딩 완료 시 초기값 동기화
  useEffect(() => {
    if (initialPrice > 0) setCurrentPrice(initialPrice);
  }, [initialPrice]);

  useEffect(() => {
    if (initialBidCount > 0) setBidCount(initialBidCount);
  }, [initialBidCount]);

  useEffect(() => {
    if (initialRemainingSeconds > 0) setRemainingSeconds(initialRemainingSeconds);
  }, [initialRemainingSeconds]);

  const connect = useCallback(() => {
    const token = getAccessToken();
    const url = `${WS_BASE_URL}/ws/auction/${auctionId}${token ? `?token=${token}` : ""}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      const message: AuctionWebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case "BID_RESULT":
          setCurrentPrice(message.currentPrice);
          setBidCount(message.bidCount);
          break;
        case "AUCTION_UPDATE":
          setCurrentPrice(message.currentPrice);
          setBidCount(message.bidCount);
          setRemainingSeconds(message.remainingSeconds);
          break;
        case "AUCTION_CLOSED":
          setRemainingSeconds(0);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [auctionId]);

  // WebSocket 연결
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  // 카운트다운 타이머
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    countdownTimer.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [remainingSeconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const placeBid = useCallback((amount: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "BID", amount }));
    }
  }, []);

  return { currentPrice, bidCount, remainingSeconds, isConnected, lastMessage, placeBid };
}
