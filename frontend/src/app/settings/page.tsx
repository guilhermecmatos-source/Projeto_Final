"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";

interface IntegrationData {
  id: string;
  title: string;
  status: "Conectado" | "Pendente" | "Configurar";
  icon: string;
  url: string;
  clientId?: string;
  clientSecret?: string;
  token?: string;
  events?: string[];
  lastSync?: string;
}

interface NotificationItem {
  label: string;
  desc: string;
  checked: boolean;
}

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notificacoes");
  const [loading, setLoading] = useState(false);

  // Access Control Settings States
  const [selectedProfile, setSelectedProfile] = useState("admin");
  const [matrixState, setMatrixState] = useState(MATRIX);

  // Notifications Settings States
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { label: "Alertas de Risco Preditivo (IA)", desc: "Avisos críticos sobre possíveis falhas ou acidentes.", checked: true },
    { label: "Relatórios Semanais", desc: "Resumo de performance da frota via e-mail.", checked: false },
    { label: "Alarme de Desvio de Rota", desc: "Notifica gestores imediatamente se houver desvio.", checked: true },
  ]);

  // Security Settings States
  const [passwordExpiry, setPasswordExpiry] = useState(90);

  // Integrations Settings States
  const [integrations, setIntegrations] = useState<IntegrationData[]>([
    { 
      id: "sap", 
      title: "ERP SAP S/4HANA", 
      status: "Conectado", 
      icon: "account_tree",
      url: "https://sap-gateway.fleetai.internal/sap/opu/odata",
      clientId: "FLEET_SAP_DEV_01",
      clientSecret: "••••••••••••••••••••",
      lastSync: "Hoje às 16:30"
    },
    { 
      id: "omnilink", 
      title: "Telemetria Omnilink", 
      status: "Conectado", 
      icon: "router",
      url: "https://api.omnilink.com.br/v2/telemetry",
      token: "<redacted>",
      lastSync: "Hoje às 16:42"
    },
    { 
      id: "repom", 
      title: "Cartões Repom", 
      status: "Pendente", 
      icon: "credit_card",
      url: "https://api.repom.com.br/v1/cards",
      clientId: "",
      clientSecret: ""
    },
    { 
      id: "webhook", 
      title: "Webhooks Custom", 
      status: "Configurar", 
      icon: "webhook",
      url: "",
      token: "",
      events: ["vehicle.alert", "travel.end"]
    },
  ]);

  // Modal Editing States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IntegrationData | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleToggleMatrix = (profile: string, index: number) => {
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Políticas de acesso salvas e aplicadas.", "success");
    }, 1000);
  };

  const handleSave = () => {
    if (activeTab === "perfis") {
      savePolicies();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Configurações salvas com sucesso!", "success");
    }, 1000);
  };

  const handleToggleNotification = (index: number) => {
    setNotifications(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, checked: !item.checked };
      }
      return item;
    }));
  };

  // Integration Modal Actions
  const handleOpenModal = (integration: IntegrationData) => {
    setEditingIntegration({ ...integration });
    setModalOpen(true);
  };

  const handleSaveIntegration = () => {
    if (!editingIntegration) return;

    if (!editingIntegration.url.trim()) {
      showToast("A URL / Endpoint é obrigatório.", "error");
      return;
    }

    setIntegrations(prev => prev.map(item => {
      if (item.id === editingIntegration.id) {
        const updatedStatus: IntegrationData["status"] =
          editingIntegration.status === "Configurar" ? "Conectado" : editingIntegration.status;
        return { 
          ...editingIntegration,
          status: updatedStatus,
          lastSync: "Recém atualizado"
        };
      }
      return item;
    }));
    
    setModalOpen(false);
    showToast(`Configurações de ${editingIntegration.title} atualizadas com sucesso!`, "success");
  };

  const handleTestConnection = () => {
    if (!editingIntegration?.url) {
      showToast("Por favor, preencha a URL antes de testar.", "error");
      return;
    }
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      showToast(`Conexão com ${editingIntegration.title} estabelecida com sucesso!`, "success");
    }, 1200);
  };

  const handleToggleEvent = (event: string) => {
    if (!editingIntegration) return;
    const currentEvents = editingIntegration.events || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter(e => e !== event)
      : [...currentEvents, event];
    setEditingIntegration({
      ...editingIntegration,
      events: newEvents
    });
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
            { id: "notificacoes", icon: "notifications", label: "Notificações" },
            { id: "seguranca", icon: "security", label: "Segurança" },
            { id: "integracoes", icon: "api", label: "Integrações (API)" },
            { id: "perfis", icon: "admin_panel_settings", label: "Controle de Acessos e Perfis" },
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

            {activeTab === "notificacoes" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Canais de Notificação</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Configure como a plataforma envia alertas e avisos do sistema.</p>
                </div>
                <div className="space-y-4">
                  {notifications.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between border border-outline-variant/20 rounded-xl p-4 bg-surface-container-high">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{item.label}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={item.checked} 
                          onChange={() => handleToggleNotification(idx)}
                        />
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
                  <input 
                    type="number" 
                    value={passwordExpiry} 
                    onChange={e => setPasswordExpiry(Number(e.target.value))}
                    className="input-fleet max-w-[200px] block" 
                  />
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
                  {integrations.map((api) => (
                    <div 
                      key={api.id} 
                      onClick={() => handleOpenModal(api)}
                      className="group border border-outline-variant/20 p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                          <Icon name={api.icon} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{api.title}</h4>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                            api.status === "Conectado" 
                              ? "text-green-500" 
                              : api.status === "Pendente" 
                              ? "text-amber-500" 
                              : "text-on-surface-variant"
                          }`}>
                            {api.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-on-surface-variant group-hover:text-on-surface">
                        <Icon name="chevron_right" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "perfis" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-on-surface mb-1">Controle de Acessos e Perfis</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Gerencie quem pode visualizar ou editar cada módulo do sistema.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  {PROFILES.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedProfile(p.id)}
                      className={`p-4 cursor-pointer transition border-2 rounded-xl bg-[#0F172A] border-outline-variant/20 hover:border-outline-variant/55 ${selectedProfile === p.id ? "border-primary bg-surface-container-highest" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.color}`}></span>
                          <h3 className="font-bold text-on-surface text-xs">{p.label}</h3>
                        </div>
                        <span className="text-[9px] font-black bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                          {p.count} usu.
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                        <Icon name="admin_panel_settings" className="text-primary" /> Matriz de Permissões
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Permissões para o perfil <strong className="text-primary capitalize">{selectedProfile}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-outline-variant/20">
                          <th className="py-2 px-3 font-bold text-on-surface-variant uppercase text-[9px] tracking-wider w-1/2">Módulo do Sistema</th>
                          <th className="py-2 px-3 font-bold text-on-surface-variant uppercase text-[9px] tracking-wider text-center">Permissão de Acesso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {MODULES.map((mod, i) => (
                          <tr key={mod} className="hover:bg-surface-container-high transition">
                            <td className="py-2.5 px-3 font-medium text-on-surface text-xs">{mod}</td>
                            <td className="py-2.5 px-3 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={matrixState[selectedProfile][i]} 
                                  onChange={() => handleToggleMatrix(selectedProfile, i)}
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

      {/* --- INTEGRATION CONFIGURATION MODAL --- */}
      {modalOpen && editingIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#111827] border border-outline-variant/20 rounded-2xl w-full max-w-[500px] shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-outline-variant/10">
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Icon name="close" className="text-sm" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Icon name={editingIntegration.icon} className="text-primary text-lg" />
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 w-max px-2 py-0.5 rounded">CONFIGURAÇÃO DE API</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide">{editingIntegration.title}</h2>
            </div>

            {/* Content Form */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {/* Common URL field */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {editingIntegration.id === "webhook" ? "URL do Endpoint de Destino" : "URL da API / Gateway"}
                </label>
                <input 
                  type="text" 
                  value={editingIntegration.url} 
                  onChange={e => setEditingIntegration({ ...editingIntegration, url: e.target.value })}
                  placeholder="https://api.exemplo.com/endpoint" 
                  className="input-fleet w-full text-xs text-white placeholder-slate-600 bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                />
              </div>

              {/* SAP specific fields */}
              {editingIntegration.id === "sap" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client ID</label>
                    <input 
                      type="text" 
                      value={editingIntegration.clientId || ""} 
                      onChange={e => setEditingIntegration({ ...editingIntegration, clientId: e.target.value })}
                      className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client Secret</label>
                    <input 
                      type="password" 
                      value={editingIntegration.clientSecret || ""} 
                      onChange={e => setEditingIntegration({ ...editingIntegration, clientSecret: e.target.value })}
                      className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                    />
                  </div>
                </>
              )}

              {/* Omnilink specific fields */}
              {editingIntegration.id === "omnilink" && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Token de Autenticação</label>
                  <input 
                    type="password" 
                    value={editingIntegration.token || ""} 
                    onChange={e => setEditingIntegration({ ...editingIntegration, token: e.target.value })}
                    className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                  />
                </div>
              )}

              {/* Repom specific fields */}
              {editingIntegration.id === "repom" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Código de Estabelecimento (Merchant ID)</label>
                    <input 
                      type="text" 
                      value={editingIntegration.clientId || ""} 
                      onChange={e => setEditingIntegration({ ...editingIntegration, clientId: e.target.value })}
                      placeholder="Ex: REPOM_MERCHANT_1092"
                      className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Token de Gateway</label>
                    <input 
                      type="password" 
                      value={editingIntegration.clientSecret || ""} 
                      onChange={e => setEditingIntegration({ ...editingIntegration, clientSecret: e.target.value })}
                      className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                    />
                  </div>
                </>
              )}

              {/* Webhooks Custom specific fields */}
              {editingIntegration.id === "webhook" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Secret Token (Assinatura de Payload)</label>
                    <input 
                      type="text" 
                      value={editingIntegration.token || ""} 
                      onChange={e => setEditingIntegration({ ...editingIntegration, token: e.target.value })}
                      placeholder="Ex: whsec_abc123xyz"
                      className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Eventos Inscritos</label>
                    <div className="grid grid-cols-1 gap-2 bg-[#0F172A] border border-outline-variant/10 rounded-xl p-3">
                      {[
                        { key: "vehicle.alert", label: "Alertas de Veículos (vehicle.alert)" },
                        { key: "travel.start", label: "Início de Viagens (travel.start)" },
                        { key: "travel.end", label: "Fim de Viagens (travel.end)" },
                      ].map(ev => {
                        const checked = (editingIntegration.events || []).includes(ev.key);
                        return (
                          <label key={ev.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={checked}
                              onChange={() => handleToggleEvent(ev.key)}
                              className="rounded bg-slate-900 border-slate-700 text-primary focus:ring-0 focus:ring-offset-0"
                            />
                            <span>{ev.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status da Integração</label>
                <select 
                  value={editingIntegration.status}
                  onChange={e => setEditingIntegration({ ...editingIntegration, status: e.target.value as IntegrationData["status"] })}
                  className="input-fleet w-full text-xs text-white bg-[#0F172A] border border-outline-variant/30 px-3 py-2 rounded-lg"
                >
                  <option value="Conectado">Conectado / Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Configurar">Configurar / Inativo</option>
                </select>
              </div>

              {/* Sync details if present */}
              {editingIntegration.lastSync && (
                <p className="text-[9px] text-slate-500 flex items-center gap-1">
                  <Icon name="sync" className="text-[10px]" /> Última sincronização efetuada: {editingIntegration.lastSync}
                </p>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-6 pt-4 border-t border-outline-variant/10 bg-[#0F172A] flex flex-col gap-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-outline-variant/30 hover:bg-white/5 py-2 text-[10px] font-bold text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex-1 rounded-lg border border-primary/50 hover:bg-primary/10 py-2 text-[10px] font-bold text-primary transition flex items-center justify-center gap-1"
                >
                  {testingConnection ? "Testando..." : "Testar Conexão"}
                </button>
              </div>
              <button 
                onClick={handleSaveIntegration}
                className="w-full rounded-lg bg-primary hover:opacity-90 py-2.5 text-[10px] font-black text-on-primary uppercase tracking-widest transition"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
