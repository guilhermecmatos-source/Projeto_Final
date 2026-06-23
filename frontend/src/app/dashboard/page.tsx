"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import SatelliteOperationalMap from "@/components/map/SatelliteOperationalMap";
import PeriodLineChart from "@/components/dashboard/PeriodLineChart";
import DateRangePicker, { defaultDateRange, DateRange } from "@/components/forms/DateRangePicker";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import { dashboardApi, vehiclesApi } from "@/services/api";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";
import { extractApiError } from "@/lib/api-errors";
import { DashboardData, PredictiveAlert } from "@/types";
import { formatBRL } from "@/lib/currency";

// ─── Tipos locais ─────────────────────────────────────────────────────────────
interface DriverCard {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  status: "EM ROTA" | "DISPONÍVEL" | "CONCLUÍDO";
  origin: string;
  destination: string;
  etaMin: number;
  remainDist: string;
  fuelEst: string;
  fuelType: string;
  avatarInitials: string;
  stars: number;
}

interface TelemetryRow {
  plate: string;
  model: string;
  sensor: string;
  value: string;
  log: string;
}

interface Alert {
  vehicle: string;
  model: string;
  message: string;
  date: string;
}

// ─── Dados estáticos ───────────────────────────────────────────────────────────
const DRIVERS: DriverCard[] = [
  {
    id: "carlos",
    name: "CARLOS SILVA",
    vehicle: "Moto Honda CE",
    plate: "ABC-2234",
    status: "EM ROTA",
    origin: "Garagem Central Palmas (Av. NS-02, Qd. 192 Sul)",
    destination: "Mercado São João (Setor Aureny I)",
    etaMin: 12,
    remainDist: "561 m restante",
    fuelEst: "R$ 18,38",
    fuelType: "Gasolina Autônoma",
    avatarInitials: "CS",
    stars: 4,
  },
  {
    id: "ana",
    name: "ANA LIMA",
    vehicle: "Cargo Bike",
    plate: "—",
    status: "DISPONÍVEL",
    origin: "Ponto de Coleta Norte (Areal 61 - Antigo 103 Norte)",
    destination: "Mercado Municipal Central (Qd. 194 Sul)",
    etaMin: 25,
    remainDist: "1.2 km restante",
    fuelEst: "R$ 0,00",
    fuelType: "Tração Humana (Eco-Bike)",
    avatarInitials: "AL",
    stars: 5,
  },
  {
    id: "roberto",
    name: "DEF-5678 • ROBERTO",
    vehicle: "Caminhão",
    plate: "DEF-5678",
    status: "CONCLUÍDO",
    origin: "Depot",
    destination: "Entregue",
    etaMin: 0,
    remainDist: "—",
    fuelEst: "—",
    fuelType: "Diesel S10",
    avatarInitials: "RB",
    stars: 3,
  },
];

const TELEMETRY: TelemetryRow[] = [
  { plate: "FLT-0130", model: "Volvo FH 540", sensor: "Balança Eixo (Auto)", value: "43.120 kg", log: "Distribuição de peso em conformidade (Eixos 1-3)." },
  { plate: "BRA-2E19", model: "Scania R 450", sensor: "Médio DriveEye", value: "2.8 km/L", log: "Desempenho ecológico ideal para carga líquida." },
  { plate: "MEC-4D21", model: "Mercedes Atego", sensor: "Balança Eixo (Auto)", value: "22.180 kg", log: "Retorno em vazio - peso bruto homologado pelo CCO." },
];

const ALERTS: Alert[] = [
  {
    vehicle: "MEC-4D21",
    model: "Mercedes-Benz Atego",
    message: "Vehicle MEC-4021 (Mercedes-Benz Atego) has traveled 50 420 km since last belt transmission correction. Schedule belt replacements soon.",
    date: "2026-06-11 13:30",
  },
  {
    vehicle: "FLT-0130",
    model: "VOLVO FH 540",
    message: "Vehicle FLT-0130 (Volvo FH 540) has traveled 17,890 km since last axial shaft oiling. Maintenance is suggested in 10 days.",
    date: "2026-06-11 08:38",
  },
  {
    vehicle: "BUV-4421",
    model: "SCANIA R 450",
    message: "Vehicle BUV-4421 (Scania R 450) has traveled 109,220 km since last standard damper checking. Schedule checking to stay within CCO bounds.",
    date: "2026-06-11 04:05",
  },
];

// ─── Chat Messages ─────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    role: "ai",
    text: "Olá! Sou o #FleetAI, assistente inteligente de diagnóstico de frotas da matriz de Palmas. Pergunte-me sobre alertas de manutenção preventiva, análise de consumo de combustível ou regras de RUV.",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function statusChip(status: DriverCard["status"]) {
  if (status === "EM ROTA") return "bg-green-500/20 text-green-400 border border-green-500/40";
  if (status === "DISPONÍVEL") return "bg-amber-500/20 text-amber-400 border border-amber-500/40";
  return "bg-slate-600/30 text-slate-400 border border-slate-500/30";
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-amber-400 text-[10px]">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name={i < n ? "star" : "star_border"} className="text-[10px]" />
      ))}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange(30));
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverCard>(DRIVERS[0]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    dashboardApi
      .get({ dateFrom: dateRange.start, dateTo: dateRange.end })
      .then((res) => setData(res.data))
      .catch((err) => {
        setData(null);
        setFetchError(extractApiError(err, "Não foi possível carregar o dashboard."));
      })
      .finally(() => setLoading(false));
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setRegisterMessage("");
    const form = new FormData(e.currentTarget);
    try {
      await vehiclesApi.create({
        plate: String(form.get("plate")),
        brand: String(form.get("brand")),
        model: String(form.get("model")),
        year: Number(form.get("year")),
        mileage: Number(form.get("mileage")),
        avg_consumption: Number(form.get("avg_consumption")),
      });
      setRegisterModalOpen(false);
      loadDashboard();
    } catch {
      setRegisterMessage("Erro ao cadastrar veículo.");
    } finally {
      setSaving(false);
    }
  }

  function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Analisando dados de telemetria e frota... Com base nos registros atuais, o veículo BRA-2E19 (Scania R 450) apresenta consumo médio dentro do esperado. Recomendo verificar os alertas de manutenção para FLT-0130 nos próximos 10 dias.",
        },
      ]);
      setChatLoading(false);
    }, 1200);
  }

  const kpis = data?.kpis;
  const chartData = useMemo(() => data?.evolution ?? [], [data?.evolution]);
  const fuelCost = kpis?.fuelCost ?? 500.15;

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Dashboard"
        eyebrow="📡 DASHBOARD PRINCIPAL"
        title="DASHBOARD PRINCIPAL"
        subtitle="Monitoramento de pedido em tempo real, telemetrias ativas e controle automatizado CCO."
        actions={
          <>
            <button
              onClick={() => { setRegisterModalOpen(true); setRegisterMessage(""); }}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-transparent px-3 py-2 text-[10px] font-bold uppercase text-amber-400 hover:bg-amber-500/10 transition"
            >
              <Icon name="login" className="text-sm" /> Ver Log de Entrada
            </button>
            <ActionButton onClick={() => { setRegisterModalOpen(true); setRegisterMessage(""); }} className="uppercase text-[10px]">
              <Icon name="add_circle" className="text-sm" />
              Novo Registro
            </ActionButton>
          </>
        }
      />

      {/* ── Top KPI Row ──────────────────────────────────────────────────────── */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Icon name="route" className="text-xl text-[#FCA311]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">VIAGENS ATIVAS / REQUISITADAS</p>
            <p className="text-2xl font-bold text-white font-mono">{kpis?.travels?.total ?? 0} <span className="text-base">Registrada(s)</span></p>
            <p className="text-[9px] text-slate-500 mt-0.5">{kpis?.travels?.completed ?? 0} concluída(s)</p>
          </div>
        </div>

        <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
            <Icon name="warning" className="text-xl text-red-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">ALERTAS CRÍTICOS BETA</p>
            <p className="text-2xl font-bold text-red-400 font-mono">{kpis?.pendingMaintenance ?? 0} Alerta(s)</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Manutenções pendentes nos próximos 30 dias</p>
          </div>
        </div>

        <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
            <Icon name="trending_up" className="text-xl text-green-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">ECONOMIA ECO ESTIMADA</p>
            <p className="text-xl font-bold text-[#FCA311] font-mono">R$<br/>14.200,00</p>
            <p className="text-[9px] text-green-400 mt-0.5 flex items-center gap-1"><Icon name="eco" className="text-[10px]"/> Rastreamento ecológico otimizando consumo</p>
          </div>
        </div>

        <div className="raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Icon name="payments" className="text-xl text-blue-400" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">CUSTOS NO PERÍODO</p>
            <p className="text-xl font-bold text-white font-mono">{formatBRL(fuelCost)}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Combustível: {formatBRL(fuelCost)}</p>
          </div>
        </div>
      </div>

      {/* ── Secondary KPI Strip ───────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="raised-card px-4 py-3 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-3">
          <Icon name="inventory_2" className="text-green-400 text-xl shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">RUV APROVADAS</p>
            <p className="text-sm font-bold text-white">{kpis?.ruv?.approved ?? 0} Aprovada(s) / {kpis?.ruv?.total ?? 0} Total</p>
          </div>
        </div>
        <div className="raised-card px-4 py-3 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-3">
          <Icon name="directions_car" className="text-primary text-xl shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">VEÍCULOS NO INVENTÁRIO</p>
            <p className="text-sm font-bold text-white">{kpis?.vehicles?.total ?? 0}/{kpis?.vehicles?.active ?? 0} ativos</p>
          </div>
        </div>
        <div className="raised-card px-4 py-3 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-3">
          <Icon name="person" className="text-secondary text-xl shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">MOTORISTAS REGISTRADOS</p>
            <p className="text-sm font-bold text-white">{kpis?.drivers ?? 0} Ativo(s)</p>
          </div>
        </div>
        <div className="raised-card px-4 py-3 bg-[#0c132b]/80 border-outline-variant/30 flex items-center gap-3">
          <Icon name="local_gas_station" className="text-[#FCA311] text-xl shrink-0" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">GASTO MÉDIO COMBUSTÍVEL</p>
            <p className="text-sm font-bold text-white">R$ 250,58 / Por viagem</p>
          </div>
        </div>
      </div>

      {/* ── Map + Chart Row ───────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-12">
        {/* Map */}
        <section className="raised-card overflow-hidden lg:col-span-8">
          <div className="border-b border-outline-variant/30 px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Icon name="map" className="text-sm" /> MAPA OPERACIONAL EM TEMPO REAL
              </h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Centro de Controle CCO — Rastreamento Palmas, TO</p>
            </div>
            <span className="flex items-center gap-1.5 rounded border border-green-500/30 bg-green-500/10 px-2 py-1 text-[9px] font-bold text-green-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> GPS PALMAS
            </span>
          </div>
          <SatelliteOperationalMap />
          {/* Camadas CCO overlay */}
          <div className="border-t border-outline-variant/20 px-4 py-2 bg-[#0c132b]/60 flex flex-wrap gap-3">
            {[
              { icon: "route", label: "Rotas dos Motoristas", color: "text-blue-400" },
              { icon: "local_gas_station", label: "Postos de Combustível", color: "text-amber-400" },
              { icon: "build", label: "Locais de Manutenção", color: "text-red-400" },
            ].map((l) => (
              <label key={l.label} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3 h-3 accent-primary" />
                <Icon name={l.icon} className={`text-xs ${l.color}`} />
                <span className="text-[9px] text-slate-300">{l.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Period Chart */}
        <section className="raised-card p-4 lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">EVOLUÇÃO DO PERÍODO</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">FILTRADO POR: ITINERÁRIO</p>
            </div>
            <div className="flex gap-1">
              <button className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">L</span>
              </button>
              <button className="w-6 h-6 rounded bg-[#0F172A] border border-outline-variant/30 flex items-center justify-center">
                <Icon name="settings" className="text-slate-400 text-xs" />
              </button>
            </div>
          </div>
          <PeriodLineChart data={chartData} loading={loading} />
        </section>
      </div>

      {/* ── Driver Cards Strip ────────────────────────────────────────────────── */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {DRIVERS.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDriver(d)}
            className={`shrink-0 flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase transition ${
              selectedDriver.id === d.id
                ? d.status === "DISPONÍVEL"
                  ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                  : d.status === "CONCLUÍDO"
                  ? "border-slate-500/50 bg-slate-600/20 text-slate-300"
                  : "border-green-500/50 bg-green-500/10 text-green-300"
                : "border-outline-variant/30 bg-[#0c132b]/60 text-slate-400 hover:text-white"
            }`}
          >
            <span>{d.plate !== "—" ? d.plate : "CARGO BIKE"} • {d.name.split(" ")[0] === "DEF-5678" ? "ROBERTO" : d.name.split(" ")[0]}</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${statusChip(d.status)}`}>{d.status}</span>
          </button>
        ))}
      </div>

      {/* ── Active Driver Detail Card ─────────────────────────────────────────── */}
      {selectedDriver && (
        <div className="mb-6 raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm border border-outline-variant/40 shrink-0">
                {selectedDriver.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white uppercase">{selectedDriver.name}</h4>
                  <span className="text-[9px] text-slate-400">{selectedDriver.vehicle} ★ {selectedDriver.plate}</span>
                </div>
                <Stars n={selectedDriver.stars} />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {selectedDriver.status === "EM ROTA" && (
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/40`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Em trânsito • Restam {selectedDriver.remainDist}
                </span>
              )}
              {selectedDriver.status === "DISPONÍVEL" && (
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Disponível • Aguardando rota
                </span>
              )}
              {selectedDriver.status === "CONCLUÍDO" && (
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/40`}>
                  <Icon name="check_circle" className="text-xs text-blue-400" /> Viagem Concluída
                </span>
              )}
              {selectedDriver.fuelEst !== "—" && (
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Icon name="local_gas_station" className="text-xs" /> Gasto Est.: {selectedDriver.fuelEst}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full border ${selectedDriver.status === "CONCLUÍDO" ? "bg-blue-400 border-blue-500" : "bg-green-400 border-green-500"}`} />
                {selectedDriver.status === "CONCLUÍDO" ? "PONTO DE ORIGEM" : "ORIGEM EM ROTA (ATUAL)"}
              </p>
              <p className="text-[10px] font-bold text-white">{selectedDriver.origin}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full border ${selectedDriver.status === "CONCLUÍDO" ? "bg-blue-500 border-blue-600" : "bg-red-400 border-red-500"}`} />
                {selectedDriver.status === "CONCLUÍDO" ? "DESTINO FINAL (ENTREGUE)" : "DESTINO FINAL (FTD)"}
              </p>
              <p className="text-[10px] font-bold text-white">{selectedDriver.destination}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                {selectedDriver.status === "CONCLUÍDO" ? "STATUS DA VIAGEM" : "TEMPO ESTIMADO"}
              </p>
              <p className="text-lg font-bold text-white">
                {selectedDriver.status === "CONCLUÍDO" ? "0" : selectedDriver.etaMin} <span className="text-xs text-slate-400">minutos</span>
              </p>
              <p className="text-[9px] text-slate-500">
                {selectedDriver.status === "CONCLUÍDO" ? "Viagem finalizada" : "Distância restante em rota"}
              </p>
              <p className={`text-[10px] font-bold ${selectedDriver.status === "CONCLUÍDO" ? "text-blue-400" : "text-primary"}`}>
                {selectedDriver.status === "CONCLUÍDO" ? "Finalizada" : selectedDriver.remainDist}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">COMBUSTÍVEL / FONTE</p>
              <p className="text-[11px] font-bold text-[#FCA311]">{selectedDriver.fuelType}</p>
              <p className="text-[9px] text-slate-500 mt-1">GASTO EM ROTA</p>
              <p className="text-sm font-bold text-green-400">
                {selectedDriver.status === "CONCLUÍDO" ? "Consumo finalizado" : selectedDriver.fuelEst}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-blue-500/5 border border-blue-500/15 p-3">
            <p className="text-[9px] text-slate-400">
              <Icon name="info" className="text-[11px] text-blue-400 mr-1" />
              Os cálculos combinam o consumo médio de Km/L do veículo, preço atual e trajeto Palmas TO.
            </p>
          </div>
        </div>
      )}

      {/* ── Side metrics + Map + Chat ─────────────────────────────────────────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-12">
        {/* Side metrics */}
        <div className="lg:col-span-8 space-y-3">

          {/* Alertas Inteligentes Registrados */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <h3 className="text-xs font-bold uppercase text-primary flex items-center gap-2 mb-4">
              <Icon name="warning" className="text-amber-400" /> ALERTAS INTELIGENTES REGISTRADOS
            </h3>
            <ul className="space-y-3">
              {ALERTS.map((a, i) => (
                <li key={i} className="rounded-lg border-l-4 border-l-amber-500 bg-[#0F172A]/60 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold text-amber-400 uppercase">VEÍCULO — {a.vehicle} ({a.model})</span>
                  </div>
                  <p className="text-[10px] text-slate-300">{a.message}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">{a.date}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Central Telemetria Ativa */}
          <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase text-primary flex items-center gap-2">
                <Icon name="sensors" /> CENTRAL TELEMETRIA ATIVA
              </h3>
              <span className="text-[9px] font-bold text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-1 rounded uppercase">
                Status: ● OPERANTE
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mb-4">Dados dinâmicos de pesagem e consumo provenientes dos rastreadores</p>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[9px] font-bold text-slate-500 uppercase">
                  <th className="py-2 px-2">PLACA</th>
                  <th className="py-2 px-2">CAVALO TRATOR</th>
                  <th className="py-2 px-2">SENSOR ATIVO</th>
                  <th className="py-2 px-2">VALOR SENSOR</th>
                  <th className="py-2 px-2">LOG OPERACIONAL CCO</th>
                  <th className="py-2 px-2">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {TELEMETRY.map((t, i) => (
                  <tr key={i} className="hover:bg-white/5 transition">
                    <td className="py-3 px-2 text-[10px] font-bold text-[#FCA311] font-mono">{t.plate}</td>
                    <td className="py-3 px-2 text-[10px] text-slate-300">{t.model}</td>
                    <td className="py-3 px-2">
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold">{t.sensor}</span>
                    </td>
                    <td className="py-3 px-2 text-[10px] font-bold text-white font-mono">{t.value}</td>
                    <td className="py-3 px-2 text-[9px] text-slate-400">• {t.log}</td>
                    <td className="py-3 px-2">
                      <Link href="/bi" className="text-[9px] font-bold text-primary hover:text-blue-300 transition flex items-center gap-0.5">
                        Mais Métricas <Icon name="chevron_right" className="text-xs" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chat / AI Panel */}
        <div className="lg:col-span-4 raised-card p-4 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col h-full min-h-[420px]">
          <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                <Icon name="psychology" className="text-sm" /> ASSISTÊNCIA INTELIGENTE
              </h3>
              <p className="text-[9px] text-slate-400 mt-0.5">FLEETAI COPILOT ATIVO</p>
            </div>
            <div className="flex gap-1.5">
              <button className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">L</button>
              <button className="w-6 h-6 rounded bg-[#0F172A] border border-outline-variant/30 flex items-center justify-center">
                <Icon name="settings" className="text-slate-400 text-xs" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 shrink-0 mt-1">AI</div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 text-[10px] leading-relaxed ${
                    msg.role === "ai"
                      ? "bg-[#0F172A]/80 border border-outline-variant/20 text-slate-300"
                      : "bg-blue-600 text-white ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold mr-2 shrink-0">AI</div>
                <div className="bg-[#0F172A]/80 border border-outline-variant/20 rounded-xl p-3 text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pergunte sobre telemetria..."
              className="flex-1 text-[10px] h-9 bg-[#0b0e14]/80 border border-outline-variant/30 rounded-lg px-3 text-slate-300 focus:outline-none focus:border-primary/50 placeholder-slate-600"
            />
            <button type="submit" disabled={!chatInput.trim() || chatLoading} className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition disabled:opacity-40">
              <Icon name="send" className="text-white text-sm" />
            </button>
          </form>

          {/* Módulo Preditivo */}
          <div className="mt-3 pt-3 border-t border-outline-variant/20">
            <div className="flex items-center justify-between text-[9px]">
              <span className="flex items-center gap-1 text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Módulo Preditivo Ativo</span>
              <span className="text-slate-400 font-mono">Palmas Center 1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side Metrics ────────────────────────────────────────────────── */}
      <div className="mb-6 raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Viagens Efetuadas (Palmas CCO)</p>
              <p className="text-sm font-bold text-green-400">+18 Concluídas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FCA311] shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Economia Acumulada em R$</p>
              <p className="text-sm font-bold text-[#FCA311]">R$ 14.200,00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Módulo Preditivo Ativo</p>
              <p className="text-sm font-bold text-blue-400">Palmas Center 1.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Register Modal ────────────────────────────────────────────────────── */}
      <FormModal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title="Novo Registro" subtitle="Cadastro rápido de veículo operacional">
        <form className="space-y-3" onSubmit={handleRegisterSubmit}>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Placa do Veículo</label>
            <input className="input-fleet" name="plate" placeholder="EX: ABC-1234" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Marca / Fabricante</label>
            <input className="input-fleet" name="brand" placeholder="Ex: Mercedes-Benz" required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Modelo Comercial</label>
            <input className="input-fleet" name="model" placeholder="Ex: Atego 2426" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Ano</label>
              <input className="input-fleet" name="year" type="number" defaultValue="2022" required />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Odômetro (KM)</label>
              <input className="input-fleet" name="mileage" type="number" defaultValue="100000" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Consumo Médio (KM/L)</label>
            <input className="input-fleet" name="avg_consumption" type="number" step="0.1" defaultValue="4" />
          </div>
          {registerMessage && <p className="text-sm text-primary">{registerMessage}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">
            {saving ? "Salvando..." : "Vincular Veículo"}
          </button>
        </form>
      </FormModal>
    </AppShell>
  );
}
