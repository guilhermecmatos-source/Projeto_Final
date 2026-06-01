"use client";

import { ReactNode } from "react";
import { DashboardShell } from "./dashboard-shell";

interface AppShellProps {
  children: ReactNode;
  headerTitle?: string;
  searchPlaceholder?: string;
  headerAction?: ReactNode;
  showOfflineForPilot?: boolean;
  fullWidth?: boolean;
}

/** Compatibilidade com páginas legadas — delega ao DashboardShell */
export default function AppShell({
  children,
  headerTitle,
  headerAction,
  fullWidth,
}: AppShellProps) {
  return (
    <DashboardShell titulo={headerTitle} acao={headerAction} semPadding={fullWidth}>
      {children}
    </DashboardShell>
  );
}
