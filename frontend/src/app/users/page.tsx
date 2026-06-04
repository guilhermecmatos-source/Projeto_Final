"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { usersApi } from "@/services/api";
import { User } from "@/types";
import { validateCpf, validateEmail } from "@/lib/validators";

const ROLES = [
  { value: "solicitante", label: "Solicitante" },
  { value: "motorista", label: "Motorista" },
  { value: "gestor", label: "Gestor" },
  { value: "administrador", label: "Administrador" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    rg: "",
    cargo: "",
    unidade: "",
    role: "solicitante",
  });

  const load = useCallback(() => {
    setLoading(true);
    usersApi
      .list()
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const em = validateEmail(form.email);
    if (!em.valid) return setError(em.message ?? "E-mail inválido");
    if (form.cpf) {
      const cp = validateCpf(form.cpf);
      if (!cp.valid) return setError(cp.message ?? "CPF inválido");
    }
    try {
      await usersApi.create(form);
      setForm({
        name: "",
        email: "",
        password: "",
        cpf: "",
        rg: "",
        cargo: "",
        unidade: "",
        role: "solicitante",
      });
      load();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Erro ao criar usuário"
      );
    }
  }

  return (
    <AppShell headerTitle="Usuários">
      <PageHeader title="Gestão de Usuários" subtitle="CRUD, perfis e permissões corporativas." />

      <form onSubmit={handleCreate} className="raised-card mb-8 grid gap-4 p-6 md:grid-cols-2">
        <h3 className="md:col-span-2 text-headline-sm font-bold">Novo usuário</h3>
        {(
          [
            ["name", "Nome", "text"],
            ["email", "E-mail", "email"],
            ["password", "Senha", "password"],
            ["cpf", "CPF", "text"],
            ["rg", "RG", "text"],
            ["cargo", "Cargo", "text"],
            ["unidade", "Unidade", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <div key={key}>
            <label className="mb-1 block text-label-md text-on-surface-variant">{label}</label>
            <input
              className="input-fleet"
              type={type}
              required={key === "name" || key === "email" || key === "password"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-label-md text-on-surface-variant">Perfil</label>
          <select
            className="input-fleet"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="md:col-span-2 text-sm text-error">{error}</p>}
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary">
            Cadastrar usuário
          </button>
        </div>
      </form>

      <div className="raised-card overflow-hidden">
        <table className="zebra-table w-full">
          <thead>
            <tr className="border-b text-left text-label-md text-on-surface-variant">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4">Unidade</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  Carregando...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-bold">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                  <td className="px-6 py-4">{u.unidade ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
