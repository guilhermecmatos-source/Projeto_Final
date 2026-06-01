"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSyncQueue,
  getSyncQueue,
  isOnline,
  removeFromSyncQueue,
  SyncItem,
} from "@/lib/offline";
import { persistence } from "@/lib/persistence/store";
import { driversApi, fuelApi, maintenanceApi, travelsApi } from "@/services/api";

export interface SyncResult {
  ok: boolean;
  synced: number;
  failed: number;
  message: string;
}

async function processSyncItem(item: SyncItem): Promise<boolean> {
  try {
    const p = item.payload;
    switch (item.type) {
      case "driver": {
        const name = String(p.name || "").trim();
        const license = String(p.license_number || "").trim();
        if (!name || !license) return false;
        await driversApi.create({
          name,
          license_number: license,
          phone: String(p.phone || ""),
        });
        break;
      }
      case "travel": {
        const vehicleId = String(p.vehicle_id || "");
        const driverId = String(p.driver_id || "");
        if (!vehicleId || !driverId) return false;
        await travelsApi.create({
          vehicle_id: vehicleId,
          driver_id: driverId,
          origin: p.origin,
          destination: p.destination,
          distance_km: Number(p.distance_km || 0),
          fuel_consumption: Number(p.fuel_consumption || 0),
        });
        break;
      }
      case "fuel":
        await fuelApi.create({
          vehicle_id: p.vehicle_id,
          liters: Number(p.liters),
          cost: Number(p.cost),
          mileage_at_fill: Number(p.mileage_at_fill),
          station: p.station || "",
          filled_at: p.filled_at || new Date().toISOString(),
        });
        break;
      case "maintenance":
        await maintenanceApi.create({
          vehicle_id: p.vehicle_id,
          type: p.type,
          description: p.description,
          cost: Number(p.cost || 0),
          scheduled_at: p.scheduled_at || new Date().toISOString(),
        });
        break;
      case "ruv":
        persistence.saveRuv(item.payload);
        return true;
      case "logistics":
        persistence.saveLogistics(item.payload);
        return true;
      case "inspection":
        persistence.saveInspection(item.payload);
        return true;
      default:
        return true;
    }
    return true;
  } catch {
    return false;
  }
}

export function useOffline() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refresh = useCallback(() => {
    setOnline(isOnline());
    setPendingCount(getSyncQueue().length);
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = () => refresh();
    const onOffline = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const interval = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
  }, [refresh]);

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline()) {
      const result: SyncResult = {
        ok: false,
        synced: 0,
        failed: 0,
        message: "Sem conexão. Aguarde voltar online.",
      };
      setLastSyncResult(result);
      return result;
    }

    setSyncing(true);
    const queue = getSyncQueue();
    if (queue.length === 0) {
      const empty: SyncResult = {
        ok: true,
        synced: 0,
        failed: 0,
        message: "Nenhum item pendente na fila.",
      };
      setLastSyncResult(empty);
      setSyncing(false);
      return empty;
    }

    let synced = 0;
    let failed = 0;
    for (const item of queue) {
      const success = await processSyncItem(item);
      if (success) {
        removeFromSyncQueue(item.id);
        synced++;
      } else {
        failed++;
      }
    }

    if (synced > 0 && failed === 0) {
      clearSyncQueue();
    }

    refresh();
    setSyncing(false);

    const result: SyncResult = {
      ok: failed === 0,
      synced,
      failed,
      message:
        failed === 0
          ? `Sincronização concluída (${synced} item(ns)).`
          : `Parcial: ${synced} ok, ${failed} com erro. Tente novamente.`,
    };
    setLastSyncResult(result);
    return result;
  }, [refresh]);

  return { online, pendingCount, syncing, lastSyncResult, refresh, syncNow };
}
