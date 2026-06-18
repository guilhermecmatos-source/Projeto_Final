"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  hash?: string;
}

export function showToast(message: string, type: "success" | "info" | "warning" | "error" = "info", hash?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fleet-toast", {
        detail: { message, type, hash },
      })
    );
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message: string;
        type?: "success" | "info" | "warning" | "error";
        hash?: string;
      }>;
      const { message, type = "info", hash } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prev) => [...prev, { id, message, type, hash }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };

    window.addEventListener("fleet-toast", handleToast);
    return () => window.removeEventListener("fleet-toast", handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none md:bottom-6 md:right-6">
      {toasts.map((toast) => {
        let bg = "bg-surface-container-high border-outline text-on-surface";
        let icon = "info";
        let iconColor = "text-primary";

        if (toast.type === "success") {
          bg = "bg-emerald-950/95 border-emerald-500/40 text-emerald-100";
          icon = "check_circle";
          iconColor = "text-emerald-400";
        } else if (toast.type === "error") {
          bg = "bg-red-950/95 border-red-500/40 text-red-100";
          icon = "error";
          iconColor = "text-red-400";
        } else if (toast.type === "warning") {
          bg = "bg-amber-950/95 border-amber-500/40 text-amber-100";
          icon = "warning";
          iconColor = "text-amber-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex flex-col rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bg}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <Icon name={icon} className={`${iconColor} shrink-0 mt-0.5 text-xl`} />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-slate-100">{toast.message}</p>
                {toast.hash && (
                  <div className="mt-2.5 rounded-lg bg-black/60 p-2 font-mono text-[10px] leading-relaxed break-all select-all flex flex-col gap-1 border border-white/10 text-slate-300">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                      <Icon name="verified_user" className="text-[11px] shrink-0" />
                      <span>Ledger Audited Event</span>
                    </div>
                    <span className="text-slate-400">{toast.hash}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white transition p-0.5 rounded-full hover:bg-white/10"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                aria-label="Fechar notificação"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
