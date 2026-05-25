"use client";

import { useCallback, useEffect, useState } from "react";
import { clearSyncQueue, getSyncQueue, isOnline } from "@/lib/offline";

export function useOffline() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(() => {
    setOnline(isOnline());
    setPendingCount(getSyncQueue().length);
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = () => refresh();
    const onOffline = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const interval = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, [refresh]);

  const syncNow = useCallback(async () => {
    if (!isOnline()) return false;
    clearSyncQueue();
    refresh();
    return true;
  }, [refresh]);

  return { online, pendingCount, refresh, syncNow };
}
