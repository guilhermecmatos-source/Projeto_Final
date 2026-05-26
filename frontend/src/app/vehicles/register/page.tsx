"use client";

import { useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import CameraPhotoField from "@/components/forms/CameraPhotoField";
import { vehiclesApi, uploadsApi } from "@/services/api";

export default function VehicleRegisterPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | undefined>();

  return (
    <FormShell
      title="Cadastrar Veículo"
      subtitle="Registre um novo veículo na frota com foto opcional (câmera ou galeria)."
      backHref="/vehicles"
      redirectOnSuccess="/vehicles"
      onSubmit={async (form) => {
        const plate = String(form.get("plate")).trim();
        const res = await vehiclesApi.create({
          plate,
          brand: form.get("brand"),
          model: form.get("model"),
          year: Number(form.get("year")),
          status: form.get("status") || "active",
          mileage: Number(form.get("mileage") || 0),
        });

        const vehicleId = (res.data as { id?: string })?.id;
        if (photoFile && vehicleId) {
          try {
            await uploadsApi.upload(photoFile, "vehicle", vehicleId);
          } catch {
            if (photoPreview && plate) {
              localStorage.setItem(`vehicle_photo_${plate}`, photoPreview);
            }
          }
        } else if (photoPreview && plate) {
          localStorage.setItem(`vehicle_photo_${plate}`, photoPreview);
        }
      }}
    >
      <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        <FormField label="Placa" name="plate" placeholder="ABC-1234" required />
        <FormField label="Marca" name="brand" placeholder="Toyota" required />
        <FormField label="Modelo" name="model" placeholder="Hilux" required />
        <FormField label="Ano" name="year" type="number" placeholder="2024" required />
        <FormField
          label="Status"
          name="status"
          options={[
            { value: "active", label: "Ativo" },
            { value: "maintenance", label: "Em manutenção" },
            { value: "inactive", label: "Inativo" },
          ]}
        />
        <FormField label="Quilometragem" name="mileage" type="number" placeholder="0" />

        <div className="md:col-span-2">
          <CameraPhotoField
            onCapture={(dataUrl, file) => {
              setPhotoPreview(dataUrl);
              setPhotoFile(file);
            }}
            previewUrl={photoPreview}
          />
        </div>
      </section>
    </FormShell>
  );
}
