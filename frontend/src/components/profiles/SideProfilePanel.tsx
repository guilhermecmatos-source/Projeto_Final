"use client";

import Icon from "@/components/ui/Icon";

interface SideProfilePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SideProfilePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
}: SideProfilePanelProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 lg:bg-transparent"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface shadow-2xl transition-transform">
        <div className="flex items-start justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="text-headline-sm font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-surface-container-high"
            aria-label="Fechar"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  );
}
