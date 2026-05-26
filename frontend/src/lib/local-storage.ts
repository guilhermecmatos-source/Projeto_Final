export interface StoredFile {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  savedAt: string;
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function filesToStored(files: File[]): Promise<StoredFile[]> {
  const stored: StoredFile[] = [];
  for (const file of files) {
    stored.push({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.type,
      dataUrl: await fileToDataUrl(file),
      savedAt: new Date().toISOString(),
    });
  }
  return stored;
}

export function appendStoredFiles(key: string, newFiles: StoredFile[]): StoredFile[] {
  const existing = readJson<StoredFile[]>(key, []);
  const merged = [...existing, ...newFiles];
  writeJson(key, merged);
  return merged;
}

export function removeStoredFile(key: string, fileId: string): StoredFile[] {
  const next = readJson<StoredFile[]>(key, []).filter((f) => f.id !== fileId);
  writeJson(key, next);
  return next;
}

export function generateAuthNumber(): string {
  const stored = readJson<number>("fleet_ruv_counter", 7193);
  const next = stored + 1;
  writeJson("fleet_ruv_counter", next);
  return String(next).padStart(6, "0");
}
