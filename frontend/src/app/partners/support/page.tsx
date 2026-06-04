"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";
import { partnersApi } from "@/services/api";

export default function PartnerSupportPage() {
  const [partnerOptions, setPartnerOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Sem vínculo / geral" },
  ]);

  useEffect(() => {
    partnersApi
      .list()
      .then((res) => {
        const partners = (res.data as { partners?: { id: string; name: string }[] })?.partners ?? [];
        setPartnerOptions([
          { value: "", label: "Sem vínculo / geral" },
          ...partners.map((p) => ({ value: p.id, label: p.name })),
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <FormShell
      title="Abrir Chamado de Suporte"
      subtitle="Chamado registrado na base de parceiros."
      backHref="/partners"
      redirectOnSuccess="/partners"
      submitLabel="Abrir Chamado"
      onSubmit={async (form) => {
        const partnerId = String(form.get("partner_id") || "");
        await partnersApi.createTicket({
          subject: form.get("subject"),
          partner_name: form.get("partner_name"),
          message: form.get("message"),
          partner_id: partnerId || undefined,
          priority: form.get("priority") || "normal",
        });
      }}
    >
      <section className="raised-card grid gap-4 p-6">
        <FormField label="Assunto" name="subject" required />
        <FormField label="Nome do solicitante / empresa" name="partner_name" required />
        <FormField
          label="Parceiro vinculado"
          name="partner_id"
          options={partnerOptions}
        />
        <FormField
          label="Prioridade"
          name="priority"
          options={[
            { value: "normal", label: "Normal" },
            { value: "alta", label: "Alta" },
          ]}
        />
        <div>
          <label htmlFor="message" className="mb-1 block text-label-md text-on-surface-variant">
            Descrição
          </label>
          <textarea id="message" name="message" className="input-fleet min-h-32" required />
        </div>
      </section>
    </FormShell>
  );
}
