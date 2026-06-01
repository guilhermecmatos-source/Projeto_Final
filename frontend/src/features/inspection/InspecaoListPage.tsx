"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function InspecaoListPage() {
  return (
    <DashboardShell
      titulo="Inspeção"
      acao={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={ROUTES.inspectionIns}>Relatório INS</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={ROUTES.inspectionRegister}>Cadastro</Link>
          </Button>
        </div>
      }
    >
      <p className="text-gray-400">Vistorias, cadastros e relatórios INS.</p>
    </DashboardShell>
  );
}
