export const THEME_OPTIONS = [
  { id: "dark", label: "Escuro" },
  { id: "light", label: "Claro" },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

const STORAGE_KEY = "fleet_theme";

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) || "dark";
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme(): void {
  applyTheme(getStoredTheme());
}
