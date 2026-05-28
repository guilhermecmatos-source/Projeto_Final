"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/navigation";
import { IMAGES } from "@/lib/images";
import { User } from "@/types";
import ProfileSwitcher from "./ProfileSwitcher";

interface SidebarProps {
  user: User | null;
  open?: boolean;
  onClose?: () => void;
  onProfileChange?: (user: User) => void;
}

export default function Sidebar({ user, open = false, onClose, onProfileChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[min(100vw-3rem,16rem)] max-w-[85vw] flex-col border-r border-outline-variant bg-surface-container-low py-6 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="mb-6 flex items-center justify-between px-4">
        <div>
          <h1 className="text-headline-md font-bold text-primary">FleetAI</h1>
          <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
            Operational Control
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 lg:hidden"
          aria-label="Fechar menu"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-md transition ${
                active
                  ? "nav-active"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              }`}
            >
              <Icon name={item.icon} className="text-xl" filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant px-4 pt-4">
        <div className="flex items-center gap-3">
          <img
            src={IMAGES.userAvatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full border border-outline-variant object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-label-md font-bold text-on-surface">
              {user?.name ?? "Operador"}
            </p>
            <p className="truncate text-[10px] capitalize text-on-surface-variant">
              {user?.role ?? "gestor"}
            </p>
          </div>
        </div>
        {onProfileChange && (
          <ProfileSwitcher user={user} onProfileChange={onProfileChange} />
        )}
      </div>
    </aside>
  );
}
