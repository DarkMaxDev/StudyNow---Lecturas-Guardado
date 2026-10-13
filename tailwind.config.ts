import type { Config } from "tailwindcss";
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: v("ink"), panel: v("panel"), mist: v("mist"), teal: v("teal"), a2: v("a2") }, fontFamily: { sans: ["var(--font-manrope)", "system-ui", "sans-serif"] } } },
  plugins: [],
} satisfies Config;
