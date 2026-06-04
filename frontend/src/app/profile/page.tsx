"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import {
  addProfile,
  getProfiles,
  saveProfiles,
  setActiveProfile,
  StoredProfile,
} from "@/lib/profiles";

export default function ProfilePage() {
  const { user, setUser } = useAuth(false);
  const [profiles, setProfiles] = useState<StoredProfile[]>(() =>
    typeof window !== "undefined" ? getProfiles() : []
  );

  function refresh() {
    setProfiles(getProfiles());
  }

  function handleSwitch(p: StoredProfile) {
    setActiveProfile(p);
    setUser(p);
  }

  function handleAdd() {
    const name = prompt("Nome do perfil:");
    if (!name?.trim()) return;
    const email = prompt("E-mail:") || `${Date.now()}@fleet.local`;
    const role = (prompt("Papel (admin/attendant/client):") || "attendant") as StoredProfile["role"];
    const p = addProfile({
      id: `local-${Date.now()}`,
      name: name.trim(),
      email,
      role: ["admin", "attendant", "client"].includes(role) ? role : "attendant",
    });
    refresh();
    setUser(p);
  }

  function handleRemove(profileId: string) {
    const next = getProfiles().filter((p) => p.profileId !== profileId);
    saveProfiles(next);
    refresh();
  }

  return (
    <AppShell headerTitle="Perfis de Usuário">
      <PageHeader
        title="Perfis de Usuário"
        subtitle="Crie e alterne entre múltiplos perfis na mesma conta."
      />

      {user && (
        <div className="mb-6 raised-card p-4">
          <p className="text-label-md text-on-surface-variant">Perfil ativo</p>
          <p className="text-headline-sm font-bold">{user.name}</p>
          <p className="text-sm text-on-surface-variant">{user.email} • {user.role}</p>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={handleAdd} className="btn-primary">
          <Icon name="person_add" />
          Novo perfil
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <div key={p.profileId} className="raised-card flex flex-col p-4">
            <p className="font-bold">{p.name}</p>
            <p className="text-sm text-on-surface-variant">{p.email}</p>
            <p className="mt-1 text-xs capitalize text-primary">{p.role}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSwitch(p)}
                className="rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary"
              >
                Usar este perfil
              </button>
              {profiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(p.profileId)}
                  className="rounded-lg border border-error px-3 py-1.5 text-xs text-error"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <p className="text-on-surface-variant">Nenhum perfil salvo. Crie o primeiro perfil acima.</p>
      )}

      <div className="mt-8 raised-card max-w-md p-6">
        <h3 className="mb-4 text-headline-sm font-bold">Acessibilidade</h3>
        <ThemeSwitcher />
      </div>
    </AppShell>
  );
}
