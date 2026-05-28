import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003d9b",
          container: "#0052cc",
          fixed: "#dae2ff",
        },
        secondary: {
          DEFAULT: "#825500",
          container: "#feaa00",
          fixed: "#ffddb3",
        },
        tertiary: {
          DEFAULT: "#7b2600",
          container: "#a33500",
        },
        surface: {
          DEFAULT: "#f8f9fb",
          dim: "#d9dadc",
          bright: "#f8f9fb",
          variant: "#e1e2e4",
          container: {
            DEFAULT: "#edeef0",
            low: "#f3f4f6",
            lowest: "#ffffff",
            high: "#e7e8ea",
            highest: "#e1e2e4",
          },
        },
        outline: {
          DEFAULT: "#737685",
          variant: "#c3c6d6",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-surface": "#191c1e",
        "on-surface-variant": "#434654",
        "on-primary": "#ffffff",
        "on-primary-container": "#c4d2ff",
        "on-secondary-container": "#684300",
        "on-error-container": "#93000a",
        background: "#f8f9fb",
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
        raised: "0 2px 4px rgba(0,0,0,0.05)",
        overlay: "0 12px 24px rgba(0,0,0,0.1)",
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
