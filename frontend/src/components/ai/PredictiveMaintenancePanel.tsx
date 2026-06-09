"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  analyzeFleet,
  countByStatus,
  FACTORY_PLANS,
  MaintenanceAlert,
  VehicleMaintenanceState,
} from "@/lib/ai/predictive-maintenance";
import { vehiclesApi } from "@/services/api";
import { readJson, writeJson } from "@/lib/local-storage";

const SERVICE_STATE_KEY = "fleet_last_service";

function statusStyle(status: MaintenanceAlert["status"]) {
  if (status === "critical") return "border-l-error bg-red-50";
  if (status === "warning") return "border-l-amber-500 bg-amber-50";
  return "border-l-green-500 bg-green-50";
}

function statusLabel(status: MaintenanceAlert["status"]) {
  if (status === "critical") return "Revisão vencida";
  if (status === "warning") return "Próximo da revisão";
  return "Em dia";
}

export default function PredictiveMaintenancePanel({ compact = false }: { compact?: boolean }) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const serviceMap = readJson<Record<string, { km: number; date: string }>>(SERVICE_STATE_KEY, {});

    vehiclesApi
      .list()
      .then((res) => {
        const list = (Array.isArray(res.data) ? res.data : []) as {
          id: string;
          plate: string;
          mileage: number;
        }[];
        const states: VehicleMaintenanceState[] = list.map((v) => {
          const saved = serviceMap[v.id];
          return {
            vehicleId: v.id,
            plate: v.plate,
            mileage: Number(v.mileage) || 0,
            lastServiceKm: saved?.km ?? Math.max(0, Number(v.mileage) - 5000),
            lastServiceDate: saved?.date ?? new Date(Date.now() - 90 * 86400000).toISOString(),
          };
        });
        if (states.length === 0) {
          states.push({
            vehicleId: "demo",
            plate: "ABC-1234",
            mileage: 48500,
            lastServiceKm: 42000,
            lastServiceDate: new Date(Date.now() - 200 * 86400000).toISOString(),
          });
        }
        setAlerts(analyzeFleet(states));
      })
      .catch(() => {
        setAlerts(
          analyzeFleet([
            {
              vehicleId: "demo",
              plate: "ABC-1234",
              mileage: 48500,
              lastServiceKm: 42000,
              lastServiceDate: new Date(Date.now() - 200 * 86400000).toISOString(),
            },
          ])
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (alerts.length === 0) return;
    const critical = alerts.filter((a) => a.status === "critical");
    if (critical.length > 0 && typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        new Notification("FleetAI — Manutenção vencida", {
          body: critical[0].message,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [alerts]);

  const counts = countByStatus(alerts);
  const display = compact ? alerts.slice(0, 4) : alerts;

  return (
    <div className={`flex flex-col ${compact ? "" : "raised-card p-4 sm:p-6"}`}>
      <h3 className="mb-1 flex items-center gap-2 text-headline-sm text-primary">
        <Icon name="engineering" />
        IA 3 — Manutenção Preditiva
      </h3>
      <p className="mb-3 text-xs text-on-surface-variant">
        Planos de fábrica: {FACTORY_PLANS.length} revisões monitoradas (km e tempo)
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="chip-active">Em dia: frota monitorada</span>
        <span className="chip-warning">{counts.warning} próximo(s)</span>
        <span className="chip-error">{counts.critical} vencido(s)</span>
      </div>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Analisando frota...</p>
      ) : display.length === 0 ? (
        <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Todos os veículos com manutenção em dia.
        </p>
      ) : (
        <ul className={`space-y-3 ${compact ? "max-h-48 overflow-y-auto" : ""}`}>
          {display.map((a) => (
            <li
              key={`${a.vehicleId}-${a.planId}`}
              className={`rounded-lg border-l-4 p-3 ${statusStyle(a.status)}`}
              style={a.status === "critical" ? { color: "#000000" } : undefined}
            >
              <div className="flex justify-between gap-2">
                <span className="text-xs font-bold uppercase" style={a.status === "critical" ? { color: "#000000" } : undefined}>{a.plate}</span>
                <span
                  className={
                    a.status === "critical"
                      ? "chip-error"
                      : a.status === "warning"
                        ? "chip-warning"
                        : "chip-active"
                  }
                  style={a.status === "critical" ? { color: "#000000", borderColor: "#000000" } : undefined}
                >
                  {statusLabel(a.status)}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold" style={a.status === "critical" ? { color: "#000000" } : undefined}>{a.planName}</p>
              <p className="text-xs" style={a.status === "critical" ? { color: "#000000" } : { color: "var(--color-on-surface-variant, #6b7280)" }}>{a.description}</p>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary hover:underline"
          onClick={() => {
            writeJson(SERVICE_STATE_KEY, {
              demo: { km: 48000, date: new Date().toISOString() },
            });
            window.location.reload();
          }}
        >
          Registrar revisão realizada (demo)
        </button>
      )}
    </div>
  );
}
