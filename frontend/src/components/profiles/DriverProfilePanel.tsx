"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import SideProfilePanel from "./SideProfilePanel";
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
  vehicle_plate?: string | null;
  score: number;
  status?: string | null;
  profile_image_url?: string | null;
  cnh_image_url?: string | null;
  cnh_pdf_url?: string | null;
}

interface StoredImage {
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
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const profileInputRef = useRef<HTMLInputElement>(null);
  const cnhInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!driverId) return;
    setLoading(true);
    setError("");
    driversApi
      .get(driverId)
      .then((res) => {
        const data = res.data as { driver: DriverDetail; images: StoredImage[] };
        setDriver(data.driver);
        setImages(data.images ?? []);
      })
      .catch(() => setError("Erro ao carregar perfil."))
      .finally(() => setLoading(false));
  }, [driverId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(file: File, entityType: "driver_profile" | "driver_cnh") {
    if (!driverId) return;
    setUploading(true);
    setError("");
    try {
      await uploadsApi.upload(file, entityType, driverId);
      load();
    } catch {
      setError("Falha ao salvar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const profileUrls = [
    driver?.profile_image_url,
    driver?.cnh_image_url,
    ...images.map((i) => i.path),
  ].filter(Boolean) as string[];

  return (
    <SideProfilePanel
      open={!!driverId}
      title={driver?.name ?? "Motorista"}
      subtitle={driver?.license_number ? `CNH ${driver.license_number}` : undefined}
      onClose={onClose}
    >
      {loading ? (
        <p className="text-on-surface-variant">Carregando...</p>
      ) : driver ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container/20 text-2xl font-bold text-primary">
              {driver.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={driver.profile_image_url} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                driver.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-bold">{driver.name}</p>
              <span className={driver.status === "inativo" ? "chip-pending" : "chip-active"}>
                {driver.status ?? "Ativo"}
              </span>
            </div>
          </div>

          <section className="space-y-2 text-sm">
            <h3 className="text-label-md font-bold uppercase text-on-surface-variant">Informações</h3>
            <p><strong>CPF:</strong> {driver.cpf ?? "—"}</p>
            <p><strong>RG:</strong> {driver.rg ?? "—"}</p>
            <p><strong>Telefone:</strong> {driver.phone ?? "—"}</p>
            <p><strong>Categoria CNH:</strong> {driver.cnh_category ?? "—"}</p>
            <p><strong>Validade CNH:</strong> {driver.cnh_expiry ? new Date(driver.cnh_expiry).toLocaleDateString("pt-BR") : "—"}</p>
            <p><strong>Veículo:</strong> {driver.vehicle_plate ?? "—"}</p>
            <p><strong>Score:</strong> {Math.round(Number(driver.score))}/100</p>
          </section>

          <section>
            <h3 className="mb-3 text-label-md font-bold uppercase text-on-surface-variant">Imagens</h3>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, "driver_profile");
                e.target.value = "";
              }}
            />
            <input
              ref={cnhInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, "driver_cnh");
                e.target.value = "";
              }}
            />
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => profileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-primary-container px-3 py-2 text-sm font-medium text-on-primary-container"
              >
                <Icon name="add_photo_alternate" />
                Adicionar Imagem
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => cnhInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                <Icon name="badge" />
                CNH / Documento
              </button>
            </div>
            {profileUrls.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Nenhuma imagem cadastrada.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {profileUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${url}-${i}`} src={url} alt="" className="h-28 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </section>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      ) : (
        <p className="text-on-surface-variant">{error || "Motorista não encontrado."}</p>
      )}
    </SideProfilePanel>
  );
}
