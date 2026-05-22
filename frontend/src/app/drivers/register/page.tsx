"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { driversApi } from "@/services/api";

export default function DriverRegisterPage() {
  return (
    <FormShell
      title="Novo Motorista"
      subtitle="Cadastre motorista com CNH e contato."
      backHref="/drivers"
      redirectOnSuccess="/drivers"
      onSubmit={async (form) => {
        await driversApi.create({
          name: form.get("name"),
          license_number: form.get("license_number"),
          phone: form.get("phone") || "",
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField label="Nome completo" name="name" required />
        <FormField label="Número da CNH" name="license_number" required />
        <FormField label="Telefone" name="phone" placeholder="(11) 99999-9999" />
      </section>
    </FormShell>
  );
}
