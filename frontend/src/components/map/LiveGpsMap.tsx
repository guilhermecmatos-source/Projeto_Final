"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

interface GpsVehicle {
  id: string;
  plate: string;
  lat: number;
  lng: number;
  speed: number;
  heading: string;
}

const INITIAL: GpsVehicle[] = [
  { id: "1", plate: "ABC-1234", lat: 42, lng: 28, speed: 62, heading: "SP → Curitiba" },
  { id: "2", plate: "DEF-5678", lat: 55, lng: 45, speed: 48, heading: "Campinas → Santos" },
  { id: "3", plate: "GHI-9012", lat: 35, lng: 62, speed: 71, heading: "BH → Rio" },
  { id: "4", plate: "JKL-3456", lat: 68, lng: 22, speed: 0, heading: "Parado - Hub Cajamar" },
];

export default function LiveGpsMap() {
  const [vehicles, setVehicles] = useState(INITIAL);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setVehicles((prev) =>
        prev.map((v) =>
          v.speed === 0
            ? v
            : {
                ...v,
                lat: Math.max(8, Math.min(88, v.lat + (Math.random() - 0.5) * 3)),
                lng: Math.max(8, Math.min(88, v.lng + (Math.random() - 0.5) * 3)),
                speed: Math.round(Math.max(20, Math.min(90, v.speed + (Math.random() - 0.5) * 8))),
              }
        )
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-b-xl bg-gradient-to-br from-primary via-primary/90 to-primary-container md:min-h-[320px]">
      <div className="absolute inset-0 opacity-20 technical-pattern" />
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
        GPS ao vivo • atualizado {tick > 0 ? "agora" : "iniciando..."}
      </div>

      <div className="relative h-full min-h-[240px] p-4 md:min-h-[320px]">
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" strokeWidth="0.3" />
          <path d="M0,70 Q40,55 100,65" fill="none" stroke="white" strokeWidth="0.3" />
        </svg>

        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            title={`${v.plate} — ${v.speed} km/h`}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
            style={{ left: `${v.lng}%`, top: `${v.lat}%` }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container shadow-lg ring-2 ring-white md:h-10 md:w-10">
              <Icon name="local_shipping" className="text-sm text-on-secondary-container md:text-base" />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white group-hover:block md:text-xs">
              {v.plate} • {v.speed} km/h
            </span>
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-2 border-t border-white/20 bg-black/30 p-3 backdrop-blur">
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white md:text-xs">
            <Icon name="my_location" className="text-secondary-container text-sm" />
            <span className="font-bold">{v.plate}</span>
            <span className="opacity-80">{v.heading}</span>
            <span className={v.speed > 0 ? "text-green-300" : "text-amber-300"}>
              {v.speed > 0 ? `${v.speed} km/h` : "Parado"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
