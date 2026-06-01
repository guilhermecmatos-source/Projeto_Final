/** Máscaras de input — FleetAI */

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function mascaraMoeda(raw: string): string {
  const centavos = apenasDigitos(raw);
  if (!centavos) return "";
  return formatarMoeda(Number(centavos) / 100);
}

export function parseMoeda(raw: string): number {
  const centavos = apenasDigitos(raw);
  if (!centavos) return 0;
  return Number(centavos) / 100;
}

export function mascaraKm(raw: string): string {
  const digits = apenasDigitos(raw);
  if (!digits) return "";
  return `${Number(digits).toLocaleString("pt-BR")} km`;
}

export function parseKm(raw: string): number {
  return Number(apenasDigitos(raw)) || 0;
}

export function mascaraLitros(raw: string): string {
  const limpo = raw.replace(/[^\d,]/g, "").replace(",", ".");
  if (!limpo) return "";
  const n = parseFloat(limpo) || 0;
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L`;
}

export function parseLitros(raw: string): number {
  const limpo = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(limpo) || 0;
}

export function mascaraPlaca(raw: string): string {
  const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (v.length <= 3) return v;
  if (v.length <= 4) return `${v.slice(0, 3)}-${v.slice(3)}`;
  if (/[A-Z]/.test(v[4] ?? "")) {
    return `${v.slice(0, 3)}-${v.slice(3, 4)}${v.slice(4, 6)}${v.slice(6)}`;
  }
  return `${v.slice(0, 3)}-${v.slice(3, 7)}`;
}

export function mascaraTelefone(raw: string): string {
  const d = apenasDigitos(raw).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function parseTelefone(raw: string): string {
  return apenasDigitos(raw);
}
