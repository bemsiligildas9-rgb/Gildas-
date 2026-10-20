import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: v("brand"), strong: v("brand-strong") },
        night: v("night"),
        cyan: { accent: v("cyan") },
        bg: v("bg"),
        surface: v("surface"),
        raised: v("raised"),
        ink: { DEFAULT: v("ink"), soft: v("ink-soft") },
        line: v("line"),
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "14px", pill: "999px" },
    },
  },
  plugins: [],
};
export default config;
