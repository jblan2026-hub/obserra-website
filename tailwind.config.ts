import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        obserra: {
          navy: "#03162a",
          blue: "#84d6f5",
          gold: "#f4ba55",
        },
      },
    },
  },
  plugins: [],
};

export default config;
