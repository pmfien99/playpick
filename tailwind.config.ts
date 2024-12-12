import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cpb: {
          lightred: '#FF5A78',
          lightgreen: '#1AE1B7',
          basegreen: '#00644F',
          darkgreen: '#0C1D17',
          baseblack: '#1F1F1F',
          basewhite: '#F9F9FB',
          basegray: '#ECECEC'
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
