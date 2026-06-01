"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function ManutencaoListPage() {
  return (
    <DashboardShell
      titulo="Manutenção"
      acao={
        <Button size="sm" asChild>
          <Link href={ROUTES.maintenanceRegister}>Registrar</Link>
        </Button>
      }
    >
      <p className="text-gray-400">Agende e acompanhe manutenções preventivas e corretivas.</p>
    </DashboardShell>
  );
}
