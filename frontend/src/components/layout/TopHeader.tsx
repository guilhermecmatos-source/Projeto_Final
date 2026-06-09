"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import { ReactNode, useState, useEffect } from "react";
import { getStoredTheme, applyTheme, ThemeId } from "@/lib/themes";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("dark");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  };

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

  const showSearchBar = !title || searchOpen;

  return (
    <header
      className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur-md safe-area-top"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:min-h-16 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {action}
          {title && !searchOpen ? (
            <span className="truncate text-headline-sm font-bold text-primary">{title}</span>
          ) : showSearchBar ? (
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-high/50 px-3 py-2 focus-within:border-primary">
              <Icon name="search" className="shrink-0 text-outline" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="ml-2 min-w-0 flex-1 border-none bg-transparent text-body-md focus:outline-none focus:ring-0"
                enterKeyHint="search"
                autoComplete="off"
              />
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {title && (
            <button
              type="button"
              className="touch-target rounded-full p-2 transition hover:bg-surface-container-high md:hidden"
              aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Icon
                name={searchOpen ? "close" : "search"}
                className="text-on-surface-variant"
              />
            </button>
          )}
          <Link
            href="/notifications"
            className="touch-target relative rounded-full p-2 transition hover:bg-surface-container-high"
            aria-label="Notificações"
          >
            <Icon name="notifications" className="text-on-surface-variant" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
          </Link>
          <Link
            href="/profile"
            className="touch-target rounded-full p-2 transition hover:bg-surface-container-high"
            aria-label="Perfil"
          >
            <Icon name="account_circle" className="text-on-surface-variant" />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="touch-target rounded-full p-2 transition hover:bg-surface-container-high"
            aria-label="Alternar Tema"
          >
            <Icon name={theme === "light" ? "dark_mode" : "light_mode"} className="text-on-surface-variant" />
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="touch-target hidden rounded-lg border border-outline-variant px-2 py-1.5 text-label-md text-on-surface-variant transition hover:border-primary hover:text-primary sm:inline-flex sm:px-3"
          >
            Sair
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="touch-target rounded-full p-2 transition hover:bg-surface-container-high sm:hidden"
            aria-label="Sair"
          >
            <Icon name="logout" className="text-on-surface-variant" />
          </button>
        </div>
      </div>
    </header>
  );
}
