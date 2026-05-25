"use client";

import { useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import Icon from "@/components/ui/Icon";
import { vehiclesApi } from "@/services/api";

export default function VehicleRegisterPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vehicle_photo_pending", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <FormShell
      title="Cadastrar Veículo"
      subtitle="Registre um novo veículo na frota com foto opcional."
      backHref="/vehicles"
      redirectOnSuccess="/vehicles"
      onSubmit={async (form) => {
        const plate = String(form.get("plate"));
        const photo = sessionStorage.getItem("vehicle_photo_pending");
        if (photo && plate) {
          localStorage.setItem(`vehicle_photo_${plate}`, photo);
        }
        await vehiclesApi.create({
          plate,
          brand: form.get("brand"),
          model: form.get("model"),
          year: Number(form.get("year")),
          status: form.get("status") || "active",
          mileage: Number(form.get("mileage") || 0),
        });
        sessionStorage.removeItem("vehicle_photo_pending");
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
          <label className="mb-1 block text-label-md text-on-surface-variant">
            Foto do veículo
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low px-6 py-8 transition hover:border-primary">
              <Icon name="add_a_photo" className="mb-2 text-3xl text-primary" />
              <span className="text-sm font-medium text-primary">Enviar foto</span>
              <span className="mt-1 text-xs text-on-surface-variant">JPG, PNG até 5MB</span>
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            {photoPreview && (
              <div className="flex-1">
                <img
                  src={photoPreview}
                  alt="Preview do veículo"
                  className="max-h-48 w-full rounded-lg border border-outline-variant object-cover sm:max-w-xs"
                />
                {photoName && (
                  <p className="mt-2 text-xs text-on-surface-variant">{photoName}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </FormShell>
  );
}
