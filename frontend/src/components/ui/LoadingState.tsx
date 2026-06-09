import React from "react";
import Icon from "./Icon";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "Carregando...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-on-surface-variant ${className}`}
      role="status"
      aria-live="polite"
    >
      <Icon name="progress_activity" className="animate-spin text-3xl text-primary" />
      <p className="text-body-md">{message}</p>
    </div>
  );
}
