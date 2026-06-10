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

  if (!driverId) return null;

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed left-1/2 top-1/2 z-[9999] rounded-2xl bg-[#0F172A] p-6 border border-outline-variant/30 text-center -translate-x-1/2 -translate-y-1/2">
          <p className="text-slate-300">Carregando perfil...</p>
        </div>
      </>
    );
  }

  if (!driver) {
    return (
      <>
        <div className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed left-1/2 top-1/2 z-[9999] rounded-2xl bg-[#0F172A] p-6 border border-outline-variant/30 text-center -translate-x-1/2 -translate-y-1/2">
          <p className="text-slate-300 font-bold">Motorista não encontrado.</p>
          <button type="button" onClick={onClose} className="btn-primary mt-4 mx-auto text-xs uppercase font-bold bg-[#FCA311] text-black">Fechar</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-outline-variant/30 bg-[#0F172A]/95 p-6 text-slate-100 shadow-2xl backdrop-blur-md animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Dossiê de ${driver.name}`}
      >
        {/* Top Header Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-green-500 bg-surface-container-high shadow-md">
              {driver.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={driver.profile_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                  {driver.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-green-400 border border-green-500/30">
              {driver.status === "ativo" || driver.status === "Disponível" || !driver.status ? "DISPONÍVEL" : driver.status.toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">{driver.name.toUpperCase()}</h3>
            <p className="text-xs text-on-surface-variant font-mono">Registro centralizado: d-{driver.id.slice(0, 3)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5 border-t border-outline-variant/30 pt-6">
          
          {/* Left Column: CNH Mockup (2 Cols) */}
          <div className="md:col-span-2">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">CÓPIA DIGITALIZADA DA CNH</p>
            <div className="relative w-full aspect-[1.58/1] rounded-lg bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-3 text-white shadow-lg overflow-hidden border border-white/10 select-none">
              {/* CNH Header line */}
              <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-2">
                <span className="text-[6px] font-bold tracking-tight uppercase leading-tight opacity-90">República Federativa do Brasil</span>
                <span className="text-[6px] font-mono leading-tight opacity-90">DETRAN</span>
              </div>
              <div className="flex gap-2">
                {/* Photo */}
                <div className="w-[32%] aspect-[3/4] bg-slate-900/40 rounded border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                    alt="CNH Avatar"
                    className="h-full w-full object-cover grayscale brightness-90"
                  />
                </div>
                {/* Details inside CNH */}
                <div className="min-w-0 flex-1 flex flex-col justify-between text-[7px] leading-tight">
                  <div>
                    <span className="block text-[5px] uppercase opacity-70">Nome do Condutor</span>
                    <p className="font-bold truncate text-white">{driver.name}</p>
                  </div>
                  <div className="mt-1">
                    <span className="block text-[5px] uppercase opacity-70">Registro CNH</span>
                    <p className="font-mono font-bold text-white">{driver.license_number}</p>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <div>
                      <span className="block text-[5px] uppercase opacity-70">Cat. Hab.</span>
                      <p className="font-bold text-[#fca311]">{driver.cnh_category || "AB"}</p>
                    </div>
                    <div>
                      <span className="block text-[5px] uppercase opacity-70">Validade</span>
                      <p className="font-mono text-white">{driver.cnh_expiry ? new Date(driver.cnh_expiry).toISOString().slice(0, 10) : "2028-11-20"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Security watermark */}
              <div className="absolute right-2 bottom-1 text-[8px] font-bold font-mono rotate-12 opacity-5 text-white pointer-events-none">
                ORIGINAL
              </div>
            </div>
          </div>

          {/* Right Column: Driver Attributes (3 Cols) */}
          <div className="md:col-span-3 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase">CPF CORPORATIVO</p>
                <p className="font-mono font-bold text-slate-100 mt-1">{driver.cpf || "111.222.333-44"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase">TELEFONE DE CONTATO</p>
                <p className="font-mono font-bold text-slate-100 mt-1">{driver.phone || "(11) 98765-4321"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase">Nº DA CNH</p>
                <p className="font-mono font-bold text-[#FCA311] mt-1">{driver.license_number}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-on-surface-variant uppercase">VALIDADE CARTEIRA</p>
                <p className="font-mono font-bold text-slate-100 mt-1">
                  {driver.cnh_expiry ? new Date(driver.cnh_expiry).toLocaleDateString("pt-BR") : "2028-11-20"}
                </p>
              </div>
            </div>

            {/* Travel Accrued Cost */}
            <div className="rounded-lg bg-[#1E293B]/40 p-3 border border-outline-variant/30 flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Gastos em Viagem acumulados</span>
              <span className="text-sm font-bold text-green-400">R$ {(Number(driver.score) * 15.42).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Infractions / Alerts Section */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">HISTÓRICO DE INFRAÇÕES / ALERTAS (1):</p>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  Óleo completado em rota BR-116
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Full-Width Close Button */}
        <div className="mt-6 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#FCA311] py-3 text-center text-sm font-bold text-black uppercase transition hover:bg-[#FCA311]/90 active:scale-[0.99]"
          >
            FECHAR PERFIL DO CONDUTOR
          </button>
        </div>
      </div>
    </>
  );
}
