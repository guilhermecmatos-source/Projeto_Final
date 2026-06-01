"use client";

import { useEffect, useState } from "react";
import type { VehicleMapUnit } from "@/types";

interface MapaCanvasProps {
  veiculos: VehicleMapUnit[];
  gpsAoVivo: boolean;
}

/** Canvas do mapa — marcadores isolados, sem texto sobreposto */
export function MapaCanvas({ veiculos, gpsAoVivo }: MapaCanvasProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!gpsAoVivo) return;
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, [gpsAoVivo]);

  return (
    <div className="relative h-full min-h-[320px] w-full bg-[#0a0f1a]">
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
        <defs>
          <pattern id="grade-mapa" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grade-mapa)" />
      </svg>
      {veiculos
        .filter((v) => v.inTransit)
        .map((v, i) => {
          const offset = gpsAoVivo ? Math.sin((tick + i) * 0.35) * 1.5 : 0;
          const x = 12 + ((v.lng + 50) % 76) + offset;
          const y = 15 + ((v.lat + 25) % 70) + offset;
          return (
            <div
              key={v.id}
              className="absolute transition-all duration-700"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              title={v.plate}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-300/50">
                <span className="text-lg" role="img" aria-label="veículo">
                  🚛
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
