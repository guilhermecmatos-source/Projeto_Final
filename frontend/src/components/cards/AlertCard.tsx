"use client";

import { motion } from "framer-motion";
import { Fuel, ShieldAlert, Wrench, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FleetAlert } from "@/types";
import { slideUp } from "@/lib/motion";

const ICONES = {
  consumption: Fuel,
  fraud: ShieldAlert,
  maintenance: Wrench,
  efficiency: AlertOctagon,
};

const NIVEL_LABEL = { low: "Baixo", medium: "Médio", critical: "Crítico" } as const;

export function AlertCard({ alerta }: { alerta: FleetAlert }) {
  const Icone = ICONES[alerta.category];
  return (
    <motion.article
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 transition hover:border-cyan-500/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-xl bg-gray-800 p-2">
            <Icone className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-100">{alerta.title}</h4>
            <p className="text-xs text-gray-500">
              {alerta.vehiclePlate ?? alerta.driverName ?? "Frota"}
            </p>
          </div>
        </div>
        <Badge variant={alerta.level}>{NIVEL_LABEL[alerta.level]}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-gray-400">{alerta.description}</p>
    </motion.article>
  );
}
