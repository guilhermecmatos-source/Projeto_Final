"use client";

import { useMemo } from "react";
import { ALERTAS_MOCK } from "@/features/alerts/constants";
import type { FleetAlert } from "@/types";

export function useAlerts() {
  const alertas = useMemo(() => ALERTAS_MOCK, []);

  const criticos = alertas.filter((a) => a.level === "critical");
  const medios = alertas.filter((a) => a.level === "medium");
  const baixos = alertas.filter((a) => a.level === "low");

  return {
    alertas,
    criticos,
    medios,
    baixos,
    total: alertas.length,
    ativos: alertas.length,
  };
}

export function useAlertById(id: string): FleetAlert | undefined {
  const { alertas } = useAlerts();
  return alertas.find((a) => a.id === id);
}
