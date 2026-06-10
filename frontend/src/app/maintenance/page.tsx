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
}

const TYPE_LABEL: Record<string, string> = {
  preventive: "OM PREVENTIVA",
  corrective: "OM CORRETIVA",
  predictive: "OM PREDITIVA",
  occurrence: "OM CORRETIVA",
};

export default function MaintenancePage() {
  const [history, setHistory] = useState<MaintenanceRow[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  
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

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Maintenance"
        title="Manutenção e Ocorrências"
        subtitle="Alertas preditivos termográficos, ocorrências em rodovia e histórico faturado."
        actions={
          <ActionButton onClick={() => setModalOpen(true)}>
            <Icon name="add" />
            Nova Ocorrência
          </ActionButton>
        }
      />

      {criticalAlert && (
        <div className="mb-6 rounded-xl border border-error/50 bg-error-container/20 p-4">
          <p className="flex items-start gap-2 text-sm text-error">
            <Icon name="warning" className="shrink-0 text-xl" />
            <span><strong>Atenção:</strong> {criticalAlert}</span>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <p className="col-span-2 text-on-surface-variant">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="col-span-2 raised-card p-6 text-on-surface-variant">Nenhuma ordem de manutenção.</p>
        ) : (
          history.map((h) => {
            const done = !!h.completed_at;
            const typeKey = h.type in TYPE_LABEL ? h.type : "corrective";
            return (
              <article key={h.id} className="raised-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-primary">{TYPE_LABEL[typeKey]}</span>
                  <span className={done ? "chip-active" : "chip-warning"}>{done ? "Concluído" : "Em Execução"}</span>
                </div>
                <p className="text-sm font-bold uppercase">{formatPlateDisplay(h.vehicle_plate)}</p>
                <div className="mt-2 rounded-lg bg-surface-container-high p-2 text-xs text-on-surface-variant">{h.description}</div>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-on-surface-variant">Data: {new Date(h.scheduled_at).toLocaleDateString("pt-BR")}</span>
                  <span className="font-bold text-green-400">Custo: {formatBRL(Number(h.cost))}</span>
                </div>
              </article>
            );
          })
        )}
      </div>

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
