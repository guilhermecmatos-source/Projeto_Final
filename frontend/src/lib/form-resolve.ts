import { ComboboxOption } from "@/components/forms/SearchableCombobox";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Resolve valor do combobox para ID da entidade (por UUID, label ou placa/nome) */
export function resolveEntityId(
  raw: string,
  options: ComboboxOption[]
): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (UUID_RE.test(value)) return value;

  const byValue = options.find((o) => o.value === value);
  if (byValue?.value) return byValue.value;

  const lower = value.toLowerCase();
  const byLabel = options.find(
    (o) =>
      o.label.toLowerCase() === lower ||
      o.label.toLowerCase().includes(lower) ||
      lower.includes(o.label.toLowerCase())
  );
  return byLabel?.value || null;
}
