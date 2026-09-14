import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          espresso: "var(--brand-espresso)",
          dark: "var(--brand-dark)",
          caramel: "var(--brand-caramel)",
          gold: "var(--brand-gold)",
          cream: "var(--brand-cream)",
          surface: "var(--brand-surface)",
          text: "var(--brand-text)",
          muted: "var(--brand-muted)",
          border: "var(--brand-border)",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
      },
      boxShadow: {
        warm: "0 10px 30px -10px rgba(56, 34, 22, 0.15)",
        "warm-lg": "0 20px 40px -15px rgba(56, 34, 22, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
