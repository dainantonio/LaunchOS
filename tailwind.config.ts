import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.18)",
        hairline: "0 0 0 1px rgba(255,255,255,0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
