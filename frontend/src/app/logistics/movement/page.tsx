"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FormField from "@/components/forms/FormField";
import FormActions from "@/components/forms/FormActions";
import Icon from "@/components/ui/Icon";
import {
  addToSyncQueue,
  formatSavedAt,
  getLogisticsDraft,
  isOnline,
  saveLogisticsDraft,
} from "@/lib/offline";
import { useOffline } from "@/hooks/useOffline";
import { ruvApi } from "@/services/api";
import Icon from "@/components/ui/Icon";

function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  form.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export default function LogisticsMovementPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kmRodado, setKmRodado] = useState<number | "">("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ error: "", success: "" });
  const { online, syncNow } = useOffline();

  // RUV association state
  const [ruvList, setRuvList] = useState<{ id: string; protocol: string; requester: string; destination: string; status: string }[]>([]);
  const [selectedRuvId, setSelectedRuvId] = useState("");

  useEffect(() => {
    const draft = getLogisticsDraft();
    if (draft?.savedAt) setLastSaved(draft.savedAt as string);
    // Fetch RUV list
    ruvApi.list().then(res => {
      const items = (res.data as any[]) ?? [];
      setRuvList(items.map((r: any) => ({
        id: r.id ?? r._id ?? "",
        protocol: r.protocol ?? r.numero_protocolo ?? `RUV-${(r.id ?? r._id ?? "").toString().slice(-6)}`,
        requester: r.requester_name ?? r.solicitante ?? "---",
        destination: r.destination ?? r.destino ?? "---",
        status: r.status ?? "pendente",
      })));
    }).catch(() => setRuvList([]));
  }, []);

  function updateKmRodado(initial: string, final: string) {
    const a = Number(initial);
    const b = Number(final);
    if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) {
      setKmRodado(b - a);
    } else {
      setKmRodado("");
    }
  }

  function handleSaveLocal() {
    if (!formRef.current) return;
    const savedAt = saveLogisticsDraft(formToObject(new FormData(formRef.current)));
    setLastSaved(savedAt);
    setMessage({ error: "", success: "Movimentação salva localmente." });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = formToObject(new FormData(e.currentTarget));
    // Associate RUV protocol
    const associatedRuv = ruvList.find(r => r.id === selectedRuvId);
    if (associatedRuv) {
      data.ruv_protocol = associatedRuv.protocol;
      data.ruv_id = associatedRuv.id;
    }
    saveLogisticsDraft(data);
    addToSyncQueue({ type: "logistics", payload: data });
    const ruvMsg = associatedRuv ? ` Protocolo RUV: ${associatedRuv.protocol}` : "";
    setMessage({ error: "", success: `Registro salvo. Sincronização quando online.${ruvMsg}` });
    setSelectedRuvId("");
    setLoading(false);
  }

  return (
    <AppShell headerTitle="Movimentação do Veículo">
      <Link href="/logistics" className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline">
        <Icon name="arrow_back" />
        Voltar à Logística
      </Link>

      <h1 className="mb-2 text-headline-lg">Movimentação do Veículo</h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Registro de saída, chegada, hodômetro e fechamento de RUV.
      </p>

      {lastSaved && (
        <p className="mb-4 text-sm text-on-surface-variant">
          Último salvamento: {formatSavedAt(lastSaved)}
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
          <h2 className="md:col-span-2 text-headline-sm">Trajeto</h2>
          <FormField label="Local de saída" name="departure_location" required />
          <FormField label="Local de chegada" name="arrival_location" required />
          <FormField label="Data/Hora saída" name="departure_datetime" type="datetime-local" required />
          <FormField label="Data/Hora chegada" name="arrival_datetime" type="datetime-local" required />
        </section>

        <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
          <h2 className="md:col-span-2 text-headline-sm">Hodômetro</h2>
          <div>
            <label htmlFor="odometer_start" className="mb-1 block text-label-md text-on-surface-variant">
              KM inicial
            </label>
            <input
              id="odometer_start"
              name="odometer_start"
              type="number"
              required
              className="input-fleet"
              placeholder="0"
              onChange={(e) => {
                const end = (document.getElementById("odometer_end") as HTMLInputElement)?.value ?? "";
                updateKmRodado(e.target.value, end);
              }}
            />
          </div>
          <div>
            <label htmlFor="odometer_end" className="mb-1 block text-label-md text-on-surface-variant">
              KM final
            </label>
            <input
              id="odometer_end"
              name="odometer_end"
              type="number"
              required
              className="input-fleet"
              placeholder="0"
              onChange={(e) => {
                const start = (document.getElementById("odometer_start") as HTMLInputElement)?.value ?? "";
                updateKmRodado(start, e.target.value);
              }}
            />
          </div>
          <div className="md:col-span-2 rounded-lg bg-primary-container/10 p-4">
            <p className="text-label-md text-on-surface-variant">KM rodado (calculado)</p>
            <p className="text-2xl font-bold text-primary">
              {kmRodado === "" ? "—" : `${kmRodado} km`}
            </p>
          </div>
        </section>

        <section className="raised-card grid gap-4 p-4 sm:p-6 md:grid-cols-2">
          <h2 className="md:col-span-2 text-headline-sm">Fechamento de RUV</h2>
          <FormField label="Data fechamento" name="ruv_close_date" type="date" required />
          <FormField label="KM rodado (RUV)" name="ruv_km" type="number" placeholder="Igual ao calculado" />
          <FormField label="Observações" name="ruv_notes" as="textarea" className="md:col-span-2" rows={4} />
        </section>

        {/* RUV Protocol Association */}
        <section className="raised-card grid gap-4 p-4 sm:p-6">
          <h2 className="text-headline-sm flex items-center gap-2">
            <Icon name="link" className="text-primary" /> Associar Protocolo RUV
          </h2>
          <select
            className="input-fleet w-full"
            value={selectedRuvId}
            onChange={e => setSelectedRuvId(e.target.value)}
          >
            <option value="">— Nenhum protocolo vinculado —</option>
            {ruvList.map(r => (
              <option key={r.id} value={r.id}>
                {r.protocol} — {r.requester} → {r.destination} [{r.status}]
              </option>
            ))}
          </select>
          {ruvList.length === 0 && (
            <p className="text-sm text-on-surface-variant">Nenhuma RUV encontrada. Crie uma RUV antes de associar.</p>
          )}
        </section>

        <FormActions
          loading={loading}
          submitLabel="Salvar Movimentação"
          onSaveLocal={handleSaveLocal}
          onSyncNow={async () => {
            if (!isOnline()) {
              setMessage({ error: "Sem conexão.", success: "" });
              return;
            }
            const ok = await syncNow();
            setMessage(ok ? { error: "", success: "Sincronizado." } : { error: "Erro ao sincronizar.", success: "" });
          }}
          onExportPdf={() => window.print()}
          syncDisabled={!online}
          submitClassName="flex items-center justify-center gap-2 rounded-lg bg-[#0B3C95] hover:bg-[#09327a] px-6 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
          exportClassName="flex items-center justify-center gap-2 rounded-lg bg-[#FCA311] hover:bg-[#e5940f] px-6 py-3 font-semibold text-black transition active:scale-[0.98] disabled:opacity-50"
          saveLocalClassName="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white text-black hover:bg-slate-100 px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50"
          syncClassName="flex items-center justify-center gap-2 rounded-lg border border-[#0B3C95] bg-transparent text-[#0B3C95] hover:bg-blue-50/10 px-6 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50"
        />
      </form>

    </AppShell>
  );
}
