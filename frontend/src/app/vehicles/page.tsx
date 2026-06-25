"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { showToast } from "@/components/ui/Toast";

import { vehiclesApi } from "@/services/api";

const STATUS_OPTIONS = ["TODOS", "DISPONÍVEL", "EM MANUTENÇÃO", "INATIVO"];

const mapStatusToTag = (status: string) => {
  switch (status) {
    case "active":
    case "disponível":
    case "disponivel":
      return { tag: "DISPONÍVEL", tagColor: "text-green-400 border border-green-500/50 bg-green-500/10" };
    case "maintenance":
    case "manutenção":
    case "manutencao":
      return { tag: "EM MANUTENÇÃO", tagColor: "text-amber-400 border border-amber-500/50 bg-amber-500/10" };
    case "inactive":
    case "inativo":
      return { tag: "INATIVO", tagColor: "text-purple-400 border border-purple-500/50 bg-purple-500/10" };
    default:
      return { tag: "DISPONÍVEL", tagColor: "text-green-400 border border-green-500/50 bg-green-500/10" };
  }
};

interface VehicleData {
  id: string;
  brand: string;
  model: string;
  plate: string;
  tag: string;
  tagColor: string;
  mileage: number;
  consumption: number;
  year: number;
  autonomy: number;
  image: string;
  engine: string;
  purpose?: string;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  const load = () => {
    setLoading(true);
    vehiclesApi.list()
      .then((res) => {
        const rawList = Array.isArray(res.data) ? res.data : [];
        const mapped = rawList.map((v: any) => {
          const { tag, tagColor } = mapStatusToTag(v.status || "active");
          
          let localPhoto = "";
          if (typeof window !== "undefined") {
            localPhoto = localStorage.getItem(`vehicle_photo_${v.plate}`) || "";
          }

          return {
            id: v.id,
            brand: v.brand,
            model: v.model,
            plate: v.plate,
            tag: tag,
            tagColor: tagColor,
            mileage: Number(v.mileage || 0),
            consumption: Number(v.avg_consumption || 10),
            year: Number(v.year || new Date().getFullYear()),
            autonomy: Number(v.autonomy_km || (v.avg_consumption ? v.avg_consumption * 50 : 500)),
            image: localPhoto || v.photo_url || "",
            engine: v.engine || "Óleo Diesel S10",
            purpose: v.purpose || "locacao",
          };
        });
        setVehicles(mapped);
      })
      .catch((err) => {
        console.error("Erro ao carregar veículos:", err);
        showToast("Erro ao carregar veículos do servidor.", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);



  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === "TODOS" || 
                          (activeTab === "DISPONÍVEL" && v.tag === "DISPONÍVEL") ||
                          (activeTab === "EM MANUTENÇÃO" && v.tag === "EM MANUTENÇÃO") ||
                          (activeTab === "INATIVO" && v.tag === "INATIVO");
                          
    return matchesSearch && matchesStatus;
  });

  const totalCount = vehicles.length;
  const availableCount = vehicles.filter(v => v.tag === "DISPONÍVEL").length;
  const maintenanceCount = vehicles.filter(v => v.tag === "EM MANUTENÇÃO").length;
  const inactiveCount = vehicles.filter(v => v.tag === "INATIVO").length;

  return (
    <AppShell>
      <PageHeader
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / FLEET"
        title="Inventário de Frota"
        subtitle="Gestão de cavalos mecânicos, caminhões e utilitários da geradora."
        actions={
          <button onClick={() => router.push("/vehicles/register")} className="flex items-center gap-1.5 rounded-lg bg-[#FCA311] px-4 py-2 text-xs font-bold uppercase text-[#0c132b] hover:bg-amber-400 transition">
            <Icon name="add" className="text-sm" /> CADASTRAR VEÍCULO
          </button>
        }
      />

      {/* KPI Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">TOTAL VEÍCULOS</p>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">DISPONÍVEIS</p>
          <p className="text-3xl font-bold text-green-400">{availableCount}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">EM MANUTENÇÃO</p>
          <p className="text-3xl font-bold text-[#FCA311]">{maintenanceCount}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/30 bg-[#0F172A] p-4 flex flex-col justify-between">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">INATIVOS</p>
          <p className="text-3xl font-bold text-white">{inactiveCount}</p>
        </div>
      </div>

      {/* Filters (Select + Text) */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Buscar placa, marca ou modelo..." 
            className="input-fleet pl-8 py-2 w-full text-sm" 
          />
        </div>
        <select 
          value={activeTab} 
          onChange={e => setActiveTab(e.target.value)} 
          className="input-fleet py-2 text-sm w-full sm:w-48"
        >
          {STATUS_OPTIONS.map((tab) => (
            <option key={tab} value={tab}>{tab}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <p className="animate-pulse">Carregando inventário de frota...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-outline-variant/30 rounded-2xl bg-[#0c132b]/40">
          <Icon name="directions_car" className="text-4xl mb-2 text-slate-500" />
          <p>Nenhum veículo encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((v) => (
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
                {v.tag === "DISPONÍVEL" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/travels/ruv?vehicleId=${v.id}`);
                    }}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition"
                  >
                    Reservar Locação
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 col-span-2">
                  <span className="text-[10px] text-slate-500 font-medium">Finalidade</span>
                  <span className="text-[11px] font-bold text-white capitalize">
                    {selectedVehicle.purpose === "venda" ? "Venda" : "Locação"}
                  </span>
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
