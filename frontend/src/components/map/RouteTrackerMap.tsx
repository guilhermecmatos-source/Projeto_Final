"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { trailDistanceKm } from "@/lib/geo";
import { geocodingApi } from "@/services/api";
import * as L from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  ts: number;
}

interface RouteTrackerMapProps {
  center?: { lat: number; lng: number };
  heightClass?: string;
  useDeviceGps?: boolean;
  showRouteChart?: boolean;
}

const TO_CENTER = { lat: -10.184, lng: -48.333 };

const DEMO_VEHICLES = [
  { id: "1", plate: "ABC-1234", lat: -10.184, lng: -48.333, speed: 62, heading: "Palmas → Gurupi" },
  { id: "2", plate: "DEF-5678", lat: -11.729, lng: -49.068, speed: 48, heading: "Gurupi → Palmas" },
];

export default function RouteTrackerMap({
  center = TO_CENTER,
  heightClass = "min-h-[280px] md:min-h-[360px]",
  useDeviceGps = true,
  showRouteChart = true,
}: RouteTrackerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const vehicleMarkersRef = useRef<L.Marker[]>([]);

  const [trail, setTrail] = useState<MapPoint[]>([]);
  const [position, setPosition] = useState<MapPoint | null>(null);
  const [vehicles, setVehicles] = useState(DEMO_VEHICLES);
  const [tick, setTick] = useState(0);
  const [gpsError, setGpsError] = useState("");
  const watchId = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // Rotas reais do backend
  const [routePoints, setRoutePoints] = useState<{ lat: number; lng: number }[]>([]);
  const indicesRef = useRef({ v1: 0, v2: 0 });
  const dirsRef = useRef({ v1: 1, v2: -1 });

  // Carrega rotas do backend
  useEffect(() => {
    geocodingApi.routePoints("Palmas", "Gurupi")
      .then((res) => {
        if (res.data?.points) {
          setRoutePoints(res.data.points);
          indicesRef.current.v1 = 0;
          indicesRef.current.v2 = res.data.points.length - 1;
        }
      })
      .catch((err) => console.error("[tracker] Erro ao obter rota:", err));
  }, []);

  const addPoint = useCallback((lat: number, lng: number) => {
    const point: MapPoint = { lat, lng, ts: Date.now() };
    setPosition(point);
    setTrail((prev) => [...prev.slice(-80), point]);
  }, []);

  // Inicializar o Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 8,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Linha do trajeto percorrendo
      const polyline = L.polyline([], { color: "#4ade80", weight: 3, opacity: 0.8 }).addTo(map);
      trailPolylineRef.current = polyline;

      const truckIcon = L.divIcon({
        className: "leaflet-truck-icon-tracker",
        html: `<div style="background:#007194;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zm-1.5-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      DEMO_VEHICLES.forEach((v) => {
        const m = L.marker([v.lat, v.lng], { icon: truckIcon })
          .bindPopup(`<b>${v.plate}</b><br/>${v.speed} km/h<br/>${v.heading}`)
          .addTo(map);
        vehicleMarkersRef.current.push(m);
      });

      mapInstance.current = map;
      setReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      userMarkerRef.current = null;
      trailPolylineRef.current = null;
      vehicleMarkersRef.current = [];
    };
  }, [center]);

  // Escuta geolocalização do dispositivo
  useEffect(() => {
    if (!useDeviceGps || typeof navigator === "undefined" || !navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError("");
        addPoint(pos.coords.latitude, pos.coords.longitude);
      },
      () => setGpsError("GPS indisponível — usando simulação de frota."),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [useDeviceGps, addPoint]);

  // Simulação e movimentação dos veículos ao longo da rota real
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);

      if (routePoints.length > 0) {
        setVehicles((prev) =>
          prev.map((v) => {
            const idxKey: "v1" | "v2" = v.id === "1" ? "v1" : "v2";
            let idx = indicesRef.current[idxKey];
            let dir = dirsRef.current[idxKey];

            idx += dir;
            if (idx >= routePoints.length) {
              idx = routePoints.length - 2;
              dir = -1;
            } else if (idx < 0) {
              idx = 1;
              dir = 1;
            }

            indicesRef.current[idxKey] = idx;
            dirsRef.current[idxKey] = dir;

            const point = routePoints[idx];
            const heading = dir === 1 ? "Palmas → Gurupi" : "Gurupi → Palmas";

            return {
              ...v,
              lat: point.lat,
              lng: point.lng,
              heading,
              speed: Math.round(Math.max(45, Math.min(85, v.speed + (Math.random() - 0.5) * 8))),
            };
          })
        );
      } else {
        // Fallback simulação aleatória se a rota do backend não carregou
        setVehicles((prev) =>
          prev.map((v) => ({
            ...v,
            lat: v.lat + (Math.random() - 0.5) * 0.008,
            lng: v.lng + (Math.random() - 0.5) * 0.008,
            speed: Math.round(Math.max(20, Math.min(90, v.speed + (Math.random() - 0.5) * 6))),
          }))
        );
      }

      if (!position) {
        addPoint(center.lat + (Math.random() - 0.5) * 0.02, center.lng + (Math.random() - 0.5) * 0.02);
      }
    }, 4000);

    return () => clearInterval(id);
  }, [position, center, addPoint, routePoints]);

  // Atualizar rastro e posição no mapa Leaflet
  useEffect(() => {
    if (!mapInstance.current || !ready) return;

    if (position) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([position.lat, position.lng]);
      } else {
        userMarkerRef.current = L.circleMarker([position.lat, position.lng], {
          radius: 8,
          color: "#4ade80",
          fillColor: "#4ade80",
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(mapInstance.current)
          .bindPopup("Sua localização");
        
        mapInstance.current.setView([position.lat, position.lng], 9);
      }
    }

    if (trail.length > 0 && trailPolylineRef.current) {
      trailPolylineRef.current.setLatLngs(trail.map((p) => [p.lat, p.lng]));
    }
  }, [position, trail, ready]);

  // Atualizar marcadores dos veículos no Leaflet
  useEffect(() => {
    if (!mapInstance.current || !ready) return;
    vehicles.forEach((v, i) => {
      if (vehicleMarkersRef.current[i]) {
        vehicleMarkersRef.current[i].setLatLng([v.lat, v.lng]);
        vehicleMarkersRef.current[i].setPopupContent(`<b>${v.plate}</b><br/>${v.speed} km/h<br/>${v.heading}`);
      }
    });
  }, [vehicles, ready]);

  const totalKm = useMemo(() => trailDistanceKm(trail), [trail]);

  const chartPoints = useMemo(() => {
    if (trail.length < 2) return "";
    let cumulative = 0;
    const segments: { x: number; y: number }[] = [{ x: 0, y: 38 }];
    for (let i = 1; i < trail.length; i++) {
      cumulative += haversineSegment(trail[i - 1], trail[i]);
      const x = totalKm > 0 ? (cumulative / totalKm) * 100 : (i / (trail.length - 1)) * 100;
      const y = 38 - Math.min(30, cumulative * 0.15);
      segments.push({ x, y });
    }
    return segments.map((p) => `${p.x},${p.y}`).join(" ");
  }, [trail, totalKm]);

  function haversineSegment(a: MapPoint, b: MapPoint) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl border border-outline-variant/30 ${heightClass}`}>
        <div ref={mapRef} className="absolute inset-0 h-full w-full" />

        <div className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          GPS em tempo real • {tick > 0 ? "sinal ativo" : "iniciando..."}
        </div>
        {gpsError && (
          <p className="absolute right-3 top-3 z-[500] max-w-[200px] rounded bg-amber-500/90 px-2 py-1 text-[10px] text-white">
            {gpsError}
          </p>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-[500] flex flex-wrap gap-2 border-t border-white/20 bg-black/70 p-3 backdrop-blur">
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
              {chartPoints ? (
                <polyline
                  fill="none"
                  stroke="#003d9b"
                  strokeWidth="1.5"
                  points={chartPoints}
                />
              ) : (
                <text x="50" y="22" textAnchor="middle" className="fill-on-surface-variant text-[4px]">
                  Aguardando pontos GPS...
                </text>
              )}
            </svg>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant">
            {trail.length} pontos • distância percorrida: {totalKm.toLocaleString("pt-BR")} km •
            última atualização: {position ? new Date(position.ts).toLocaleTimeString("pt-BR") : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
