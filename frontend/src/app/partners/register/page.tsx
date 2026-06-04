"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { partnersApi } from "@/services/api";
import { validateCnpj, validateEmail } from "@/lib/validators";

export default function PartnerRegisterPage() {
  return (
    <FormShell
      title="Novo Parceiro"
      subtitle="Cadastro de oficina, distribuidora ou revenda na rede."
      backHref="/partners"
      redirectOnSuccess="/partners"
      onSubmit={async (form) => {
        const cnpj = String(form.get("cnpj") || "").trim();
        const email = String(form.get("email") || "").trim();
        if (cnpj) {
          const c = validateCnpj(cnpj);
          if (!c.valid) throw { response: { data: { error: c.message } } };
        }
        if (email) {
          const e = validateEmail(email);
          if (!e.valid) throw { response: { data: { error: e.message } } };
        }
        await partnersApi.create({
          name: form.get("name"),
          city: form.get("city"),
          type: form.get("type") || "workshop",
          email: email || undefined,
          cnpj: cnpj || undefined,
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6 md:grid-cols-2">
        <FormField label="Razão social" name="name" required />
        <FormField label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" />
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
        <FormField label="E-mail de contato" name="email" type="email" className="md:col-span-2" />
      </section>
    </FormShell>
  );
}
