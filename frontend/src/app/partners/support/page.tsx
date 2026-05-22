"use client";

import FormField from "@/components/forms/FormField";
import FormShell from "@/components/forms/FormShell";

export default function PartnerSupportPage() {
  return (
    <FormShell
      title="Abrir Chamado de Suporte"
      subtitle="Descreva o problema para a equipe FleetAI."
      backHref="/partners"
      redirectOnSuccess="/partners"
      submitLabel="Abrir Chamado"
      onSubmit={async () => {
        /* fila de suporte — integração futura */
      }}
    >
      <section className="raised-card grid gap-4 p-6">
        <FormField label="Assunto" name="subject" required />
        <FormField label="Parceiro / Empresa" name="partner" required />
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
