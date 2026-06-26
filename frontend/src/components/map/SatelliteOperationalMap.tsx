"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

interface DriverMarker {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  vehicle: string;
  plate: string;
  destination: string;
  origin: string;
  status: "EM ROTA" | "DISPONÍVEL" | "CONCLUÍDO";
  color: string;
  bgColor: string;
  statusIcon: string;
}

const PALMAS_DRIVERS: DriverMarker[] = [
  {
    id: "carlos",
    name: "Carlos Silva",
    shortName: "CS",
    lat: -10.184,
    lng: -48.370,
    vehicle: "Moto Honda CE",
    plate: "ABC-2234",
    origin: "Garagem Central Palmas",
    destination: "Mercado São João (Aureny I)",
    status: "EM ROTA",
    color: "#22c55e",
    bgColor: "#16a34a",
    statusIcon: "🟢",
  },
  {
    id: "ana",
    name: "Ana Lima",
    shortName: "AL",
    lat: -10.161,
    lng: -48.344,
    vehicle: "Cargo Bike",
    plate: "—",
    origin: "Ponto de Coleta Norte",
    destination: "Mercado Municipal Central",
    status: "DISPONÍVEL",
    color: "#f59e0b",
    bgColor: "#d97706",
    statusIcon: "🟡",
  },
  {
    id: "roberto",
    name: "Roberto Souza",
    shortName: "RS",
    lat: -10.215,
    lng: -48.360,
    vehicle: "Caminhão",
    plate: "DEF-5678",
    origin: "Depot",
    destination: "Entregue",
    status: "CONCLUÍDO",
    color: "#94a3b8",
    bgColor: "#64748b",
    statusIcon: "🔵",
  },
];

/** Guard: retorna true somente se lat/lng são números finitos e não-NaN */
function isValidCoord(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    !isNaN(lat) && !isNaN(lng) &&
    isFinite(lat) && isFinite(lng)
  );
}

export default function SatelliteOperationalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const hasCentered = useRef(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [ready, setReady] = useState(false);

  // Simulated movement offsets for drivers
  const offsetsRef = useRef({ carlos: 0, ana: 0, roberto: 0 });

  useEffect(() => {
    let cancelled = false;
    let mapObserver: ResizeObserver;
    const capturedMapEl = mapRef.current;

    const ensureCss = (): Promise<void> => {
      return new Promise((resolve) => {
        const existing = document.getElementById("leaflet-cdn-css-dash") as HTMLLinkElement | null;
        if (existing) {
          if (existing.sheet) { resolve(); return; }
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const link = document.createElement("link");
        link.id = "leaflet-cdn-css-dash";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
        link.onload = () => resolve();
        document.head.appendChild(link);
      });
    };

    async function initMap() {
      await ensureCss();
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-10.184, -48.355],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Satellite tile layer (Esri World Imagery — free, no API key needed)
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri",
        }
      );

      // Satellite labels overlay (Esri Reference Overlay — road names, city names on top of satellite)
      const labelsLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          pane: "overlayPane",
        }
      );

      satelliteLayer.addTo(map);
      labelsLayer.addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      // Custom dark popup styling
      const popupStyle = `
        font-family: 'Inter', system-ui, sans-serif;
        min-width: 220px;
        color: #e2e8f0;
        background: #0c132b;
        border-radius: 12px;
        padding: 12px 14px;
        border: 1px solid rgba(255,255,255,0.1);
      `;

      // Add driver markers with pulse animation
      PALMAS_DRIVERS.forEach((d) => {
        if (!isValidCoord(d.lat, d.lng)) return;

        const isActive = d.status === "EM ROTA";
        const pulseRing = isActive
          ? `<div style="
              position:absolute; top:50%; left:50%;
              transform:translate(-50%,-50%);
              width:44px; height:44px;
              border-radius:50%;
              border:2px solid ${d.color};
              opacity:0.5;
              animation: pulse-ring 2s ease-out infinite;
            "></div>`
          : "";

        const markerHtml = `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            ${pulseRing}
            <div style="
              background: linear-gradient(135deg, ${d.bgColor}, ${d.color});
              color: white;
              font-size: 10px;
              font-weight: 800;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2.5px solid white;
              box-shadow: 0 3px 12px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              letter-spacing: 0.03em;
              position: relative;
              z-index: 2;
            ">
              ${d.shortName}
            </div>
            <div style="
              position:absolute;
              bottom:-6px;
              left:50%;
              transform:translateX(-50%);
              width:0; height:0;
              border-left:5px solid transparent;
              border-right:5px solid transparent;
              border-top:6px solid white;
              z-index:2;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          className: "",
          html: markerHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 38],
        });

        const statusBadge =
          d.status === "EM ROTA"
            ? '<span style="color:#22c55e;font-size:9px;font-weight:800;">● EM ROTA</span>'
            : d.status === "DISPONÍVEL"
            ? '<span style="color:#f59e0b;font-size:9px;font-weight:800;">● DISPONÍVEL</span>'
            : '<span style="color:#60a5fa;font-size:9px;font-weight:800;">● CONCLUÍDO</span>';

        const popupContent = `
          <div style="${popupStyle}">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <div style="
                width:28px; height:28px; border-radius:50%;
                background:linear-gradient(135deg, ${d.bgColor}, ${d.color});
                display:flex; align-items:center; justify-content:center;
                color:white; font-weight:800; font-size:9px;
                border:2px solid rgba(255,255,255,0.2);
              ">${d.shortName}</div>
              <div>
                <p style="font-weight:800;font-size:11px;margin:0;color:white;">${d.name}</p>
                <p style="font-size:9px;color:#94a3b8;margin:0;">${d.vehicle} • ${d.plate}</p>
              </div>
            </div>
            <div style="margin-bottom:6px;">${statusBadge}</div>
            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
              <p style="font-size:9px;color:#64748b;margin:0 0 2px;text-transform:uppercase;font-weight:700;">Origem</p>
              <p style="font-size:10px;margin:0 0 6px;color:#cbd5e1;">${d.origin}</p>
              <p style="font-size:9px;color:#64748b;margin:0 0 2px;text-transform:uppercase;font-weight:700;">Destino</p>
              <p style="font-size:10px;margin:0 0 6px;color:#FCA311;font-weight:700;">${d.destination}</p>
              <p style="font-size:8px;color:#475569;margin:0;font-family:monospace;">
                ${d.lat.toFixed(6)}, ${d.lng.toFixed(6)}
              </p>
            </div>
          </div>
        `;

        const marker = L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent, {
            className: "dark-popup",
            closeButton: true,
            maxWidth: 260,
          });

        markersRef.current.push(marker);
      });

      // Inject the pulse animation CSS and dark popup override
      if (!document.getElementById("map-pulse-css")) {
        const style = document.createElement("style");
        style.id = "map-pulse-css";
        style.textContent = `
          @keyframes pulse-ring {
            0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; }
            100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
          }
          .dark-popup .leaflet-popup-content-wrapper {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            border-radius: 12px !important;
          }
          .dark-popup .leaflet-popup-content {
            margin: 0 !important;
          }
          .dark-popup .leaflet-popup-tip {
            background: #0c132b !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
          }
          .dark-popup .leaflet-popup-close-button {
            color: #94a3b8 !important;
            top: 6px !important;
            right: 6px !important;
            font-size: 16px !important;
          }
          .dark-popup .leaflet-popup-close-button:hover {
            color: white !important;
          }
        `;
        document.head.appendChild(style);
      }

      mapObserver = new ResizeObserver(() => {
        if (mapInstance.current) mapInstance.current.invalidateSize();
      });
      if (capturedMapEl) mapObserver.observe(capturedMapEl);

      mapInstance.current = map;
      setReady(true);

      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 600);
      setTimeout(() => map.invalidateSize(), 1500);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapObserver && capturedMapEl) mapObserver.unobserve(capturedMapEl);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // GPS watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocalização não suportada");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isValidCoord(latitude, longitude)) return;
        setGps({ lat: latitude, lng: longitude });
        setGpsError("");
        if (mapInstance.current && !hasCentered.current) {
          hasCentered.current = true;
          import("leaflet").then(({ default: L }) => {
            if (!mapInstance.current) return;
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            } else {
              const userHtml = `
                <div style="position:relative; display:flex; align-items:center; justify-content:center;">
                  <div style="
                    position:absolute; width:28px; height:28px;
                    border-radius:50%; background:rgba(59,130,246,0.3);
                    animation: pulse-ring 2s ease-out infinite;
                  "></div>
                  <div style="
                    width:14px; height:14px; border-radius:50%;
                    background:#3b82f6; border:3px solid white;
                    box-shadow:0 2px 8px rgba(59,130,246,0.6);
                    position:relative; z-index:2;
                  "></div>
                </div>
              `;
              userMarkerRef.current = L.marker([latitude, longitude], {
                icon: L.divIcon({
                  className: "",
                  html: userHtml,
                  iconSize: [28, 28],
                  iconAnchor: [14, 14],
                }),
              })
                .addTo(mapInstance.current)
                .bindPopup(`
                  <div style="font-family:sans-serif;color:#0c132b;padding:4px;">
                    <p style="font-weight:800;font-size:11px;margin:0;">Sua localização</p>
                    <p style="font-size:9px;color:#666;margin:2px 0 0;">GPS em tempo real</p>
                  </div>
                `);
            }
          });
        }
      },
      () => setGpsError("GPS indisponível"),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [ready]);

  // Simulate minor drift for Carlos and Ana to feel "live"
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      import("leaflet").then(() => {
        if (!mapInstance.current) return;
        const carlosMarker = markersRef.current[0];
        const anaMarker = markersRef.current[1];

        if (carlosMarker) {
          const base = PALMAS_DRIVERS[0];
          offsetsRef.current.carlos += 0.0001;
          const newLat = base.lat + Math.sin(offsetsRef.current.carlos) * 0.002;
          const newLng = base.lng + Math.cos(offsetsRef.current.carlos) * 0.002;
          if (isValidCoord(newLat, newLng)) {
            carlosMarker.setLatLng([newLat, newLng]);
          }
        }
        if (anaMarker) {
          const base = PALMAS_DRIVERS[1];
          offsetsRef.current.ana += 0.00005;
          const newLat = base.lat + Math.sin(offsetsRef.current.ana) * 0.001;
          const newLng = base.lng + Math.cos(offsetsRef.current.ana) * 0.0015;
          if (isValidCoord(newLat, newLng)) {
            anaMarker.setLatLng([newLat, newLng]);
          }
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [ready]);

  const handleCenterPalmas = () => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([-10.184, -48.355], 13, { duration: 1.2 });
    }
  };

  const handleCenterUser = () => {
    if (mapInstance.current && gps) {
      mapInstance.current.flyTo([gps.lat, gps.lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="relative">
      {/* Top-right map controls */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5">
        <button
          onClick={handleCenterPalmas}
          title="Centralizar em Palmas"
          className="w-8 h-8 rounded-lg bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/90 transition shadow-lg"
        >
          <Icon name="my_location" className="text-sm" />
        </button>
        {gps && (
          <button
            onClick={handleCenterUser}
            title="Ir para sua localização"
            className="w-8 h-8 rounded-lg bg-blue-600/80 backdrop-blur border border-blue-400/30 flex items-center justify-center text-white hover:bg-blue-600 transition shadow-lg"
          >
            <Icon name="person_pin_circle" className="text-sm" />
          </button>
        )}
      </div>

      {/* GPS Badge */}
      <div className="absolute left-3 bottom-4 z-[500] flex flex-col gap-0.5 rounded-lg bg-black/75 px-3 py-2 text-[9px] text-white backdrop-blur shadow-lg border border-white/5">
        <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          RASTREAMENTO SATELITAL ATIVO
        </span>
        <span className="text-slate-400">Cobertura: Palmas, TO — Satélite HD</span>
        {gps && (
          <span className="text-green-400 font-mono text-[8px]">
            GPS: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
          </span>
        )}
        {gpsError && <span className="text-amber-400 text-[8px]">{gpsError}</span>}
      </div>

      {/* Driver legend */}
      <div className="absolute right-3 bottom-4 z-[500] rounded-lg bg-black/75 backdrop-blur px-3 py-2 shadow-lg border border-white/5">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Motoristas</p>
        <div className="space-y-1">
          {PALMAS_DRIVERS.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/30"
                style={{ background: d.color }}
              />
              <span className="text-[9px] text-slate-300 font-bold">{d.shortName}</span>
              <span className="text-[8px] text-slate-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map canvas */}
      <div ref={mapRef} className="w-full overflow-hidden h-[340px]" />
    </div>
  );
}
