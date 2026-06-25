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

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedBookingVehicle, setSelectedBookingVehicle] = useState<{ name: string; plate: string; rate: string } | null>(null);
  const [bookingDriver, setBookingDriver] = useState("");
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [entradaValue, setEntradaValue] = useState("");
  const [installments, setInstallments] = useState("60");

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDriver || !bookingStartDate || !bookingEndDate || !paymentMode) {
      showToast("Por favor, preencha todos os campos da compra.", "warning");
      return;
    }
    setBookingConfirmed(true);
    showToast(`Proposta de compra do ${selectedBookingVehicle?.name} confirmada! Modo: ${paymentMode}.`, "success");
  };

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
            <button onClick={() => {
              const csvHeader = "Veículo,Diária,Semanal,Mensal,Placa,Ano\n";
              const csvRows = [
                "Scania R 450,R$ 1800,R$ 11000,R$ 38000,BRA-2E19,2024",
                "Volvo FH 540,R$ 2200,R$ 13500,R$ 49000,FLT-0130,2025",
              ].join("\n");
              const csvContent = csvHeader + csvRows;
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `receita_frota_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              showToast("Relatório de receita exportado com sucesso.", "success");
            }} className="flex items-center gap-1.5 border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/20 transition rounded-lg">
              <Icon name="table_chart" className="text-sm" /> Exportar Receita
            </button>
          </div>
        }
      />

      <div className="sticky top-14 sm:top-16 z-20 bg-surface-container flex gap-2 border-b border-outline-variant/20 mb-6 pb-2 pt-2 overflow-x-auto custom-scrollbar">
        {[
          { id: "dashboard", label: "Dashboard Analítico", icon: "monitoring" },
          { id: "contratos", label: "Gestão de Contratos", icon: "assignment" },
          { id: "hub", label: "Vitrine de Venda (Hub)", icon: "storefront" },
        ].map(t => (
          <button
            type="button"
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
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Veículos Disponíveis para Venda: 2</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Veículos seminovos com garantia de fábrica e documentação pronta</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="raised-card overflow-hidden group hover:border-primary/50 transition-colors flex flex-col h-full bg-[#0c132b]">
              <div className="relative h-48 bg-surface-container-low overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/scania.png" alt="Scania R450" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Venda</div>
                <div className="absolute top-3 right-3 bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <Icon name="star" className="text-[10px]" /> Recomendado
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0c132b] to-transparent h-20"></div>
                <div className="absolute bottom-3 right-3 bg-green-500/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-400">Livre de IPVA</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Preço de Venda</p>
                  <h4 className="text-2xl font-black text-white">R$ 850.000,00</h4>
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
                <div className="grid grid-cols-2 gap-2 bg-[#0b0e14] p-3 rounded-lg border border-outline-variant/20 mb-6 mt-auto">
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">À Vista</p>
                      <p className="text-xs font-bold text-green-400">R$ 850.000</p>
                   </div>
                   <div className="text-center border-l border-outline-variant/20">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Financiado (60x)</p>
                      <p className="text-xs font-bold text-primary">R$ 18.900/mês</p>
                   </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedBookingVehicle({ name: "Scania R 450", plate: "BRA-2E19", rate: "R$ 850.000,00" });
                    setBookingConfirmed(false);
                    setPaymentMode(""); setEntradaValue(""); setInstallments("60");
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 text-white font-bold uppercase text-[11px] tracking-wider rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
                >
                  Comprar Veículo
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="raised-card overflow-hidden group hover:border-primary/50 transition-colors flex flex-col h-full bg-[#0c132b]">
              <div className="relative h-48 bg-surface-container-low overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/volvo.png" alt="Volvo FH540" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">Venda</div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0c132b] to-transparent h-20"></div>
                <div className="absolute bottom-3 right-3 bg-green-500/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-400">Livre de IPVA</div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Preço de Venda</p>
                  <h4 className="text-2xl font-black text-white">R$ 1.250.000,00</h4>
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
                <div className="grid grid-cols-2 gap-2 bg-[#0b0e14] p-3 rounded-lg border border-outline-variant/20 mb-6 mt-auto">
                   <div className="text-center">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">À Vista</p>
                      <p className="text-xs font-bold text-green-400">R$ 1.250.000</p>
                   </div>
                   <div className="text-center border-l border-outline-variant/20">
                      <p className="text-[8px] text-slate-500 font-bold uppercase">Financiado (60x)</p>
                      <p className="text-xs font-bold text-primary">R$ 27.500/mês</p>
                   </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedBookingVehicle({ name: "Volvo FH 540", plate: "FLT-0130", rate: "R$ 1.250.000,00" });
                    setBookingConfirmed(false);
                    setPaymentMode(""); setEntradaValue(""); setInstallments("60");
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 text-white font-bold uppercase text-[11px] tracking-wider rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20"
                >
                  Comprar Veículo
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Booking Confirmation Modal */}
      {isBookingOpen && selectedBookingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c132b] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  {bookingConfirmed ? "✅ Proposta Confirmada" : "Confirmar Compra de Veículo"}
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-1">PROPOSTA COMERCIAL DE VENDA</p>
              </div>
              <button 
                type="button"
                onClick={() => { setIsBookingOpen(false); setSelectedBookingVehicle(null); setBookingConfirmed(false); }} 
                className="text-slate-400 hover:text-white transition"
              >
                <Icon name="close" />
              </button>
            </div>

            {/* Confirmed state — contract signing */}
            {bookingConfirmed ? (
              <div className="p-6 space-y-5">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <Icon name="check_circle" className="text-4xl text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-white">Compra de {selectedBookingVehicle.name} confirmada!</p>
                  <p className="text-[10px] text-emerald-300 mt-1">Placa: {selectedBookingVehicle.plate} · Modo: {paymentMode}</p>
                  {entradaValue && <p className="text-[10px] text-slate-400 mt-0.5">Entrada: R$ {entradaValue}</p>}
                </div>

                <div className="bg-[#0F172A] border border-outline-variant/20 rounded-xl p-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Resumo Financeiro</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor do Veículo</span>
                      <span className="text-white font-bold">{selectedBookingVehicle.rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Modo de Pagamento</span>
                      <span className="text-emerald-400 font-bold capitalize">{paymentMode}</span>
                    </div>
                    {entradaValue && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valor de Entrada</span>
                        <span className="text-white font-bold">R$ {entradaValue}</span>
                      </div>
                    )}
                    {(paymentMode === "parcelado" || paymentMode === "financiamento") && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parcelas</span>
                        <span className="text-white font-bold">{installments}x</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Comprador</span>
                      <span className="text-white font-bold">{bookingDriver}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Contrato de compra do ${selectedBookingVehicle.name} enviado para assinatura digital. Verifique seu e-mail.`, "success");
                    setIsBookingOpen(false);
                    setSelectedBookingVehicle(null);
                    setBookingConfirmed(false);
                    setBookingDriver(""); setBookingStartDate(""); setBookingEndDate("");
                    setPaymentMode(""); setEntradaValue(""); setInstallments("60");
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Icon name="draw" className="text-sm" /> Assinar Contrato
                </button>

                <button
                  type="button"
                  onClick={() => setBookingConfirmed(false)}
                  className="w-full py-2.5 rounded-xl border border-outline-variant/40 text-slate-300 text-xs font-bold uppercase hover:bg-white/5 transition"
                >
                  Voltar e editar
                </button>
              </div>
            ) : (
              /* Purchase form */
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Vehicle info */}
                <div className="bg-[#0F172A] border border-outline-variant/20 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Veículo Selecionado</p>
                    <p className="text-white font-bold mt-0.5">{selectedBookingVehicle.name}</p>
                    <p className="text-slate-500 text-[10px] font-mono">Placa: {selectedBookingVehicle.plate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Preço</p>
                    <p className="text-emerald-400 font-black text-sm">{selectedBookingVehicle.rate}</p>
                  </div>
                </div>

                {/* Buyer name */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Nome do Comprador</label>
                  <input 
                    type="text" 
                    value={bookingDriver} 
                    onChange={(e) => setBookingDriver(e.target.value)} 
                    placeholder="Nome completo do comprador..." 
                    className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" 
                    required
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Modo de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "credito", label: "Crédito", icon: "credit_card" },
                      { value: "consorcio", label: "Consórcio", icon: "groups" },
                      { value: "parcelado", label: "Parcelado", icon: "payments" },
                      { value: "financiamento", label: "Financiamento", icon: "account_balance" },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-xs ${
                          paymentMode === opt.value
                            ? "border-emerald-500/60 bg-emerald-500/10 text-white"
                            : "border-outline-variant/30 bg-[#0F172A] text-slate-400 hover:border-emerald-500/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value={opt.value}
                          checked={paymentMode === opt.value}
                          onChange={() => setPaymentMode(opt.value)}
                          className="hidden"
                          required
                        />
                        <Icon name={opt.icon} className="text-[14px]" />
                        <span className="font-bold">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Down payment */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Valor de Entrada (R$) — opcional</label>
                  <input 
                    type="number" 
                    value={entradaValue} 
                    onChange={(e) => setEntradaValue(e.target.value)} 
                    placeholder="Ex: 150000" 
                    min="0"
                    className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" 
                  />
                </div>

                {/* Installments — only for parcelado or financiamento */}
                {(paymentMode === "parcelado" || paymentMode === "financiamento") && (
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Número de Parcelas</label>
                    <select
                      value={installments}
                      onChange={e => setInstallments(e.target.value)}
                      className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      {[12, 24, 36, 48, 60, 72, 84].map(n => (
                        <option key={n} value={String(n)}>{n}x</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Data da Proposta</label>
                    <input 
                      type="date" 
                      value={bookingStartDate} 
                      onChange={(e) => setBookingStartDate(e.target.value)} 
                      className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 appearance-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Previsão de Entrega</label>
                    <input 
                      type="date" 
                      value={bookingEndDate} 
                      onChange={(e) => setBookingEndDate(e.target.value)} 
                      className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 appearance-none" 
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setIsBookingOpen(false); setSelectedBookingVehicle(null); setBookingConfirmed(false); }} 
                    className="flex-1 py-2.5 rounded-lg border border-outline-variant/40 text-xs font-bold text-slate-300 uppercase hover:bg-white/5 transition text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-wider transition shadow-lg shadow-emerald-500/20 text-center"
                  >
                    Confirmar Compra
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
