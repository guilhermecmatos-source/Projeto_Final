"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import ActionButton from "@/components/ui/ActionButton";
import FormModal from "@/components/ui/FormModal";
import FormField from "@/components/forms/FormField";
import { maintenanceApi, vehiclesApi, uploadsApi } from "@/services/api";
import { formatBRL } from "@/lib/currency";
import { formatPlateDisplay } from "@/lib/validators";
import CurrencyField from "@/components/forms/CurrencyField";
import MediaUpload from "@/components/forms/MediaUpload";

interface MaintenanceRow {
  id: string;
  vehicle_plate: string;
  type: string;
  description: string;
  cost: number;
  scheduled_at: string;
  completed_at?: string | null;
  photo_url?: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  preventive: "OM PREVENTIVA",
  corrective: "OM CORRETIVA",
  predictive: "OM PREDITIVA",
  occurrence: "OM CORRETIVA",
};

const TYPE_COLOR: Record<string, string> = {
  preventive: "text-green-400 border-green-400/30 bg-green-400/10",
  corrective: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  predictive: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  occurrence: "text-orange-400 border-orange-400/30 bg-orange-400/10",
};

const TYPE_ICON: Record<string, string> = {
  preventive: "build_circle",
  corrective: "warning",
  predictive: "psychology",
  occurrence: "report_problem",
};

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<"list" | "profile">("list");
  const [history, setHistory] = useState<MaintenanceRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MaintenanceRow | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Media upload state
  const [defectFile, setDefectFile] = useState<File | null>(null);
  const [defectDataUrl, setDefectDataUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([maintenanceApi.list(), maintenanceApi.alerts(), vehiclesApi.list()])
      .then(([listRes, alertRes, vehRes]) => {
        setHistory(Array.isArray(listRes.data) ? listRes.data : []);
        setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
        const alerts = alertRes.data as { predictive?: { message: string }[] };
        setCriticalAlert(alerts?.predictive?.[0]?.message ?? "Atenção: 1 Alerta Preditivo Crítico de Alta Temperatura Identificado no Volvo FH 540.");
      })
      .catch(() => setCriticalAlert("Atenção: 1 Alerta Preditivo Crítico de Alta Temperatura Identificado no Volvo FH 540."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await maintenanceApi.create({
        vehicle_id: form.get("vehicle_id"),
        type: form.get("type"),
        description: form.get("description"),
        cost: Number(form.get("cost")),
        scheduled_at: form.get("scheduled_at") || new Date().toISOString(),
      });
      const recordId = (res.data as { id?: string })?.id;
      if (recordId && defectFile) {
        await uploadsApi.upload(defectFile, "maintenance_defect", recordId);
      }
      setModalOpen(false);
      setDefectFile(null);
      setDefectDataUrl(null);
      const listRes = await maintenanceApi.list();
      setHistory(Array.isArray(listRes.data) ? listRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const openProfile = (item: MaintenanceRow) => {
    setSelectedItem(item);
    setActiveTab("profile");
  };

  const totalCost = history.reduce((s, h) => s + Number(h.cost), 0);
  const completedCount = history.filter(h => !!h.completed_at).length;
  const pendingCount = history.length - completedCount;

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Maintenance"
        title="Manutenção e Ocorrências"
        subtitle="Alertas preditivos termográficos, ocorrências em rodovia e histórico faturado."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${activeTab === "list"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon name="list" className="text-sm" />
                Ordens de Manutenção
              </button>
              <button
                type="button"
                onClick={() => { if (selectedItem) setActiveTab("profile"); }}
                disabled={!selectedItem}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${!selectedItem ? "opacity-30 cursor-not-allowed text-slate-600" : activeTab === "profile"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <Icon name="build" className="text-sm" />
                Perfil {selectedItem && `(${formatPlateDisplay(selectedItem.vehicle_plate)})`}
              </button>
            </div>
            <ActionButton onClick={() => setModalOpen(true)}>
              <Icon name="add" />
              Nova Ocorrência
            </ActionButton>
          </div>
        }
      />

      {activeTab === "list" && (
        <>
          {criticalAlert && (
            <div className="mb-6 rounded-xl border border-error/50 bg-error-container/20 p-4">
              <p className="flex items-start gap-2 text-sm text-error">
                <Icon name="warning" className="shrink-0 text-xl" />
                <span><strong>Atenção:</strong> {criticalAlert}</span>
              </p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="raised-card p-4 text-center bg-[#0c132b]/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total de OMs</p>
              <p className="text-2xl font-bold text-primary">{history.length}</p>
              <p className="text-[9px] text-slate-500 mt-1">ordens no histórico</p>
            </div>
            <div className="raised-card p-4 text-center bg-[#0c132b]/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Custo Total</p>
              <p className="text-2xl font-bold text-[#FCA311]">{formatBRL(totalCost)}</p>
              <p className="text-[9px] text-slate-500 mt-1">{completedCount} concluídas · {pendingCount} em execução</p>
            </div>
            <div className="raised-card p-4 text-center bg-[#0c132b]/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status Geral</p>
              <p className="text-2xl font-bold text-green-400">{history.length > 0 ? Math.round((completedCount / history.length) * 100) : 0}%</p>
              <p className="text-[9px] text-slate-500 mt-1">taxa de conclusão</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              <p className="col-span-2 text-on-surface-variant">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="col-span-2 raised-card p-6 text-on-surface-variant">Nenhuma ordem de manutenção.</p>
            ) : (
              history.map((h) => {
                const done = !!h.completed_at;
                const typeKey = h.type in TYPE_LABEL ? h.type : "corrective";
                const typeClass = TYPE_COLOR[typeKey] || TYPE_COLOR.corrective;
                const iconName = TYPE_ICON[typeKey] || "build";
                return (
                  <article
                    key={h.id}
                    className="raised-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all group"
                    onClick={() => openProfile(h)}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full ${typeClass}`}>
                        <Icon name={iconName} className="text-[11px]" />
                        {TYPE_LABEL[typeKey]}
                      </span>
                      <span className={done ? "chip-active" : "chip-warning"}>{done ? "Concluído" : "Em Execução"}</span>
                    </div>
                    <p className="text-sm font-bold uppercase text-primary">{formatPlateDisplay(h.vehicle_plate)}</p>
                    <div className="mt-2 rounded-lg bg-surface-container-high p-2 text-xs text-on-surface-variant line-clamp-2">{h.description}</div>
                    {h.photo_url && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-outline-variant/20 h-20">
                        <img src={h.photo_url} alt="Defeito" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="mt-3 flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">Data: {new Date(h.scheduled_at).toLocaleDateString("pt-BR")}</span>
                      <span className="font-bold text-green-400">Custo: {formatBRL(Number(h.cost))}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-primary/60 group-hover:text-primary/80 transition">
                      <Icon name="open_in_new" className="text-[10px]" />
                      Clique para ver perfil completo
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === "profile" && selectedItem && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#0F172A]/80 border border-outline-variant/30 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition uppercase"
            >
              <Icon name="arrow_back" /> Voltar para a Lista
            </button>
            {!selectedItem.completed_at && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    setSaving(true);
                    await maintenanceApi.complete(selectedItem.id);
                    const listRes = await maintenanceApi.list();
                    const updatedHistory = Array.isArray(listRes.data) ? listRes.data : [];
                    setHistory(updatedHistory);
                    const updatedItem = updatedHistory.find(h => h.id === selectedItem.id);
                    if (updatedItem) setSelectedItem(updatedItem);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-green-500 shadow transition"
              >
                <Icon name="check" className="text-sm" /> {saving ? "Processando..." : "Concluir Manutenção"}
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5 space-y-6">
              <div className="raised-card p-5 bg-[#0c132b]/80 border-outline-variant/30 flex flex-col h-full">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-4 border-b border-outline-variant/20 pb-3 flex items-center gap-1.5">
                  <Icon name="photo_camera" /> EVIDÊNCIA VISUAL / ANEXO
                </h3>
                {selectedItem.photo_url ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 shadow-xl select-none group">
                    <img
                      src={selectedItem.photo_url}
                      alt="Evidência do Defeito"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/30 p-8 text-center bg-[#0F172A]/40 min-h-[220px]">
                    <Icon name="photo_camera" className="text-4xl text-slate-500 mb-2 opacity-40" />
                    <p className="text-xs font-bold text-slate-300">Sem Registro de Imagem</p>
                    <p className="text-[9px] text-slate-500 mt-1">Nenhuma evidência fotográfica anexada a esta ordem de manutenção.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              <div className="raised-card p-6 bg-[#0c132b]/80 border-outline-variant/30 space-y-6">
                <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full ${TYPE_COLOR[selectedItem.type in TYPE_COLOR ? selectedItem.type : 'corrective'] || TYPE_COLOR.corrective}`}>
                        <Icon name={TYPE_ICON[selectedItem.type in TYPE_ICON ? selectedItem.type : 'corrective'] || 'build'} className="text-[11px]" />
                        {TYPE_LABEL[selectedItem.type in TYPE_LABEL ? selectedItem.type : 'corrective']}
                      </span>
                      <span className={selectedItem.completed_at ? "chip-active text-[9px]" : "chip-warning text-[9px]"}>
                        {selectedItem.completed_at ? "Concluído" : "Em Execução"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#FCA311] font-mono mt-2">
                      VEÍCULO: {formatPlateDisplay(selectedItem.vehicle_plate)}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Placa vinculada a esta Ordem de Manutenção operacional.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">CUSTO REGISTRADO</span>
                    <p className="text-lg font-bold text-green-400 font-mono">{formatBRL(Number(selectedItem.cost))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0F172A]/50 border border-outline-variant/20 rounded-lg p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Data de Agendamento</span>
                    <p className="text-xs font-bold text-slate-200">
                      {new Date(selectedItem.scheduled_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-[#0F172A]/50 border border-outline-variant/20 rounded-lg p-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Data de Finalização</span>
                    <p className="text-xs font-bold text-slate-200">
                      {selectedItem.completed_at
                        ? new Date(selectedItem.completed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Manutenção Pendente"}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0F172A]/50 border border-outline-variant/20 rounded-lg p-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 flex items-center gap-1">
                    <Icon name="description" className="text-xs text-[#FCA311]" /> Descrição Técnica da Intervenção
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10 text-[9px] text-slate-500 font-mono">
                  <span>OM ID: {selectedItem.id.toUpperCase()}</span>
                  <span>Sistema de Auditoria de Manutenção</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setDefectFile(null); setDefectDataUrl(null); }}
        title="Adicional de Ordem de Manutenção"
        subtitle="Registro de intervenção veicular"
        wide
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <FormField label="Selecionar Veículo Acometido" name="vehicle_id" required options={[{ value: "", label: "Escolha o veículo..." }, ...vehicles.map((v) => ({ value: v.id, label: v.plate }))]} />
          <FormField label="Tipo de Intervenção" name="type" options={[{ value: "corrective", label: "Corretiva Urgente" }, { value: "preventive", label: "Preventiva" }, { value: "predictive", label: "Preditiva" }]} />
          <CurrencyField label="Custo Estimado" name="cost" defaultValue={1500} required />
          <FormField label="Descrição Detalhada do Problema" name="description" as="textarea" rows={4} placeholder="Ex: Trepidação acentuada acima de 80km/h." />
          <MediaUpload
            label="Anexar Imagem do Defeito (Opcional)"
            value={defectFile}
            onChange={(file, dataUrl) => {
              setDefectFile(file);
              setDefectDataUrl(dataUrl);
            }}
          />
          <button type="submit" disabled={saving} className="btn-primary w-full uppercase">{saving ? "Gravando..." : "Adicionar Ordem"}</button>
        </form>
      </FormModal>
    </AppShell>
  );
}
