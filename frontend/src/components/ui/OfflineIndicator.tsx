"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useOffline } from "@/hooks/useOffline";

interface OfflineIndicatorProps {
  showForPilot?: boolean;
}

export default function OfflineIndicator({ showForPilot = true }: OfflineIndicatorProps) {
  const { online, pendingCount, syncing, syncNow } = useOffline();
  const [feedback, setFeedback] = useState("");

  if (!showForPilot) return null;

  async function handleSync() {
    setFeedback("");
    const result = await syncNow();
    setFeedback(result.message);
  }

  return (
    <div
      className={`mb-4 flex flex-col gap-2 rounded-lg border px-4 py-3 text-sm ${
        online
          ? pendingCount > 0
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : "border-green-200 bg-green-50 text-green-900"
          : "border-orange-300 bg-orange-50 text-orange-900"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name={online ? "cloud_done" : "cloud_off"} />
          <span>
            {online ? "Modo online" : "Modo offline ativo (piloto)"}
            {pendingCount > 0 && (
              <strong className="ml-2">
                • {pendingCount} item(ns) pendente(s) de sincronização
              </strong>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={!online || syncing}
          className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary disabled:opacity-50"
        >
          <Icon name={syncing ? "hourglass_top" : "sync"} className={`text-sm ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      </div>
      {feedback && <p className="text-xs font-medium">{feedback}</p>}
    </div>
  );
}
