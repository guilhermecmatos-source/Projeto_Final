"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/navigation";
import { IMAGES } from "@/lib/images";
import { User } from "@/types";

interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low py-6">
      <div className="mb-8 px-4">
        <h1 className="text-headline-md font-bold text-primary">FleetAI</h1>
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
          Operational Control
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
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
            className="h-10 w-10 rounded-full border border-outline-variant object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-label-md font-bold text-on-surface">
              {user?.name ?? "Operador"}
            </p>
            <p className="truncate text-[10px] capitalize text-on-surface-variant">
              {user?.role ?? "gestor"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
