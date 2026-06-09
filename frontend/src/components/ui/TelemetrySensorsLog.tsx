"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

interface TelemetryEvent {
  id: string;
  timestamp: string;
  plate: string;
  sensor: "thermal" | "drivereye" | "axle" | "diesel_thief";
  value: string;
  status: "ok" | "warning" | "critical";
  message: string;
}

const VEHICLES = ["ABC-1234", "DEF-5678", "GHI-9012", "JKL-3456"];

const SENSOR_ICONS = {
  thermal: "thermostat",
  drivereye: "visibility",
  axle: "scale",
  diesel_thief: "local_gas_station",
};

const SENSOR_LABELS = {
  thermal: "Freio Térmico",
  drivereye: "Câmera DriverEye",
  axle: "Balança Eixos (Axle)",
  diesel_thief: "Guarda Combustível",
};

export default function TelemetrySensorsLog() {
  const [logs, setLogs] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    // Generate initial logs
    const initialLogs: TelemetryEvent[] = Array.from({ length: 5 }).map((_, i) =>
      generateRandomEvent(i.toString())
    );
    setLogs(initialLogs);

    // Live update simulator
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextEvent = generateRandomEvent(Date.now().toString());
        return [nextEvent, ...prev.slice(0, 19)]; // Keep last 20
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function generateRandomEvent(id: string): TelemetryEvent {
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const plate = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
    const sensors: TelemetryEvent["sensor"][] = ["thermal", "drivereye", "axle", "diesel_thief"];
    const sensor = sensors[Math.floor(Math.random() * sensors.length)];

    let value = "";
    let status: TelemetryEvent["status"] = "ok";
    let message = "";

    switch (sensor) {
      case "thermal": {
        const temp = Math.floor(100 + Math.random() * 220);
        value = `${temp}°C`;
        if (temp > 280) {
          status = "critical";
          message = "Temperatura crítica nos tambores de freio (> 280°C)";
        } else if (temp > 220) {
          status = "warning";
          message = "Temperatura elevada observada.";
        } else {
          status = "ok";
          message = "Temperatura dos discos estável.";
        }
        break;
      }
      case "drivereye": {
        const score = Math.floor(Math.random() * 100);
        value = `Fadiga: ${score}/100`;
        if (score > 80) {
          status = "critical";
          message = "Alerta DriverEye: Alto risco de fadiga/distração.";
        } else if (score > 50) {
          status = "warning";
          message = "Sinais leves de cansaço detectados.";
        } else {
          status = "ok";
          message = "Condutor atento e focado.";
        }
        break;
      }
      case "axle": {
        const load = Math.floor(12000 + Math.random() * 6000);
        value = `${load.toLocaleString("pt-BR")} kg`;
        if (load > 17000) {
          status = "critical";
          message = "Excesso de peso por eixo detectado (> 17T).";
        } else if (load > 15000) {
          status = "warning";
          message = "Carga próxima ao limite permitido.";
        } else {
          status = "ok";
          message = "Distribuição de peso em conformidade.";
        }
        break;
      }
      case "diesel_thief": {
        const drop = (Math.random() * 8).toFixed(1);
        const isDrop = Math.random() > 0.7;
        value = isDrop ? `-${drop}%` : "0.0%";
        if (isDrop && parseFloat(drop) > 4.0) {
          status = "critical";
          message = "Antifurto: Queda abrupta no nível de diesel!";
        } else if (isDrop && parseFloat(drop) > 1.5) {
          status = "warning";
          message = "Oscilação anormal no nível de combustível.";
        } else {
          status = "ok";
          message = "Volume de diesel conciliado com GPS.";
        }
        break;
      }
    }

    return { id, timestamp, plate, sensor, value, status, message };
  }

  return (
    <section className="raised-card p-4 sm:p-6 bg-[#14213D] border border-outline-variant/30 text-slate-100">
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <h3 className="flex items-center gap-2 text-headline-sm text-primary font-bold">
          <Icon name="stream" />
          Central Telemetria Ativa
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Transmissão Live
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase text-[10px] font-bold">
              <th className="py-2 pr-3">Horário</th>
              <th className="py-2 px-3">Veículo</th>
              <th className="py-2 px-3">Sensor</th>
              <th className="py-2 px-3">Valor</th>
              <th className="py-2 pl-3">Log Evento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition">
                <td className="py-3 pr-3 text-slate-400 font-mono">{log.timestamp}</td>
                <td className="py-3 px-3 font-semibold text-slate-100">{log.plate}</td>
                <td className="py-3 px-3 flex items-center gap-1.5">
                  <Icon name={SENSOR_ICONS[log.sensor]} className="text-primary text-sm" />
                  <span>{SENSOR_LABELS[log.sensor]}</span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`font-mono font-bold ${
                      log.status === "critical"
                        ? "text-error"
                        : log.status === "warning"
                          ? "text-amber-400"
                          : "text-green-400"
                    }`}
                  >
                    {log.value}
                  </span>
                </td>
                <td className="py-3 pl-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        log.status === "critical"
                          ? "bg-error"
                          : log.status === "warning"
                            ? "bg-amber-400"
                            : "bg-green-400"
                      }`}
                    />
                    <span className="truncate max-w-xs sm:max-w-md">{log.message}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
