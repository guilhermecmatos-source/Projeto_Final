"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { geocodingApi } from "@/services/api";
import * as L from 'leaflet';

interface VehicleMarker {
  id: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
}

const FLEET_VEHICLES: VehicleMarker[] = [
  { id: "1", plate: "ABC-1234", lat: -10.184, lng: -48.333, speed: 62, heading: "Palmas → Gurupi" },
  { id: "2", plate: "DEF-5678", lat: -11.729, lng: -49.068, speed: 48, heading: "Gurupi → Palmas" },
  { id: "3", plate: "GHI-9012", lat: -10.184, lng: -48.333, speed: 71, heading: "Palmas → Araguaína" },
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
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const hasCentered = useRef(false);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [vehicles, setVehicles] = useState(FLEET_VEHICLES);
  const [ready, setReady] = useState(false);

  // Estados para as rotas reais consumidas da API do backend
  const [routePalmasGurupi, setRoutePalmasGurupi] = useState<{ lat: number; lng: number }[]>([]);
  const [routePalmasAraguaina, setRoutePalmasAraguaina] = useState<{ lat: number; lng: number }[]>([]);

  // Índices e direções da simulação
  const indicesRef = useRef({ v1: 0, v2: 0, v3: 0 });
  const dirsRef = useRef({ v1: 1, v2: -1, v3: 1 }); // 1 = ida, -1 = volta

  // Carregar as rotas da API no mount
  useEffect(() => {
    Promise.all([
      geocodingApi.routePoints("Palmas", "Gurupi"),
      geocodingApi.routePoints("Palmas", "Araguaína")
    ])
      .then(([rgRes, raRes]) => {
        if (rgRes.data?.points) {
          setRoutePalmasGurupi(rgRes.data.points);
          indicesRef.current.v1 = 0;
          indicesRef.current.v2 = rgRes.data.points.length - 1; // Começa de Gurupi
        }
        if (raRes.data?.points) {
          setRoutePalmasAraguaina(raRes.data.points);
          indicesRef.current.v3 = 0;
        }
      })
      .catch((err) => {
        console.error("[map] Erro ao obter rotas geográficas do backend:", err);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-10.184, -48.333],
        zoom: 7, // zoom menor para ver Palmas, Gurupi e Araguaína
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

      const truckIcon = L.divIcon({
        className: "leaflet-truck-icon-container",
        html: `<div style="background:#007194;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);transition:all 0.3s ease;">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zm-1.5-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      FLEET_VEHICLES.forEach((v) => {
        if (!isValidCoord(v.lat, v.lng)) return; // guard: skip invalid coords
        const m = L.marker([v.lat, v.lng], { icon: truckIcon })
          .bindPopup(`<b>${v.plate}</b><br/>${v.speed} km/h<br/>${v.heading}`)
          .addTo(map);
        markersRef.current.push(m);
      });

      mapInstance.current = map;
      setReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocalização não suportada");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isValidCoord(latitude, longitude)) return; // guard: skip bad GPS fix
        setGps({ lat: latitude, lng: longitude });
        setGpsError("");
        if (mapInstance.current) {          
          import("leaflet").then(({ default: L }) => {
            if (!mapInstance.current) return;
            if (!hasCentered.current) {
              mapInstance.current.setView([latitude, longitude], 9);
              hasCentered.current = true;
            }
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

  // Simular movimentação fluida dos veículos baseada nos pontos da rota da API
  useEffect(() => {
    if (routePalmasGurupi.length === 0 || routePalmasAraguaina.length === 0) return;

    const id = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          let route = routePalmasGurupi;
          let idxKey: "v1" | "v2" | "v3" = "v1";

          if (v.id === "1") {
            route = routePalmasGurupi;
            idxKey = "v1";
          } else if (v.id === "2") {
            route = routePalmasGurupi;
            idxKey = "v2";
          } else if (v.id === "3") {
            route = routePalmasAraguaina;
            idxKey = "v3";
          }

          let idx = indicesRef.current[idxKey];
          let dir = dirsRef.current[idxKey];

          // Avança na direção correspondente
          idx += dir;
          
          if (idx >= route.length) {
            idx = route.length - 2;
            dir = -1; // Volta na rota
          } else if (idx < 0) {
            idx = 1;
            dir = 1; // Segue na rota novamente
          }

          indicesRef.current[idxKey] = idx;
          dirsRef.current[idxKey] = dir;

          const nextPoint = route[idx];
          
          let heading = "";
          if (v.id === "1") heading = dir === 1 ? "Palmas → Gurupi" : "Gurupi → Palmas";
          if (v.id === "2") heading = dir === 1 ? "Palmas → Gurupi" : "Gurupi → Palmas";
          if (v.id === "3") heading = dir === 1 ? "Palmas → Araguaína" : "Araguaína → Palmas";

          return {
            ...v,
            lat: nextPoint.lat,
            lng: nextPoint.lng,
            heading,
            speed: Math.round(Math.max(50, Math.min(90, v.speed + (Math.random() - 0.5) * 10))),
          };
        })
      );
    }, 4000);

    return () => clearInterval(id);
  }, [routePalmasGurupi, routePalmasAraguaina]);

  // Atualizar marcadores no mapa Leaflet
  useEffect(() => {
    if (!mapInstance.current || !ready) return;
    vehicles.forEach((v, i) => {
      if (markersRef.current[i] && isValidCoord(v.lat, v.lng)) {
        markersRef.current[i].setLatLng([v.lat, v.lng]);
        markersRef.current[i].setPopupContent(`<b>${v.plate}</b><br/>${v.speed} km/h<br/>${v.heading}`);
      }
    });
  }, [vehicles, ready]);

  return (
    <div className="relative">
      <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1 rounded-lg bg-black/70 px-3 py-2 text-[10px] text-white backdrop-blur md:text-xs">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          SINAL GPS ATIVO
        </span>
        {gps ? (
          <span>REF: LAT {gps.lat.toFixed(4)} | LNG {gps.lng.toFixed(4)}</span>
        ) : (
          <span>{gpsError || "Obtendo geolocalização..."}</span>
        )}
      </div>

      <div ref={mapRef} className="h-[280px] w-full md:h-[360px] rounded-b-xl overflow-hidden" />

      <div className="flex flex-wrap gap-2 border-t border-outline-variant bg-surface-container-low p-3">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-high px-2 py-1 text-[10px] md:text-xs"
          >
            <Icon name="local_shipping" className="text-primary text-sm" />
            <span className="font-bold">{v.plate}</span>
            <span className="text-on-surface-variant">{v.heading}</span>
            <span className={v.speed > 0 ? "text-green-500" : "text-amber-500"}>
              {v.speed > 0 ? `${v.speed} km/h` : "Parado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
