"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

interface VehicleMarker {
  id: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
}

const SP_CENTER = { lat: -23.5505, lng: -46.6333 };

const DEMO_VEHICLES: VehicleMarker[] = [
  { id: "1", plate: "ABC-1234", lat: -23.55, lng: -46.63, speed: 62 },
  { id: "2", plate: "DEF-5678", lat: -23.48, lng: -46.52, speed: 48 },
  { id: "3", plate: "GHI-9012", lat: -23.52, lng: -46.58, speed: 71 },
];

interface SatelliteOperationalMapProps {
  heightClass?: string;
}

export default function SatelliteOperationalMap({
  heightClass = "min-h-[280px] md:min-h-[360px]",
}: SatelliteOperationalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ remove: () => void } | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [vehicles] = useState(DEMO_VEHICLES);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsError("");
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setGpsError("GPS indisponível — centralizado em São Paulo."),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      const center = position ?? SP_CENTER;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([center.lat, center.lng], 13);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
        }
      ).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        opacity: 0.35,
        maxZoom: 19,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: "",
        html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const truckIcon = L.divIcon({
        className: "",
        html: `<div style="background:#f59e0b;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35);font-size:14px">🚛</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (position) {
        L.marker([position.lat, position.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("Sua localização");
      }

      vehicles.forEach((v) => {
        L.marker([v.lat, v.lng], { icon: truckIcon })
          .addTo(map)
          .bindPopup(`<strong>${v.plate}</strong><br/>${v.speed} km/h`);
      });

      mapInstance.current = map;
    })();

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [position, vehicles]);

  return (
    <div className={`relative overflow-hidden rounded-b-xl ${heightClass}`}>
      <div ref={mapRef} className="h-full min-h-[280px] w-full md:min-h-[360px]" />
      <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        Mapa satélite • GPS {position ? "ativo" : "simulado"}
      </div>
      {gpsError && (
        <p className="absolute right-3 top-3 z-[1000] max-w-[220px] rounded bg-amber-500/90 px-2 py-1 text-[10px] text-white">
          {gpsError}
        </p>
      )}
      {position && (
        <div className="absolute bottom-14 left-3 z-[1000] rounded-lg bg-black/60 px-3 py-2 text-[10px] text-white backdrop-blur md:text-xs">
          <Icon name="my_location" className="mr-1 inline text-sm text-green-400" />
          LAT: {position.lat.toFixed(4)} | LNG: {position.lng.toFixed(4)}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-wrap gap-2 border-t border-white/20 bg-black/50 p-3 backdrop-blur">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white md:text-xs"
          >
            <span className="font-bold">{v.plate}</span>
            <span className="text-green-300">{v.speed} km/h</span>
          </div>
        ))}
      </div>
    </div>
  );
}
