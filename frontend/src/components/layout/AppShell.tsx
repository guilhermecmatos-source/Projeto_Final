"use client";

import { ReactNode, useCallback, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileBottomNav from "./MobileBottomNav";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import LoadingState from "@/components/ui/LoadingState";
import AccessDenied from "@/components/ui/AccessDenied";
import ToastContainer from "@/components/ui/ToastContainer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useTelemetrySocket } from "@/hooks/useTelemetrySocket";
import { canAccessRoute, normalizeRole } from "@/lib/permissions";
import Icon from "@/components/ui/Icon";
import type { TelemetryAlert } from "@/types";
import { io } from "socket.io-client";

interface AppShellProps {
  children: ReactNode;
  headerTitle?: string;
  searchPlaceholder?: string;
  headerAction?: ReactNode;
  showOfflineForPilot?: boolean;
}

export default function AppShell({
  children,
  headerTitle,
  searchPlaceholder,
  headerAction,
  showOfflineForPilot = false,
}: AppShellProps) {
  const { user, ready, setUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados do Modal LGPD
  const [lgpdName, setLgpdName] = useState("");
  const [lgpdDoc, setLgpdDoc] = useState("");
  const [lgpdChecked, setLgpdChecked] = useState(false);
  const [lgpdError, setLgpdError] = useState("");
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(true);

  // Estados do Toast de Sincronização
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [syncToastMsg, setSyncToastMsg] = useState("");

  // ── Toast system ──────────────────────────────────────────────
  const { toasts, addToast, addTelemetryAlert, removeToast } = useToast();

  const handleTelemetryAlert = useCallback(
    (alert: TelemetryAlert) => {
      addTelemetryAlert(alert);
    },
    [addTelemetryAlert]
  );

  // Polling — só envia alertas quando usuário está autenticado
  const isAuthenticated = ready && !!user;

  useEffect(() => {
    if (!isAuthenticated) return;

    const backendUrl =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "";

    const socket = io(backendUrl);

    socket.on("connect", () => {
      console.log("[ws] Conectado ao servidor Socket.io do backend");
    });

    socket.on("telemetry-alert", (alert: any) => {
      console.log("[ws] Alerta recebido via WS:", alert);
      // Disparar Toast visual imediato
      addToast(
        alert.title,
        alert.message,
        alert.severity === "medium" ? "medium" : alert.severity
      );
      // Emitir evento local para recarregar listas (ex: feed de notificações)
      window.dispatchEvent(new CustomEvent("ws-telemetry-alert", { detail: alert }));
    });

    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        message: string;
        severity: any;
      }>;
      if (customEvent.detail) {
        addToast(
          customEvent.detail.title,
          customEvent.detail.message,
          customEvent.detail.severity
        );
      }
    };

    window.addEventListener("new-toast", handleNewToast);

    return () => {
      socket.disconnect();
      window.removeEventListener("new-toast", handleNewToast);
    };
  }, [isAuthenticated, addToast]);

  const stableAlert = useCallback(
    (alert: TelemetryAlert) => {
      if (isAuthenticated) handleTelemetryAlert(alert);
    },
    [isAuthenticated, handleTelemetryAlert]
  );

  useTelemetrySocket(isAuthenticated, stableAlert);
  // ─────────────────────────────────────────────────────────────

  // Salvaguarda RBAC: se papel trocado para Solicitante/Client e rota for restrita, redireciona ao dashboard
  useEffect(() => {
    if (ready && user) {
      const role = normalizeRole(user.role);
      if ((role === "solicitante" || role === "client") && !canAccessRoute(user, pathname)) {
        router.push("/dashboard");
      }
    }
  }, [user, ready, pathname, router]);

  // Primeiro acesso / Verificação de LGPD
  useEffect(() => {
    if (ready && user) {
      const alreadyAccepted = (user as any).acceptedTerms || localStorage.getItem(`lgpd_accepted_${user.id}`) === "true";
      setHasAcceptedTerms(!!alreadyAccepted);
    }
  }, [ready, user]);

  // Listener para o Sync Toast
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setSyncToastMsg(customEvent.detail?.message || "Sincronizando dados locais...");
      setShowSyncToast(true);
      setTimeout(() => {
        setShowSyncToast(false);
      }, 1500);
    };
    window.addEventListener("show-sync-toast", handleSync);
    return () => window.removeEventListener("show-sync-toast", handleSync);
  }, []);

  const handleLgpdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdName.trim()) {
      setLgpdError("Nome completo é obrigatório.");
      return;
    }
    if (!lgpdDoc.trim()) {
      setLgpdError("CPF ou RG é obrigatório para assinatura digital.");
      return;
    }
    if (!lgpdChecked) {
      setLgpdError("Você deve concordar com os termos de consentimento.");
      return;
    }

    if (user) {
      const consentInfo = {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        signerName: lgpdName.trim(),
        signerDoc: lgpdDoc.trim(),
        acceptedAt: new Date().toISOString(),
        ipSimulated: "192.168.100.45",
        status: "HOMOLOGADO"
      };

      // Save to localStorage as a record of the homologation
      localStorage.setItem(`lgpd_consent_info_${user.id}`, JSON.stringify(consentInfo));
      localStorage.setItem(`lgpd_accepted_${user.id}`, "true");

      const updatedUser = { ...user, acceptedTerms: true };
      setUser(updatedUser);
      setHasAcceptedTerms(true);
      setLgpdError("");
      
      // Dispatch alert to CCO feed log as well
      window.dispatchEvent(new CustomEvent("new-toast", {
        detail: {
          title: "Termos Aceitos",
          message: `Assinatura de ${lgpdName.trim()} homologada com sucesso!`,
          severity: "success"
        }
      }));
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center safe-area-padding">
        <LoadingState message="Carregando sessão..." />
      </div>
    );
  }

  const accessDenied = user && !canAccessRoute(user, pathname);

  const isPilotContext =
    showOfflineForPilot ||
    user?.role === "attendant" ||
    (typeof window !== "undefined" && window.location.pathname.includes("/drivers"));

  return (
    <div className="min-h-screen bg-background">
      {/* Toast de telemetria — Portal no topo da tela */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Toast de Sincronização — laranja, topo direito, 1.5s */}
      {showSyncToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[9999] flex items-center gap-2 rounded-lg bg-[#FCA311] px-4 py-2.5 text-sm font-bold text-black shadow-lg"
        >
          <Icon name="sync" className="animate-spin text-base" />
          {syncToastMsg}
        </div>
      )}

      {/* Modal LGPD — Primeiro Acesso com Assinatura Digital */}
      {ready && user && !hasAcceptedTerms && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lgpd-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#FCA311]/30 bg-surface-container-lowest p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCA311]/20">
                <Icon name="gavel" className="text-xl text-[#FCA311]" />
              </span>
              <div>
                <h2 id="lgpd-title" className="text-headline-sm font-bold text-on-surface">
                  Termos de Uso Corporativos
                </h2>
                <p className="text-xs text-on-surface-variant">Conformidade LGPD — Lei nº 13.709/2018</p>
              </div>
            </div>

            {/* Corpo dos termos */}
            <div className="mb-5 max-h-40 overflow-y-auto rounded-lg border border-outline-variant/40 bg-surface-container-high p-4 text-xs leading-relaxed text-on-surface-variant">
              <p className="mb-2 font-bold text-on-surface">FleetAI Operational Control — Acordo de Privacidade e Uso</p>
              <p className="mb-2">
                Ao acessar esta plataforma, você concorda com a coleta, armazenamento e processamento de dados operacionais
                de frota, incluindo geolocalização de veículos, registros de viagens, abastecimentos e dados de condutores,
                conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <p className="mb-2">
                ⚠️ <strong>Dados monitorados:</strong> posição GPS em tempo real, velocidade, odômetro, consumo de combustível,
                identidade do condutor (CNH) e histórico de ocorrências.
              </p>
              <p className="mb-2">
                ✅ <strong>Direitos garantidos:</strong> acesso, correção, portabilidade e eliminação dos seus dados,
                mediante solicitação ao DPO corporativo.
              </p>
              <p>
                📊 Os dados são tratados exclusivamente para fins operacionais e não são compartilhados com terceiros
                sem consentimento explícito, exceto por obrigação legal.
              </p>
            </div>

            {/* Formulário de assinatura digital */}
            <form onSubmit={handleLgpdSubmit} className="space-y-3">
              <div>
                <label htmlFor="lgpd-name" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Nome Completo (Assinatura Digital)
                </label>
                <input
                  id="lgpd-name"
                  type="text"
                  value={lgpdName}
                  onChange={(e) => setLgpdName(e.target.value)}
                  placeholder="Digite seu nome completo como consta no documento"
                  className="input-fleet text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="lgpd-doc" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  CPF ou RG
                </label>
                <input
                  id="lgpd-doc"
                  type="text"
                  value={lgpdDoc}
                  onChange={(e) => setLgpdDoc(e.target.value)}
                  placeholder="Número do documento de identificação"
                  className="input-fleet text-sm"
                  required
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-high p-3">
                <input
                  type="checkbox"
                  id="lgpd-check"
                  checked={lgpdChecked}
                  onChange={(e) => setLgpdChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#FCA311]"
                />
                <span className="text-xs text-on-surface-variant">
                  Li, compreendi e aceito os Termos de Uso Corporativos e a Política de Privacidade da plataforma
                  <strong className="text-[#FCA311]"> FleetAI Operational Control</strong>, conforme a LGPD.
                </span>
              </label>

              {lgpdError && (
                <div role="alert" className="rounded-lg bg-error/15 border border-error/30 px-3 py-2 text-xs text-error">
                  {lgpdError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full justify-center gap-2 uppercase text-sm"
              >
                <Icon name="verified" className="text-base" />
                Assinar e Concordar — Acessar Plataforma
              </button>
            </form>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ml-64">
        {headerTitle ? (
          <TopHeader
            title={headerTitle}
            searchPlaceholder={searchPlaceholder}
            action={
              <>
                <button
                  type="button"
                  className="touch-target rounded-lg p-2 lg:hidden"
                  aria-label="Abrir menu"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Icon name="menu" className="text-2xl text-primary" />
                </button>
                {headerAction}
              </>
            }
          />
        ) : (
          <TopHeader
            className="lg:hidden"
            title={headerTitle}
            searchPlaceholder={searchPlaceholder}
            action={
              <>
                <button
                  type="button"
                  className="touch-target rounded-lg p-2"
                  aria-label="Abrir menu"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Icon name="menu" className="text-2xl text-primary" />
                </button>
                {headerAction}
              </>
            }
          />
        )}
        <div id="main-content" className="main-content flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          {isPilotContext && <OfflineIndicator />}
          {accessDenied ? <AccessDenied /> : children}
        </div>
      </div>

      <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
