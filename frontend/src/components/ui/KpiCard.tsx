import Icon from "./Icon";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "secondary" | "green" | "error";
}

const accentMap = {
  primary: "border-l-primary",
  secondary: "border-l-secondary-container",
  green: "border-l-green-500",
  error: "border-l-error",
};

export default function KpiCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accent = "primary",
}: KpiCardProps) {
  return (
    <div
      className={`glass flex flex-col justify-between rounded-xl border-l-4 p-4 shadow-raised transition hover:shadow-md ${accentMap[accent]}`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded bg-primary/10 p-2 text-primary">
          <Icon name={icon} className="text-xl" />
        </span>
        {trend && (
          <span
            className={`text-[10px] font-bold ${trendUp ? "text-green-600" : "text-on-surface-variant"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
          {label}
        </p>
        <h4 className="text-xl font-bold text-on-surface">{value}</h4>
      </div>
    </div>
  );
}
