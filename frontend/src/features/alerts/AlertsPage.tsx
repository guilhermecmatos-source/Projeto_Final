"use client";

import { motion } from "framer-motion";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AlertCard } from "@/components/cards/AlertCard";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useAlerts } from "@/hooks/useAlerts";
import { staggerContainer } from "@/lib/motion";

export function AlertsPage() {
  const { alertas, criticos, medios, baixos } = useAlerts();
  const linhas = alertas.map((a) => ({
    titulo: a.title,
    nivel: a.level,
    descricao: a.description,
    veiculo: a.vehiclePlate ?? "",
    motorista: a.driverName ?? "",
  }));

  return (
    <DashboardShell titulo="Alertas IA">
      <div className="mb-6 flex flex-wrap justify-between gap-4">
        <p className="text-gray-400">Detecção inteligente de anomalias operacionais.</p>
        <BarraExportacao
          titulo="Alertas IA"
          nomeArquivo="alertas-ia"
          colunas={[
            { header: "Título", key: "titulo" },
            { header: "Nível", key: "nivel" },
            { header: "Descrição", key: "descricao" },
          ]}
          linhas={linhas}
        />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3 text-center text-sm">
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">
          <p className="text-2xl font-bold text-red-400">{criticos.length}</p>
          <p className="text-gray-500">Críticos</p>
        </div>
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4">
          <p className="text-2xl font-bold text-amber-400">{medios.length}</p>
          <p className="text-gray-500">Médios</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
          <p className="text-2xl font-bold text-gray-300">{baixos.length}</p>
          <p className="text-gray-500">Baixos</p>
        </div>
      </div>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 lg:grid-cols-2">
        {alertas.map((a) => (
          <AlertCard key={a.id} alerta={a} />
        ))}
      </motion.div>
    </DashboardShell>
  );
}
