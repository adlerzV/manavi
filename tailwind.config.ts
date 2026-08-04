import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-yekan)", "sans-serif"],
      },
      colors: {
        background: "#121212",
        surface: "#1E1E1E",
        border: "#2C2C2C",
        primary: {
          DEFAULT: "#00DC64",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#EC4899",
          foreground: "#FFFFFF",
        },
        text: {
          main: "#FFFFFF",
          muted: "#AAAAAA",
        },
      },
    },
  },
  plugins: [],
};

export default config;