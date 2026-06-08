"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
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
  { id: "1", plate: "ABC-1234", lat: -23.5505, lng: -46.6333, speed: 62, heading: "SP → Curitiba" },
  { id: "2", plate: "DEF-5678", lat: -22.9068, lng: -47.063, speed: 48, heading: "Campinas → Santos" },
  { id: "3", plate: "GHI-9012", lat: -23.42, lng: -46.82, speed: 71, heading: "Hub Cajamar" },
];

export default function SatelliteOperationalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [vehicles, setVehicles] = useState(FLEET_VEHICLES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-23.5505, -46.6333],
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri, Maxar, Earthstar Geographics", maxZoom: 19 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const truckIcon = L.divIcon({
        className: "",
        html: `<div style="background:#ff9f00;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">
          <span style="color:#000;font-size:14px">🚛</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      FLEET_VEHICLES.forEach((v) => {
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
        setGps({ lat: latitude, lng: longitude });
        setGpsError("");
        if (mapInstance.current) {          
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

  useEffect(() => {
    const id = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.002,
          lng: v.lng + (Math.random() - 0.5) * 0.002,
          speed: Math.round(Math.max(0, Math.min(90, v.speed + (Math.random() - 0.5) * 6))),
        }))
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !ready) return;
    vehicles.forEach((v, i) => {
      markersRef.current[i]?.setLatLng([v.lat, v.lng]);
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

      <div ref={mapRef} className="h-[280px] w-full md:h-[360px]" />

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
