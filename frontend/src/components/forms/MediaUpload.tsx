"use client";

import { useRef, useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";

interface MediaUploadProps {
  label: string;
  onChange: (file: File | null, dataUrl: string | null) => void;
  value?: File | null;
  accept?: string;
}

export default function MediaUpload({
  label,
  onChange,
  value = null,
  accept = "image/*",
}: MediaUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);

    // Free memory when component unmounts or value changes
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onChange(null, null);
    }
    // Reset inputs so the same file can be uploaded again if removed
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange(null, null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase text-on-surface-variant">
        {label}
      </label>
      
      <div className="flex flex-col gap-3">
        {!preview ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border border-secondary-container bg-secondary-container/10 py-3 text-sm font-semibold text-secondary-container hover:bg-secondary-container/20 transition"
            >
              <Icon name="add_a_photo" /> Câmera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border border-secondary-container bg-secondary-container/10 py-3 text-sm font-semibold text-secondary-container hover:bg-secondary-container/20 transition"
            >
              <Icon name="upload" /> Arquivo
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pré-visualização"
              className="max-h-48 w-full object-contain rounded"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-error/10 py-2 text-xs font-semibold text-error hover:bg-error/20 transition"
            >
              <Icon name="delete" className="text-sm" /> Remover Imagem
            </button>
          </div>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept={accept}
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
