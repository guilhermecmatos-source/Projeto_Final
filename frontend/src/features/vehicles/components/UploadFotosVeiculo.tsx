"use client";

import { Camera, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FotoPreview {
  id: string;
  url: string;
}

export function UploadFotosVeiculo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);

  function adicionar(files: FileList | null) {
    if (!files) return;
    const novas = Array.from(files).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      url: URL.createObjectURL(f),
    }));
    setFotos((prev) => [...prev, ...novas]);
  }

  function remover(id: string) {
    setFotos((prev) => {
      const alvo = prev.find((p) => p.id === id);
      if (alvo) URL.revokeObjectURL(alvo.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  return (
    <div>
      <Label>Fotos do veículo</Label>
      <div className="mt-2 flex flex-wrap gap-3">
        {fotos.map((f) => (
          <div key={f.id} className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-700">
            <img src={f.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
              onClick={() => remover(f.id)}
              aria-label="Remover foto"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-dashed border-gray-600 text-gray-500 hover:border-cyan-500 hover:text-cyan-400"
        >
          <Plus className="h-6 w-6" />
          <span className="mt-1 text-[10px]">Adicionar</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => adicionar(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => adicionar(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => cameraRef.current?.click()}
      >
        <Camera className="mr-2 h-4 w-4" />
        Tirar foto
      </Button>
    </div>
  );
}
