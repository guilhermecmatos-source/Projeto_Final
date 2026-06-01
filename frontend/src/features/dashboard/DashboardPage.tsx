"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Fuel, Gauge, PiggyBank, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/cards/StatCard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { GraficoConsumoMensal } from "@/components/charts/GraficoConsumoMensal";
import { GraficoEficienciaFrota } from "@/components/charts/GraficoEficienciaFrota";
import { GraficoRankingMotoristas } from "@/components/charts/GraficoRankingMotoristas";
import { formatarMoeda } from "@/lib/masks";
import { staggerContainer } from "@/lib/motion";
import {
  COLUNAS_EXPORT,
  CONSUMO_MENSAL,
  EFICIENCIA_FROTA,
  RANKING_MOTORISTAS,
  STATS_MOCK,
  TABELA_VEICULOS,
} from "./constants";

export function DashboardPage() {
  return (
    <DashboardShell titulo="Dashboard Executivo">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard titulo="Gasto Total" valor={formatarMoeda(STATS_MOCK.totalSpend)} icone={TrendingUp} atraso={0} />
          <StatCard titulo="Litros Abastecidos" valor={`${STATS_MOCK.totalLiters.toLocaleString("pt-BR")} L`} icone={Fuel} destaque="cyan" atraso={0.05} />
          <StatCard titulo="Média KM/L" valor={`${STATS_MOCK.avgKmPerLiter} km/L`} icone={Gauge} destaque="emerald" atraso={0.1} />
          <StatCard titulo="Alertas Ativos" valor={String(STATS_MOCK.activeAlerts)} icone={AlertTriangle} destaque="red" atraso={0.15} />
          <StatCard titulo="Economia Gerada" valor={formatarMoeda(STATS_MOCK.savingsGenerated)} icone={PiggyBank} destaque="emerald" atraso={0.2} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Consumo mensal</CardTitle>
              <CardDescription>Litros abastecidos por mês</CardDescription>
            </CardHeader>
            <GraficoConsumoMensal dados={CONSUMO_MENSAL} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Eficiência da frota</CardTitle>
              <CardDescription>Média KM/L semanal</CardDescription>
            </CardHeader>
            <GraficoEficienciaFrota dados={EFICIENCIA_FROTA} />
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ranking de motoristas</CardTitle>
            </CardHeader>
            <GraficoRankingMotoristas dados={RANKING_MOTORISTAS} />
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Performance da frota</CardTitle>
              <CardDescription>Busca, ordenação e exportação</CardDescription>
            </div>
            <BarraExportacao
              titulo="Performance da Frota"
              nomeArquivo="frota-performance"
              colunas={COLUNAS_EXPORT}
              linhas={TABELA_VEICULOS}
            />
          </CardHeader>
          <DataTable
            dados={TABELA_VEICULOS}
            colunas={[
              { chave: "placa", titulo: "Placa" },
              { chave: "motorista", titulo: "Motorista" },
              { chave: "consumo", titulo: "Consumo" },
              {
                chave: "status",
                titulo: "Status",
                render: (l) => (
                  <Badge
                    variant={
                      l.status === "alerta" ? "critical" : l.status === "atenção" ? "medium" : "success"
                    }
                  >
                    {String(l.status)}
                  </Badge>
                ),
              },
              { chave: "kmL", titulo: "KM/L" },
            ]}
            chavesBusca={["placa", "motorista"]}
          />
        </Card>
      </motion.div>
    </DashboardShell>
  );
}
