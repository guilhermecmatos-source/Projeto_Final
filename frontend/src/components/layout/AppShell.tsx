"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { useAuth } from "@/hooks/useAuth";

interface AppShellProps {
  children: ReactNode;
  headerTitle?: string;
  searchPlaceholder?: string;
  headerAction?: ReactNode;
}

export default function AppShell({
  children,
  headerTitle,
  searchPlaceholder,
  headerAction,
}: AppShellProps) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-on-surface-variant">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="ml-64 flex min-h-screen flex-col">
        <TopHeader
          title={headerTitle}
          searchPlaceholder={searchPlaceholder}
          action={headerAction}
        />
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
