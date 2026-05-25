const SYNC_QUEUE_KEY = "fleet_sync_queue";
const DRIVER_DRAFT_KEY = "fleet_driver_draft";

export interface SyncItem {
  id: string;
  type: "driver" | "travel" | "inspection";
  payload: Record<string, unknown>;
  createdAt: string;
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function getSyncQueue(): SyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToSyncQueue(item: Omit<SyncItem, "id" | "createdAt">): void {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: `sync-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

export function saveDriverDraft(data: Record<string, unknown>): string {
  const savedAt = new Date().toISOString();
  localStorage.setItem(DRIVER_DRAFT_KEY, JSON.stringify({ ...data, savedAt }));
  return savedAt;
}

export function getDriverDraft(): { savedAt: string; [key: string]: unknown } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRIVER_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
