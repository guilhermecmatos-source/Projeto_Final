"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { GraficoConsumoMensal } from "@/components/charts/GraficoConsumoMensal";
import { CONSUMO_MENSAL } from "@/features/dashboard/constants";
import { fadeIn } from "@/lib/motion";

const RELATORIOS = [
  { id: "1", titulo: "Eficiência de combustível", descricao: "Análise trimestral da frota" },
  { id: "2", titulo: "Custos operacionais", descricao: "Consolidado mensal" },
  { id: "3", titulo: "Disponibilidade de veículos", descricao: "Taxa de utilização" },
];

export function RelatoriosPage() {
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const relatorio = RELATORIOS.find((r) => r.id === detalheId);

  const linhas = RELATORIOS.map((r) => ({ titulo: r.titulo, descricao: r.descricao }));

  return (
    <DashboardShell titulo="Relatórios Estratégicos">
      <BarraExportacao
        titulo="Relatórios"
        nomeArquivo="relatorios-estrategicos"
        colunas={[
          { header: "Título", key: "titulo" },
          { header: "Descrição", key: "descricao" },
        ]}
        linhas={linhas}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {RELATORIOS.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="text-base">{r.titulo}</CardTitle>
              <p className="text-sm text-gray-500">{r.descricao}</p>
            </CardHeader>
            <Button size="sm" variant="secondary" onClick={() => setDetalheId(r.id)}>
              Ver Relatório
            </Button>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {relatorio && (
          <motion.div
            {...fadeIn}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setDetalheId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-gray-800 bg-gray-950 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-xl font-bold">{relatorio.titulo}</h3>
              <GraficoConsumoMensal dados={CONSUMO_MENSAL} />
              <div className="mt-4 flex justify-end gap-2">
                <BarraExportacao
                  titulo={relatorio.titulo}
                  nomeArquivo={`relatorio-${relatorio.id}`}
                  colunas={[{ header: "Mês", key: "mes" }, { header: "Litros", key: "litros" }]}
                  linhas={CONSUMO_MENSAL}
                />
                <Button variant="outline" onClick={() => setDetalheId(null)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
