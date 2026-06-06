"use client";

import { ReactNode, useEffect } from "react";
import Icon from "./Icon";

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  xl?: boolean;
}

export default function FormModal({ open, title, subtitle, onClose, children, wide, xl }: FormModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Fechar" onClick={onClose} />
      <div
        className={`relative z-10 w-full animate-slide-in rounded-xl border border-primary/30 bg-surface-container-low shadow-overlay ${
          xl ? "max-w-5xl" : wide ? "max-w-3xl" : "max-w-xl"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between border-b border-outline-variant px-5 py-4">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
          >
            Cancelar
          </button>
        </header>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
