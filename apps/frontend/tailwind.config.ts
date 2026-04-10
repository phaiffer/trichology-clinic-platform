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
          50: "#f3f7f4",
          100: "#deebe1",
          500: "#2f6b56",
          700: "#214b3d",
          900: "#152d25",
        },
        sand: "#f6f2eb",
      },
    },
  },
  plugins: [],
};

export default config;

