"use client";

import { motion } from "framer-motion";
import type { VehicleMapUnit } from "@/types";

interface MapVehiclesBottomBarProps {
  veiculos: VehicleMapUnit[];
}

/** Tags de veículos em trânsito — fora do container do mapa */
export function MapVehiclesBottomBar({ veiculos }: MapVehiclesBottomBarProps) {
  const emTransito = veiculos.filter((v) => v.inTransit);

  return (
    <div className="shrink-0 border-t border-gray-800 bg-gray-950 px-4 py-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Veículos em trânsito
      </p>
      {emTransito.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum veículo em movimento no momento.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {emTransito.map((v) => (
            <motion.span
              key={v.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-200"
            >
              <span className="font-bold text-cyan-400">{v.plate}</span>
              <span className="text-gray-600">·</span>
              <span>{v.route}</span>
              <span className="text-gray-600">·</span>
              <span>{v.speedKmh} km/h</span>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
