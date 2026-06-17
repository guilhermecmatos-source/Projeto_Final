"use client";

import { useState, useCallback } from "react";
import type { TelemetryAlert } from "@/types";

export interface Toast {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "info";
  timestamp: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    title: string,
    message: string,
    severity: Toast["severity"] = "info"
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, title, message, severity, timestamp: Date.now() };
    setToasts((prev) => [toast, ...prev].slice(0, 5)); // máximo 5 toasts
    return id;
  }, []);

  const addTelemetryAlert = useCallback((alert: TelemetryAlert) => {
    addToast(alert.title, alert.message, alert.severity === "medium" ? "medium" : alert.severity);
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => setToasts([]), []);

  return { toasts, addToast, addTelemetryAlert, removeToast, clearAll };
}
