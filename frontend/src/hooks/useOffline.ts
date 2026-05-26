"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSyncQueue,
  getSyncQueue,
  isOnline,
  removeFromSyncQueue,
  SyncItem,
} from "@/lib/offline";
import { driversApi, fuelApi, maintenanceApi, travelsApi } from "@/services/api";

async function processSyncItem(item: SyncItem): Promise<boolean> {
  try {
    const p = item.payload;
    switch (item.type) {
      case "driver":
        await driversApi.create({
          name: p.name,
          license_number: p.license_number,
          phone: p.phone || "",
        });
        break;
      case "travel":
        await travelsApi.create({
          vehicle_id: p.vehicle_id,
          driver_id: p.driver_id,
          origin: p.origin,
          destination: p.destination,
          distance_km: Number(p.distance_km || 0),
          fuel_consumption: Number(p.fuel_consumption || 0),
        });
        break;
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
      case "logistics":
      case "inspection":
        /* persistidos localmente; sem endpoint dedicado */
        break;
      default:
        break;
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

  const syncNow = useCallback(async () => {
    if (!isOnline()) return false;
    setSyncing(true);
    const queue = getSyncQueue();
    let ok = 0;
    for (const item of queue) {
      const success = await processSyncItem(item);
      if (success) {
        removeFromSyncQueue(item.id);
        ok++;
      }
    }
    if (ok === queue.length && queue.length > 0) {
      clearSyncQueue();
    }
    refresh();
    setSyncing(false);
    return ok > 0 || queue.length === 0;
  }, [refresh]);

  return { online, pendingCount, syncing, refresh, syncNow };
}
