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
  const r = role.toLowerCase();
  if (r === "administrador" || r === "admin") return "text-[#FCA311] border border-[#FCA311]/30 bg-[#FCA311]/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider";
  if (r === "gestor" || r === "attendant") return "text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider";
  return "text-slate-300 border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider";
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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
    setProfileModalOpen(true);
  };

  async function handleDelete(user: User, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este usuário permanentemente?")) return;
    try {
      await usersApi.remove(user.id);
      load();
    } catch (err: unknown) {
      alert("Erro ao excluir usuário");
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
        breadcrumb="SEDE CENTRAL / UNIDADE OPERACIONAL / USERS"
        title="Gestão de Usuários"
        subtitle="Controle de perfis corporativos e restrições de privilégios rbac."
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#FCA311]/50 bg-[#FCA311]/10 px-4 py-2 text-xs font-bold uppercase text-[#FCA311] hover:bg-[#FCA311]/20 transition"
          >
            + NOVO USUÁRIO
          </button>
        }
      />

      <section className="raised-card overflow-hidden bg-[#0c132b]/80 border-outline-variant/30">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 p-4">
          <h2 className="text-sm font-bold text-[#FCA311]">Usuários com Login Homologado</h2>
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input
              className="w-full rounded-lg bg-[#0F172A]/80 border border-outline-variant/30 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
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
        >
          <div className="table-responsive">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-[#0F172A]/40 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">OPERADOR</th>
                  <th className="px-4 py-3">CARGO / LOTAÇÃO</th>
                  <th className="px-4 py-3">CPF / RG</th>
                  <th className="px-4 py-3">PRIVILÉGIO</th>
                  <th className="px-4 py-3 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-slate-300 uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs flex items-center gap-1.5">
                            {u.name}
                            {u.role === "solicitante" && <span className="text-[10px] text-slate-400 font-normal">(Condutor)</span>}
                            <button onClick={() => handleSelectUser(u)} className="text-[9px] text-blue-400 hover:text-blue-300 font-medium">(Ficha)</button>
                          </p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      <p className="font-semibold">{u.cargo ?? "Não definido"}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{u.unidade ?? "Sem lotação"}</p>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                      <p>CPF: <span className="text-slate-300">{u.cpf || "000.000.000-00"}</span></p>
                      <p className="mt-0.5">RG: <span className="text-slate-300">{u.rg || "00.000.000-0"}</span></p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={roleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition">
                        <button onClick={() => handleSelectUser(u)} className="p-1 text-slate-400 hover:text-blue-400 transition" title="Ver Ficha">
                          <Icon name="visibility" className="text-sm" />
                        </button>
                        <button onClick={(e) => handleDelete(u, e)} className="p-1 text-slate-400 hover:text-red-400 transition" title="Excluir">
                          <Icon name="delete" className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ListPageStates>
      </section>

      {/* Modal Novo Usuário */}
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

      {/* Modal View Profile */}
      {profileModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0c132b] shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col">
            {/* Header blue gradient */}
            <div className="bg-gradient-to-b from-blue-600 to-[#121b38] pt-8 pb-10 flex flex-col items-center relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#121b38] bg-slate-300 relative overflow-hidden shadow-lg flex items-center justify-center text-3xl font-bold text-slate-500 uppercase">
                {selectedUser.name.charAt(0)}
              </div>
              <div className="absolute top-[88px] right-[140px] w-4 h-4 rounded-full bg-[#FCA311] border-2 border-[#121b38]"></div>
              
              <h3 className="mt-3 text-lg font-bold text-white">{selectedUser.name}</h3>
              <p className="text-xs text-slate-300">{selectedUser.email}</p>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">PRIVILÉGIO RBAC</span>
                <span className="text-blue-500">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">CARGO CORPORATIVO</span>
                <span className="text-slate-300 capitalize text-right">{selectedUser.cargo || "Não informado"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">LOTAÇÃO / UNIDADE</span>
                <span className="text-slate-300 capitalize text-right">{selectedUser.unidade || "Não informada"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">DOCUMENTO CPF</span>
                <span className="text-slate-300 font-mono">{selectedUser.cpf || "000.000.000-00"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">DOCUMENTO RG</span>
                <span className="text-slate-300 font-mono">{selectedUser.rg || "00.000.000-0"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <span className="text-slate-500">STATUS DE LOGIN</span>
                <span className="text-[#FCA311]">PENDENTE</span>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="text-slate-500">ACEITOU TERMOS & LGPD</span>
                <span className="text-green-400">Sim, Homologado</span>
              </div>
              
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="w-full mt-2 py-3 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-[#0c132b] font-black uppercase text-xs tracking-widest transition"
              >
                FECHAR PERFIL
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
