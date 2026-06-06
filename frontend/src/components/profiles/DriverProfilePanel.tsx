"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SideProfilePanel from "./SideProfilePanel";
import Icon from "@/components/ui/Icon";
import { driversApi, uploadsApi } from "@/services/api";

interface DriverDetail {
  id: string;
  name: string;
  license_number: string;
  phone?: string | null;
  cpf?: string | null;
  rg?: string | null;
  cnh_category?: string | null;
  cnh_expiry?: string | null;
  status?: string | null;
  score: number;
  vehicle_plate?: string | null;
  profile_image_url?: string | null;
  cnh_image_url?: string | null;
}

interface UploadRow {
  id: string;
  path: string;
  filename: string;
  mime_type: string;
}

interface DriverProfilePanelProps {
  driverId: string | null;
  onClose: () => void;
}

export default function DriverProfilePanel({ driverId, onClose }: DriverProfilePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [images, setImages] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    if (!driverId) return;
    setLoading(true);
    driversApi
      .get(driverId)
      .then((res) => {
        const data = res.data as { driver: DriverDetail; images: UploadRow[] };
        setDriver(data.driver);
        setImages(data.images ?? []);
      })
      .catch(() => {
        setDriver(null);
        setImages([]);
      })
      .finally(() => setLoading(false));
  }, [driverId]);

  useEffect(() => {
    if (driverId) load();
    else {
      setDriver(null);
      setImages([]);
    }
  }, [driverId, load]);

  async function handleUpload(file: File, type: "driver_profile" | "driver_cnh") {
    if (!driverId) return;
    setUploading(true);
    setMessage("");
    try {
      await uploadsApi.upload(file, type, driverId);
      setMessage("Imagem salva com sucesso.");
      load();
    } catch {
      setMessage("Falha ao salvar imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <SideProfilePanel
      open={!!driverId}
      title={driver?.name ?? "Perfil do Motorista"}
      subtitle="Documentos, fotos e dados operacionais"
      onClose={onClose}
    >
      {loading ? (
        <p className="text-on-surface-variant">Carregando perfil...</p>
      ) : !driver ? (
        <p className="text-on-surface-variant">Motorista não encontrado.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
              {driver.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={driver.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{driver.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-bold">{driver.name}</p>
              <p className="text-sm text-on-surface-variant">CNH {driver.license_number}</p>
              <span className="chip-active mt-1 inline-block">{driver.status ?? "Ativo"}</span>
            </div>
          </div>

          <dl className="grid gap-3 text-sm">
            {[
              ["CPF", driver.cpf],
              ["RG", driver.rg],
              ["Telefone", driver.phone],
              ["Categoria", driver.cnh_category],
              ["Vencimento CNH", driver.cnh_expiry ? new Date(driver.cnh_expiry).toLocaleDateString("pt-BR") : null],
              ["Veículo", driver.vehicle_plate],
              ["Score", `${Math.round(Number(driver.score))}/100`],
            ].map(([label, value]) =>
              value ? (
                <div key={String(label)} className="flex justify-between gap-2 border-b border-outline-variant/40 pb-2">
                  <dt className="text-on-surface-variant">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ) : null
            )}
          </dl>

          <div>
            <h3 className="mb-3 text-label-md uppercase text-primary">Fotos & Documentos</h3>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, "driver_profile");
                e.target.value = "";
              }}
            />
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-primary"
              >
                <Icon name="add_a_photo" />
                {uploading ? "Salvando..." : "Adicionar Imagem"}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (ev) => {
                    const file = (ev.target as HTMLInputElement).files?.[0];
                    if (file) handleUpload(file, "driver_cnh");
                  };
                  input.click();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface-variant"
              >
                <Icon name="badge" />
                CNH
              </button>
            </div>
            {message && <p className="mb-2 text-xs text-primary">{message}</p>}
            <div className="grid grid-cols-2 gap-2">
              {images.length === 0 && !driver.cnh_image_url ? (
                <p className="col-span-2 text-sm text-on-surface-variant">Nenhuma imagem cadastrada.</p>
              ) : (
                <>
                  {driver.cnh_image_url && (
                    <a href={driver.cnh_image_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-outline-variant">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={driver.cnh_image_url} alt="CNH" className="h-28 w-full object-cover" />
                    </a>
                  )}
                  {images.map((img) => (
                    <a key={img.id} href={img.path} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-outline-variant">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.path} alt={img.filename} className="h-28 w-full object-cover" />
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </SideProfilePanel>
  );
}
