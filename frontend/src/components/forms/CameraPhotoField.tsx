"use client";

import { useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

interface CameraPhotoFieldProps {
  label?: string;
  onCapture?: (dataUrl: string, file?: File) => void;
  previewUrl?: string | null;
  maxSizeMb?: number;
}

const MAX_DEFAULT_MB = 5;

export default function CameraPhotoField({
  label = "Foto do veículo",
  onCapture,
  previewUrl: externalPreview,
  maxSizeMb = MAX_DEFAULT_MB,
}: CameraPhotoFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(externalPreview ?? null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shownPreview = externalPreview ?? preview;

  async function processFile(file: File) {
    setError("");
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Arquivo excede ${maxSizeMb}MB. Escolha uma imagem menor.`);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    setLoading(true);
    setFileName(file.name);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setPreview(dataUrl);
      onCapture?.(dataUrl, file);
    } catch {
      setError("Não foi possível ler a imagem.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  }

  return (
    <div>
      <label className="mb-1 block text-label-md text-on-surface-variant">{label}</label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary-container/5 px-5 py-6 transition hover:bg-primary-container/15"
          >
            <Icon name="photo_camera" className="mb-2 text-3xl text-primary" />
            <span className="text-sm font-medium text-primary">Tirar foto</span>
            <span className="mt-1 text-xs text-on-surface-variant">Câmera (mobile)</span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low px-5 py-6 transition hover:border-primary"
          >
            <Icon name="add_a_photo" className="mb-2 text-3xl text-primary" />
            <span className="text-sm font-medium text-primary">Galeria</span>
            <span className="mt-1 text-xs text-on-surface-variant">JPG, PNG até {maxSizeMb}MB</span>
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {loading && (
          <p className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Icon name="hourglass_top" className="animate-spin text-primary" />
            Processando imagem...
          </p>
        )}

        {shownPreview && !loading && (
          <div className="flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shownPreview}
              alt="Preview"
              className="max-h-48 w-full rounded-lg border border-outline-variant object-cover sm:max-w-xs"
            />
            {fileName && <p className="mt-2 text-xs text-on-surface-variant">{fileName}</p>}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
