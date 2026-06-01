import { STORAGE_KEYS } from "@/lib/constants";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export interface PersistedRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  payload: Record<string, unknown>;
}

function appendRecord(key: string, payload: Record<string, unknown>): PersistedRecord {
  const list = readJson<PersistedRecord[]>(key, []);
  const now = new Date().toISOString();
  const existing = list.find(
    (r) => r.payload.auth_number === payload.auth_number && payload.auth_number
  );
  if (existing && payload.auth_number) {
    existing.payload = payload;
    existing.updatedAt = now;
    existing.synced = false;
    writeJson(key, list);
    return existing;
  }
  const record: PersistedRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    synced: false,
    payload,
  };
  list.unshift(record);
  writeJson(key, list);
  return record;
}

export const persistence = {
  saveRuv(payload: Record<string, unknown>) {
    return appendRecord(STORAGE_KEYS.ruvRecords, payload);
  },
  listRuv() {
    return readJson<PersistedRecord[]>(STORAGE_KEYS.ruvRecords, []);
  },
  markRuvSynced(id: string) {
    const list = readJson<PersistedRecord[]>(STORAGE_KEYS.ruvRecords, []);
    const item = list.find((r) => r.id === id);
    if (item) item.synced = true;
    writeJson(STORAGE_KEYS.ruvRecords, list);
  },

  saveLogistics(payload: Record<string, unknown>) {
    return appendRecord(STORAGE_KEYS.logisticsRecords, payload);
  },
  listLogistics() {
    return readJson<PersistedRecord[]>(STORAGE_KEYS.logisticsRecords, []);
  },
  markLogisticsSynced(id: string) {
    const list = readJson<PersistedRecord[]>(STORAGE_KEYS.logisticsRecords, []);
    const item = list.find((r) => r.id === id);
    if (item) item.synced = true;
    writeJson(STORAGE_KEYS.logisticsRecords, list);
  },

  saveInspection(payload: Record<string, unknown>) {
    const list = readJson<PersistedRecord[]>(STORAGE_KEYS.inspectionsLocal, []);
    const now = new Date().toISOString();
    const record: PersistedRecord = {
      id: `insp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      synced: false,
      payload,
    };
    list.unshift(record);
    writeJson(STORAGE_KEYS.inspectionsLocal, list);
    return record;
  },
  listInspections() {
    return readJson<PersistedRecord[]>(STORAGE_KEYS.inspectionsLocal, []);
  },

  saveFuelLocal(payload: Record<string, unknown>) {
    const list = readJson<PersistedRecord[]>(STORAGE_KEYS.fuelLocal, []);
    const now = new Date().toISOString();
    const record: PersistedRecord = {
      id: `fuel-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      synced: false,
      payload,
    };
    list.unshift(record);
    writeJson(STORAGE_KEYS.fuelLocal, list);
    return record;
  },
  listFuelLocal() {
    return readJson<PersistedRecord[]>(STORAGE_KEYS.fuelLocal, []);
  },
};
