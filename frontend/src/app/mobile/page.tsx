"use client";

import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";

export default function MobilePage() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="PLATAFORMA"
        title="Aplicativo Mobile"
        subtitle="Gerencie o ecossistema móvel para motoristas e baixe o APK de homologação."
      />

      <div className="grid lg:grid-cols-2 gap-8 items-center h-full max-h-[80vh]">
        {/* Left Info Column */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-4">
              O copiloto de bolso da sua frota.
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              O aplicativo móvel da FleetAI conecta seus motoristas diretamente ao Central de Operações.
              Eles podem realizar checklists diários, anexar evidências de abastecimento e disparar PINGs de GPS ao vivo mesmo com tela bloqueada.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "checklist", label: "Checklists Digitais", desc: "Assinaturas e fotos direto no local." },
              { icon: "radar", label: "Telemetria Híbrida", desc: "Funciona mesmo sem sinal (Offline-first)." },
              { icon: "chat", label: "Comunicação Segura", desc: "Chat corporativo criptografado." },
              { icon: "bolt", label: "Alertas de Fadiga", desc: "Avisos em tempo real ao motorista." },
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <Icon name={f.icon} className="text-primary text-2xl shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{f.label}</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-highest border border-primary/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-white rounded-xl p-2 shrink-0">
              {/* Fake QR Code */}
              <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://fleetai.mock/app')] bg-cover bg-center rounded-lg"></div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">QR Code de Pareamento</h3>
              <p className="text-xs text-on-surface-variant mb-4">Escaneie o código para instalar o aplicativo de homologação (APK/iOS) e parear o dispositivo do motorista instantaneamente ao veículo ativo.</p>
              <div className="flex gap-2">
                <button onClick={() => showToast("SMS com link de instalação enviado para o motorista.", "success")} className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90">Enviar Link via SMS</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Phone Mockup Column */}
        <div className="hidden lg:flex justify-center">
          <div className="relative w-[300px] h-[600px] bg-[#0c132b] rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl"></div>
            </div>

            {/* App UI Mockup */}
            <div className="flex-1 p-4 pt-10 flex flex-col bg-[#0b0e14]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant">Olá, Carlos Silva</p>
                  <h3 className="text-sm font-bold text-white">SCANIA R450 • Ativo</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-xs">C</div>
              </div>

              <div className="bg-primary/20 border border-primary/30 rounded-xl p-4 mb-4 text-center">
                <Icon name="radar" className="text-primary text-3xl mb-2 animate-pulse" />
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Viagem em Andamento</h4>
                <p className="text-[9px] text-on-surface-variant mt-1">Palmas › São Paulo</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div onClick={() => showToast("Abastecimento registrado.", "success")} className="bg-surface-container-high rounded-xl p-3 text-center cursor-pointer hover:bg-surface-container-highest transition">
                  <Icon name="local_gas_station" className="text-on-surface-variant mb-1" />
                  <p className="text-[10px] font-bold text-white">Abastecer</p>
                </div>
                <div onClick={() => showToast("Incidente reportado ao CCO.", "error")} className="bg-surface-container-high rounded-xl p-3 text-center cursor-pointer hover:bg-surface-container-highest transition">
                  <Icon name="warning" className="text-amber-500 mb-1" />
                  <p className="text-[10px] font-bold text-white">Incidente</p>
                </div>
                <div onClick={() => showToast("Despesa enviada para aprovação.", "success")} className="bg-surface-container-high rounded-xl p-3 text-center cursor-pointer hover:bg-surface-container-highest transition">
                  <Icon name="receipt" className="text-on-surface-variant mb-1" />
                  <p className="text-[10px] font-bold text-white">Despesas</p>
                </div>
                <div onClick={() => showToast("Checklist assinado com sucesso.", "success")} className="bg-surface-container-high rounded-xl p-3 text-center cursor-pointer hover:bg-surface-container-highest transition">
                  <Icon name="fact_check" className="text-green-400 mb-1" />
                  <p className="text-[10px] font-bold text-white">Checklist</p>
                </div>
              </div>

              <div className="mt-auto">
                <button onClick={() => showToast("ALERTA DE PÂNICO ENVIADO AO CCO!", "error")} className="w-full bg-error text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 shadow-lg shadow-error/20 hover:bg-red-600 transition">
                  <Icon name="sos" /> Botão de Pânico
                </button>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-16 bg-[#0c132b] border-t border-slate-800 flex justify-around items-center px-2 z-50">
              <Icon name="home" className="text-primary text-xl" />
              <Icon name="route" className="text-on-surface-variant text-xl" />
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary -mt-6 border-4 border-[#0c132b]">
                <Icon name="mic" className="text-lg" />
              </div>
              <Icon name="notifications" className="text-on-surface-variant text-xl" />
              <Icon name="person" className="text-on-surface-variant text-xl" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
