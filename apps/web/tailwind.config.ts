import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--paper)",
          2: "var(--paper-2)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
        },
        red: {
          DEFAULT: "var(--red)",
          soft: "var(--red-soft)",
        },
        green: {
          DEFAULT: "var(--green)",
          soft: "var(--green-soft)",
        },
        rule: "var(--rule)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Instrument Serif", "Fraunces", "serif"],
        ui: ["var(--font-ui)", "Geist", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(.22, 1, .36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
