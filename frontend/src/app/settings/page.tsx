"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("gerais");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("FleetAI Operations");

  const handleSave = () => {
    if (activeTab === "gerais" && orgName.trim() === "") {
      showToast("O Nome da Organização é obrigatório.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Configurações salvas com sucesso!", "success");
    }, 1000);
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumb="PLATAFORMA"
        title="Configurações Globais"
        subtitle="Gerencie as preferências da plataforma, webhooks e integrações de sistema."
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "gerais", icon: "settings", label: "Gerais" },
            { id: "notificacoes", icon: "notifications", label: "Notificações" },
            { id: "seguranca", icon: "security", label: "Segurança" },
            { id: "integracoes", icon: "api", label: "Integrações (API)" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary shadow-lg"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon name={tab.icon} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="raised-card p-6">
            {activeTab === "gerais" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Configurações Gerais</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Informações básicas da organização e preferências regionais.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome da Organização</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="input-fleet w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fuso Horário Padrão</label>
                    <select className="input-fleet w-full" defaultValue="BRT">
                      <option value="BRT">Horário de Brasília (BRT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Moeda Principal</label>
                    <select className="input-fleet w-full" defaultValue="BRL">
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="USD">Dólar Americano ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Idioma do Sistema</label>
                    <select className="input-fleet w-full" defaultValue="PT-BR">
                      <option value="PT-BR">Português (BR)</option>
                      <option value="EN-US">English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notificacoes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Canais de Notificação</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Configure como a plataforma envia alertas e avisos do sistema.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Alertas de Risco Preditivo (IA)", desc: "Avisos críticos sobre possíveis falhas ou acidentes." },
                    { label: "Relatórios Semanais", desc: "Resumo de performance da frota via e-mail." },
                    { label: "Alarme de Desvio de Rota", desc: "Notifica gestores imediatamente se houver desvio." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between border border-outline-variant/20 rounded-xl p-4 bg-surface-container-high">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{item.label}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i !== 1} />
                        <div className="w-11 h-6 bg-outline-variant/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Segurança de Acesso</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Políticas de senha e autenticação multifator (MFA).</p>
                </div>
                <div className="bg-surface-container-high p-5 rounded-xl border border-outline-variant/20 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="gpp_good" className="text-green-500 text-2xl" />
                    <h4 className="text-sm font-bold text-on-surface">Autenticação em 2 Fatores (2FA) Ativada</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">Requerida para usuários com perfil de Administrador ou Gestor.</p>
                  <button onClick={() => showToast("Painel de dispositivos não disponível na demo.", "info")} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Gerenciar Dispositivos</button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expiração de Senha (Dias)</label>
                  <input type="number" defaultValue={90} className="input-fleet max-w-[200px] block" />
                </div>
              </div>
            )}

            {activeTab === "integracoes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Integrações de Frota</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Conecte a FleetAI a fornecedores e sistemas de telemetria externos.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "ERP SAP S/4HANA", status: "Conectado", icon: "account_tree" },
                    { title: "Telemetria Omnilink", status: "Conectado", icon: "router" },
                    { title: "Cartões Repom", status: "Pendente", icon: "credit_card" },
                    { title: "Webhooks Custom", status: "Configurar", icon: "webhook" },
                  ].map((api, i) => (
                    <div key={i} className="border border-outline-variant/20 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                          <Icon name={api.icon} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{api.title}</h4>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${api.status === "Conectado" ? "text-green-500" : api.status === "Pendente" ? "text-amber-500" : "text-on-surface-variant"}`}>{api.status}</p>
                        </div>
                      </div>
                      <button onClick={() => showToast("Permissão insuficiente para alterar API.", "error")} className="text-on-surface-variant hover:text-on-surface">
                        <Icon name="chevron_right" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? <span className="animate-spin text-lg block">⏳</span> : <Icon name="save" className="text-sm" />}
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
