import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base atmospheric dark surface (deep slate-navy, not pure black --
        // reads like a night-sky radar display, not a generic dark-mode SaaS)
        base: {
          950: "#080B10",
          900: "#0B0F15",
          800: "#121821",
          700: "#171F2A",
          600: "#1F2A38",
          500: "#2A3A4C",
        },
        ink: {
          100: "#EDF2F7",
          300: "#C3CEDA",
          500: "#8593A3",
          700: "#5B6675",
        },
        signal: {
          // instrument-panel cyan-blue accent, distinct from the AQI scale
          DEFAULT: "#49D3E8",
          dim: "#2B8FA3",
          glow: "#8FEBF6",
        },
        // Official CPCB National AQI category colors -- functional, not decorative
        aqi: {
          good: "#3FA96A",
          satisfactory: "#A0CE4E",
          moderate: "#F2C230",
          poor: "#F2883B",
          verypoor: "#E2483E",
          severe: "#8D1B3D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(73,211,232,0.08), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
