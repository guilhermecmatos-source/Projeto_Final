"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";

const SECTIONS = [
  {
    title: "Exterior",
    items: [
      { name: "Lataria", detail: "Sem amassados ou riscos profundos." },
      { name: "Pneus", detail: "Calibragem e sulcos dentro do limite legal." },
      { name: "Vidros", detail: "Para-brisa e laterais sem trincas." },
    ],
    status: "ok" as const,
  },
  {
    title: "Mecânica",
    items: [
      { name: "Motor", detail: "Sem vazamentos; ruído normal em marcha lenta." },
      { name: "Freios", detail: "Pastilhas com 60% de vida útil restante." },
      { name: "Suspensão", detail: "Amortecedores firmes; sem folga excessiva." },
    ],
    status: "ok" as const,
  },
  {
    title: "Documentação",
    items: [
      { name: "CRLV", detail: "Válido até 12/2026." },
      { name: "Seguro", detail: "Apólice vence em 30 dias — renovar." },
      { name: "Licenciamento", detail: "Em dia para o exercício atual." },
    ],
    status: "warn" as const,
  },
];

function InspectionDetailContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") || "INS-2026-041";
  const [expanded, setExpanded] = useState<string | null>("Exterior");

  // Email modal states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Relatório de Inspeção ${reportId}`);
  const [emailBody, setEmailBody] = useState(
    `Olá,\n\nSegue em anexo o relatório de inspeção detalhado para o veículo ABC-1234 (Toyota Hilux).\nScore Final: 92/100 (Aprovado).\n\nAtenciosamente,\nEquipe RUV Intelligence Hub`
  );
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  function toggle(title: string) {
    setExpanded((prev) => (prev === title ? null : title));
  }

  function downloadMockPDF() {
    const content = `%PDF-1.4
%
1 0 obj
<< /Title (Relatorio de Inspecao ${reportId}) /Author (FleetAI) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << >> >>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
70 700 Td
(Relatorio de Inspecao: ${reportId}) Tj
/F1 10 Tf
0 -20 Td
(Veiculo: ABC-1234 - Toyota Hilux) Tj
0 -20 Td
(Score Final: 92/100) Tj
0 -20 Td
(Status: Aprovado) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000078 00000 n 
0000000127 00000 n 
0000000187 00000 n 
0000000293 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
443
%%EOF`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-inspeção-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleSendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSendingEmail(true);
    setSendSuccess("");
    
    // Simulate SMTP network call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setSendSuccess(`E-mail enviado com sucesso para ${emailTo}! Cópia (CC) encaminhada para o remetente.`);
    setSendingEmail(false);
    setTimeout(() => {
      setEmailModalOpen(false);
      setSendSuccess("");
      setEmailTo("");
    }, 1500);
  }

  return (
    <AppShell headerTitle="Inspeção Detalhada">
      <div className="mb-6">
        <Link
          href="/inspection"
          className="inline-flex items-center gap-1 text-label-md text-primary hover:underline"
        >
          <Icon name="arrow_back" className="text-base" />
          Voltar
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-bold text-primary">Relatório {reportId}</h1>
          <p className="text-body-md text-on-surface-variant">
            Veículo ABC-1234 • Toyota Hilux • 20/05/2026
          </p>
        </div>
        <div className="w-full rounded-xl border border-outline-variant bg-white px-6 py-4 text-center sm:w-auto">
          <p className="text-label-md text-on-surface-variant">Score Final</p>
          <p className="text-headline-lg font-bold text-primary">92/100</p>
          <span className="chip-active mt-2 inline-block">Aprovado</span>
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const isOpen = expanded === s.title;
          return (
            <section key={s.title} className="raised-card overflow-hidden">
              <button
                type="button"
                className="accordion-trigger w-full rounded-none border-0 bg-transparent px-4 py-4 sm:px-6"
                onClick={() => toggle(s.title)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <h3 className="text-headline-sm">{s.title}</h3>
                  <Icon
                    name={s.status === "ok" ? "check_circle" : "warning"}
                    className={s.status === "ok" ? "text-green-600" : "text-secondary-container"}
                    filled
                  />
                </span>
                <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-primary" />
              </button>

              {isOpen && (
                <div className="accordion-panel mx-4 mb-4 sm:mx-6">
                  <ul className="space-y-3">
                    {s.items.map((item) => (
                      <li key={item.name} className="border-b border-outline-variant/30 pb-3 last:border-0">
                        <p className="flex items-center gap-2 font-semibold text-body-md">
                          <Icon name="chevron_right" className="text-sm text-outline" />
                          {item.name}
                        </p>
                        <p className="mt-1 pl-6 text-sm text-on-surface-variant">{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-6 raised-card p-4 sm:p-6">
        <h3 className="mb-4 text-headline-sm">Observações do Inspetor</h3>
        <p className="text-body-md text-on-surface-variant">
          Veículo em excelente estado geral. Recomenda-se regularizar documentação do seguro antes da
          próxima viagem intermunicipal.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ActionButton onClick={downloadMockPDF} variant="primary">
            <Icon name="download" />
            Exportar PDF
          </ActionButton>
          <ActionButton onClick={() => setEmailModalOpen(true)} variant="outline">
            <Icon name="email" />
            Enviar por E-mail
          </ActionButton>
        </div>
      </section>

      {/* Modal de Envio de E-mail */}
      <FormModal
        open={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setSendSuccess("");
        }}
        title="Enviar Relatório por E-mail"
        subtitle={`Encaminhar o Relatório ${reportId} em PDF`}
      >
        <form className="space-y-4 text-slate-100" onSubmit={handleSendEmail}>
          <div>
            <label htmlFor="email_to" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
              Destinatário (E-mail)
            </label>
            <input
              id="email_to"
              name="to"
              type="email"
              className="input-fleet"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              required
              placeholder="exemplo@empresa.com.br"
            />
          </div>
          <div>
            <label htmlFor="email_subject" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
              Assunto
            </label>
            <input
              id="email_subject"
              name="subject"
              type="text"
              className="input-fleet"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email_body" className="mb-1 block text-label-md text-on-surface-variant font-bold uppercase text-[10px]">
              Mensagem
            </label>
            <textarea
              id="email_body"
              name="body"
              className="input-fleet min-h-[120px] resize-y py-3"
              rows={5}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs text-primary">
            <Icon name="mail" />
            <span>Uma cópia (CC) será enviada automaticamente para o seu e-mail cadastrado.</span>
          </div>

          {sendSuccess && <p className="text-sm font-semibold text-green-400">{sendSuccess}</p>}
          
          <button
            type="submit"
            disabled={sendingEmail || !!sendSuccess}
            className="btn-primary w-full uppercase"
          >
            {sendingEmail ? "Enviando..." : "Enviar E-mail"}
          </button>
        </form>
      </FormModal>
    </AppShell>
  );
}

export default function InspectionDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell headerTitle="Inspeção Detalhada">
          <p className="text-on-surface-variant">Carregando relatório...</p>
        </AppShell>
      }
    >
      <InspectionDetailContent />
    </Suspense>
  );
}
