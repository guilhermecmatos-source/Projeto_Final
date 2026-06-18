"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/components/ui/Toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const FILTERS = ["6 meses", "12 meses", "Este ano", "Personalizado"];

// Typed recharts formatter helpers — ValueType accepts string|number|undefined
const fmtCurrency = (v: unknown) => `R$ ${Number(v ?? 0).toLocaleString("pt-BR")}`;
const fmtKmL     = (v: unknown) => `${Number(v ?? 0)} km/L`;
const fmtPct     = (v: unknown) => `${Number(v ?? 0)}%`;

export default function BiPage() {
  const [activeFilter, setActiveFilter] = useState("6 meses");
  const [isUpdating, setIsUpdating] = useState(false);

  // Multiplier logic for dynamic data simulation
  const multiplier = useMemo(() => {
    switch(activeFilter) {
      case "12 meses": return 2.1;
      case "Este ano": return 1.4;
      case "Personalizado": return 0.8;
      default: return 1;
    }
  }, [activeFilter]);

  const desempenhoData = useMemo(() => [
    { mes: "Jan", km: Math.round(48200 * multiplier), viagens: Math.round(38 * multiplier), eficiencia: 91 },
    { mes: "Fev", km: Math.round(52100 * multiplier), viagens: Math.round(41 * multiplier), eficiencia: 88 },
    { mes: "Mar", km: Math.round(61500 * multiplier), viagens: Math.round(49 * multiplier), eficiencia: 94 },
    { mes: "Abr", km: Math.round(58900 * multiplier), viagens: Math.round(45 * multiplier), eficiencia: 92 },
    { mes: "Mai", km: Math.round(64300 * multiplier), viagens: Math.round(52 * multiplier), eficiencia: 96 },
    { mes: "Jun", km: Math.round(70100 * multiplier), viagens: Math.round(58 * multiplier), eficiencia: 97 },
  ], [multiplier]);

  const custosData = useMemo(() => [
    { mes: "Jan", combustivel: Math.round(38400 * multiplier), manutencao: Math.round(12100 * multiplier), outros: Math.round(4200 * multiplier) },
    { mes: "Fev", combustivel: Math.round(41600 * multiplier), manutencao: Math.round(9800 * multiplier), outros: Math.round(3800 * multiplier) },
    { mes: "Mar", combustivel: Math.round(49200 * multiplier), manutencao: Math.round(15400 * multiplier), outros: Math.round(5100 * multiplier) },
    { mes: "Abr", combustivel: Math.round(47100 * multiplier), manutencao: Math.round(11200 * multiplier), outros: Math.round(4600 * multiplier) },
    { mes: "Mai", combustivel: Math.round(51400 * multiplier), manutencao: Math.round(8600 * multiplier), outros: Math.round(3200 * multiplier) },
    { mes: "Jun", combustivel: Math.round(56100 * multiplier), manutencao: Math.round(10300 * multiplier), outros: Math.round(4800 * multiplier) },
  ], [multiplier]);

  const consumoData = [
    { name: "SCANIA R450", valor: 2.8, fill: "#3B82F6" },
    { name: "VOLVO FH540", valor: 2.5, fill: "#10B981" },
    { name: "MB Atego 2426", valor: 3.5, fill: "#F59E0B" },
  ];

  const fadiga = useMemo(() => [
    { mes: "Jan", alertas: Math.max(1, Math.round(3 * multiplier)) },
    { mes: "Fev", alertas: Math.max(0, Math.round(1 * multiplier)) },
    { mes: "Mar", alertas: Math.max(1, Math.round(5 * multiplier)) },
    { mes: "Abr", alertas: Math.max(0, Math.round(2 * multiplier)) },
    { mes: "Mai", alertas: Math.max(1, Math.round(4 * multiplier)) },
    { mes: "Jun", alertas: Math.max(0, Math.round(1 * multiplier)) },
  ], [multiplier]);

  const emissoes = [
    { name: "CO₂ Emitido", value: 68, fill: "#EF4444" },
    { name: "Mitigado", value: 32, fill: "#10B981" },
  ];

  const KPI_DATA = useMemo(() => [
    { label: "KM Totais", value: (354.1 * multiplier).toFixed(1) + "k", unit: "km", icon: "route", color: "text-blue-400", border: "border-blue-500/30" },
    { label: "Custo Total", value: "R$ " + (368.2 * multiplier).toFixed(1) + "k", unit: "", icon: "payments", color: "text-red-400", border: "border-red-500/30" },
    { label: "Viagens Realizadas", value: Math.round(283 * multiplier).toString(), unit: "viagens", icon: "local_shipping", color: "text-green-400", border: "border-green-500/30" },
    { label: "Consumo Médio", value: "2.94", unit: "km/L", icon: "local_gas_station", color: "text-amber-400", border: "border-amber-500/30" },
    { label: "Eficiência Média", value: "93%", unit: "", icon: "trending_up", color: "text-purple-400", border: "border-purple-500/30" },
    { label: "Alertas de Fadiga", value: Math.round(16 * multiplier).toString(), unit: "eventos", icon: "bedtime", color: "text-orange-400", border: "border-orange-500/30" },
  ], [multiplier]);

  function filterFleetPerformance(filter: string) {
    setActiveFilter(filter);
    setIsUpdating(true);
    showToast(`Filtrando dados para: ${filter}`, "info");
    setTimeout(() => {
      setIsUpdating(false);
    }, 800);
  }

  function renderBiAnalyticsCharts() {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      showToast("Relatório BI atualizado com dados em tempo real", "success");
    }, 1000);
  }

  function exportReport(type: "PDF" | "Excel" | "CSV") {
    const data = desempenhoData.map(d => `${d.mes},${d.km},${d.viagens},${d.eficiencia}`).join("\n");
    if (type === "CSV") {
      const blob = new Blob([`Mês,KM,Viagens,Eficiência\n${data}`], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio_frota.csv";
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV exportado com sucesso!", "success");
    } else {
      showToast(`Exportação ${type} simulada — arquivo gerado no servidor.`, "info");
    }
  }

  return (
    <AppShell>
      <PageHeader
        breadcrumb="BI & ANALYTICS"
        title="Business Intelligence & Analytics"
        subtitle="Análise de desempenho, custos, consumo e produtividade da frota em tempo real."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={renderBiAnalyticsCharts}
              disabled={isUpdating}
              className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50"
            >
              <Icon name={isUpdating ? "sync" : "refresh"} className={`text-sm ${isUpdating ? "animate-spin" : ""}`} /> 
              {isUpdating ? "Atualizando..." : "Atualizar"}
            </button>
            {(["PDF", "Excel", "CSV"] as const).map((t) => (
              <button
                key={t}
                onClick={() => exportReport(t)}
                className="flex items-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface-variant hover:text-primary transition"
              >
                <Icon name="download" className="text-sm" /> {t}
              </button>
            ))}
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Período:</span>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => filterFleetPerformance(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeFilter === f ? "bg-primary text-on-primary shadow-lg" : "border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={`transition-opacity duration-300 ${isUpdating ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        {/* KPIs */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {KPI_DATA.map(k => (
            <div key={k.label} className={`rounded-2xl border bg-surface-container-low p-4 ${k.border} hover:scale-105 transition-transform cursor-default`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">{k.label}</p>
                <Icon name={k.icon} className={`${k.color} text-base`} />
              </div>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              {k.unit && <p className="text-[9px] text-on-surface-variant mt-1">{k.unit}</p>}
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="raised-card p-5">
            <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">📊 Desempenho por Mês</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={desempenhoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="viagens" name="Viagens" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eficiencia" name="Eficiência %" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="raised-card p-5">
            <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">💰 Custos por Categoria</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={custosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}}
                  formatter={fmtCurrency} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="combustivel" name="Combustível" fill="#EF4444" stackId="a" />
                <Bar dataKey="manutencao" name="Manutenção" fill="#F59E0B" stackId="a" />
                <Bar dataKey="outros" name="Outros" fill="#6366F1" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="raised-card p-5">
            <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">⛽ Consumo por Modelo</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={consumoData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b" }} width={100} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}}
                  formatter={fmtKmL} />
                <Bar dataKey="valor" name="Consumo (km/L)" radius={[0, 4, 4, 0]}>
                  {consumoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="raised-card p-5">
            <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">😴 Alertas de Fadiga</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={fadiga}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}} />
                <Line type="monotone" dataKey="alertas" name="Alertas" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="raised-card p-5">
            <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">🌿 Emissões CO₂</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={emissoes} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {emissoes.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}}
                  formatter={fmtPct} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-[9px] text-on-surface-variant mt-2">Carbono mitigado: <span className="font-bold text-green-400">32%</span></p>
          </div>
        </div>

        {/* Productivity Table */}
        <div className="raised-card p-5">
          <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">📋 Produtividade por Veículo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  {["Placa", "Modelo", "KM Rodado", "Viagens", "Consumo Médio", "Custo Total", "Eficiência"].map(h => (
                    <th key={h} className="pb-3 text-left font-bold text-on-surface-variant uppercase tracking-wider text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {[
                  ["BRA-2E19", "SCANIA R450", (125.4 * multiplier).toFixed(1) + "k", Math.round(89 * multiplier), "2.8 km/L", "R$ " + (142.8 * multiplier).toFixed(1) + "k", "96%"],
                  ["FLT-0130", "VOLVO FH540", (82.1 * multiplier).toFixed(1) + "k", Math.round(64 * multiplier), "2.5 km/L", "R$ " + (98.6 * multiplier).toFixed(1) + "k", "91%"],
                  ["MEC-4D21", "MB Atego 2426", (146.4 * multiplier).toFixed(1) + "k", Math.round(130 * multiplier), "3.5 km/L", "R$ " + (126.8 * multiplier).toFixed(1) + "k", "89%"],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-high transition">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-3 pr-4 font-mono ${j === 0 ? "font-bold text-primary" : "text-on-surface-variant"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
