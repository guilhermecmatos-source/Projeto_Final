"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";

export default function PartnerRegisterPage() {
  return (
    <FormShell
      title="Novo Parceiro"
      subtitle="Cadastro de oficina, distribuidora ou revenda na rede."
      backHref="/partners"
      redirectOnSuccess="/partners"
      onSubmit={async () => {
        /* módulo de parceiros ainda sem endpoint dedicado */
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField label="Razão social" name="name" required />
        <FormField label="Cidade" name="city" required />
        <FormField
          label="Tipo"
          name="type"
          options={[
            { value: "workshop", label: "Oficina" },
            { value: "distributor", label: "Distribuidora" },
            { value: "dealer", label: "Revendedora" },
          ]}
        />
        <FormField label="E-mail de contato" name="email" type="email" />
      </section>
    </FormShell>
  );
}
