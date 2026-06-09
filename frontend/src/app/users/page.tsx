"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import ListPageStates from "@/components/ui/ListPageStates";
import { usersApi } from "@/services/api";
import { extractApiError } from "@/lib/api-errors";
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
  const [fetchError, setFetchError] = useState<string | null>(null);
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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
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
    setFetchError(null);
    usersApi
      .list()
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setUsers([]);
        setFetchError(extractApiError(err, "Não foi possível carregar os usuários."));
      })
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

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      cpf: user.cpf || "",
      rg: user.rg || "",
      cargo: user.cargo || "",
      unidade: user.unidade || "",
      role: user.role || "solicitante",
    });
    setEditError("");
    setEditModalOpen(true);
  };

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    if (!selectedUser) return;
    const em = validateEmail(editForm.email);
    if (!em.valid) return setEditError(em.message ?? "E-mail inválido");
    if (editForm.cpf) {
      const cp = validateCpf(editForm.cpf);
      if (!cp.valid) return setEditError(cp.message ?? "CPF inválido");
    }

    const payload: Record<string, unknown> = {
      name: editForm.name,
      email: editForm.email,
      cpf: editForm.cpf,
      rg: editForm.rg,
      cargo: editForm.cargo,
      unidade: editForm.unidade,
      role: editForm.role,
    };
    if (editForm.password) {
      payload.password = editForm.password;
    }

    try {
      await usersApi.update(selectedUser.id, payload);
      setEditModalOpen(false);
      load();
    } catch (err: unknown) {
      setEditError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao atualizar usuário"
      );
    }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    if (!confirm("Tem certeza que deseja excluir este usuário permanentemente?")) return;
    try {
      await usersApi.remove(selectedUser.id);
      setEditModalOpen(false);
      load();
    } catch (err: unknown) {
      setEditError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao excluir usuário"
      );
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
        <ListPageStates
          loading={loading}
          error={fetchError}
          isEmpty={filtered.length === 0}
          onRetry={load}
          loadingMessage="Carregando usuários..."
          emptyTitle={search ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
          emptyDescription={search ? "Tente outro termo de busca." : "Adicione o primeiro perfil corporativo."}
          emptyIcon="manage_accounts"
          emptyAction={
            !search ? (
              <ActionButton onClick={() => setModalOpen(true)}>
                <Icon name="person_add" />
                Novo Usuário
              </ActionButton>
            ) : undefined
          }
        >
          <div className="table-responsive">
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
                {filtered.map((u) => (
                  <tr key={u.id} className="cursor-pointer hover:bg-surface-container-high/40 transition" onClick={() => handleSelectUser(u)}>
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
          </div>
        </ListPageStates>
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

      <FormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Detalhes do Usuário"
        subtitle="EDITAR OU EXCLUIR PERFIL CORPORATIVO"
      >
        <form className="space-y-3" onSubmit={handleUpdate}>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Nome Completo</label>
            <input className="input-fleet" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">E-mail Corporativo</label>
            <input className="input-fleet" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">CPF</label>
              <input className="input-fleet" value={editForm.cpf} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">RG</label>
              <input className="input-fleet" value={editForm.rg} onChange={(e) => setEditForm({ ...editForm, rg: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Cargo</label>
              <input className="input-fleet" value={editForm.cargo} onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Unidade</label>
              <input className="input-fleet" value={editForm.unidade} onChange={(e) => setEditForm({ ...editForm, unidade: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Nova Senha (deixe em branco para manter)</label>
            <input className="input-fleet" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">Perfil de Privilégios</label>
            <select className="input-fleet" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {editError && <p className="text-sm text-error">{editError}</p>}
          
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-error hover:bg-red-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1 flex-1 font-bold"
            >
              <Icon name="delete" />
              Excluir
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 uppercase font-semibold text-xs tracking-wider"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </FormModal>
    </AppShell>
  );
}
