import Icon from "./Icon";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {breadcrumb && (
          <nav className="mb-2 flex items-center gap-1 text-label-md text-on-surface-variant">
            <span>FleetAI</span>
            <Icon name="chevron_right" className="text-sm" />
            <span className="font-bold text-primary">{breadcrumb}</span>
          </nav>
        )}
        <h1 className="text-headline-lg text-on-surface">{title}</h1>
        {subtitle && <p className="mt-1 text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
