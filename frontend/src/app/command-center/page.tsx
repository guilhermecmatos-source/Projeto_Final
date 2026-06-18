"use client";

import { useEffect, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

/* ── Feed log data ── */
const INITIAL_FEED_LOGS = [
  { time: "23:46:54", severity: "SUCCESS", color: "text-green-400", msg: "Pacote de telemetria de precisão Palmas, TO recebido sem perdas." },
  { time: "23:46:37", severity: "SUCCESS", color: "text-green-400", msg: "Ana Lima check-in concluído via APP Simulado." },
  { time: "23:46:24", severity: "INFO", color: "text-blue-400", msg: "Atualização de coordenadas GPS [Carlos Silva] registrada – Av. MS-15." },
  { time: "23:46:20", severity: "CRITICAL", color: "text-error", msg: "Alerta Contrato Vencendo – Aviso de expiração do plano de seguros de frota co..." },
];

/* ── Alert pills ── */
const ALERT_TYPES = [
  { label: "PARADO", color: "bg-error text-white" },
  { label: "CONSUMO", color: "bg-blue-600 text-white" },
  { label: "ATRASO", color: "bg-[#FCA311] text-[#0c132b]" },
  { label: "DESVIO", color: "bg-green-600 text-white" },
];

/* ── CCO Notifications ── */
const INITIAL_NOTIFICATIONS = [
  { id: 1, msg: "[FleetAI Intelligence] Alerta Preditivo de Segurança disparado para AIK-12340 O evento foi listado no log geral." },
];

const INITIAL_DRIVERS = [
  { id: "d1", name: "Carlos Silva", vehicle: "Moto Honda CG • ABC-1234", destination: "Mercado São João", lat: -10.174545, lng: -48.330296, status: "EM ROTA", avatar: "C", color: "#3B82F6", progress: 65 },
  { id: "d2", name: "Ana Lima", vehicle: "Cargo Bike • ---", destination: "Mercado Central", lat: -10.198121, lng: -48.349228, status: "DISPONÍVEL", avatar: "A", color: "#F59E0B", progress: 0 },
  { id: "d3", name: "Roberto Santos", vehicle: "Fiat Uno • DEF-5678", destination: "", lat: -10.195000, lng: -48.325000, status: "CONCLUÍDO", avatar: "R", color: "#10B981", progress: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  "EM ROTA": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "DISPONÍVEL": "bg-green-500/20 text-green-400 border-green-500/30",
  "CONCLUÍDO": "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function CommandCenterPage() {
  const [appTab, setAppTab] = useState<"cargas" | "gestor">("cargas");
  const [showNotifs, setShowNotifs] = useState(true);
  const [dismissedNotifs, setDismissedNotifs] = useState<number[]>([]);
  
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState(INITIAL_DRIVERS[0]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [activeNotifications, setActiveNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeLogs, setActiveLogs] = useState(INITIAL_FEED_LOGS);

  const [pings, setPings] = useState<string[]>([
    "PING packet recebido! Palmas nodes [23...",
    "PING packet recebido! Palmas nodes [23...",
  ]);

  // Simulate Telemetry PINGs
  useEffect(() => {
    const interval = setInterval(() => {
      setPings(prev => [`PING packet recebido! Palmas nodes [${Math.floor(Math.random() * 99)}...`, ...prev.slice(0, 2)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate Driver Movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === "EM ROTA") {
          const latJitter = (Math.random() - 0.5) * 0.0005;
          const lngJitter = (Math.random() - 0.5) * 0.0005;
          const newLat = d.lat + latJitter;
          const newLng = d.lng + lngJitter;
          const newProg = Math.min(100, d.progress + Math.random() * 2);
          
          // Update Marker physically
          if (markersRef.current[d.id]) {
            markersRef.current[d.id].setLatLng([newLat, newLng]);
          }

          if (selectedDriver.id === d.id) {
            setSelectedDriver(prevSel => ({...prevSel, lat: newLat, lng: newLng, progress: newProg}));
          }

          return { ...d, lat: newLat, lng: newLng, progress: newProg };
        }
        return d;
      }));
    }, 3000);
    return () => clearInterval(moveInterval);
  }, [selectedDriver.id]);

  // LEAFLET INITIALIZATION
  useEffect(() => {
    let L: any;
    let mapObserver: ResizeObserver;

    const initMap = async () => {
      if (!document.getElementById("leaflet-cdn-css-dash")) {
        const link = document.createElement("link");
        link.id = "leaflet-cdn-css-dash";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      L = (await import("leaflet")).default;
      if (!mapRef.current || mapInstance.current) return;
      
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([-10.1843, -48.3338], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 18 }).addTo(map);
      mapInstance.current = map;

      // Add driver markers
      drivers.forEach(dr => {
        const icon = L.divIcon({
          html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white" style="background-color: ${dr.color}">${dr.avatar}</div>`,
          className: "", iconSize: [32, 32], iconAnchor: [16, 16],
        });
        const marker = L.marker([dr.lat, dr.lng], { icon }).addTo(map);
        marker.bindPopup(`<div class="p-2 bg-[#111827] text-white rounded"><b class="text-sm">${dr.name}</b><br/><span class="text-[10px] text-slate-300">${dr.vehicle}</span></div>`);
        markersRef.current[dr.id] = marker;
      });

      // Resize observer to auto-invalidate size
      mapObserver = new ResizeObserver(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      });
      if (mapRef.current) mapObserver.observe(mapRef.current);
      
      setTimeout(() => { map.invalidateSize(); }, 300);
    };

    initMap();
    
    return () => {
      if (mapObserver && mapRef.current) mapObserver.unobserve(mapRef.current);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncDeviceCoords = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const L = (await import("leaflet")).default;
          if (mapInstance.current) {
            const managerIcon = L.divIcon({
              html: `<div class="w-8 h-8 rounded-full bg-error border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white" style="animation: pulse 2s infinite;">★</div>`,
              className: "", iconSize: [32, 32], iconAnchor: [16, 16],
            });
            const marker = L.marker([latitude, longitude], { icon: managerIcon }).addTo(mapInstance.current);
            marker.bindPopup(`<div class="p-2 bg-slate-900 text-white rounded text-[10px] font-bold"><b class="text-error">📍 Seu Local</b></div>`).openPopup();
            mapInstance.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
          }
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const dispatchOperationalAlert = (riskType: string) => {
    const alertId = Date.now();
    setActiveNotifications(prev => [{ id: alertId, msg: `[Intelligence] Alerta de Segurança (${riskType}) disparado em área crítica.` }, ...prev]);
    setActiveLogs(prev => [{ time: new Date().toLocaleTimeString("pt-BR", { hour12: false }), severity: "CRITICAL", color: "text-error", msg: `Alerta: ${riskType} – Acionamento emergencial.` }, ...prev]);
  };

  const visibleNotifs = activeNotifications.filter(n => !dismissedNotifs.includes(n.id));

  return (
    <AppShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase text-[#FCA311] tracking-widest mb-1">
            SEDE CENTRAL / UNIDADE OPERACIONAL
          </p>
          <h1 className="text-2xl font-black text-white tracking-wide">Command Center</h1>
          <p className="text-[11px] text-slate-400 font-medium">GPS OpenStreetMap — Atualiza a cada 3s</p>
        </div>
        <button 
          onClick={handleSyncDeviceCoords}
          className="flex items-center gap-2 rounded-full bg-error/20 border border-error/30 hover:bg-error/30 px-4 py-2 text-[10px] font-bold text-error transition"
        >
          <Icon name="my_location" className="text-sm" /> Usar Meu GPS
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div className="xl:col-span-3 relative rounded-2xl overflow-hidden border border-outline-variant/20 bg-[#0c132b] h-[450px]">
          <div ref={mapRef} style={{ width: "100%", height: "100%", position: "absolute", zIndex: 0 }} />
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
            <button onClick={() => mapInstance.current?.zoomIn()} className="w-8 h-8 rounded bg-white/90 text-slate-700 shadow font-bold text-lg flex items-center justify-center hover:bg-white">+</button>
            <button onClick={() => mapInstance.current?.zoomOut()} className="w-8 h-8 rounded bg-white/90 text-slate-700 shadow font-bold text-lg flex items-center justify-center hover:bg-white">−</button>
          </div>
          <div className="absolute bottom-4 left-4 z-10 bg-error/10 border border-error/30 rounded-lg p-3 max-w-[260px] backdrop-blur-sm">
            <p className="text-[8px] font-bold text-error uppercase tracking-widest mb-1">RASTREAMENTO EM TRANSMISSÃO</p>
            {pings.map((p, i) => <p key={i} className="text-[8px] font-mono text-slate-400 truncate">{p}</p>)}
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[450px] custom-scrollbar pr-2">
          {drivers.map((d) => (
            <div 
              key={d.id} 
              className={`rounded-xl border p-4 cursor-pointer transition ${selectedDriver?.id === d.id ? "bg-[#0c132b] border-primary/50 shadow-[0_0_15px_rgba(255,159,0,0.1)]" : "bg-[#0c132b]/80 border-outline-variant/20 hover:border-primary/30"}`}
              onClick={() => {
                setSelectedDriver(d);
                if (mapInstance.current) mapInstance.current.flyTo([d.lat, d.lng], 15, { duration: 1.2 });
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 border-2 border-white/20" style={{ backgroundColor: d.color }}>{d.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-white truncate">{d.name}</h4>
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                  </div>
                  <p className="text-[9px] text-slate-400">{d.vehicle}</p>
                </div>
              </div>
              <div className="space-y-1 bg-[#0F172A] p-2 rounded-lg mb-2">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">COORDENADAS</p>
                <p className="text-[10px] font-mono text-slate-300">{d.lat.toFixed(5)}°, {d.lng.toFixed(5)}°</p>
              </div>
              {d.progress > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${d.progress}%` }}></div>
                  </div>
                  <span className="text-[9px] font-black text-blue-400">{Math.round(d.progress)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="raised-card bg-[#0c132b]/80 border-outline-variant/30 rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Icon name="settings" className="text-primary text-xl" /></div>
            <div>
              <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">PAINEL INTEGRADO DE TELEMETRIA</h3>
              <p className="text-[9px] text-slate-400 font-medium">Dispare alarmes analíticos preditivos para testar redundâncias de segurança.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#0F172A] p-2 rounded-xl border border-outline-variant/10">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mx-2">SIMULAR ALERTA:</span>
            {ALERT_TYPES.map(a => (
              <button key={a.label} onClick={() => dispatchOperationalAlert(a.label)} className={`${a.color} text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider hover:opacity-80 transition`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4 max-h-[300px] flex flex-col">
            <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1">
              <Icon name="terminal" className="text-[11px]" /> FEED LOGÍSTICO EM TEMPO REAL
            </h4>
            <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-2">
              {activeLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[9px] py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-500 font-mono shrink-0">[{log.time}]</span>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shrink-0 ${log.severity === "CRITICAL" ? "bg-error/20 text-error" : log.severity === "SUCCESS" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>{log.severity}</span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-outline-variant/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                <Icon name="smartphone" className="text-[11px]" /> APP MOTORISTA EMULADO
              </h4>
              <div className="flex rounded-lg overflow-hidden border border-outline-variant/20 bg-[#0c132b]">
                <button onClick={() => setAppTab("cargas")} className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition ${appTab === "cargas" ? "bg-primary text-on-primary" : "text-slate-400 hover:text-white"}`}>CARGAS</button>
                <button onClick={() => setAppTab("gestor")} className={`px-3 py-1 text-[8px] font-bold uppercase tracking-wider transition ${appTab === "gestor" ? "bg-primary text-on-primary" : "text-slate-400 hover:text-white"}`}>GESTOR</button>
              </div>
            </div>
            
            {appTab === "cargas" ? (
              <div className="bg-[#0c132b] border border-outline-variant/10 rounded-lg p-4">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">CALL BOX VIRTUAL</p>
                <h4 className="text-[11px] font-bold text-white mb-4">Viagem ativa Palmas p/ Mercado São João</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-surface-container-high p-2 rounded">
                    <span className="text-[10px] text-slate-300 font-bold">1. Checklist de Partida</span>
                    <button className="bg-primary text-on-primary text-[8px] font-black px-3 py-1 rounded hover:opacity-90 transition">ENVIAR</button>
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-high p-2 rounded">
                    <span className="text-[10px] text-slate-300 font-bold">2. Assinatura Teórica RUV</span>
                    <button className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded hover:opacity-90 transition">ASSINAR</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0c132b] border border-outline-variant/10 rounded-lg p-4">
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-2">RUV PENDENTES</p>
                <div className="bg-[#0F172A] border border-outline-variant/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white">RUV-0412</p>
                      <p className="text-[9px] text-slate-400">Rota SP – SJC</p>
                    </div>
                    <button className="bg-primary text-on-primary text-[8px] font-black px-4 py-1.5 rounded hover:opacity-90 transition">APROVAR</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifs && visibleNotifs.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-[320px]">
          {visibleNotifs.map(n => (
            <div key={n.id} className="bg-[#111827] border border-outline-variant/20 rounded-xl p-4 shadow-2xl relative animate-in slide-in-from-right">
              <button onClick={() => dismissNotif(n.id)} className="absolute top-2 right-2 text-slate-500 hover:text-white transition">
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
