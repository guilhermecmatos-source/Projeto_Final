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
  status: "EM ROTA" | "DISPONÍVEL" | "CONCLUÍDO";
  color: string;
  bgColor: string;
}

const PALMAS_DRIVERS: DriverMarker[] = [
  {
    id: "carlos",
    name: "Carlos Silva",
    shortName: "CARLOS",
    lat: -10.184,
    lng: -48.370,
    vehicle: "Moto Honda CE",
    plate: "ABC-1234",
    destination: "Mercado São João",
    status: "EM ROTA",
    color: "#22c55e",
    bgColor: "#16a34a",
  },
  {
    id: "ana",
    name: "Ana Lima",
    shortName: "ANA",
    lat: -10.161,
    lng: -48.344,
    vehicle: "Cargo Bike",
    plate: "—",
    destination: "Mercado Central",
    status: "DISPONÍVEL",
    color: "#f59e0b",
    bgColor: "#d97706",
  },
  {
    id: "roberto",
    name: "Roberto Souza",
    shortName: "ROBERTO",
    lat: -10.215,
    lng: -48.360,
    vehicle: "Caminhão",
    plate: "DEF-5678",
    destination: "Entregue",
    status: "CONCLUÍDO",
    color: "#94a3b8",
    bgColor: "#64748b",
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
  const [selectedDriver, setSelectedDriver] = useState<DriverMarker | null>(null);

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

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "topleft" }).addTo(map);

      // Add driver markers
      PALMAS_DRIVERS.forEach((d) => {
        if (!isValidCoord(d.lat, d.lng)) return;

        const markerHtml = `
          <div style="
            background: ${d.bgColor};
            color: white;
            font-size: 9px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.4);
            white-space: nowrap;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            position: relative;
          ">
            ${d.shortName}
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${d.bgColor};
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          className: "",
          html: markerHtml,
          iconSize: [60, 26],
          iconAnchor: [30, 32],
        });

        const marker = L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px;color:#1e293b;">
              <p style="font-weight:800;font-size:11px;margin:0 0 4px">${d.name}</p>
              <p style="font-size:10px;color:#666;margin:0 0 2px">${d.vehicle} • ${d.plate}</p>
              <p style="font-size:10px;margin:0 0 4px">Destino: <b>${d.destination}</b></p>
              <p style="font-size:9px;color:#999;margin:0">Lat: ${d.lat.toFixed(6)} | Lng: ${d.lng.toFixed(6)}</p>
            </div>
          `);

        markersRef.current.push(marker);
      });

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
          // Don't re-center to user location — keep Palmas centered
          hasCentered.current = true;
          import("leaflet").then(({ default: L }) => {
            if (!mapInstance.current) return;
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
            } else {
              userMarkerRef.current = L.circleMarker([latitude, longitude], {
                radius: 8,
                color: "#22c55e",
                fillColor: "#22c55e",
                fillOpacity: 0.9,
                weight: 2,
              })
                .addTo(mapInstance.current)
                .bindPopup("Sua localização");
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
      import("leaflet").then(({ default: L }) => {
        if (!mapInstance.current) return;
        // Carlos drifts slightly
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

  const statusColor = (s: DriverMarker["status"]) => {
    if (s === "EM ROTA") return "text-green-400 bg-green-500/10 border-green-500/30";
    if (s === "DISPONÍVEL") return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-slate-400 bg-slate-500/10 border-slate-500/30";
  };

  return (
    <div className="relative">
      {/* GPS Badge */}
      <div className="absolute left-3 bottom-16 z-[500] flex flex-col gap-1 rounded-lg bg-black/75 px-3 py-2 text-[9px] text-white backdrop-blur shadow-lg">
        <span className="font-bold text-slate-300 uppercase tracking-wider">RASTREAMENTO AUTOMATIZADO</span>
        <span className="text-slate-400">Leitura abrange Palmas TO situadas</span>
        <span className="text-slate-400">nos raios: Ok (ativo)</span>
      </div>

      {/* Map canvas */}
      <div ref={mapRef} className="h-[340px] w-full overflow-hidden" />
    </div>
  );
}
