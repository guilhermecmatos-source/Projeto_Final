import { ReactNode } from "react";
import Icon from "./Icon";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant px-6 py-12 text-center ${className}`}
    >
      <Icon name={icon} className="text-4xl text-on-surface-variant opacity-50" />
      <h3 className="text-headline-sm text-on-surface">{title}</h3>
      {description && <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
