"use client";

import { useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import {
  appendStoredFiles,
  filesToStored,
  removeStoredFile,
  readJson,
  StoredFile,
  writeJson,
} from "@/lib/local-storage";

interface FileUploadFieldProps {
  label: string;
  storageKey: string;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}

export default function FileUploadField({
  label,
  storageKey,
  accept = "image/*,.pdf",
  multiple = true,
  hint,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StoredFile[]>(() => readJson(storageKey, []));

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    const stored = await filesToStored(selected);
    const merged = appendStoredFiles(storageKey, stored);
    setFiles(merged);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(id: string) {
    const next = removeStoredFile(storageKey, id);
    setFiles(next);
  }

  function clearAll() {
    writeJson(storageKey, []);
    setFiles([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-label-md text-on-surface-variant">{label}</label>
        {files.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-error hover:underline"
          >
            Limpar todos
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-body-md font-medium text-primary transition hover:border-primary hover:bg-primary-container/5"
      >
        <Icon name="upload_file" />
        Enviar arquivo{multiple ? "s" : ""}
      </button>
      {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
      {files.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <div
              key={f.id}
              className="relative overflow-hidden rounded-lg border border-outline-variant bg-white"
            >
              {f.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.dataUrl} alt={f.name} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-2 bg-surface-container-low p-4">
                  <Icon name="picture_as_pdf" className="text-4xl text-error" />
                  <span className="truncate text-xs font-medium">{f.name}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-outline-variant/50 px-2 py-1.5">
                <span className="truncate text-[10px] text-on-surface-variant">{f.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(f.id)}
                  className="shrink-0 rounded p-1 text-error hover:bg-error-container/20"
                  aria-label="Remover arquivo"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
