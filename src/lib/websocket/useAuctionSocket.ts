"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  AuctionWebSocketMessage,
  BidResultMessage,
  InstantBuyReservedMessage,
  InstantBuyStartedMessage,
} from "@/types/auction";
import { getAccessToken } from "../utils/token";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export type ConnectionStatus = "connected" | "connecting" | "reconnecting" | "failed";

export interface InstantBuyReservation {
  buyerId: number;
  expiresAt: string;
}

interface OptimisticState {
  currentPrice: number;
  bidCount: number;
}

interface UseAuctionSocketReturn {
  currentPrice: number;
  bidCount: number;
  remainingSeconds: number;
  connectionStatus: ConnectionStatus;
  lastMessage: AuctionWebSocketMessage | null;
  viewerCount: number | null;
  placeBid: (amount: number) => void;
  isPending: boolean;
  reconnect: () => void;
  instantBuyReservation: InstantBuyReservation | null;
  myInstantBuyReserved: InstantBuyReservedMessage | null;
  instantBuyLocked: boolean;
}

export function useAuctionSocket(
  auctionId: number,
  initialPrice: number,
  initialBidCount: number,
  initialRemainingSeconds: number,
  initialInstantBuyLocked: boolean = false,
): UseAuctionSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const previousState = useRef<OptimisticState | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [lastMessage, setLastMessage] = useState<AuctionWebSocketMessage | null>(null);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [instantBuyReservation, setInstantBuyReservation] = useState<InstantBuyReservation | null>(null);
  const [myInstantBuyReserved, setMyInstantBuyReserved] = useState<InstantBuyReservedMessage | null>(null);
  const [instantBuyLocked, setInstantBuyLocked] = useState(initialInstantBuyLocked);

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

    setConnectionStatus(reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      const message: AuctionWebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case "BID_RESULT": {
          const bidResult = message as BidResultMessage;
          setIsPending(false);

          if (bidResult.status === "ACCEPTED") {
            setCurrentPrice(bidResult.currentPrice);
            setBidCount(bidResult.bidCount);
          } else if (bidResult.status === "REJECTED") {
            if (previousState.current) {
              setCurrentPrice(previousState.current.currentPrice);
              setBidCount(previousState.current.bidCount);
            }
          }
          previousState.current = null;
          break;
        }
        case "AUCTION_UPDATE":
          setCurrentPrice(message.currentPrice);
          setBidCount(message.bidCount);
          setRemainingSeconds(message.remainingSeconds);
          if (message.viewerCount != null) {
            setViewerCount(message.viewerCount);
          }
          break;
        case "AUCTION_CLOSED":
          setRemainingSeconds(0);
          setInstantBuyReservation(null);
          break;
        case "INSTANT_BUY_RESERVED": {
          // 내가 선점한 경우 - 결제 페이지로 이동 유도
          const reserved = message as InstantBuyReservedMessage;
          setIsPending(false);
          previousState.current = null;
          setMyInstantBuyReserved(reserved);
          break;
        }
        case "INSTANT_BUY_STARTED": {
          // 다른 사용자가 선점 시작
          const started = message as InstantBuyStartedMessage;
          setInstantBuyReservation({
            buyerId: started.buyerId,
            expiresAt: started.expiresAt,
          });
          break;
        }
        case "INSTANT_BUY_CANCELLED":
          setInstantBuyReservation(null);
          setMyInstantBuyReserved(null);
          break;
        case "INSTANT_BUY_LOCKED":
          setInstantBuyLocked(true);
          break;
      }
    };

    ws.onclose = () => {
      reconnectAttemptsRef.current++;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus("failed");
      } else {
        setConnectionStatus("reconnecting");
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, RECONNECT_INTERVAL);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [auctionId]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setConnectionStatus("connecting");
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    connect();
  }, [connect]);

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
      previousState.current = { currentPrice, bidCount };
      setCurrentPrice(amount);
      setBidCount((prev) => prev + 1);
      setIsPending(true);

      wsRef.current.send(JSON.stringify({ type: "BID", amount }));
    }
  }, [currentPrice, bidCount]);

  return {
    currentPrice,
    bidCount,
    remainingSeconds,
    connectionStatus,
    lastMessage,
    viewerCount,
    placeBid,
    isPending,
    reconnect,
    instantBuyReservation,
    myInstantBuyReserved,
    instantBuyLocked,
  };
}
