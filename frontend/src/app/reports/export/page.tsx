"use client";

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function ReportsExportPage() {
  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      reports: ["operacional", "combustivel", "conformidade", "motoristas"],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleetai-relatorios-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell headerTitle="Exportar Relatórios">
      <Link href="/reports" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" className="text-base" />
        Voltar
      </Link>
      <h1 className="mb-4 text-headline-lg">Exportar Pacote de Relatórios</h1>
      <p className="mb-8 text-body-md text-on-surface-variant">
        Baixe um pacote consolidado em JSON com os indicadores do período.
      </p>
      <button type="button" onClick={handleExport} className="btn-primary">
        <Icon name="download" />
        Baixar Pacote JSON
      </button>
    </AppShell>
  );
}
