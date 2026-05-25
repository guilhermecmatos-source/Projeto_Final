"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, ready, setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

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

      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onProfileChange={setUser}
      />

      <div className="flex min-h-screen flex-col lg:ml-64">
        <TopHeader
          title={headerTitle}
          searchPlaceholder={searchPlaceholder}
          action={
            <>
              <button
                type="button"
                className="rounded-lg p-2 lg:hidden"
                aria-label="Abrir menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Icon name="menu" className="text-2xl text-primary" />
              </button>
              {headerAction}
            </>
          }
        />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {isPilotContext && <OfflineIndicator />}
          {children}
        </div>
      </div>
    </div>
  );
}
