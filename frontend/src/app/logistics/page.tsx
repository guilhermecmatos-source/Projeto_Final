"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";
import ActionLink from "@/components/ui/ActionLink";
import { ACTION_ROUTES } from "@/lib/action-routes";

const MATCHES = [
  { pct: 98, time: "14:30 Today", from: "Showroom Alpha", to: "Oficina Central", pax: 4 },
  { pct: 82, time: "15:45 Today", from: "Matriz SP", to: "CD Guarulhos", pax: 2 },
];

const DISPATCHES = [
  { id: "DSP-8821", dest: "Unidade Barueri", type: "Utilitário", status: "Confirmado" },
  { id: "DSP-8822", dest: "Cliente VIP", type: "Van Executiva", status: "Pendente" },
];

export default function LogisticsPage() {
  const router = useRouter();

  return (
    <AppShell headerTitle="Logística & Caronas">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="tonal-card flex flex-col rounded-lg p-6 lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-headline-sm">Agendamento Assistido</h2>
            <Icon name="history_edu" className="text-primary-container" />
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(ACTION_ROUTES.logisticsDispatch);
            }}
          >
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">
                Funcionário / Equipe
              </label>
              <input className="input-fleet" placeholder="Nome ou Matrícula" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-label-md text-on-surface-variant">
                  Tipo de Veículo
                </label>
                <select className="input-fleet">
                  <option>Utilitário</option>
                  <option>Moto (Express)</option>
                  <option>Van Executiva</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-label-md text-on-surface-variant">Prioridade</label>
                <select className="input-fleet">
                  <option>Normal</option>
                  <option>Alta (Urgente)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">Destino Final</label>
              <div className="relative">
                <Icon
                  name="location_on"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
                />
                <input className="input-fleet pl-10" placeholder="Endereço ou Unidade" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              <Icon name="add_task" />
              Agendar Despacho
            </button>
          </form>
        </section>

        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm">Sugestões de Matching AI</h2>
            <span className="rounded-full bg-primary-container/10 px-3 py-1 text-label-md text-primary-container">
              3 Matches Encontrados
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {MATCHES.map((m) => (
              <div
                key={m.pct}
                className={`tonal-card flex flex-col justify-between border-l-4 p-4 ${m.pct > 90 ? "border-l-secondary-container" : "border-l-primary"}`}
              >
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-label-md font-bold text-primary">MATCH {m.pct}%</span>
                    <span className="text-label-md text-on-surface-variant">{m.time}</span>
                  </div>
                  <p className="font-bold">{m.from}</p>
                  <p className="text-sm text-on-surface-variant">{m.to}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">+{m.pax} passageiros</p>
                </div>
                <ActionLink
                  href={ACTION_ROUTES.travelsRegister}
                  variant="secondary"
                  className="mt-4 w-full justify-center"
                >
                  <Icon name="sms" className="text-lg" />
                  Aprovar & SMS
                </ActionLink>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-headline-sm">Listagem de Despachos</h2>
        <div className="raised-card divide-y divide-outline-variant/30 overflow-hidden">
          {DISPATCHES.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 hover:bg-surface-container-low">
              <div>
                <p className="font-bold">{d.id}</p>
                <p className="text-sm text-on-surface-variant">
                  {d.dest} • {d.type}
                </p>
              </div>
              <span className={d.status === "Confirmado" ? "chip-active" : "chip-pending"}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
