import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff9f00",
          container: "#ff9f00",
          fixed: "var(--primary-fixed)",
        },
        secondary: {
          DEFAULT: "#3b82f6",
          container: "#2196f3",
          fixed: "var(--secondary-fixed)",
        },
        tertiary: {
          DEFAULT: "#7b1f2a",
          container: "#9b2335",
        },
        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-low)",
          bright: "var(--surface-high)",
          variant: "var(--outline-variant)",
          container: {
            DEFAULT: "var(--surface)",
            low: "var(--surface-low)",
            lowest: "var(--surface-lowest)",
            high: "var(--surface-high)",
            highest: "var(--surface-highest)",
          },
        },
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        error: {
          DEFAULT: "#ef4444",
          container: "#3f1515",
        },
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-primary": "var(--on-primary)",
        "on-primary-container": "var(--on-primary)",
        "on-secondary-container": "#ffffff",
        "on-error-container": "#fecaca",
        background: "var(--background)",
        fleet: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px" }],
        "body-md": ["14px", { lineHeight: "20px" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.05em" }],
      },
      spacing: {
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
      },
      boxShadow: {
        raised: "0 2px 8px rgba(0,0,0,0.35)",
        overlay: "0 12px 32px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.25s ease-out",
      },
      padding: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      },
      minHeight: {
        "screen-safe": "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
      },
    },
  },
  plugins: [],
};

export default config;
