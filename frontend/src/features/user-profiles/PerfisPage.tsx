"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarraExportacao } from "@/components/forms/BarraExportacao";
import { DataTable } from "@/components/tables/DataTable";
import { useToast } from "@/hooks/useToast";
import { perfilUsuarioSchema } from "@/lib/validations/profile";
import { mascaraTelefone, parseTelefone } from "@/lib/masks";
import { STORAGE_KEYS } from "@/lib/constants";
import type { UserProfile } from "@/types";

function carregarPerfis(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.profiles) || "[]");
  } catch {
    return [];
  }
}

export function PerfisPage() {
  const toast = useToast();
  const [perfis, setPerfis] = useState<UserProfile[]>([]);
  const [telefone, setTelefone] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => setPerfis(carregarPerfis()), []);

  function persistir(lista: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(lista));
    setPerfis(lista);
  }

  function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dados = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      phone: parseTelefone(telefone),
      role: fd.get("role") as UserProfile["role"],
    };
    const parsed = perfilUsuarioSchema.safeParse(dados);
    if (!parsed.success) {
      toast.erro(parsed.error.errors[0]?.message ?? "Inválido");
      return;
    }
    if (editandoId) {
      persistir(
        perfis.map((p) =>
          p.id === editandoId
            ? { ...p, ...parsed.data, phone: parsed.data.phone, updatedAt: new Date().toISOString() }
            : p
        )
      );
      setEditandoId(null);
      toast.sucesso("Perfil atualizado.");
    } else {
      const novo: UserProfile = {
        id: `prof-${Date.now()}`,
        ...parsed.data,
        phone: parsed.data.phone,
        createdAt: new Date().toISOString(),
      };
      persistir([novo, ...perfis]);
      toast.sucesso("Perfil criado.");
    }
    e.currentTarget.reset();
    setTelefone("");
  }

  function excluir(id: string) {
    persistir(perfis.filter((p) => p.id !== id));
    toast.info("Perfil removido.");
  }

  const linhasExport = perfis.map((p) => ({
    nome: p.name,
    email: p.email,
    telefone: p.phone,
    papel: p.role,
  }));

  return (
    <DashboardShell titulo="Perfis de Usuário">
      <BarraExportacao
        titulo="Perfis"
        nomeArquivo="perfis-usuarios"
        colunas={[
          { header: "Nome", key: "nome" },
          { header: "E-mail", key: "email" },
          { header: "Telefone", key: "telefone" },
          { header: "Papel", key: "papel" },
        ]}
        linhas={linhasExport}
      />
      <Card className="mt-4 mb-6">
        <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Nome</Label>
            <Input name="name" required />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} required />
          </div>
          <div>
            <Label>Papel</Label>
            <select name="role" className="flex h-10 w-full rounded-xl border border-gray-700 bg-gray-900 px-3 text-sm" required>
              <option value="admin">Admin</option>
              <option value="attendant">Operador</option>
              <option value="client">Cliente</option>
            </select>
          </div>
          <Button type="submit" className="md:col-span-2 w-full sm:w-auto">
            {editandoId ? "Atualizar perfil" : "Criar perfil"}
          </Button>
        </form>
      </Card>
      {perfis.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhum perfil cadastrado.</p>
      ) : (
        <DataTable
          dados={linhasExport}
          colunas={[
            { chave: "nome", titulo: "Nome" },
            { chave: "email", titulo: "E-mail" },
            { chave: "telefone", titulo: "Telefone" },
            { chave: "papel", titulo: "Papel" },
          ]}
        />
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {perfis.map((p) => (
          <Button key={p.id} variant="outline" size="sm" onClick={() => excluir(p.id)}>
            Excluir {p.name}
          </Button>
        ))}
      </div>
    </DashboardShell>
  );
}
