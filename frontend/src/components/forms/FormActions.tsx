"use client";

import Icon from "@/components/ui/Icon";

interface FormActionsProps {
  loading?: boolean;
  submitLabel?: string;
  onSaveLocal?: () => void;
  onSyncNow?: () => void;
  onExportPdf?: () => void;
  syncDisabled?: boolean;
  showOfflineActions?: boolean;
}

export default function FormActions({
  loading,
  submitLabel = "Salvar e enviar",
  onSaveLocal,
  onSyncNow,
  onExportPdf,
  syncDisabled,
  showOfflineActions = true,
}: FormActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
      <button type="submit" disabled={loading} className="btn-primary">
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
          className="rounded-lg border border-outline-variant px-6 py-3 font-semibold hover:bg-surface-container-low"
        >
          <Icon name="download" className="mr-1 inline" />
          Salvar localmente
        </button>
      )}
      {showOfflineActions && onSyncNow && (
        <button
          type="button"
          onClick={onSyncNow}
          disabled={syncDisabled}
          className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary hover:bg-primary-container/10 disabled:opacity-50"
        >
          <Icon name="sync" className="mr-1 inline" />
          Sincronizar agora
        </button>
      )}
    </div>
  );
}
