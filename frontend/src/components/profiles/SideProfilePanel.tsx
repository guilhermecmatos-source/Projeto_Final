"use client";

import { ReactNode, useEffect } from "react";
import Icon from "@/components/ui/Icon";

interface SideProfilePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SideProfilePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: SideProfilePanelProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-lowest shadow-overlay animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex items-start justify-between gap-3 border-b border-outline-variant px-5 py-4">
          <div>
            <h2 className="text-headline-sm font-bold text-primary">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
            aria-label="Fechar"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t border-outline-variant px-5 py-4">{footer}</footer>
        )}
      </aside>
    </>
  );
}
