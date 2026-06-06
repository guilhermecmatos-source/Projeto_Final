import Icon from "./Icon";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  accent?: "primary" | "secondary" | "green" | "error" | "white";
  large?: boolean;
}

const iconColor: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary-container",
  green: "text-green-400",
  error: "text-error",
  white: "text-on-surface",
};

export default function KpiCard({
  label,
  value,
  icon,
  sub,
  trend,
  trendUp,
  accent = "primary",
  large = false,
}: KpiCardProps) {
  return (
    <div
      className={`fleet-kpi-card flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-4 ${large ? "min-h-[120px] sm:p-5" : "min-h-[88px]"}`}
    >
      <div className="flex items-start justify-between">
        <span className={`${iconColor[accent]} opacity-90`}>
          <Icon name={icon} className={large ? "text-3xl" : "text-2xl"} />
        </span>
        {trend && (
          <span className={`text-[10px] font-bold ${trendUp ? "text-green-400" : "text-on-surface-variant"}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
        <h4 className={`font-bold text-on-surface ${large ? "text-2xl" : "text-lg"}`}>{value}</h4>
        {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}
