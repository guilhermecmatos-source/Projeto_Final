export function formatCurrency(value: number | string): string {
  const n = typeof value === "string" ? parseMoney(value) : value;
  if (Number.isNaN(n)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

export function parseMoney(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function maskCurrencyInput(raw: string): string {
  const n = parseMoney(raw);
  return formatCurrency(n);
}

export function formatKm(value: number | string): string {
  const n =
    typeof value === "string"
      ? Number(value.replace(/\D/g, "")) || 0
      : Math.round(value);
  return `${n.toLocaleString("pt-BR")} km`;
}

export function maskKmInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const n = Number(digits);
  return `${n.toLocaleString("pt-BR")} km`;
}

export function parseKm(raw: string): number {
  return Number(raw.replace(/\D/g, "")) || 0;
}

export function maskLitersInput(raw: string): string {
  const digits = raw.replace(/[^\d,]/g, "").replace(",", ".");
  if (!digits) return "";
  const n = parseFloat(digits) || 0;
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L`;
}

export function parseLiters(raw: string): number {
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function maskPlateInput(raw: string): string {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (v.length <= 3) return v;
  if (v.length <= 4) return `${v.slice(0, 3)}-${v.slice(3)}`;
  if (/[A-Z]/.test(v[4])) {
    return `${v.slice(0, 3)}-${v.slice(3, 4)}${v.slice(4, 6)}${v.slice(6)}`;
  }
  return `${v.slice(0, 3)}-${v.slice(3, 7)}`;
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(0)}%`;
}
