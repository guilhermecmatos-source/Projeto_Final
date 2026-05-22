"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import { ReactNode } from "react";

interface TopHeaderProps {
  title?: string;
  searchPlaceholder?: string;
  action?: ReactNode;
}

export default function TopHeader({
  title,
  searchPlaceholder = "Buscar no ecossistema...",
  action,
}: TopHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* token may be invalid */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/90 px-6 backdrop-blur-md">
      {title ? (
        <span className="text-headline-sm font-bold text-primary">{title}</span>
      ) : (
        <div className="flex max-w-md flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-high/50 px-3 py-1.5 focus-within:border-primary">
          <Icon name="search" className="text-outline" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="ml-2 w-full border-none bg-transparent text-body-md focus:outline-none focus:ring-0"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        {action}
        <Link
          href="/dashboard"
          className="relative rounded-full p-2 transition hover:bg-surface-container-high"
          aria-label="Notificações"
        >
          <Icon name="notifications" className="text-on-surface-variant" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
        </Link>
        <Link
          href="/partners/docs"
          className="rounded-full p-2 transition hover:bg-surface-container-high"
          aria-label="Configurações"
        >
          <Icon name="settings" className="text-on-surface-variant" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-md text-on-surface-variant transition hover:border-primary hover:text-primary"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
