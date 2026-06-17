"use client";

import { useEffect, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

/* ── Driver mock data ── */
const DRIVERS = [
  {
    id: "d1",
    name: "Carlos Silva",
    vehicle: "Moto Honda CG • ABC-1234",
    destination: "Mercado São João",
    lat: -10.174545,
    lng: -48.330296,
    status: "EM ROTA" as const,
    avatar: "C",
    color: "#3B82F6",
    progress: 100,
  },
  {
    id: "d2",
    name: "Ana Lima",
    vehicle: "Cargo Bike • ---",
    destination: "Mercado Central",
    lat: -10.198121,
    lng: -48.349228,
    status: "DISPONÍVEL" as const,
    avatar: "A",
    color: "#F59E0B",
    progress: 0,
  },
  {
    id: "d3",
    name: "Roberto Santos",
    vehicle: "Fiat Uno • DEF-5678",
    destination: "",
    lat: -10.195000,
    lng: -48.325000,
    status: "CONCLUÍDO" as const,
    avatar: "R",
    color: "#10B981",
    progress: 0,
  },
];

const STATUS_STYLES: Record<string, string> = {
  "EM ROTA": "bg-green-500/20 text-green-400 border-green-500/30",
  "DISPONÍVEL": "bg-green-500/20 text-green-400 border-green-500/30",
  "CONCLUÍDO": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

/* ── Feed log data ── */
const FEED_LOGS = [
  { time: "23:46:54", severity: "SUCCESS", color: "text-green-400", msg: "Pacote de telemetria de precisão Palmas, TO recebido sem perdas." },
  { time: "23:46:37", severity: "SUCCESS", color: "text-green-400", msg: "Ana Lima check-in concluído via APP Simulado." },
  { time: "23:46:24", severity: "INFO", color: "text-blue-400", msg: "Atualização de coordenadas GPS [Carlos Silva] registrada – Av. MS-15." },
  { time: "23:46:20", severity: "CRITICAL", color: "text-error", msg: "Alerta Contrato Vencendo – Aviso de expiração do plano de seguros de frota co..." },
  { time: "23:46:19", severity: "CRITICAL", color: "text-error", msg: "Revisão Preventiva Ultrapassada – Prazo de troca de óleo preventiva ultrapas..." },
  { time: "23:46:19", severity: "CRITICAL", color: "text-error", msg: "Desperdício: Consumo Elevado – Média de consumo caiu instantaneamente para 1..." },
  { time: "23:46:18", severity: "CRITICAL", color: "text-error", msg: "Alerta Telemetria: Carlos Ocioso – Carlos Silva estacionado em rodovia com mo..." },
  { time: "23:45:57", severity: "SUCCESS", color: "text-green-400", msg: "Ana Lima check-in concluído via APP Simulado." },
  { time: "23:45:54", severity: "SUCCESS", color: "text-green-400", msg: "Pacote de telemetria de precisão Palmas, TO recebido sem perdas." },
];

/* ── Alert pills ── */
const ALERT_TYPES = [
  { label: "PARADO", color: "bg-error text-white" },
  { label: "CONSUMO", color: "bg-blue-600 text-white" },
  { label: "ATRASO", color: "bg-[#FCA311] text-[#0c132b]" },
  { label: "DESVIO", color: "bg-green-600 text-white" },
];

/* ── RUV pending ── */
const RUVS = [
  { id: "RUV-0412", route: "Rota São Paulo (SP) – São José dos Campos (SP)", date: "" },
];

/* ── CCO Notifications ── */
const NOTIFICATIONS = [
  { id: 1, msg: "[FleetAI Intelligence] Alerta Preditivo de Segurança disparado para AIK-12340 O evento foi listado no log geral." },
  { id: 2, msg: "[FleetAI Intelligence] Alerta Preditivo de Segurança disparado para ABC-1234! O evento foi listado no log geral." },
  { id: 3, msg: "[FleetAI Intelligence] Alerta Preditivo de Segurança disparado para DEF-5678! O evento foi listado no log geral." },
  { id: 4, msg: "[FleetAI Intelligence] Alerta Preditivo de Segurança disparado para v-31 O evento foi listado no log geral." },
];

export default function CommandCenterPage() {
  const [appTab, setAppTab] = useState<"cargas" | "gestor">("cargas");
  const [showNotifs, setShowNotifs] = useState(true);
  const [dismissedNotifs, setDismissedNotifs] = useState<number[]>([]);
  const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulated PING messages
  const [pings, setPings] = useState<string[]>([
    "PING packet recebido! Palmas nodes [23...",
    "PING packet recebido! Palmas nodes [23...",
    "PING packet recebido! Palmas nodes [23...",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPings(prev => {
        const newPing = `PING packet recebido! Palmas nodes [${Math.floor(Math.random() * 99)}...`;
        return [newPing, ...prev.slice(0, 2)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dismissNotif = (id: number) => {
    setDismissedNotifs(prev => [...prev, id]);
  };

  const visibleNotifs = NOTIFICATIONS.filter(n => !dismissedNotifs.includes(n.id));

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-6">
        <p className="text-[9px] font-bold uppercase text-[#FCA311] tracking-widest mb-2 flex items-center gap-2">
          SEDE CENTRAL / UNIDADE OPERACIONAL / <span className="text-white">COMMAND-CENTER</span>
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">GPS ao Vivo</h1>
            <p className="text-[11px] text-slate-400 font-medium">
              OpenStreetMap real — Palmas, TO — atualiza a cada 3s
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-error/20 border border-error/30 hover:bg-error/30 px-4 py-2 text-[10px] font-bold text-error transition">
            <Icon name="my_location" className="text-sm" /> Usar Meu GPS
          </button>
        </div>
      </header>

      {/* ──────── MAP + DRIVER SIDEBAR ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Map Area */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-outline-variant/20 bg-[#0c132b]" style={{ minHeight: 380 }} ref={mapRef}>
          {/* Embed an OSM tile map */}
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-48.39,-10.22,-48.28,-10.16&layer=mapnik"
            width="100%"
            height="100%"
            style={{ border: 0, position: "absolute", inset: 0 }}
            loading="lazy"
          ></iframe>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
            <button className="w-8 h-8 rounded bg-white/90 text-slate-700 shadow font-bold text-lg flex items-center justify-center hover:bg-white transition">+</button>
            <button className="w-8 h-8 rounded bg-white/90 text-slate-700 shadow font-bold text-lg flex items-center justify-center hover:bg-white transition">−</button>
          </div>

          {/* Map overlay — Carlos tooltip */}
          <div className="absolute top-[15%] left-[35%] z-10 bg-[#111827]/95 border border-outline-variant/30 rounded-xl shadow-2xl p-4 min-w-[200px] backdrop-blur-sm">
            <h4 className="text-sm font-black text-white mb-1">Carlos Silva</h4>
            <p className="text-[10px] font-bold text-white">Moto Honda CG • ABC-1234</p>
            <p className="text-[10px] font-bold text-blue-400 mt-1">Destino: Mercado São João</p>
            <p className="text-[8px] font-mono text-slate-500 mt-2">Lat: -10.174545 | Lng: -48.330296</p>
          </div>

          {/* Map labels */}
          <div className="absolute bottom-[55%] left-[50%] z-10">
            <span className="text-[8px] font-black text-white bg-[#0c132b]/80 px-2 py-0.5 rounded-full uppercase tracking-wider">PRAÇA DOS GIRASSÓIS</span>
          </div>
          <div className="absolute bottom-[35%] left-[45%] z-10">
            <span className="text-[8px] font-black text-white bg-[#0c132b]/80 px-2 py-0.5 rounded-full uppercase tracking-wider">MERCADO CENTRAL</span>
          </div>

          {/* Map driver icons */}
          <div className="absolute bottom-[25%] left-[40%] z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-[#0c132b]">A</div>
          </div>
          <div className="absolute bottom-[15%] right-[30%] z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#10B981] border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white">R</div>
            <span className="text-[8px] font-black text-white bg-[#0c132b]/80 px-2 py-0.5 rounded-full mt-1 uppercase">ROBERTO</span>
          </div>
          <div className="absolute top-[30%] left-[32%] z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6] border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white">C</div>
            <span className="text-[8px] font-black text-white bg-[#0c132b]/80 px-2 py-0.5 rounded-full mt-1 uppercase">CARLOS</span>
          </div>

          {/* PING overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-error/10 border border-error/30 rounded-lg p-3 max-w-[260px]">
            <p className="text-[8px] font-bold text-error uppercase tracking-widest mb-1">RASTREAMENTO EM TRANSMISSÃO</p>
            {pings.map((p, i) => (
              <p key={i} className="text-[8px] font-mono text-slate-400 truncate">{p}</p>
            ))}
          </div>
        </div>

        {/* Driver Sidebar */}
        <div className="space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar">
          {DRIVERS.map((d) => (
            <div 
              key={d.id} 
              className={`rounded-xl border p-4 cursor-pointer transition ${
                selectedDriver?.id === d.id 
                  ? "bg-[#0c132b] border-[#FCA311]/50" 
                  : "bg-[#0c132b]/80 border-outline-variant/20 hover:border-[#FCA311]/30"
              }`}
              onClick={() => setSelectedDriver(d)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 border-2 border-white/20"
                  style={{ backgroundColor: d.color }}
                >
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-white truncate">{d.name}</h4>
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[d.status]}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400">{d.vehicle}</p>
                </div>
              </div>
              {d.destination && (
                <p className="text-[9px] text-slate-400 mb-2">→ {d.destination}</p>
              )}
              <div className="space-y-1">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">COORDENADAS REAIS</p>
                <p className="text-[10px] font-mono text-slate-300">{d.lat}°, {d.lng}°</p>
              </div>
              {d.progress > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.progress}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-blue-400">{d.progress} m</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ──────── TELEMETRY PANEL ──────── */}
      <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Icon name="settings" className="text-[#FCA311] text-lg" />
            <div>
              <h3 className="text-[11px] font-bold text-[#FCA311] uppercase tracking-widest">PAINEL INTEGRADO DE TELEMETRIA & GÊMEOS DIGITAIS</h3>
              <p className="text-[9px] text-slate-400 font-medium">Dispare alarmes analíticos preditivos para testar regras automatizadas de fadiga ou redundância</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1">SIMULAR ALERTA DE RISCO:</span>
            {ALERT_TYPES.map(a => (
              <button 
                key={a.label} 
                className={`${a.color} text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider hover:opacity-80 transition`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">FROTA ATIVA</p>
            <h4 className="text-2xl font-black text-white">94.8%</h4>
            <p className="text-[9px] font-bold text-green-400 mt-1">▲ +1.2% este mês</p>
          </div>
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">UTILIZAÇÃO ATIVA</p>
            <h4 className="text-2xl font-black text-white">92.0%</h4>
            <p className="text-[9px] text-slate-400 mt-1">3/3 ativos em rota</p>
          </div>
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">TEMPO MÉDIO / ESCALA</p>
            <h4 className="text-2xl font-black text-white">115 <span className="text-sm">h/mês</span></h4>
            <p className="text-[9px] text-slate-400 mt-1">Por veículo ativo</p>
          </div>
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">RASTREAMENTO EFICIÊNCIA</p>
            <h4 className="text-2xl font-black text-white">2.93 <span className="text-sm">km/L</span></h4>
            <p className="text-[9px] font-bold text-green-400 mt-1">▲ +10.1 km/l otimizado</p>
          </div>
        </div>

        {/* Feed + App Motorista */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feed Log */}
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4 max-h-[300px] overflow-hidden">
            <h4 className="text-[9px] font-bold text-[#FCA311] uppercase tracking-widest mb-3 flex items-center gap-1">
              <Icon name="terminal" className="text-[11px]" /> FEED LOGÍSTICO EM TEMPO REAL (MDE LOGS)
            </h4>
            <div className="space-y-1 overflow-y-auto max-h-[230px] custom-scrollbar">
              {FEED_LOGS.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[9px]">
                  <span className="text-slate-500 font-mono shrink-0">[{log.time}]</span>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                    log.severity === "CRITICAL" ? "bg-error/20 text-error" :
                    log.severity === "SUCCESS" ? "bg-green-500/20 text-green-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>{log.severity}</span>
                  <span className="text-slate-300 truncate">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* App Motorista */}
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Icon name="smartphone" className="text-[11px]" /> APP MOTORISTA (PALMAS)
              </h4>
              <div className="flex rounded-lg overflow-hidden border border-outline-variant/20">
                <button 
                  onClick={() => setAppTab("cargas")}
                  className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition ${
                    appTab === "cargas" ? "bg-[#FCA311] text-[#0c132b]" : "bg-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  CARGAS
                </button>
                <button 
                  onClick={() => setAppTab("gestor")}
                  className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition ${
                    appTab === "gestor" ? "bg-[#FCA311] text-[#0c132b]" : "bg-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  GESTOR
                </button>
              </div>
            </div>

            {appTab === "cargas" && (
              <div className="space-y-4">
                <div className="bg-[#0c132b] border border-outline-variant/10 rounded-lg p-3">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CALL BOX VIRTUAL</p>
                  <h4 className="text-[11px] font-bold text-white mb-3">Viagem ativa Palmas p/ Mercado São João</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">1. Checklist de Partida</span>
                      <button className="bg-[#FCA311] text-[#0c132b] text-[8px] font-black px-3 py-1 rounded uppercase hover:bg-yellow-500 transition">ENVIAR</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">2. Assinatura Teórica RUV</span>
                      <button className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded uppercase hover:bg-blue-500 transition">ASSINAR</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {appTab === "gestor" && (
              <div className="space-y-4">
                <div className="bg-[#0c132b] border border-outline-variant/10 rounded-lg p-3">
                  <p className="text-[8px] font-bold text-[#FCA311] uppercase tracking-widest mb-2">RUV PENDENTES ONLINE</p>
                  <h4 className="text-[11px] font-bold text-[#FCA311] mb-3">RUV Pendentes para aprovação:</h4>
                  {RUVS.map(ruv => (
                    <div key={ruv.id} className="bg-[#0F172A] border border-outline-variant/10 rounded-lg p-3 mb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-white">{ruv.id}</p>
                          <p className="text-[9px] text-slate-400">{ruv.route}</p>
                          <p className="text-[8px] text-slate-500 font-mono">(SP)</p>
                        </div>
                        <button className="bg-[#FCA311] text-[#0c132b] text-[8px] font-black px-4 py-1.5 rounded uppercase hover:bg-yellow-500 transition">APROVAR</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────── CCO Notification Toasts ──────── */}
      {showNotifs && visibleNotifs.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-[320px]">
          {visibleNotifs.map(n => (
            <div key={n.id} className="bg-[#111827] border border-outline-variant/20 rounded-xl p-4 shadow-2xl relative animate-in slide-in-from-right">
              <button 
                onClick={() => dismissNotif(n.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-white transition"
              >
                <Icon name="close" className="text-xs" />
              </button>
              <p className="text-[9px] font-black text-error uppercase tracking-widest mb-1">AVISO DO CCO</p>
              <p className="text-[9px] text-slate-300 leading-relaxed pr-4">{n.msg}</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
