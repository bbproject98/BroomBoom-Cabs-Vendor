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
        puja: {
          cream: "#FFFDF7",
          subtle: "#FEFCE8",
          yellow: "#F59E0B",
          yellowLight: "#FEF08A",
          gold: "#EAB308",
          dark: "#D97706",
          amber: "#B45309",
        },
        brand: {
          yellow: {
            DEFAULT: "#FFB800",
            hover: "#E5A600",
            dark: "#D97706",
            light: "#FFFDF7",
            subtle: "#FEFCE8",
          },
          black: {
            DEFAULT: "#111827",
            pure: "#000000",
            dark: "#0F172A",
            border: "#E2E8F0",
          },
        },
      },
      backgroundImage: {
        "puja-gradient-hero":
          "radial-gradient(circle at 10% 20%, rgba(254, 240, 138, 0.45) 0%, transparent 40%), radial-gradient(circle at 90% 10%, rgba(253, 224, 71, 0.35) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(254, 240, 138, 0.3) 0%, transparent 50%), #FFFDF7",
        "yellow-dots":
          "radial-gradient(rgba(234, 179, 8, 0.15) 1.5px, transparent 1.5px)",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 12px 30px rgba(234, 179, 8, 0.2)",
        "yellow-glow": "0 4px 20px rgba(234, 179, 8, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

