import Icon from "./Icon";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <nav className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span>Sede Central</span>
          <Icon name="chevron_right" className="text-sm" />
          <span>Unidade Operacional</span>
          {breadcrumb && (
            <>
              <Icon name="chevron_right" className="text-sm" />
              <span className="font-bold text-primary">{breadcrumb}</span>
            </>
          )}
        </nav>
        {eyebrow && (
          <p className="mb-1 text-label-md font-bold uppercase text-primary">{eyebrow}</p>
        )}
        <h1 className="text-headline-lg font-bold text-primary sm:text-headline-lg">{title}</h1>
        {subtitle && <p className="mt-1 text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
