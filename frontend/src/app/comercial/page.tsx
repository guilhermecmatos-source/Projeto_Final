"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const mrrData = [
  { mes: "Jan", receita: 350000, meta: 380000 },
  { mes: "Fev", receita: 380000, meta: 390000 },
  { mes: "Mar", receita: 410000, meta: 400000 },
  { mes: "Abr", receita: 425000, meta: 420000 },
  { mes: "Mai", receita: 460000, meta: 440000 },
  { mes: "Jun", receita: 482500, meta: 460000 },
];

const contractComposition = [
  { tipo: "Frota Dedicada", valor: 280000, fill: "#3B82F6" },
  { tipo: "Last Mile", valor: 110000, fill: "#10B981" },
  { civil: "Transporte Pesado", valor: 92500, fill: "#F59E0B" },
];

const CONTRACTS = [
  { id: "C-1002", client: "Logística Alpha S.A.", service: "Frotas Dedicadas", value: "R$ 45.000/mês", status: "Ativo", valid: "Dez 2028", items: 12 },
  { id: "C-1044", client: "Supermercados Beta", service: "Distribuição Urbana", value: "R$ 12.500/mês", status: "Em Negociação", valid: "---", items: 3 },
  { id: "C-1018", client: "Indústria Gamma", service: "Transporte Pesado", value: "R$ 89.000/mês", status: "Ativo", valid: "Out 2026", items: 25 },
  { id: "C-0985", client: "E-commerce Delta", service: "Last Mile", value: "R$ 22.000/mês", status: "Renovação Pendente", valid: "Jun 2026", items: 8 },
];

export default function ComercialPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "contratos" | "hub">("hub");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const filteredContracts = CONTRACTS.filter(c => {
    const matchesSearch = c.client.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Todos" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <PageHeader
        breadcrumb="PLATAFORMA"
        title="Premium Hub Venda & Locação"
        subtitle="Gestão de negócios, ativos e faturamento da frota corporativa."
        actions={
          <div className="flex gap-2">
            <button onClick={() => { window.print(); showToast("Preparando documento para impressão...", "info"); }} className="flex items-center gap-1.5 border border-outline-variant/40 bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface hover:text-primary transition rounded-lg">
              <Icon name="print" className="text-sm" /> Imprimir
            </button>
            <button onClick={() => showToast("Relatório de receita exportado com sucesso.", "success")} className="flex items-center gap-1.5 border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 transition rounded-lg">
              <Icon name="table_chart" className="text-sm" /> Exportar Receita
            </button>
          </div>
        }
      />

      <div className="flex gap-2 border-b border-outline-variant/20 mb-6 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: "dashboard", label: "Dashboard Analítico", icon: "monitoring" },
          { id: "contratos", label: "Gestão de Contratos", icon: "assignment" },
          { id: "hub", label: "Vitrine de Locação (Hub)", icon: "storefront" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === t.id ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Icon name={t.icon} className="text-[14px]" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "MRR", value: "R$ 482.500", trend: "+12%", trendColor: "text-green-400" },
              { label: "Novos Contratos", value: "14", trend: "+3 este mês", trendColor: "text-green-400" },
              { label: "Ticket Médio", value: "R$ 8.450", trend: "-2%", trendColor: "text-error" },
              { label: "Churn Rate", value: "1.2%", trend: "Baixo Risco", trendColor: "text-blue-400" },
            ].map((kpi, i) => (
              <div key={i} className="raised-card p-5">
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{kpi.label}</p>
                <h4 className="text-2xl font-black text-on-surface">{kpi.value}</h4>
                <p className={`text-[10px] font-bold mt-1 ${kpi.trendColor}`}>{kpi.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 raised-card p-5">
              <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">Evolução do MRR (Receita Recorrente Mensal)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mrrData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}} />
                  <Area type="monotone" dataKey="receita" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                  <Area type="monotone" dataKey="meta" stroke="#FCA311" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="raised-card p-5">
              <h3 className="mb-4 text-sm font-bold text-on-surface uppercase tracking-wider">Composição de Receita</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contractComposition} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `R$${v/1000}k`} />
                  <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={110} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#fff" }} itemStyle={{color: "#fff"}} />
                  <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={20}>
                    {contractComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "contratos" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 raised-card p-0 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Pipeline de Contratos</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar contrato..." className="input-fleet pl-8 py-1.5 text-xs w-48" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-fleet py-1.5 text-xs">
                  <option value="Todos">Todos Status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Em Negociação">Em Negociação</option>
                  <option value="Renovação Pendente">Renovação Pendente</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-[#0b0e14]">
                    <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">Contrato / Cliente</th>
                    <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">Serviço</th>
                    <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">Valor Mensal</th>
                    <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredContracts.map((c, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedContract(c)}
                      className={`cursor-pointer transition ${selectedContract?.id === c.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-surface-container-high border-l-2 border-transparent"}`}
                    >
                      <td className="py-3 px-4">
                        <div className="text-xs font-bold text-on-surface">{c.client}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">{c.id}</div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-xs">{c.service}</td>
                      <td className="py-3 px-4 font-mono text-xs">{c.value}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md border ${
                          c.status === "Ativo" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          c.status === "Em Negociação" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {selectedContract ? (
              <div className="raised-card p-5 sticky top-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-1">{selectedContract.client}</h3>
                    <p className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded inline-block">{selectedContract.id}</p>
                  </div>
                  <button onClick={() => setSelectedContract(null)} className="text-on-surface-variant hover:text-white transition"><Icon name="close" /></button>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/10 flex justify-between items-center">
                    <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Valor Contratual</span>
                    <span className="text-on-surface font-mono font-bold">{selectedContract.value}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/10">
                      <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px] block mb-1">Vencimento</span>
                      <span className="text-on-surface">{selectedContract.valid}</span>
                    </div>
                    <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/10">
                      <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px] block mb-1">Ativos Alocados</span>
                      <span className="text-on-surface">{selectedContract.items} Veículos</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => showToast("Renovação de SLA iniciada.", "success")} className="flex-1 bg-primary text-on-primary py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:opacity-90 transition">Renovar SLA</button>
                  <button onClick={() => showToast("Processo de auditoria em execução.", "info")} className="flex-1 border border-outline-variant/40 text-on-surface py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:border-primary hover:text-primary transition">Auditar</button>
                </div>
              </div>
            ) : (
               <div className="raised-card p-8 text-center text-on-surface-variant flex flex-col items-center justify-center h-full min-h-[300px]">
                  <Icon name="touch_app" className="text-4xl mb-3 block opacity-40" />
                  <p className="text-sm font-bold">Selecione um contrato</p>
                  <p className="text-xs mt-1">para exibir o dossiê detalhado.</p>
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "hub" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-[#0b0e14] p-4 rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Veículos Disponíveis para Locação: 2</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Contratos com quilometragem livre e seguro total de pátio</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="raised-card overflow-hidden group hover:border-primary/50 transition-colors flex flex-col h-full bg-[#0c132b]">
              <div className="relative h-48 bg-surface-container-low overflow-hidden">
                <img src="/images/scania.png" alt="Scania R450" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Locação</div>
                <div className="absolute top-3 right-3 bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <Icon name="star" className="text-[10px]" /> Recomendado
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0c132b] to-transparent h-20"></div>
                <div className="absolute bottom-3 right-3 bg-green-500/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-400">Livre de IPVA</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Diária Fixa</p>
                  <h4 className="text-2xl font-black text-white">R$ 1.800,00 <span className="text-xs font-normal text-slate-400">/dia</span></h4>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-primary uppercase tracking-wider mb-1">Scania R 450</h3>
                    <p className="text-[10px] text-slate-400">Placa: BRA-2E19 <span className="mx-1">|</span> Ano: 2024 <span className="mx-1">|</span> Cor: Vermelho</p>
                  </div>
                  <div className="bg-[#111827] border border-outline-variant/30 px-2 py-1 rounded text-right">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">KM Atual</p>
                    <p className="text-[10px] font-mono text-white font-bold">125.430</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#0b0e14] p-3 rounded-lg border border-outline-variant/20 mb-6 mt-auto">
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Diário</p>
                      <p className="text-xs font-bold text-primary">R$ 1800</p>
                   </div>
                   <div className="text-center border-x border-outline-variant/20">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Semanal</p>
                      <p className="text-xs font-bold text-primary">R$ 11000</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Mensal</p>
                      <p className="text-xs font-bold text-green-400">R$ 38000</p>
                   </div>
                </div>
                <button 
                  onClick={() => showToast("Solicitação de locação enviada ao consultor.", "success")}
                  className="w-full py-3 bg-blue-600 text-white font-bold uppercase text-[11px] tracking-wider rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                >
                  Reservar Locação
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="raised-card overflow-hidden group hover:border-primary/50 transition-colors flex flex-col h-full bg-[#0c132b]">
              <div className="relative h-48 bg-surface-container-low overflow-hidden">
                <img src="/images/volvo.png" alt="Volvo FH540" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Locação</div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0c132b] to-transparent h-20"></div>
                <div className="absolute bottom-3 right-3 bg-green-500/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-400">Livre de IPVA</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Diária Fixa</p>
                  <h4 className="text-2xl font-black text-white">R$ 2.200,00 <span className="text-xs font-normal text-slate-400">/dia</span></h4>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-primary uppercase tracking-wider mb-1">Volvo FH 540</h3>
                    <p className="text-[10px] text-slate-400">Placa: FLT-0130 <span className="mx-1">|</span> Ano: 2025 <span className="mx-1">|</span> Cor: Prata</p>
                  </div>
                  <div className="bg-[#111827] border border-outline-variant/30 px-2 py-1 rounded text-right">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">KM Atual</p>
                    <p className="text-[10px] font-mono text-white font-bold">82.190</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#0b0e14] p-3 rounded-lg border border-outline-variant/20 mb-6 mt-auto">
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Diário</p>
                      <p className="text-xs font-bold text-primary">R$ 2200</p>
                   </div>
                   <div className="text-center border-x border-outline-variant/20">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Semanal</p>
                      <p className="text-xs font-bold text-primary">R$ 13500</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Mensal</p>
                      <p className="text-xs font-bold text-green-400">R$ 49000</p>
                   </div>
                </div>
                <button 
                  onClick={() => showToast("Solicitação de locação enviada ao consultor.", "success")}
                  className="w-full py-3 bg-blue-600 text-white font-bold uppercase text-[11px] tracking-wider rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                >
                  Reservar Locação
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}
