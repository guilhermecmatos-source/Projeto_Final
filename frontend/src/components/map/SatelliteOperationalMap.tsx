"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import * as L from "leaflet";

interface DriverMarker {
  id: string;
  plate: string;
  driverName: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
  status: "trânsito" | "estacionado" | "alerta";
  origin: [number, number];
  destination: [number, number];
  originName: string;
  destinationName: string;
}

const FLEET_VEHICLES: VehicleMarker[] = [
  {
    id: "1",
    plate: "ABC-1234",
    driverName: "Roberto Alencar",
    lat: -10.184319,
    lng: -48.333798,
    speed: 62,
    heading: "Palmas → Gurupi",
    status: "trânsito",
    origin: [-10.184319, -48.333798],
    destination: [-10.2800, -48.3800],
    originName: "Terminal Rodoviário Palmas (Carregamento)",
    destinationName: "Posto Fiscal de Gurupi (Entrega)",
  },
  {
    id: "2",
    plate: "DEF-5678",
    driverName: "Ana Maria",
    lat: -10.212,
    lng: -48.360,
    speed: 0,
    heading: "Araguaína → Palmas",
    status: "estacionado",
    origin: [-10.1500, -48.3500],
    destination: [-10.212, -48.360],
    originName: "Distribuidora Araguaína (Carregamento)",
    destinationName: "Porto Seco Palmas (Entrega)",
  },
  {
    id: "3",
    plate: "GHI-9012",
    driverName: "Carlos Eduardo",
    lat: -10.170,
    lng: -48.310,
    speed: 48,
    heading: "Hub Palmas",
    status: "alerta",
    origin: [-10.1100, -48.2900],
    destination: [-10.170, -48.310],
    originName: "CD Central Palmas (Carregamento)",
    destinationName: "Hub Logístico Palmas (Entrega)",
  },
];

const FUEL_STATIONS = [
  {
    name: "Posto Rota Norte",
    lat: -10.180,
    lng: -48.315,
    dieselPrice: "R$ 5,84/L",
    transaction: "Última transação: R$ 350,00 por Roberto Alencar",
  },
  {
    name: "Posto Tocantins",
    lat: -10.205,
    lng: -48.355,
    dieselPrice: "R$ 5,79/L",
    transaction: "Última transação: R$ 410,00 por Ana Maria",
  },
];

const ALERT_ZONES = [
  {
    title: "Obras na BR-153",
    lat: -10.195,
    lng: -48.328,
    type: "obras",
    description: "Pista única, fluxo lento.",
  },
  {
    title: "Chuva Forte",
    lat: -10.225,
    lng: -48.375,
    type: "chuva",
    description: "Visibilidade reduzida, pista escorregadia.",
  },
];

const WORKSHOPS = [
  {
    name: "Oficina Car Valle",
    lat: -10.190,
    lng: -48.350,
    specialty: "Freios e Suspensão Pesada",
    hash: "8f4b1d3c2e6a7f8090b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
  },
  {
    name: "Palmas Diesel",
    lat: -10.172,
    lng: -48.305,
    specialty: "Injeção Eletrônica e Motores",
    hash: "2e6a7f8090b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f38f4b1d3c",
  },
];

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SatelliteOperationalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasCentered = useRef(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [ready, setReady] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverMarker | null>(null);

  // Simulated movement offsets for drivers
  const offsetsRef = useRef({ carlos: 0, ana: 0, roberto: 0 });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      // Palmas coordinate center
      const map = L.map(mapRef.current, {
        center: [-10.184319, -48.333798],
        zoom: 12,
        zoomControl: false,
      });

      // Estilização Premium Voyager / Dark Matter of CartoDB to minimize eye fatigue
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      L.control.zoom({ position: "topleft" }).addTo(map);

      // Render support points on load
      // 1. Fuel stations (Green pins)
      const fuelIcon = L.divIcon({
        className: "",
        html: `
          <div style="background:#065f46;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #34d399;box-shadow:0 2px 5px rgba(0,0,0,0.4)">
            <span class="material-symbols-outlined" style="font-size:16px;color:#34d399">local_gas_station</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      FUEL_STATIONS.forEach((st) => {
        L.marker([st.lat, st.lng], { icon: fuelIcon })
          .bindPopup(
            `<b>Posto Conveniado: ${st.name}</b><br/>Preço Diesel: <b>${st.dieselPrice}</b><br/>${st.transaction}`
          )
          .addTo(map);
      });

      // 2. Alert Zones (Red pins)
      const alertIcon = L.divIcon({
        className: "",
        html: `
          <div style="background:#991b1b;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #f87171;box-shadow:0 2px 5px rgba(0,0,0,0.4)">
            <span class="material-symbols-outlined" style="font-size:16px;color:#f87171">warning</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      ALERT_ZONES.forEach((al) => {
        L.marker([al.lat, al.lng], { icon: alertIcon })
          .bindPopup(
            `<b style="color:#f87171">ZONA DE ALERTA: ${al.title}</b><br/>${al.description}`
          )
          .addTo(map);
      });

      // 3. Workshops (Blue/Orange pins)
      const workshopIcon = L.divIcon({
        className: "",
        html: `
          <div style="background:#1e3a8a;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #60a5fa;box-shadow:0 2px 5px rgba(0,0,0,0.4)">
            <span class="material-symbols-outlined" style="font-size:16px;color:#60a5fa">build</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      WORKSHOPS.forEach((ws) => {
        L.marker([ws.lat, ws.lng], { icon: workshopIcon })
          .bindPopup(
            `<b>Oficina Credenciada: ${ws.name}</b><br/>Especialidade: ${ws.specialty}<br/><span style="font-size:9px;color:#94a3b8;word-break:break-all">Ledger SHA-256: ${ws.hash.substring(0, 16)}...</span>`
          )
          .addTo(map);
      });

      // Render routes, pins (Start/End) and Vehicle Markers
      FLEET_VEHICLES.forEach((v) => {
        // Polyline connecting origin and destination
        L.polyline([v.origin, v.destination], {
          color:
            v.status === "trânsito"
              ? "#3b82f6"
              : v.status === "estacionado"
              ? "#10b981"
              : "#f59e0b",
          weight: 3.5,
          opacity: 0.7,
          dashArray: "6, 8",
        }).addTo(map);

        // Start marker (Carregamento)
        const startIcon = L.divIcon({
          className: "",
          html: `
            <div style="background:#1e293b;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #10b981;box-shadow:0 1px 5px rgba(0,0,0,0.4)">
              <span style="color:#10b981;font-size:10px;font-weight:bold;">A</span>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker(v.origin, { icon: startIcon })
          .bindPopup(`<b>Carregamento (Início)</b><br/>${v.originName}`)
          .addTo(map);

        // End marker (Entrega)
        const endIcon = L.divIcon({
          className: "",
          html: `
            <div style="background:#1e293b;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #ef4444;box-shadow:0 1px 5px rgba(0,0,0,0.4)">
              <span style="color:#ef4444;font-size:10px;font-weight:bold;">B</span>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker(v.destination, { icon: endIcon })
          .bindPopup(`<b>Entrega (Fim)</b><br/>${v.destinationName}`)
          .addTo(map);

        // Vehicle marker
        let iconBg = "#3b82f6";
        let pulseClass = "pulse-blue-ring";
        if (v.status === "estacionado") {
          iconBg = "#10b981";
          pulseClass = "pulse-green-ring";
        } else if (v.status === "alerta") {
          iconBg = "#f59e0b";
          pulseClass = "pulse-amber-ring";
        }

        const truckIcon = L.divIcon({
          className: "",
          html: `
            <div class="${pulseClass}" style="background:${iconBg};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.5)">
              <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:#fff" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zm-1.5-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const m = L.marker([v.lat, v.lng], { icon: truckIcon })
          .bindPopup(
            `<b>Motorista: ${v.driverName}</b><br/>Placa: ${v.plate}<br/>Velocidade: ${v.speed} km/h<br/>Status: <b>${v.status.toUpperCase()}</b><br/>Rota: ${v.heading}`
          )
          .addTo(map);

        markersRef.current[v.id] = m;
      });

      mapInstance.current = map;
      setReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markersRef.current = {};
    };
  }, []);

  // Sync / simulated manager location (CCO Geolocator)
  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    let watchId: number | null = null;

    async function initUserLocation() {
      const L = (await import("leaflet")).default;

      const managerIcon = L.divIcon({
        className: "",
        html: `
          <div style="background:#581c87;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #c084fc;box-shadow:0 0 10px #c084fc">
            <span class="material-symbols-outlined" style="font-size:18px;color:#c084fc">shield_person</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      if (!navigator.geolocation) {
        setGpsError("Geolocalização não suportada");
        // Fallback simulation near Palmas CCO Center
        const fallbackLat = -10.1800;
        const fallbackLng = -48.3400;
        setGps({ lat: fallbackLat, lng: fallbackLng });
        userMarkerRef.current = L.marker([fallbackLat, fallbackLng], {
          icon: managerIcon,
        })
          .addTo(mapInstance.current!)
          .bindPopup("CCO: Sua Localização (Simulada)");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setGps({ lat: latitude, lng: longitude });
          setGpsError("");

          if (mapInstance.current) {
            if (!hasCentered.current) {
              // Center near user
              mapInstance.current.setView([latitude, longitude], 12);
              hasCentered.current = true;
            }

            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            } else {
              userMarkerRef.current = L.marker([latitude, longitude], {
                icon: managerIcon,
              })
                .addTo(mapInstance.current)
                .bindPopup("CCO: Sua Localização Física");
            }
          }
        },
        () => {
          setGpsError("GPS indisponível");
          // Fallback simulation
          const fallbackLat = -10.1800;
          const fallbackLng = -48.3400;
          setGps({ lat: fallbackLat, lng: fallbackLng });
          if (mapInstance.current && !userMarkerRef.current) {
            userMarkerRef.current = L.marker([fallbackLat, fallbackLng], {
              icon: managerIcon,
            })
              .addTo(mapInstance.current)
              .bindPopup("CCO: Sua Localização (Simulada)");
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }

    initUserLocation();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [ready]);

  // Deep Link handler
  useEffect(() => {
    if (!ready || !mapInstance.current) return;

    const params = new URLSearchParams(window.location.search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    const name = params.get("name");

    if (lat && lng) {
      const targetLat = parseFloat(lat);
      const targetLng = parseFloat(lng);
      if (!isNaN(targetLat) && !isNaN(targetLng)) {
        mapInstance.current.setView([targetLat, targetLng], 15);

        import("leaflet").then(({ default: L }) => {
          if (!mapInstance.current) return;

          const highlightIcon = L.divIcon({
            className: "animate-bounce",
            html: `
              <div style="background:#ea580c;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #ffedd5;box-shadow:0 0 12px #ea580c">
                <span class="material-symbols-outlined" style="font-size:18px;color:#ffedd5">location_on</span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          L.marker([targetLat, targetLng], { icon: highlightIcon })
            .addTo(mapInstance.current)
            .bindPopup(`<b>${name || "Foco de Comando"}</b><br/>Foco direcionado do CCO`)
            .openPopup();

          // Dispatch cryptographic Ledger Toast
          const eventMsg = `Direcionamento CCO: Foco em ${name || "Oficina"} nas coordenadas [${targetLat}, ${targetLng}]`;
          sha256(eventMsg).then((hash) => {
            showToast(
              `CCO focado no estabelecimento: ${name || "Oficina"}`,
              "success",
              hash
            );
          });
        });
      }
    }
  }, [ready]);

  // Simulação de Telemetria de Trânsito em tempo real sem latência
  useEffect(() => {
    const id = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === "estacionado") return v; // Keep parked vehicle static

          const latDiff = (Math.random() - 0.5) * 0.0012;
          const lngDiff = (Math.random() - 0.5) * 0.0012;
          const nextSpeed = Math.round(
            Math.max(30, Math.min(88, v.speed + (Math.random() - 0.5) * 8))
          );

          return {
            ...v,
            lat: v.lat + latDiff,
            lng: v.lng + lngDiff,
            speed: nextSpeed,
          };
        })
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Update vehicle markers on state change
  useEffect(() => {
    if (!mapInstance.current || !ready) return;

    vehicles.forEach((v) => {
      const marker = markersRef.current[v.id];
      if (marker) {
        marker.setLatLng([v.lat, v.lng]);
        marker.setPopupContent(
          `<b>Motorista: ${v.driverName}</b><br/>Placa: ${v.plate}<br/>Velocidade: ${v.speed} km/h<br/>Status: <b>${v.status.toUpperCase()}</b><br/>Rota: ${v.heading}`
        );
      }
    });
  }, [vehicles, ready]);

  // Ledger Audit report generator
  const handleGenerateAuditReport = async () => {
    const timestamp = new Date().toISOString();
    const dataString = `CCO_REPORT|${timestamp}|${vehicles
      .map((v) => `${v.plate}:${v.lat.toFixed(5)},${v.lng.toFixed(5)}`)
      .join(";")}`;
    const hash = await sha256(dataString);
    showToast(
      "Relatório de Auditoria CCO assinado e armazenado no Ledger!",
      "success",
      hash
    );
  };

  return (
    <div className="relative">
      {/* Pulse simulation styles injected */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marker-pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes marker-pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes marker-pulse-amber {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .pulse-blue-ring { animation: marker-pulse-blue 2s infinite; }
        .pulse-green-ring { animation: marker-pulse-green 2s infinite; }
        .pulse-amber-ring { animation: marker-pulse-amber 2s infinite; }
      `,
        }}
      />

      <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1 rounded-lg bg-black/85 px-3 py-2 text-[10px] text-white backdrop-blur-md md:text-xs border border-white/10">
        <span className="flex items-center gap-2 font-bold text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-sm" />
          CCO MAP ACTIVE
        </span>
        {gps ? (
          <span className="font-mono text-slate-300">
            REF: LAT {gps.lat.toFixed(5)} | LNG {gps.lng.toFixed(5)}
          </span>
        ) : (
          <span className="text-slate-400">
            {gpsError || "Sincronizando CCO..."}
          </span>
        )}
      </div>

      <div className="absolute right-3 top-3 z-[500]">
        <button
          onClick={handleGenerateAuditReport}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition px-3 py-1.5 text-xs font-bold uppercase text-white shadow-lg shadow-emerald-950/20 border border-emerald-500/20"
        >
          <Icon name="verified_user" className="text-sm" />
          Assinar Auditoria Ledger
        </button>
      </div>

      <div
        ref={mapRef}
        className="h-[320px] w-full md:h-[400px] bg-[#0c0f16]"
      />

      <div className="flex flex-wrap gap-2 border-t border-outline-variant bg-surface-container-low p-3">
        {vehicles.map((v) => {
          let statusLabelColor = "text-blue-400";
          let statusText = "Em Trânsito";
          if (v.status === "estacionado") {
            statusLabelColor = "text-emerald-400";
            statusText = "Manobra / Porto";
          } else if (v.status === "alerta") {
            statusLabelColor = "text-amber-400";
            statusText = "Alerta Corretiva";
          }

          return (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-high px-2 py-1 text-[10px] md:text-xs"
            >
              <Icon name="local_shipping" className="text-primary text-sm" />
              <span className="font-bold text-slate-200">{v.plate}</span>
              <span className="text-slate-400 font-medium">
                ({v.driverName})
              </span>
              <span className="text-on-surface-variant font-mono">
                {v.heading}
              </span>
              <span className={`font-bold ${statusLabelColor}`}>
                {v.speed > 0 ? `${v.speed} km/h` : statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
