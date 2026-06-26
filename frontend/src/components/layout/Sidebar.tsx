"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/navigation";
import { filterNavByRole } from "@/lib/permissions";
import { IMAGES } from "@/lib/images";
import { User } from "@/types";
import { authApi } from "@/services/api";
import { getStoredTheme, applyTheme, ThemeId, THEME_OPTIONS } from "@/lib/themes";
import { getOfflineMode, saveOfflineMode } from "@/db/localDb";

interface SidebarProps {
  user: User | null;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = filterNavByRole(NAV_ITEMS, user);

  const [syncQueueLength, setSyncQueueLength] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("dark");
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollSaveFrame = useRef<number | null>(null);
  const isUnmounting = useRef(false);

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
    if (typeof window !== "undefined") {
      setOfflineMode(getOfflineMode());
    }
  }, []);

  useEffect(() => {
    const getQueueSize = () => {
      if (typeof window !== "undefined") {
        try {
          const q = JSON.parse(localStorage.getItem("fleet_offline_queue") || "[]");
          setSyncQueueLength(Array.isArray(q) ? q.length : 0);
        } catch {
          setSyncQueueLength(0);
        }
      }
    };
    getQueueSize();
    const interval = setInterval(getQueueSize, 3000);
    const handleStorage = () => getQueueSize();
    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    isUnmounting.current = false;
    const restoreScroll = () => {
      if (!navScrollRef.current || typeof window === "undefined") return;
      const saved = sessionStorage.getItem("fleet_sidebar_scroll");
      if (saved) {
        navScrollRef.current.scrollTop = Number(saved);
      }
    };

    restoreScroll();
    const timer = setTimeout(restoreScroll, 50);

    const handleScroll = () => {
      if (!navScrollRef.current || isUnmounting.current) return;
      if (scrollSaveFrame.current !== null) {
        cancelAnimationFrame(scrollSaveFrame.current);
      }
      scrollSaveFrame.current = requestAnimationFrame(() => {
        if (!navScrollRef.current || isUnmounting.current) return;
        sessionStorage.setItem("fleet_sidebar_scroll", String(navScrollRef.current.scrollTop));
      });
    };

    const navElem = navScrollRef.current;
    navElem?.addEventListener("scroll", handleScroll);
    return () => {
      isUnmounting.current = true;
      clearTimeout(timer);
      if (navElem) {
        navElem.removeEventListener("scroll", handleScroll);
      }
      if (scrollSaveFrame.current !== null) {
        cancelAnimationFrame(scrollSaveFrame.current);
      }
    };
  }, [pathname]);

  function handleToggleOffline() {
    const next = !offlineMode;
    setOfflineMode(next);
    saveOfflineMode(next);
  }

  async function handleSync() {
    if (offlineMode) return;
    setSyncing(true);
    window.dispatchEvent(
      new CustomEvent("show-sync-toast", { detail: { message: "Sincronizando itens offline..." } })
    );
    try {
      const queue: any[] = JSON.parse(localStorage.getItem("fleet_offline_queue") || "[]");
      if (queue.length > 0) {
        localStorage.setItem("fleet_offline_queue", "[]");
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}
    setTimeout(() => setSyncing(false), 1600);
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[min(100vw-3rem,16rem)] max-w-[85vw] flex-col border-r border-outline-variant bg-surface-container-lowest py-5 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo */}
      <div className="mb-5 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-black text-on-primary">
            F
          </span>
          <div>
            <h1 className="text-sm font-bold text-primary">FleetAI</h1>
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant">
              Operational Control
            </p>
          </div>
        </div>
        <button type="button" className="rounded-lg p-1 lg:hidden" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      {/* Navigation */}
      <nav ref={navScrollRef} className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              onClick={() => {
                if (navScrollRef.current) {
                  sessionStorage.setItem("fleet_sidebar_scroll", String(navScrollRef.current.scrollTop));
                }
                if (onClose) onClose();
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "nav-active"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon name={item.icon} className="text-xl" filled={active} />
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Panel */}
      <div className="mt-auto border-t border-outline-variant px-4 pt-4">

        {/* Offline Mode Toggle */}
        <div className="mb-3 rounded-lg border border-outline-variant/50 bg-surface-container-high p-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Modo Operação
            </span>
            <button
              type="button"
              onClick={handleToggleOffline}
              aria-pressed={offlineMode}
              aria-label={offlineMode ? "Ativar modo online" : "Ativar modo offline"}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                offlineMode ? "bg-amber-500" : "bg-green-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  offlineMode ? "left-0.5" : "left-[18px]"
                }`}
              />
            </button>
          </div>
          <p className={`mt-1 text-[9px] font-bold ${offlineMode ? "text-amber-500" : "text-green-400"}`}>
            {offlineMode ? "● OFFLINE (Cache Local)" : "● ONLINE (Conectado)"}
          </p>

          {syncQueueLength > 0 && (
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[9px] text-amber-400">
                {syncQueueLength} {syncQueueLength === 1 ? "item" : "itens"} na fila
              </span>
              {!offlineMode && (
                <button
                  type="button"
                  onClick={() => void handleSync()}
                  disabled={syncing}
                  className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 hover:bg-amber-500/30 disabled:opacity-50"
                >
                  <Icon name="sync" className={`text-xs ${syncing ? "animate-spin" : ""}`} />
                  Sincronizar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sync pending badge */}
        {syncQueueLength > 0 && !offlineMode && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold uppercase text-amber-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Sync Pendente
            </span>
            <span>{syncQueueLength} itens</span>
          </div>
        )}

        {/* Modo */}
        <div className="mb-3 space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
            MODO
          </label>
          <select
            value={user?.role ?? "administrador"}
            onChange={(e) => {
              const newRole = e.target.value;
              const updatedUser = { ...user, role: newRole };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              window.location.reload();
            }}
            className="w-full cursor-pointer rounded border border-outline-variant bg-surface p-1.5 text-[10px] font-bold uppercase text-on-surface focus:outline-none"
          >
            <option value="administrador">Administrador</option>
            <option value="gestor">Gestor</option>
            <option value="motorista">Motorista</option>
            <option value="solicitante">Solicitante</option>
          </select>
        </div>

        {/* User Info */}
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-surface-container-high p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGES.userAvatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full border border-outline-variant object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-primary">{user?.name ?? "Operador"}</p>
            <p className="truncate text-[9px] uppercase text-on-surface-variant">
              {user?.role ?? "administrador"}
            </p>
          </div>
        </div>

        {/* Theme selector */}
        <div className="mb-3">
          <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
            Tema da Interface
          </label>
          <select
            value={currentTheme}
            onChange={(e) => {
              const t = e.target.value as ThemeId;
              setCurrentTheme(t);
              applyTheme(t);
            }}
            className="w-full cursor-pointer rounded border border-outline-variant bg-surface p-1.5 text-[10px] text-on-surface focus:outline-none"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex-1 rounded-lg bg-error/20 py-1.5 text-center text-[10px] font-bold uppercase text-error hover:bg-error/30"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
