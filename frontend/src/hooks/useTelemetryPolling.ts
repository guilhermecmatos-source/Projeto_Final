"use client";

import { useEffect, useRef, useCallback } from "react";
import { telemetryApi } from "@/services/api";
import type { TelemetryAlert } from "@/types";

const POLL_INTERVAL_MS = 30_000; // 30 segundos

export function useTelemetryPolling(
  onAlert: (alert: TelemetryAlert) => void
) {
  const seenIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await telemetryApi.alerts();
      const { alerts } = res.data as { alerts: TelemetryAlert[] };
      if (!Array.isArray(alerts)) return;

      alerts.forEach((alert) => {
        if (!seenIds.current.has(alert.id)) {
          seenIds.current.add(alert.id);
          onAlert(alert);
        }
      });
    } catch {
      // Silencioso — não quebra a UI se telemetria falhar
    }
  }, [onAlert]);

  useEffect(() => {
    // Primeira chamada imediata
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);
}
