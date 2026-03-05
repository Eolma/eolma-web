"use client";

import { useState, useEffect } from "react";

type NetworkState = "online" | "offline" | "recovered";

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkState>("online");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.onLine) setStatus("offline");

    let recoveryTimer: ReturnType<typeof setTimeout>;

    const onOnline = () => {
      setStatus("recovered");
      recoveryTimer = setTimeout(() => setStatus("online"), 2000);
    };

    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", handleOffline);
      if (recoveryTimer) clearTimeout(recoveryTimer);
    };
  }, []);

  return status;
}
