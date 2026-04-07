import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        },
        rose: {
          ink: "#f8fafc",
          muted: "#94a3b8",
          soft: "#64748b"
        },
      },
      boxShadow: {
        button: "0 4px 14px rgba(79, 70, 229, 0.4)"
      }
    }
  },
  plugins: []
};

export default config;
