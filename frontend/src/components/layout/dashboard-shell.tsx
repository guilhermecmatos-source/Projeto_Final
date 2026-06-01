"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./top-bar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardShellProps {
  children: ReactNode;
  titulo?: string;
  acao?: React.ReactNode;
  semPadding?: boolean;
}

export function DashboardShell({
  children,
  titulo,
  acao,
  semPadding = false,
}: DashboardShellProps) {
  const { user, ready } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuAberta, setMenuAberta] = useState(false);
  const [colapsada, setColapsada] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar
        usuario={user}
        aberta={menuAberta}
        colapsada={colapsada}
        onFechar={() => setMenuAberta(false)}
        onAlternarColapso={() => setColapsada((c) => !c)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          colapsada ? "lg:ml-[72px]" : "lg:ml-64"
        )}
      >
        <TopBar
          titulo={titulo}
          onAbrirMenu={() => setMenuAberta(true)}
          tema={theme}
          onAlternarTema={toggle}
          acao={acao}
        />
        <main className={cn("flex-1", !semPadding && "p-4 sm:p-6 lg:p-8")}>{children}</main>
      </div>
    </div>
  );
}
