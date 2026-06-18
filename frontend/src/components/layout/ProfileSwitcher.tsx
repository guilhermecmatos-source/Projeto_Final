"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { User } from "@/types";
import {
  addProfile,
  getProfiles,
  switchProfile,
  StoredProfile,
} from "@/lib/profiles";

interface ProfileSwitcherProps {
  user: User | null;
  onProfileChange: (user: User) => void;
}

export default function ProfileSwitcher({ user, onProfileChange }: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const profiles = typeof window !== "undefined" ? getProfiles() : [];

  function handleSwitch(profileId: string) {
    const p = switchProfile(profileId);
    if (p) onProfileChange(p);
    setOpen(false);
  }

  function handleAdd() {
    if (!user) return;
    const name = prompt("Nome do novo perfil:");
    if (!name?.trim()) return;
    const email = prompt("E-mail do perfil:") || `${name.toLowerCase().replace(/\s/g, ".")}@fleet.local`;
    const newProfile: StoredProfile = addProfile({
      id: `local-${Date.now()}`,
      name: name.trim(),
      email,
      role: user.role,
      status: "ativo",
    });
    onProfileChange(newProfile);
    setOpen(false);
  }

  return (
    <div className="relative mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-2 text-left text-[11px] text-primary hover:bg-surface-container-high"
      >
        <Icon name="switch_account" className="text-base" />
        <span className="flex-1 truncate">Trocar perfil ({profiles.length || 1})</span>
        <Icon name={open ? "expand_less" : "expand_more"} className="text-sm" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-48 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-raised">
          {(profiles.length ? profiles : user ? [{ ...user, profileId: "default" }] : []).map(
            (p) => (
              <button
                key={p.profileId ?? p.email}
                type="button"
                onClick={() => p.profileId && handleSwitch(p.profileId)}
                className="block w-full truncate px-3 py-2 text-left text-xs hover:bg-surface-container-low"
              >
                {p.name}
                <span className="block text-[10px] capitalize text-on-surface-variant">{p.role}</span>
              </button>
            )
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center gap-2 border-t border-outline-variant px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low"
          >
            <Icon name="person_add" className="text-sm" />
            Novo perfil
          </button>
        </div>
      )}
    </div>
  );
}
