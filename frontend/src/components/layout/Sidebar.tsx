"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/navigation";
import { filterNavByRole } from "@/lib/permissions";
import { IMAGES } from "@/lib/images";
import { User } from "@/types";
import { authApi } from "@/services/api";

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

  useEffect(() => {
    const getQueueSize = () => {
      if (typeof window !== "undefined") {
        try {
          const q = JSON.parse(localStorage.getItem("fleet_sync_queue") || "[]");
          setSyncQueueLength(Array.isArray(q) ? q.length : 0);
        } catch {
          setSyncQueueLength(0);
        }
      }
    };
    getQueueSize();
    const interval = setInterval(getQueueSize, 3000);
    return () => clearInterval(interval);
  }, []);

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
      className={`fixed left-0 top-0 z-50 flex h-screen w-[min(100vw-3rem,16rem)] max-w-[85vw] flex-col border-r border-outline-variant bg-[#0d1117] py-5 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
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

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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

      <div className="mt-auto border-t border-outline-variant px-4 pt-4">
        {syncQueueLength > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[10px] text-amber-500 font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Sync Pendente
            </span>
            <span>{syncQueueLength} itens</span>
          </div>
        )}

        <div className="mb-3 space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
            Simulador RBAC
          </label>
          <select
            value={user?.role ?? "administrador"}
            onChange={(e) => {
              const newRole = e.target.value;
              const updatedUser = { ...user, role: newRole };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              window.location.reload();
            }}
            className="w-full rounded bg-[#0d1117] border border-outline-variant p-1.5 text-[10px] text-slate-100 uppercase font-bold focus:outline-none cursor-pointer"
          >
            <option value="administrador">Administrador</option>
            <option value="gestor">Gestor</option>
            <option value="motorista">Motorista</option>
            <option value="solicitante">Solicitante</option>
          </select>
        </div>

        <div className="mb-3 flex items-center gap-3 rounded-lg bg-surface-container-high p-2">
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
        <div className="flex gap-2">
          <Link
            href="/profile"
            className="flex-1 rounded-lg border border-outline-variant py-1.5 text-center text-[10px] font-bold uppercase text-on-surface-variant hover:border-primary hover:text-primary"
          >
            Acessib.
          </Link>
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
