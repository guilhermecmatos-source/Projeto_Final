"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import { usersApi } from "@/services/api";
import { User } from "@/types";
import { validateCpf, validateEmail } from "@/lib/validators";

const ROLES = [
  { value: "solicitante", label: "Solicitante (Motorista)" },
  { value: "gestor", label: "Gestor" },
  { value: "administrador", label: "Administrador" },
];

function roleBadge(role: string) {
  if (role === "administrador" || role === "admin") return "badge-admin";
  if (role === "gestor" || role === "attendant") return "badge-gestor";
  return "badge-solicitante";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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
      setForm({ name: "", email: "", password: "", cpf: "", rg: "", cargo: "", unidade: "", role: "solicitante" });
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao criar usuário");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Users"
        title="Gestão de Usuários"
        subtitle="Controle de perfis corporativos e restrições de privilégios rbac."
        actions={
          <ActionButton onClick={() => setModalOpen(true)}>
            <Icon name="person_add" />
            Novo Usuário
          </ActionButton>
        }
      />

      <section className="raised-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4">
          <h2 className="text-headline-sm">Usuários com Login Homologado</h2>
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="input-fleet pl-10 !h-10"
              placeholder="Filtrar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="zebra-table w-full text-sm">
          <thead>
            <tr className="border-b bg-surface-container-high text-left text-[10px] font-bold uppercase text-on-surface-variant">
              <th className="px-4 py-3">Operador</th>
              <th className="px-4 py-3">Cargo / Lotação</th>
              <th className="px-4 py-3">CPF / RG</th>
              <th className="px-4 py-3">Privilégio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center">Carregando...</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary">
                      {u.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{u.cargo ?? "—"} {u.unidade ? `| ${u.unidade}` : ""}</td>
                <td className="px-4 py-3 text-xs">{u.cpf ?? "—"} / {u.rg ?? "—"}</td>
                <td className="px-4 py-3"><span className={roleBadge(u.role)}>{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adicionar Novo Perfil"
        subtitle="FORMULÁRIO DE CADASTRO CORPORATIVO"
      >
        <form className="space-y-3" onSubmit={handleCreate}>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Nome Completo</label>
            <input className="input-fleet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">E-mail Corporativo</label>
            <input className="input-fleet" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">CPF</label>
              <input className="input-fleet" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">RG</label>
              <input className="input-fleet" value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Cargo</label>
              <input className="input-fleet" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Unidade</label>
              <input className="input-fleet" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Senha</label>
            <input className="input-fleet" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Perfil de Privilégios</label>
            <select className="input-fleet" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" className="btn-primary w-full uppercase">Gravar Usuário</button>
        </form>
      </FormModal>
    </AppShell>
  );
}
