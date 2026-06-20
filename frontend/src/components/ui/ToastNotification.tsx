"use client";

import { useEffect, useState } from "react";
import type { Toast } from "@/hooks/useToast";

const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-950/95 border-red-500",
    icon: "🚨",
    bar: "bg-red-500",
    text: "text-red-300",
  },
  high: {
    bg: "bg-orange-950/95 border-orange-500",
    icon: "⚠️",
    bar: "bg-orange-500",
    text: "text-orange-300",
  },
  medium: {
    bg: "bg-yellow-950/95 border-yellow-500",
    icon: "📍",
    bar: "bg-yellow-400",
    text: "text-yellow-300",
  },
  info: {
    bg: "bg-slate-900/95 border-blue-500",
    icon: "ℹ️",
    bar: "bg-blue-500",
    text: "text-blue-300",
  },
  success: {
    bg: "bg-emerald-950/95 border-emerald-500",
    icon: "✅",
    bar: "bg-emerald-500",
    text: "text-emerald-300",
  },
};

const AUTO_DISMISS_MS: Record<Toast["severity"], number> = {
  critical: 12000,
  high: 8000,
  medium: 6000,
  info: 4000,
  success: 4000,
};

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export default function ToastNotification({ toast, onRemove }: ToastNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const severity = (toast.severity in SEVERITY_CONFIG) ? toast.severity : "info";
  const cfg = SEVERITY_CONFIG[severity];
  const dismissMs = AUTO_DISMISS_MS[severity];

  useEffect(() => {
    // Entrada com pequeno delay para animar
    const enterTimer = setTimeout(() => setVisible(true), 20);
    // Progress bar
    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / dismissMs) * 100));
    }, 50);
    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, dismissMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [toast.id, dismissMs, onRemove]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        pointer-events-auto relative w-80 overflow-hidden rounded-xl border backdrop-blur-md
        shadow-2xl transition-all duration-300
        ${cfg.bg}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      {/* Barra de progresso */}
      <div
        className={`absolute top-0 left-0 h-0.5 transition-all duration-100 ${cfg.bar}`}
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-start gap-3 p-4">
        <span className="text-xl leading-none" aria-hidden="true">
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-snug ${cfg.text}`}>
            {toast.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300 line-clamp-3">
            {toast.message}
          </p>
          <p className="mt-1.5 text-[10px] text-slate-500">
            {new Date(toast.timestamp).toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
          aria-label="Fechar notificação"
          className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
