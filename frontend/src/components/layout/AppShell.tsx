"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileBottomNav from "./MobileBottomNav";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import LoadingState from "@/components/ui/LoadingState";
import AccessDenied from "@/components/ui/AccessDenied";
import { useAuth } from "@/hooks/useAuth";
import { canAccessRoute } from "@/lib/permissions";
import Icon from "@/components/ui/Icon";

interface AppShellProps {
  children: ReactNode;
  headerTitle?: string;
  searchPlaceholder?: string;
  headerAction?: ReactNode;
  showOfflineForPilot?: boolean;
}

export default function AppShell({
  children,
  headerTitle,
  searchPlaceholder,
  headerAction,
  showOfflineForPilot = false,
}: AppShellProps) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center safe-area-padding">
        <LoadingState message="Carregando sessão..." />
      </div>
    );
  }

  const accessDenied = user && !canAccessRoute(user, pathname);

  const isPilotContext =
    showOfflineForPilot ||
    user?.role === "attendant" ||
    (typeof window !== "undefined" && window.location.pathname.includes("/drivers"));

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <div className="lg:hidden">
          <TopHeader
            title={headerTitle}
            searchPlaceholder={searchPlaceholder}
            action={
              <>
                <button
                  type="button"
                  className="touch-target rounded-lg p-2"
                  aria-label="Abrir menu"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Icon name="menu" className="text-2xl text-primary" />
                </button>
                {headerAction}
              </>
            }
          />
        </div>
        <div id="main-content" className="main-content flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          {isPilotContext && <OfflineIndicator />}
          {accessDenied ? <AccessDenied /> : children}
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
