"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

const VEHICLES = [
  {
    id: "v-1",
    brand: "SCANIA",
    model: "R 450",
    plate: "BRA-2E19",
    year: 2024,
    color: "Vermelho",
    price: 680000,
    daily_rate: 1800,
    tags: ["VENDA", "DESTAQUE"],
    badge: "Seminovo",
    consumption: 2.8,
    autonomy: 1400,
    views: 325,
    likes: 58,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600",
    description: "Cavalo mecânico Scania R 450 ano 2024. Único dono, teto alto, cabine leito estendida. Revisões realizadas em concessionária autorizada Scania. Pneus novos.",
    odometer: 125430,
  },
  {
    id: "v-3",
    brand: "MERCEDES-BENZ",
    model: "ATEGO 2426",
    plate: "MEC-4D21",
    year: 2023,
    color: "Branco",
    price: 295000,
    daily_rate: null,
    tags: ["VENDA"],
    badge: "Seminovo",
    consumption: 3.5,
    autonomy: 950,
    views: 120,
    likes: 8,
    image: "", // Placeholder
    description: "Mercedes Benz Atego 2426 6x2 baú carga seca de 8.5 metros. Ideal para operação urbana e distribuição intermunicipal de cargas volumosas.",
    odometer: 243500,
  },
];

const SUBTABS = [
  "VEÍCULOS À VENDA",
  "VEÍCULOS PARA LOCAÇÃO",
  "SOLICITAÇÕES DE COMPRA",
  "SOLICITAÇÕES DE LOCAÇÃO 1",
  "CONTRATOS DE LOCAÇÃO",
  "CRM KANBAN",
  "VISTORIA DIGITAL",
  "COFRE DIGITAL",
  "PORTAL DO CLIENTE",
  "DASHBOARD PREMIUM",
];

const BREADCRUMBS: Record<string, string> = {
  "VEÍCULOS À VENDA": "COMMERCIAL-SALE-VEHICLES",
  "VEÍCULOS PARA LOCAÇÃO": "COMMERCIAL-SALE-VEHICLES",
  "SOLICITAÇÕES DE COMPRA": "COMMERCIAL-SALES",
  "SOLICITAÇÕES DE LOCAÇÃO": "COMMERCIAL-RENTALS",
  "CONTRATOS DE LOCAÇÃO": "COMMERCIAL-CONTRACTS",
  "PORTAL DO CLIENTE": "COMMERCIAL-CLIENT-PORTAL",
};

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("VEÍCULOS À VENDA");
  const [selectedVehicle, setSelectedVehicle] = useState<typeof VEHICLES[0] | null>(null);

  const handleTabClick = (tabName: string) => {
    const cleanName = tabName.replace(" 1", "");
    if (["CRM KANBAN", "VISTORIA DIGITAL", "COFRE DIGITAL"].includes(cleanName)) {
      router.push("/dashboard");
    } else {
      setActiveTab(cleanName);
    }
  };

  const currentBreadcrumb = BREADCRUMBS[activeTab] || "COMMERCIAL";

  return (
    <AppShell>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase text-[#FCA311] tracking-widest mb-2 flex items-center gap-2">
              SEDE CENTRAL / UNIDADE OPERACIONAL / <span className="text-white">{currentBreadcrumb}</span>
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#FCA311]/20 text-[#FCA311] border border-[#FCA311]/30 text-[9px] font-bold uppercase tracking-wider">
                MÓDULO COMERCIAL
              </span>
              <span className="text-xs font-bold text-slate-300">Premium Hub Venda & Locação</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Gestão de Negócios e Ativos</h1>
            <p className="text-xs text-slate-400 mt-1">
              Faturamento, contratos eletrônicos, leilão e leasing de caminhões da frota corporativa.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-[#0F172A] px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:bg-white/5 transition">
              <Icon name="table_view" className="text-xs text-green-400" /> Excel Relatório
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-[#0F172A] px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:bg-white/5 transition">
              <Icon name="print" className="text-xs text-blue-400" /> Imprimir Painel
            </button>
          </div>
        </div>
      </header>

      {/* Sub Tabs Navigation */}
      <div className="mb-6 overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-2">
          {SUBTABS.map((tab) => {
            const hasNotification = tab.includes("1");
            const cleanName = tab.replace(" 1", "");
            const isActive = activeTab === cleanName;
            
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition whitespace-nowrap border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-[#0F172A] text-slate-400 border-outline-variant/30 hover:bg-white/5"
                }`}
              >
                {tab.includes("VENDA") && <Icon name="sell" className="text-xs" />}
                {tab.includes("LOCAÇÃO") && !tab.includes("CONTRATOS") && !tab.includes("SOLICITAÇÕES") && <Icon name="key" className="text-xs" />}
                {tab.includes("COMPRA") && <Icon name="shopping_cart" className="text-xs" />}
                {tab.includes("SOLICITAÇÕES DE LOCAÇÃO") && <Icon name="assignment" className="text-xs" />}
                {tab.includes("CONTRATOS") && <Icon name="description" className="text-xs" />}
                {tab.includes("KANBAN") && <Icon name="view_kanban" className="text-xs" />}
                {tab.includes("VISTORIA") && <Icon name="fact_check" className="text-xs" />}
                {tab.includes("COFRE") && <Icon name="shield" className="text-xs" />}
                {tab.includes("PORTAL") && <Icon name="person" className="text-xs" />}
                {tab.includes("DASHBOARD") && <Icon name="insights" className="text-xs" />}
                
                {cleanName}
                
                {hasNotification && (
                  <span className="bg-[#FCA311] text-[#0c132b] px-1.5 rounded-full text-[9px]">1</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === "VEÍCULOS À VENDA" && (
        <>
          {/* Filters Box */}
          <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 p-4 mb-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">PESQUISAR VEÍCULO COMERCIAL</label>
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input type="text" placeholder="Busque por Marca, Modelo ou Placa..." className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">COR DO VEÍCULO</label>
                <input type="text" placeholder="Escreva a cor (ex: Verm...)" className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">VALOR MÍNIMO (R$)</label>
                <input type="number" placeholder="Valor min..." className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">VALOR MÁXIMO (R$)</label>
                <input type="number" defaultValue="800000" className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">FABRICANTE</label>
                  <select className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option>Todas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">FILTRAR POR ANO</label>
                  <select className="w-full rounded-lg bg-[#0F172A] border border-outline-variant/30 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option>Todos</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              VEÍCULOS DISPONÍVEIS À VENDA: {VEHICLES.length}
            </h2>
            <span className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">
              PREÇOS DE PÁTIO EM MOEDA CORRENTE (BRL)
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VEHICLES.map((v) => (
              <div key={v.id} className="raised-card rounded-2xl bg-[#0c132b]/80 border border-outline-variant/30 overflow-hidden flex flex-col group">
                <div className="h-48 relative overflow-hidden bg-surface-container-high flex items-center justify-center">
                  {v.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex items-center justify-center flex-col text-slate-600 w-full h-full bg-slate-900">
                      <div className="flex items-center gap-1 opacity-50 absolute top-4 left-4">
                        <Icon name="broken_image" className="text-sm" />
                        <span className="text-[10px] font-bold">{v.brand} {v.model}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {v.tags.includes("VENDA") && (
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-[8px] font-black uppercase tracking-widest rounded shadow-lg flex items-center gap-1">
                        <Icon name="sell" className="text-[10px]" /> VENDA
                      </span>
                    )}
                    {v.tags.includes("DESTAQUE") && (
                      <span className="px-2 py-1 bg-[#FCA311]/20 border border-[#FCA311]/50 text-[#FCA311] text-[8px] font-black uppercase tracking-widest rounded shadow-lg flex items-center gap-1">
                        <Icon name="star" className="text-[10px]" /> DESTAQUE
                      </span>
                    )}
                  </div>
                  
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-slate-300 hover:text-error transition">
                    <Icon name="favorite_border" className="text-sm" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c132b] via-[#0c132b]/80 to-transparent flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">VALOR A VISTA</p>
                      <p className="text-xl font-black text-white">R$ {v.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest rounded">
                      {v.badge}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-black text-[#FCA311] uppercase tracking-wider">{v.brand} {v.model}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Placa: {v.plate} | Ano: {v.year} | Cor: {v.color}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold font-mono text-[9px] border border-white/20 whitespace-nowrap">
                      KM: {v.odometer.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-4 py-3 border-y border-outline-variant/10">
                    <p className="text-[10px] text-slate-400 font-medium">Consumo: <span className="text-slate-300 font-bold">{v.consumption} Km/L</span></p>
                    <p className="text-[10px] text-slate-400 font-medium">Autonomia: <span className="text-green-400 font-bold">~{v.autonomy}km</span></p>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-slate-500">
                    <span className="flex items-center gap-1.5 text-[10px]"><Icon name="visibility" className="text-xs" /> {v.views} visualizações</span>
                    <span className="flex items-center gap-1.5 text-[10px]"><Icon name="favorite" className="text-xs" /> {v.likes} curtiram</span>
                  </div>

                  <button 
                    onClick={() => setSelectedVehicle(v)}
                    className="mt-auto w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-widest transition shadow-lg shadow-blue-600/20"
                  >
                    NEGOCIAR & VER DETALHES &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedVehicle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-4xl rounded-3xl bg-[#0c132b] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col md:flex-row max-h-[90vh]">
                <div className="md:w-1/2 relative bg-surface-container-high flex flex-col min-h-[300px]">
                  {selectedVehicle.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedVehicle.image} alt={selectedVehicle.brand} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-600 bg-slate-900">
                      <div className="flex items-center gap-2 absolute top-6 left-6 text-slate-500">
                        <Icon name="broken_image" className="text-xl" />
                        <span className="text-xs font-bold">{selectedVehicle.brand} {selectedVehicle.model}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-auto relative z-10 p-6 bg-gradient-to-t from-[#0c132b] to-transparent w-full pt-20">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Odômetro Total</span>
                        <span className="text-xs font-bold text-white">{selectedVehicle.odometer.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consumo Diesel</span>
                        <span className="text-xs font-bold text-[#FCA311]">{selectedVehicle.consumption} Km/L</span>
                      </div>
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autonomia Estimada</span>
                        <div className="flex items-center gap-2">
                          <span className="flex gap-1 text-[#FCA311]"><Icon name="toggle_on" className="text-lg" /></span>
                          <span className="text-xs font-bold text-green-400">~{selectedVehicle.autonomy} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-black text-[#FCA311] uppercase tracking-wider">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                      <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-1">Controle de Registro: {selectedVehicle.id}</p>
                    </div>
                    <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition">
                      <Icon name="close" className="text-sm" />
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Placa no Ativo</span>
                      <span className="text-xs font-bold text-white">{selectedVehicle.plate}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ano de Fabricação</span>
                      <span className="text-xs font-bold text-white">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ficha Operacional</span>
                      <span className="text-xs font-bold text-[#FCA311]">{selectedVehicle.badge}</span>
                    </div>
                  </div>

                  <div className="mt-6 mb-8">
                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">DESCRIÇÃO COMERCIAL</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{selectedVehicle.description}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between bg-[#0F172A] rounded-xl p-5 border border-outline-variant/20 mb-6">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preço Venda</p>
                        <p className="text-xl font-black text-white">R$ {selectedVehicle.price.toLocaleString("pt-BR")}</p>
                      </div>
                      {selectedVehicle.daily_rate && (
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taxa Diária</p>
                          <p className="text-xl font-black text-blue-400">R$ {selectedVehicle.daily_rate}<span className="text-xs text-blue-400/70 font-medium">/dia</span></p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button className="py-3 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-[#0c132b] font-black uppercase text-[10px] tracking-widest transition shadow-lg shadow-amber-500/20 text-center">
                        SOLICITAR COMPRA
                      </button>
                      {selectedVehicle.daily_rate ? (
                        <button className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition shadow-lg shadow-blue-600/20 text-center">
                          SOLICITAR LOCAÇÃO
                        </button>
                      ) : (
                        <div></div>
                      )}
                    </div>

                    <button className="w-full py-3 rounded-xl border border-outline-variant/30 text-slate-300 hover:bg-white/5 hover:text-white font-bold uppercase text-[10px] tracking-widest transition flex items-center justify-center gap-2">
                      <Icon name="qr_code_2" className="text-sm" /> OBTER QR CODE DO ANÚNCIO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "SOLICITAÇÕES DE COMPRA" && (
        <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#FCA311] font-black uppercase text-lg tracking-wider mb-1">SOLICITAÇÕES DE COMPRA DE VEÍCULOS</h2>
              <p className="text-[10px] text-slate-400 font-medium">Controle de autorizações, condições de pagamento e auditoria criminal de pátio.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-[#FCA311]/30 bg-[#FCA311]/10 px-4 py-2 text-[10px] font-bold uppercase text-[#FCA311] hover:bg-[#FCA311]/20 transition">
              EXPORTAR LISTA CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0F172A] border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">CÓDIGO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">PROPONENTE</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">VEÍCULO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">FORMA PAGAMENTO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">VALOR ESTIMADO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">DATA</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">STATUS</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">AÇÕES DE GESTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">#1781661963086</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[10px] text-slate-500 font-mono">CPF: 111.222.333-44</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Scania R 450</p>
                    <p className="text-[10px] text-[#FCA311] font-mono">Placa: BRA-2E19</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">PIX</td>
                  <td className="px-6 py-4 font-black text-white">R$ 680.000,00</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">2026-06-17</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">PENDENTE</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase transition hover:bg-blue-500">APROVAR FICHA</button>
                      <button className="px-3 py-1.5 rounded border border-error/50 text-error text-[9px] font-bold uppercase transition hover:bg-error/10">RECUSAR</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">#1</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[10px] text-slate-500 font-mono">CPF: 111.222.333-44</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Mercedes-Benz Atego 2426</p>
                    <p className="text-[10px] text-[#FCA311] font-mono">Placa: MEC-4D21</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">FINANCIAMENTO</td>
                  <td className="px-6 py-4 font-black text-white">R$ 295.000,00</td>
                  <td className="px-6 py-4 text-slate-400 font-mono">2026-06-09</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-green-500/50 text-green-400 bg-green-500/10">CONCLUÍDA</span>
                  </td>
                  <td className="px-6 py-4 text-right pr-12">
                    <span className="text-[10px] font-medium text-slate-500">Finalizado</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "SOLICITAÇÕES DE LOCAÇÃO" && (
        <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#FCA311] font-black uppercase text-lg tracking-wider mb-1">SOLICITAÇÕES DE LOCAÇÃO DE FROTA</h2>
              <p className="text-[10px] text-slate-400 font-medium">Verificação de licenças e contratos de trânsito válidos.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[10px] font-bold uppercase text-blue-400 hover:bg-blue-500/20 transition">
              EXPORTAR DESPACHO CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0F172A] border-b border-outline-variant/30">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">CÓDIGO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">CONDUTOR</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">VEÍCULO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">DATAS</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">RETIRADA/DEVOLUÇÃO</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">VALORES ESTIMADOS</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">STATUS</th>
                  <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">AÇÕES DE GESTOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs">
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-[#FCA311] font-bold">#1781661965286</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[9px] font-bold text-slate-500">CNH <span className="text-green-400">VÁLIDA</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Scania R 450</p>
                    <p className="text-[10px] text-slate-500 font-mono">Placa: BRA-2E19</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Início: <span className="text-green-400 font-bold">2026-06-15</span></p>
                    <p className="text-[10px] font-medium text-slate-400">Fim: <span className="text-green-400 font-bold">2026-06-25</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Matriz São Paulo</p>
                    <p className="text-[10px] text-slate-400">Para: Filial Campinas</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-[#FCA311] mb-0.5">R$ 18.000,00</p>
                    <p className="text-[10px] text-slate-400">diária: R$ 1800</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">PENDENTE</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-2 py-1.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase transition hover:bg-blue-500">APROVAR PRÉ-CONTRATO</button>
                      <button className="px-2 py-1.5 rounded border border-error/50 text-error text-[9px] font-bold uppercase transition hover:bg-error/10">RECUSAR</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-[#FCA311] font-bold">#1781661422991</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[9px] font-bold text-slate-500">CNH <span className="text-green-400">VÁLIDA</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Volvo FH 540</p>
                    <p className="text-[10px] text-slate-500 font-mono">Placa: FLT-0130</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Início: <span className="text-green-400 font-bold">2026-06-15</span></p>
                    <p className="text-[10px] font-medium text-slate-400">Fim: <span className="text-green-400 font-bold">2026-06-25</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Matriz São Paulo</p>
                    <p className="text-[10px] text-slate-400">Para: Filial Campinas</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-[#FCA311] mb-0.5">R$ 22.000,00</p>
                    <p className="text-[10px] text-slate-400">diária: R$ 2200</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">PENDENTE</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-2 py-1.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase transition hover:bg-blue-500">APROVAR PRÉ-CONTRATO</button>
                      <button className="px-2 py-1.5 rounded border border-error/50 text-error text-[9px] font-bold uppercase transition hover:bg-error/10">RECUSAR</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-[#FCA311] font-bold">#1781288958543</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[9px] font-bold text-slate-500">CNH <span className="text-green-400">VÁLIDA</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Volvo FH 540</p>
                    <p className="text-[10px] text-slate-500 font-mono">Placa: FLT-0130</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Início: <span className="text-green-400 font-bold">2026-06-15</span></p>
                    <p className="text-[10px] font-medium text-slate-400">Fim: <span className="text-green-400 font-bold">2026-06-25</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Matriz São Paulo</p>
                    <p className="text-[10px] text-slate-400">Para: Filial Campinas</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-[#FCA311] mb-0.5">R$ 22.000,00</p>
                    <p className="text-[10px] text-slate-400">diária: R$ 2200</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">PENDENTE</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-2 py-1.5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase transition hover:bg-blue-500">APROVAR PRÉ-CONTRATO</button>
                      <button className="px-2 py-1.5 rounded border border-error/50 text-error text-[9px] font-bold uppercase transition hover:bg-error/10">RECUSAR</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-mono text-[#FCA311] font-bold">#1</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Carlos Silveira</p>
                    <p className="text-[9px] font-bold text-slate-500">CNH <span className="text-green-400">VÁLIDA</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Scania R 450</p>
                    <p className="text-[10px] text-slate-500 font-mono">Placa: BRA-2E19</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-medium text-slate-400 mb-0.5">Início: <span className="text-green-400 font-bold">2026-06-15</span></p>
                    <p className="text-[10px] font-medium text-slate-400">Fim: <span className="text-green-400 font-bold">2026-06-25</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white mb-0.5">Matriz São Paulo</p>
                    <p className="text-[10px] text-slate-400">Para: Filial Campinas</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-[#FCA311] mb-0.5">R$ 18.000,00</p>
                    <p className="text-[10px] text-slate-400">diária: R$ 1800</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-slate-500/50 text-slate-400 bg-slate-500/10">DEVOLVIDO</span>
                  </td>
                  <td className="px-6 py-4">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "CONTRATOS DE LOCAÇÃO" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 flex flex-col min-h-[400px]">
            <h2 className="text-[#FCA311] font-black uppercase text-lg tracking-wider mb-1">CENTRAL DE ASSINATURAS E CONTRATOS</h2>
            <p className="text-[10px] text-slate-400 font-medium mb-16">Gere automaticamente minutas contratuais de locação e faça co-assinaturas juridicamente válidas no âmbito corporativo.</p>
            
            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Nenhum contrato ativo pendente de trâmite de assinatura eletrônica.
              </p>
            </div>
          </div>
          
          <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-6">HOMOLOGAÇÕES ATIVAS</h3>
            
            <div className="space-y-4">
              <div className="bg-[#0F172A] border border-outline-variant/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Vistoria Cadastral (RLR)</h4>
                  <span className="text-[10px] font-bold text-green-400">Ok</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed">Auditoria veicular e verificação por QR Code integrado à polícia rodoviária federal contra fraudes.</p>
              </div>
              
              <div className="bg-[#0F172A] border border-outline-variant/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Certificado De Seguro Pátio</h4>
                  <span className="text-[10px] font-bold text-blue-400">Ativo</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed">Apólice nº 447.915-A de responsabilidade civil facultativa para frotistas pesados sob cobertura da Porto Seguro.</p>
              </div>
              
              <div className="bg-[#0F172A] border border-outline-variant/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xs font-bold text-white">Gateway de Faturamento PIX</h4>
                  <span className="text-[10px] font-bold text-green-400">Pronto</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed">Geração de boletos interbancários BaaS com liquidação automática via PIX.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "PORTAL DO CLIENTE" && (
        <div className="space-y-6">
          <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-2/3">
              <p className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-2">ÁREA PRIVADA AUTORIZADA</p>
              <h2 className="text-2xl font-black text-[#FCA311] mb-2">Olá, Administrador Fleet AI!</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Monitore suas propostas comerciais, solicite vias de faturamentos, efetue assinaturas digitais blockchain e faça o download de recibos corporativos.
              </p>
            </div>
            <div className="md:w-1/3 flex flex-col items-end text-right border-l border-outline-variant/20 pl-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">SCORE DE ADIMPLÊNCIA</p>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-black text-white">980 pontos</h3>
                <Icon name="monitor_heart" className="text-2xl text-green-400" />
              </div>
              <span className="px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-[8px] font-black uppercase tracking-widest">EXCELENTE HISTÓRICO</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">FLUXO DE SOLICITAÇÕES ATIVAS</h3>
                <span className="text-[10px] text-slate-500 font-medium">Faturamentos vigentes</span>
              </div>
              
              <div className="space-y-6">
                <div className="pb-6 border-b border-outline-variant/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Scania R 450</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Faturamento Placa BRA-2E19</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">SOB REVISÃO</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/20 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-[#FCA311] -translate-y-1/2 rounded-full"></div>
                    <div className="flex justify-between relative z-10 text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-[#FCA311] bg-[#0c132b] px-2 text-center">Solicitação</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Análise RBAC</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Assinatura Doc</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Chaves Liberadas</span>
                    </div>
                  </div>
                </div>

                <div className="pb-6 border-b border-outline-variant/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Volvo FH 540</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Faturamento Placa FLT-0130</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">SOB REVISÃO</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/20 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-[#FCA311] -translate-y-1/2 rounded-full"></div>
                    <div className="flex justify-between relative z-10 text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-[#FCA311] bg-[#0c132b] px-2 text-center">Solicitação</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Análise RBAC</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Assinatura Doc</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Chaves Liberadas</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Volvo FH 540</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">Faturamento Placa FLT-0130</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-[#FCA311]/50 text-[#FCA311] bg-[#FCA311]/10">SOB REVISÃO</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant/20 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-[#FCA311] -translate-y-1/2 rounded-full"></div>
                    <div className="flex justify-between relative z-10 text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-[#FCA311] bg-[#0c132b] px-2 text-center">Solicitação</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Análise RBAC</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Assinatura Doc</span>
                      <span className="text-slate-500 bg-[#0c132b] px-2 text-center">Chaves Liberadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 flex flex-col">
              <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-6">HOMOLOGAÇÕES PENDENTES</h3>
              
              <div className="flex-1 flex items-center justify-center text-center px-4 mb-8">
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Não existem minutas orçadas aguardando sua assinatura blockchain neste momento.
                </p>
              </div>

              <div className="mt-auto bg-[#0F172A] border border-outline-variant/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="support_agent" className="text-[#FCA311] text-lg" />
                  <h4 className="text-xs font-bold text-white">Atendimento Privado 24h</h4>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed mb-4">
                  Contate a torre de despacho para alterar datas de devoluções ou reportar problemas com tacógrafo do cavalo/loc.
                </p>
                <div className="space-y-1 text-[10px] font-bold text-[#FCA311]">
                  <p>controlling@fleetai.com</p>
                  <p>(11) 4004-9876</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "DASHBOARD PREMIUM" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-5 border-l-2 border-l-[#FCA311]">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">RECEITA FATURADA (VENDAS)</p>
              <h3 className="text-2xl font-black text-[#FCA311] mb-1">R$ 295.000,00</h3>
              <p className="text-[10px] font-bold text-green-400">+ 14% vs meta quadrimestre</p>
            </div>
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-5 border-l-2 border-l-[#FCA311]">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">CONTRATOS LOCAÇÃO (REALIZADOS)</p>
              <h3 className="text-2xl font-black text-[#FCA311] mb-1">R$ 124.000,00</h3>
              <p className="text-[10px] text-slate-400">12 locações vigentes no pátio</p>
            </div>
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-5 border-l-2 border-l-[#FCA311]">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">SOLICITAÇÕES PENDENTES</p>
              <h3 className="text-2xl font-black text-[#FCA311] mb-1">4</h3>
              <p className="text-[10px] text-slate-400">Aguardando autorização rbac</p>
            </div>
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-5 border-l-2 border-l-green-500">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">VEÍCULO MAIS COBIÇADO</p>
              <h3 className="text-lg font-black text-[#FCA311] mb-1 uppercase">VOLVO FH 540</h3>
              <p className="text-[10px] font-bold text-green-400">+ 813 visualizações totais</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-1">AUDITORIA DE DESEMPENHO & FATURAMENTO</h3>
              <p className="text-[9px] text-slate-400 font-medium mb-8">Gráficos de receitas acumuladas e conversões sazonais geradas.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-4">EVOLUÇÃO MENSAL DE VENDAS (R$ MILHARES)</h4>
                  <div className="h-32 border-b border-l border-outline-variant/20 relative flex items-end justify-between px-2 pb-2 pt-4">
                    <div className="absolute left-0 -translate-x-full h-full flex flex-col justify-between text-[8px] text-slate-500 pr-2">
                      <span>R$ 600k</span>
                      <span>R$ 400k</span>
                      <span></span>
                    </div>
                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                      <path d="M 10 100 Q 50 60 90 80 T 200 20" fill="none" stroke="#FCA311" strokeWidth="3" />
                      <circle cx="10" cy="100" r="4" fill="#FCA311" />
                      <circle cx="90" cy="80" r="4" fill="#FCA311" />
                      <circle cx="200" cy="20" r="4" fill="#FCA311" />
                    </svg>
                    <div className="absolute bottom-0 translate-y-full w-full flex justify-between text-[8px] text-slate-500 pt-2 pr-6">
                      <span>Jan/Fev</span>
                      <span>Mar/Abr</span>
                      <span>Mai/Jun (Atual)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-4">VOLUME DE LOCAÇÕES POR CANAL CORPORATIVO</h4>
                  <div className="h-32 border-b border-outline-variant/20 relative flex items-end justify-around px-2 pb-0 pt-4">
                    <div className="absolute left-0 -translate-x-full h-full flex flex-col justify-between text-[8px] text-slate-500 pr-2">
                      <span>40 contratos</span>
                      <span>20</span>
                      <span></span>
                    </div>
                    
                    <div className="w-8 h-12 bg-blue-600/50 rounded-t-sm relative group">
                      <div className="absolute bottom-0 translate-y-full w-full text-center text-[8px] text-slate-500 pt-2 whitespace-nowrap -ml-2">Filiais Sul</div>
                    </div>
                    <div className="w-8 h-20 bg-blue-600/80 rounded-t-sm relative group">
                      <div className="absolute bottom-0 translate-y-full w-full text-center text-[8px] text-slate-500 pt-2 whitespace-nowrap -ml-2">Filial Sudeste</div>
                    </div>
                    <div className="w-8 h-28 bg-blue-500 rounded-t-sm relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FCA311] text-[#0c132b] text-[9px] font-black px-1.5 py-0.5 rounded-full">88</div>
                      <div className="absolute bottom-0 translate-y-full w-full text-center text-[8px] text-slate-500 pt-2 whitespace-nowrap -ml-2">Matriz S.Paulo</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">PARTICIPAÇÃO RELATIVA DO FATURAMENTO COMERCIAL</h4>
                <div className="h-3 bg-[#0F172A] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#FCA311]" style={{ width: "81%" }}></div>
                  <div className="h-full bg-blue-600" style={{ width: "19%" }}></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[8px] font-bold text-[#FCA311]">■ Vendas Autorizadas (81% - R$ 680k)</span>
                  <span className="text-[8px] font-bold text-blue-400">■ Locações de Cavaletes (19% - R$ 160k)</span>
                </div>
              </div>
            </div>

            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
              <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest mb-6">TOP VEÍCULOS MAIS DESEJADOS</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#0F172A] p-3 rounded-xl border border-outline-variant/20">
                  <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-black">1</div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-white">Scania R 450</h4>
                    <p className="text-[8px] text-slate-500 font-mono">Placa: BRA-2E19</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white">528 <span className="text-[8px] font-medium text-slate-500">views</span></p>
                    <p className="text-[9px] font-bold text-error flex items-center justify-end gap-0.5"><Icon name="favorite" className="text-[10px]" /> 57 favs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#0F172A] p-3 rounded-xl border border-outline-variant/20">
                  <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-black">2</div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-white">Volvo FH 540</h4>
                    <p className="text-[8px] text-slate-500 font-mono">Placa: FLT-0130</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white">813 <span className="text-[8px] font-medium text-slate-500">views</span></p>
                    <p className="text-[9px] font-bold text-error flex items-center justify-end gap-0.5"><Icon name="favorite" className="text-[10px]" /> 93 favs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#0F172A] p-3 rounded-xl border border-outline-variant/20">
                  <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-black">3</div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-white">Mercedes-Benz Atego 2426</h4>
                    <p className="text-[8px] text-slate-500 font-mono">Placa: MEC-4D21</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white">124 <span className="text-[8px] font-medium text-slate-500">views</span></p>
                    <p className="text-[9px] font-bold text-error flex items-center justify-end gap-0.5"><Icon name="favorite_border" className="text-[10px]" /> 0 favs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="account_balance_wallet" className="text-[#FCA311] text-lg" />
                <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">FLUXOS DE RECEBÍVEIS POR MODALIDADE</h3>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mb-6 ml-6">Demonstrativo de faturamento bruto, encargos tributários e liquidação líquida instantânea por gateway BaaS.</p>
              
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant/20">
                  <tr>
                    <th className="pb-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">CANAL FINANCEIRO</th>
                    <th className="pb-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">VALOR BRUTO</th>
                    <th className="pb-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">COMISSÕES & TX</th>
                    <th className="pb-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">TOTAL LÍQUIDO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-white">PIX Cobrança Direta</td>
                    <td className="py-3 text-[10px] font-mono text-slate-300 text-right">R$ 320.000</td>
                    <td className="py-3 text-[10px] font-mono text-error text-right">- R$ 320</td>
                    <td className="py-3 text-[10px] font-black text-green-400 text-right">R$ 319.680</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-white">Transferência TED Integrada</td>
                    <td className="py-3 text-[10px] font-mono text-slate-300 text-right">R$ 450.000</td>
                    <td className="py-3 text-[10px] font-mono text-error text-right">- R$ 45</td>
                    <td className="py-3 text-[10px] font-black text-green-400 text-right">R$ 449.955</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-white">Carnê Interbancário Boleto</td>
                    <td className="py-3 text-[10px] font-mono text-slate-300 text-right">R$ 120.000</td>
                    <td className="py-3 text-[10px] font-mono text-error text-right">- R$ 1.800</td>
                    <td className="py-3 text-[10px] font-black text-green-400 text-right">R$ 118.200</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-white">Financiamento Leasing/BB</td>
                    <td className="py-3 text-[10px] font-mono text-slate-300 text-right">R$ 250.000</td>
                    <td className="py-3 text-[10px] font-mono text-error text-right">- R$ 7.500</td>
                    <td className="py-3 text-[10px] font-black text-green-400 text-right">R$ 242.500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="trending_up" className="text-[#FCA311] text-lg" />
                <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">COMISSÕES E METAS DE REPRESENTANTES</h3>
              </div>
              <p className="text-[9px] text-slate-400 font-medium mb-6 ml-6">Acompanhamento de metas contratuuais mensais e gratificações sobre faturamento de pátio.</p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-[11px] font-bold text-white">Amélia Lacerda</h4>
                      <p className="text-[9px] text-slate-400">Faturado: <span className="text-white font-bold">R$ 930.000</span> (5 vendas)</p>
                      <p className="text-[8px] text-slate-500 font-mono">Meta Mensal: R$ 500.000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-green-400">R$ 19.200 comissão</p>
                      <p className="text-[8px] text-slate-500 font-mono">fixo base: R$ 4500</p>
                    </div>
                  </div>
                  <div className="h-1 bg-[#0F172A] rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-[#FCA311]" style={{ width: "100%" }}></div>
                    <span className="absolute right-0 top-0 text-[8px] font-black text-[#FCA311] -mt-0.5">100%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-[11px] font-bold text-white">Bruno Castanho</h4>
                      <p className="text-[9px] text-slate-400">Faturado: <span className="text-white font-bold">R$ 680.000</span> (2 vendas)</p>
                      <p className="text-[8px] text-slate-500 font-mono">Meta Mensal: R$ 400.000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-green-400">R$ 12.360 comissão</p>
                      <p className="text-[8px] text-slate-500 font-mono">fixo base: R$ 4200</p>
                    </div>
                  </div>
                  <div className="h-1 bg-[#0F172A] rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-[#FCA311]" style={{ width: "100%" }}></div>
                    <span className="absolute right-0 top-0 text-[8px] font-black text-[#FCA311] -mt-0.5">100%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-[11px] font-bold text-white">Daniela Fraga</h4>
                      <p className="text-[9px] text-slate-400">Faturado: <span className="text-white font-bold">R$ 1.260.000</span> (4 vendas)</p>
                      <p className="text-[8px] text-slate-500 font-mono">Meta Mensal: R$ 500.000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-green-400">R$ 23.180 comissão</p>
                      <p className="text-[8px] text-slate-500 font-mono">fixo base: R$ 4000</p>
                    </div>
                  </div>
                  <div className="h-1 bg-[#0F172A] rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-[#FCA311]" style={{ width: "100%" }}></div>
                    <span className="absolute right-0 top-0 text-[8px] font-black text-[#FCA311] -mt-0.5">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="warning" className="text-[#FCA311] text-lg" />
              <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">CENTRAL DE ALERTAS OPERACIONAIS & PREDITIVOS</h3>
            </div>
            <p className="text-[9px] text-slate-400 font-medium mb-6 ml-6">Notificações geradas automaticamente por motor cognitivo para otimizar faturamento e evitar multas contratuais.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#0F172A] p-4 rounded-xl border border-error/20">
                <h4 className="text-[11px] font-bold text-error mb-2">Veículo Ocioso há 18 Dias</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed">Volvo FH 540 (Placa: MOC-2020) está qualificado para desconto agressivo de 12% na taxa de locação.</p>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-[#FCA311]/20">
                <h4 className="text-[11px] font-bold text-[#FCA311] mb-2">Seguro Padrão Expirando</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed">Apólice nº 447.915-A de responsabilidade civil para pátio vence em 5 dias. Solicitar renovação Porto Seguro.</p>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-outline-variant/20">
                <h4 className="text-[11px] font-bold text-blue-400 mb-2">Vistorias Clientes Pendentes</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed">Três co-assinaturas eletrônicas homologadas aguardam vistoria cautelar de entrega do frota.</p>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-outline-variant/20">
                <h4 className="text-[11px] font-bold text-green-400 mb-2">Vencimento Parcelas BB</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed">Mensalidades de leasing e arrendamento das filiais Sul concluídas hoje via banco BaaS.</p>
              </div>
            </div>
          </div>

          <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="history" className="text-[#FCA311] text-lg" />
                <div>
                  <h3 className="text-[10px] font-bold text-[#FCA311] uppercase tracking-widest">REGISTRO DE AUDITORIAS CORPORATIVAS (AUDIT TRAILS)</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Registro de logs de conformidade inalterável para fiscalização tributária, assinaturas e privilégios RBAC</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Total: 3 transações logadas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant/20">
                  <tr>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">PROTOCOLO</th>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">PROFISSIONAL</th>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">OPERAÇÃO REALIZADA</th>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">REGISTRO COMERCIAL AFETADO</th>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">DATA & HORA</th>
                    <th className="pb-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right">ENDEREÇO IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-[#FCA311]">#1</td>
                    <td className="py-3 text-[10px] font-bold text-white">Amanda Silveira</td>
                    <td className="py-3 text-[10px] text-slate-300">Status Renovado</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400">v-1 (RESERVED)</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400 text-right">2026-06-11 18:38</td>
                    <td className="py-3 text-[10px] font-mono text-slate-500 text-right">192.168.1.102</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-[#FCA311]">#2</td>
                    <td className="py-3 text-[10px] font-bold text-white">Carlos Silveira</td>
                    <td className="py-3 text-[10px] text-slate-300">Assinatura Blockchain de Contrato</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400">rental-1</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400 text-right">2026-06-10 16:21</td>
                    <td className="py-3 text-[10px] font-mono text-slate-500 text-right">172.22.40.12</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[10px] font-bold text-[#FCA311]">#3</td>
                    <td className="py-3 text-[10px] font-bold text-white">Amanda Silveira</td>
                    <td className="py-3 text-[10px] text-slate-300">Fechamento de Proposta</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400">sale-1</td>
                    <td className="py-3 text-[10px] font-mono text-slate-400 text-right">2026-06-09 11:45</td>
                    <td className="py-3 text-[10px] font-mono text-slate-500 text-right">192.168.1.102</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
