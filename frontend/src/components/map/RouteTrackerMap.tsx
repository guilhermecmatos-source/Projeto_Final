"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

export interface MapPoint {
  lat: number;
  lng: number;
  ts: number;
}

interface RouteTrackerMapProps {
  /** Centro inicial (São Paulo) */
  center?: { lat: number; lng: number };
  heightClass?: string;
  useDeviceGps?: boolean;
  showRouteChart?: boolean;
}

const SP_CENTER = { lat: -23.5505, lng: -46.6333 };

function latLngToPercent(lat: number, lng: number, center: { lat: number; lng: number }) {
  const scale = 4200;
  const x = 50 + (lng - center.lng) * scale;
  const y = 50 - (lat - center.lat) * scale;
  return {
    x: Math.max(4, Math.min(96, x)),
    y: Math.max(8, Math.min(88, y)),
  };
}

const DEMO_VEHICLES = [
  { id: "1", plate: "ABC-1234", lat: -23.55, lng: -46.63, speed: 62, heading: "SP → Curitiba" },
  { id: "2", plate: "DEF-5678", lat: -23.48, lng: -46.52, speed: 48, heading: "Campinas → Santos" },
];

export default function RouteTrackerMap({
  center = SP_CENTER,
  heightClass = "min-h-[280px] md:min-h-[360px]",
  useDeviceGps = true,
  showRouteChart = true,
}: RouteTrackerMapProps) {
  const [trail, setTrail] = useState<MapPoint[]>([]);
  const [position, setPosition] = useState<MapPoint | null>(null);
  const [vehicles, setVehicles] = useState(DEMO_VEHICLES);
  const [tick, setTick] = useState(0);
  const [gpsError, setGpsError] = useState("");
  const watchId = useRef<number | null>(null);

  const addPoint = useCallback((lat: number, lng: number) => {
    const point: MapPoint = { lat, lng, ts: Date.now() };
    setPosition(point);
    setTrail((prev) => [...prev.slice(-80), point]);
  }, []);

  useEffect(() => {
    if (!useDeviceGps || typeof navigator === "undefined" || !navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError("");
        addPoint(pos.coords.latitude, pos.coords.longitude);
      },
      () => setGpsError("GPS indisponível — usando simulação da frota."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [useDeviceGps, addPoint]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.008,
          lng: v.lng + (Math.random() - 0.5) * 0.008,
          speed: Math.round(Math.max(20, Math.min(90, v.speed + (Math.random() - 0.5) * 6))),
        }))
      );
      if (!position) {
        addPoint(center.lat + (Math.random() - 0.5) * 0.02, center.lng + (Math.random() - 0.5) * 0.02);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [position, center, addPoint]);

  const mapCenter = position
    ? { lat: position.lat, lng: position.lng }
    : center;

  const trailPoints = trail.map((p) => latLngToPercent(p.lat, p.lng, mapCenter));
  const trailPath =
    trailPoints.length > 1
      ? trailPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
      : "";

  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-primary to-primary-container ${heightClass}`}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          GPS em tempo real • {tick > 0 ? "atualizado agora" : "iniciando..."}
        </div>
        {gpsError && (
          <p className="absolute right-3 top-3 z-10 max-w-[200px] rounded bg-amber-500/90 px-2 py-1 text-[10px] text-white">
            {gpsError}
          </p>
        )}

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {trailPath && (
            <path
              d={trailPath}
              fill="none"
              stroke="#4ade80"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          )}
        </svg>

        {trailPoints.map((p, i) =>
          i % 4 === 0 ? (
            <span
              key={`dot-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full bg-green-300/60"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ) : null
        )}

        {position && (() => {
          const { x, y } = latLngToPercent(position.lat, position.lng, mapCenter);
          return (
            <span
              className="absolute z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 ring-4 ring-green-300/50"
              style={{ left: `${x}%`, top: `${y}%` }}
              title="Sua posição"
            >
              <Icon name="my_location" className="text-white" />
            </span>
          );
        })()}

        {vehicles.map((v) => {
          const { x, y } = latLngToPercent(v.lat, v.lng, mapCenter);
          return (
            <button
              key={v.id}
              type="button"
              title={`${v.plate} — ${v.speed} km/h`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition hover:scale-110"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container shadow-lg ring-2 ring-white">
                <Icon name="local_shipping" className="text-sm text-on-secondary-container" />
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-2 border-t border-white/20 bg-black/40 p-3 backdrop-blur">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white md:text-xs"
            >
              <span className="font-bold">{v.plate}</span>
              <span className="opacity-80">{v.heading}</span>
              <span className="text-green-300">{v.speed} km/h</span>
            </div>
          ))}
        </div>
      </div>

      {showRouteChart && (
        <div className="raised-card p-4">
          <h4 className="mb-3 text-label-md font-bold uppercase text-on-surface-variant">
            Gráfico de rota (trajeto)
          </h4>
          <div className="relative h-24 overflow-hidden rounded-lg bg-surface-container-low">
            <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              {trail.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#003d9b"
                  strokeWidth="1.5"
                  points={trail
                    .map((p, i) => {
                      const x = (i / (trail.length - 1)) * 100;
                      const y = 35 - ((p.lat - mapCenter.lat) * 8000 + (p.lng - mapCenter.lng) * 2000);
                      return `${x},${Math.max(2, Math.min(38, y))}`;
                    })
                    .join(" ")}
                />
              ) : (
                <text x="50" y="22" textAnchor="middle" className="fill-on-surface-variant text-[4px]">
                  Aguardando pontos GPS...
                </text>
              )}
            </svg>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">
            {trail.length} pontos registrados • última atualização:{" "}
            {position ? new Date(position.ts).toLocaleTimeString("pt-BR") : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
