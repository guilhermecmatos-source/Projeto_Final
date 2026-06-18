"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";

const PROFILES = [
  { id: "admin", label: "Administrador", color: "bg-error", count: 4, desc: "Acesso total à plataforma e configurações." },
  { id: "gestor", label: "Gestor", color: "bg-blue-500", count: 12, desc: "Acesso a toda a operação diária e aprovações." },
  { id: "motorista", label: "Motorista", color: "bg-primary", count: 86, desc: "Acesso restrito a viagens logadas e inspeções." },
  { id: "solicitante", label: "Solicitante", color: "bg-green-500", count: 35, desc: "Pode apenas solicitar viagens e ver painel básico." },
];

const MODULES = [
  "Dashboard Geral", "Central de Comando", "Gestão de Veículos", 
  "Gestão de Motoristas", "Controle de Logística", "Aprovação de Viagens",
  "Registros de Manutenção", "Segurança IA e Fadiga", "Faturamento e Comercial"
];

const MATRIX: Record<string, boolean[]> = {
  "admin": [true, true, true, true, true, true, true, true, true],
  "gestor": [true, true, true, true, true, true, true, true, false],
  "motorista": [true, false, false, false, true, false, false, false, false],
  "solicitante": [true, false, false, false, false, false, false, false, false],
};

export default function PerfisPage() {
  const [selectedProfile, setSelectedProfile] = useState("admin");
  const [matrixState, setMatrixState] = useState(MATRIX);

  const handleToggle = (profile: string, index: number) => {
    if (profile === "admin") return;
    setMatrixState(prev => {
      const newMatrix = { ...prev };
      newMatrix[profile] = [...newMatrix[profile]];
      newMatrix[profile][index] = !newMatrix[profile][index];
      return newMatrix;
    });
  };

  const savePolicies = () => {
    if (selectedProfile === "admin") {
      showToast("As permissões de Administrador não podem ser alteradas.", "error");
      return;
    }
    showToast("Políticas de acesso salvas e aplicadas.", "success");
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumb="PLATAFORMA"
        title="Controle de Acessos e Perfis"
        subtitle="Gerencie quem pode visualizar ou editar cada módulo do sistema."
      />

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        {PROFILES.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedProfile(p.id)}
            className={`raised-card p-5 cursor-pointer transition border-2 ${selectedProfile === p.id ? "border-primary bg-surface-container-highest" : "border-transparent hover:border-outline-variant/30"}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${p.color}`}></span>
                <h3 className="font-bold text-on-surface text-sm">{p.label}</h3>
              </div>
              <span className="text-[10px] font-black bg-surface-container-high px-2 py-1 rounded-md text-on-surface-variant">
                {p.count} usuários
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="raised-card p-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
              <Icon name="admin_panel_settings" className="text-primary" /> Matriz de Permissões
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Você está visualizando a matriz para o perfil de <strong className="text-primary capitalize">{selectedProfile}</strong>.
            </p>
          </div>
          <button 
            onClick={savePolicies}
            className="bg-primary text-on-primary font-bold px-4 py-2 text-xs rounded-lg hover:opacity-90 transition"
          >
            Salvar Matriz
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider w-1/2">Módulo do Sistema</th>
                <th className="py-3 px-4 font-bold text-on-surface-variant uppercase text-[10px] tracking-wider text-center">Permissão de Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {MODULES.map((mod, i) => (
                <tr key={mod} className="hover:bg-surface-container-high transition">
                  <td className="py-3 px-4 font-medium text-on-surface text-xs">{mod}</td>
                  <td className="py-3 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={matrixState[selectedProfile][i]} 
                        onChange={() => handleToggle(selectedProfile, i)}
                        disabled={selectedProfile === "admin"} 
                      />
                      <div className="w-9 h-5 bg-outline-variant/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-disabled:opacity-50"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedProfile === "admin" && (
          <p className="text-[10px] text-error mt-4 font-bold text-center">
            * O perfil Administrador possui privilégios totais obrigatórios. As permissões não podem ser revogadas.
          </p>
        )}
      </div>
    </AppShell>
  );
}
