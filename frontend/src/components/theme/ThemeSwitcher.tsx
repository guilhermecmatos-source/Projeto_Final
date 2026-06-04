"use client";

import { THEME_OPTIONS, ThemeId, applyTheme, getStoredTheme } from "@/lib/themes";
import { useState } from "react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

  return (
    <label className="flex flex-col gap-1 text-label-md text-on-surface-variant">
      Tema de acessibilidade
      <select
        className="input-fleet"
        value={theme}
        onChange={(e) => {
          const next = e.target.value as ThemeId;
          setTheme(next);
          applyTheme(next);
        }}
      >
        {THEME_OPTIONS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
