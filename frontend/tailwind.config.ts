import type { Config } from "tailwindcss";

/** RGB triplet for Tailwind opacity modifiers (e.g. bg-primary/10) */
function c(name: string) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "headline-md": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        "headline-sm": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "body-md": ["0.9375rem", { lineHeight: "1.5rem" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.04em" }],
      },
      boxShadow: {
        raised: "var(--shadow-raised)",
      },
      colors: {
        primary: c("primary"),
        "on-primary": c("on-primary"),
        "primary-container": c("primary-container"),
        "on-primary-container": c("on-primary-container"),
        "primary-fixed": c("primary-fixed"),
        "secondary-container": c("secondary-container"),
        "on-secondary-container": c("on-secondary-container"),
        surface: c("surface"),
        "on-surface": c("on-surface"),
        "on-surface-variant": c("on-surface-variant"),
        "surface-container": c("surface-container"),
        "surface-container-low": c("surface-container-low"),
        "surface-container-high": c("surface-container-high"),
        "surface-container-lowest": c("surface-container-lowest"),
        outline: c("outline"),
        "outline-variant": c("outline-variant"),
        error: c("error"),
        "error-container": c("error-container"),
      },
    },
  },
  plugins: [],
};

export default config;
