"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { useToast } from "@/hooks/useToast";
import { insRelatorioSchema } from "@/lib/validations/inspection";
import { STORAGE_KEYS, ROUTES } from "@/lib/constants";

export function InsRelatorioPage() {
  const toast = useToast();
  const [mecanica, setMecanica] = useState("Revisão dos freios e suspensão conforme checklist.");
  const [documentacao, setDocumentacao] = useState("CRLV e seguro válidos.");
  const [editMec, setEditMec] = useState(false);
  const [editDoc, setEditDoc] = useState(false);

  function enviarEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dados = {
      email: String(fd.get("email")),
      plate: String(fd.get("plate")),
      inspector_name: String(fd.get("inspector_name")),
      mechanical_history: mecanica,
      documentation_notes: documentacao,
    };
    const parsed = insRelatorioSchema.safeParse(dados);
    if (!parsed.success) {
      toast.erro(parsed.error.errors[0]?.message ?? "E-mail inválido");
      return;
    }
    const relatorios = JSON.parse(localStorage.getItem(STORAGE_KEYS.insReports) || "[]");
    relatorios.push({ ...dados, sentAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.insReports, JSON.stringify(relatorios));
    const assunto = encodeURIComponent(`Relatório INS — ${dados.plate}`);
    const corpo = encodeURIComponent(
      `Relatório INS\nPlaca: ${dados.plate}\nInspetor: ${dados.inspector_name}\n\nMecânica: ${mecanica}\nDocumentação: ${documentacao}`
    );
    window.location.href = `mailto:${dados.email}?subject=${assunto}&body=${corpo}`;
    toast.sucesso("Cliente de e-mail aberto com o relatório.");
  }

  const linhas = [{ email: "", plate: "", inspector_name: "" }];

  return (
    <DashboardShell titulo="Relatório INS">
      <Link href={ROUTES.inspection} className="mb-4 inline-block text-sm text-cyan-400 hover:underline">
        ← Voltar
      </Link>
      <BarraExportacao
        titulo="Relatório INS"
        nomeArquivo="relatorio-ins"
        colunas={[
          { header: "E-mail", key: "email" },
          { header: "Placa", key: "plate" },
        ]}
        linhas={linhas}
      />
      <Card className="mt-4">
        <form onSubmit={enviarEmail} className="grid gap-4">
          <div>
            <Label>E-mail destinatário</Label>
            <Input name="email" type="email" required placeholder="destino@empresa.com" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Placa</Label>
              <Input name="plate" required />
            </div>
            <div>
              <Label>Inspetor</Label>
              <Input name="inspector_name" required />
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label>Anterior Mecânica</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditMec((v) => !v)}>
                <Pencil className="h-3 w-3" />
                Editar
              </Button>
            </div>
            {editMec ? (
              <Input value={mecanica} onChange={(e) => setMecanica(e.target.value)} />
            ) : (
              <p className="text-sm text-gray-400">{mecanica}</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label>Documentação</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditDoc((v) => !v)}>
                <Pencil className="h-3 w-3" />
                Editar
              </Button>
            </div>
            {editDoc ? (
              <Input value={documentacao} onChange={(e) => setDocumentacao(e.target.value)} />
            ) : (
              <p className="text-sm text-gray-400">{documentacao}</p>
            )}
          </div>
          <Button type="submit">Enviar por E-mail</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
