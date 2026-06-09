import React from "react";
import Icon from "./Icon";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-error/40 bg-error-container/10 px-6 py-10 text-center ${className}`}
      role="alert"
    >
      <Icon name="error_outline" className="text-4xl text-error" />
      <p className="max-w-md text-body-md text-on-surface">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          <Icon name="refresh" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
