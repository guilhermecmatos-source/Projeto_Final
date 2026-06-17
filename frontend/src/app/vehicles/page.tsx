"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";

const VEHICLES = [
  {
    id: "v-1",
    brand: "SCANIA",
    model: "R 450",
    plate: "BRA-2E19",
    tag: "VENDA + LOCAÇÃO",
    tagColor: "text-green-400 border border-green-500/50 bg-green-500/10",
    mileage: 125430,
    consumption: 2.8,
    year: 2024,
    autonomy: 1400,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600",
    engine: "Óleo Diesel S10",
  },
  {
    id: "v-2",
    brand: "VOLVO",
    model: "FH 540",
    plate: "FLT-0130",
    tag: "LOCAÇÃO",
    tagColor: "text-green-400 border border-green-500/50 bg-green-500/10",
    mileage: 82190,
    consumption: 2.5,
    year: 2023,
    autonomy: 1550,
    image: "https://images.unsplash.com/photo-1542382257-80da9fb9f5e2?auto=format&fit=crop&q=80&w=600", // Using a placeholder since original was a desk
    engine: "Óleo Diesel S10",
  },
  {
    id: "v-3",
    brand: "MERCEDES-BENZ",
    model: "Atego 2426",
    plate: "MEC-4D21",
    tag: "RESERVADO",
    tagColor: "text-purple-400 border border-purple-500/50 bg-purple-500/10",
    mileage: 243500,
    consumption: 3.5,
    year: 2023,
    autonomy: 950,
    image: "", // Empty to show placeholder/broken image
    engine: "Óleo Diesel S10",
  },
];

const TABS = ["TODOS", "DISPONÍVEL", "EM MANUTENÇÃO", "INATIVO"];

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState("TODOS");
  const [selectedVehicle, setSelectedVehicle] = useState<typeof VEHICLES[0] | null>(null);

  return (
    <AppShell>
      <PageHeader
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / FLEET"
        title="Inventário de Frota"
        subtitle="Gestão de cavalos mecânicos, caminhões e utilitários da geradora."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-[#FCA311] px-4 py-2 text-xs font-bold uppercase text-[#0c132b] hover:bg-amber-400 transition">
            <Icon name="add" className="text-sm" /> CADASTRAR VEÍCULO
          </button>
        }
      />

      {/* KPI Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">TOTAL VEÍCULOS</p>
          <p className="text-3xl font-bold text-white">3</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">DISPONÍVEIS</p>
          <p className="text-3xl font-bold text-green-400">2</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">EM MANUTENÇÃO</p>
          <p className="text-3xl font-bold text-[#FCA311]">0</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">INATIVOS</p>
          <p className="text-3xl font-bold text-white">1</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-3 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#FCA311] text-[#0c132b]"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VEHICLES.map((v) => (
          <div 
            key={v.id} 
            onClick={() => setSelectedVehicle(v)}
            className="raised-card flex flex-col rounded-2xl border border-outline-variant/30 bg-[#0c132b]/80 overflow-hidden cursor-pointer hover:border-blue-500/40 transition group"
          >
            {/* Header */}
            <div className="p-4 flex items-start justify-between border-b border-outline-variant/20">
              <div>
                <h3 className="text-sm font-bold text-[#FCA311] uppercase tracking-wider">{v.brand}</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{v.model}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${v.tagColor}`}>
                {v.tag}
              </span>
            </div>

            {/* Image */}
            <div className="h-40 bg-surface-container-high relative flex items-center justify-center overflow-hidden">
              {v.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="flex items-center justify-center flex-col text-slate-600">
                  <Icon name="broken_image" className="text-3xl mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sem Imagem</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">PLACA:</span>
                <span className="px-2 py-0.5 rounded bg-white text-black font-bold font-mono text-[10px]">{v.plate}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">QUILOMETRAGEM</p>
                  <p className="text-sm font-bold text-white">{v.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">DIESEL CONSUMO</p>
                  <p className="text-sm font-bold text-[#FCA311]">{v.consumption} Km/L</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <p className="text-[10px] text-slate-400 font-medium">Ano: <span className="text-slate-300 font-bold">{v.year}</span></p>
                <p className="text-[9px] text-slate-500 font-medium">Autonomia Estimada: <span className="text-slate-400 font-bold">~{v.autonomy}km</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Profile */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0c132b] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col">
            
            {/* Top Image */}
            <div className="h-56 bg-surface-container-high relative flex items-center justify-center overflow-hidden">
              {selectedVehicle.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedVehicle.image} alt={selectedVehicle.brand} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center flex-col text-slate-600">
                  <Icon name="broken_image" className="text-4xl mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Veículo sem foto</span>
                </div>
              )}
              {/* Gradient overlay for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c132b] to-transparent h-1/3 top-auto"></div>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#FCA311] uppercase tracking-wider">{selectedVehicle.brand} {selectedVehicle.model}</h2>
                  <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-1">Controle de Registro: {selectedVehicle.id}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${selectedVehicle.tagColor}`}>
                  {selectedVehicle.tag}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Placa</span>
                  <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded bg-white/10 font-mono">{selectedVehicle.plate}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Odômetro</span>
                  <span className="text-[11px] font-bold text-white">{selectedVehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Ano</span>
                  <span className="text-[11px] font-bold text-white">{selectedVehicle.year}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Méd. Consumo</span>
                  <span className="text-[11px] font-bold text-white">{selectedVehicle.consumption} Km/L</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Tipo Motor</span>
                  <span className="text-[11px] font-bold text-[#FCA311]">{selectedVehicle.engine}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] text-slate-500 font-medium">Autonomia</span>
                  <span className="text-[11px] font-bold text-green-400">~{selectedVehicle.autonomy} km</span>
                </div>
              </div>

              <div className="bg-[#0F172A] rounded-xl p-4 border border-outline-variant/20 mb-6">
                <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">STATUS DE HOMOLOGAÇÃO DE PÁTIO:</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Cavalete físico, integridade de tração pneumática e testes elétricos auditados com sucesso em conformidade com o rbac corporativo.
                </p>
              </div>

              <button 
                onClick={() => setSelectedVehicle(null)}
                className="w-full py-3.5 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-[#0c132b] font-black uppercase text-xs tracking-widest transition shadow-lg shadow-amber-500/20"
              >
                FECHAR FICHA DO VEÍCULO
              </button>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}
