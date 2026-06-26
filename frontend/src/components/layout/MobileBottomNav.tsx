"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { MOBILE_BOTTOM_NAV } from "@/lib/mobileNav";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              className={`flex min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition touch-target ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} className="text-2xl" filled={active} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-w-[4rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold text-on-surface-variant touch-target"
          aria-label="Abrir menu completo"
        >
          <Icon name="menu" className="text-2xl" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
