"use client";

import Icon from "@/components/ui/Icon";

interface FormActionsProps {
  loading?: boolean;
  syncing?: boolean;
  submitLabel?: string;
  onSaveLocal?: () => void;
  onSyncNow?: () => void | Promise<void>;
  onExportPdf?: () => void;
  syncDisabled?: boolean;
  showOfflineActions?: boolean;
}

export default function FormActions({
  loading,
  syncing,
  submitLabel = "Salvar e enviar",
  onSaveLocal,
  onSyncNow,
  onExportPdf,
  syncDisabled,
  showOfflineActions = true,
}: FormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
      <button type="submit" disabled={loading || syncing} className="btn-primary">
        <Icon name="save" />
        {loading ? "Salvando..." : submitLabel}
      </button>
      {onExportPdf && (
        <button type="button" onClick={onExportPdf} className="btn-secondary">
          <Icon name="picture_as_pdf" />
          Exportar PDF
        </button>
      )}
      {showOfflineActions && onSaveLocal && (
        <button
          type="button"
          onClick={onSaveLocal}
          disabled={loading || syncing}
          className="rounded-lg border border-outline-variant px-6 py-3 font-semibold hover:bg-surface-container-low disabled:opacity-50"
        >
          <Icon name="download" className="mr-1 inline" />
          Salvar localmente
        </button>
      )}
      {showOfflineActions && onSyncNow && (
        <button
          type="button"
          onClick={() => void onSyncNow()}
          disabled={syncDisabled || syncing}
          className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary-container/10 disabled:opacity-50"
        >
          <Icon name={syncing ? "hourglass_top" : "sync"} className={`mr-1 inline ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      )}
    </div>
  );
}
