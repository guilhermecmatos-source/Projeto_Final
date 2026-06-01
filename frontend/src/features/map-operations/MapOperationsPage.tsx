"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Wrench } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MapGpsTopBar } from "@/components/layout/top-bar";
import { MapVehiclesBottomBar } from "@/components/layout/bottom-bar";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { MapaCanvas } from "./MapaCanvas";
import { VEICULOS_MAPA } from "./constants";
import { ROUTES } from "@/lib/constants";

export function MapOperationsPage() {
  const [gpsAoVivo, setGpsAoVivo] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setGpsAoVivo(true),
      () => setGpsAoVivo(false),
      { timeout: 5000 }
    );
  }, []);

  return (
    <DashboardShell titulo="Mapa Operacional" semPadding>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-gray-800 bg-gray-950 p-4 lg:w-72 lg:border-b-0 lg:border-r">
          <CardTitle className="mb-4 text-base">Fleet Info</CardTitle>
          <ul className="mb-4 space-y-2">
            {VEICULOS_MAPA.map((v) => (
              <li
                key={v.id}
                className="flex justify-between rounded-lg border border-gray-800 px-3 py-2 text-sm"
              >
                <span className="font-medium">{v.plate}</span>
                <span className="text-gray-500">{v.inTransit ? "Em trânsito" : "Parado"}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start" asChild>
              <Link href={`${ROUTES.fleetIntelligence}?ia=manutencao`}>
                <Wrench className="mr-2 h-4 w-4" />
                Status de Manutenção IA
              </Link>
            </Button>
            <Button variant="destructive" className="justify-start" asChild>
              <Link href={`${ROUTES.fleetIntelligence}?ia=alertas`}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Alertas Críticos IA
              </Link>
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <MapGpsTopBar gpsAoVivo={gpsAoVivo} />
          <div className="relative min-h-0 flex-1">
            <MapaCanvas veiculos={VEICULOS_MAPA} gpsAoVivo={gpsAoVivo} />
          </div>
          <MapVehiclesBottomBar veiculos={VEICULOS_MAPA} />
        </div>
      </div>
    </DashboardShell>
  );
}
